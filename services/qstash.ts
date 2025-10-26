import { Client } from "@upstash/qstash";
import { redis } from "./redis";

if (!process.env.QSTASH_TOKEN) {
  throw new Error("QSTASH_TOKEN is not set");
}

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

// QStash usage tracking
const QSTASH_USAGE_KEY = "qstash:usage:daily";
const QSTASH_DAILY_LIMIT = 500;
const QSTASH_CRITICAL_RESERVE = 100; // Reserve for critical operations

/**
 * Check if we have QStash quota available
 */
export async function hasQStashQuota(critical: boolean = false): Promise<boolean> {
  try {
    const usage = (await redis.get<number>(QSTASH_USAGE_KEY)) || 0;
    const limit = critical
      ? QSTASH_DAILY_LIMIT
      : QSTASH_DAILY_LIMIT - QSTASH_CRITICAL_RESERVE;
    return usage < limit;
  } catch (error) {
    console.error("[QStash] Failed to check quota:", error);
    return true; // Fail open
  }
}

/**
 * Increment QStash usage counter
 */
async function incrementQStashUsage(): Promise<void> {
  try {
    const key = QSTASH_USAGE_KEY;
    const current = (await redis.get<number>(key)) || 0;

    // Set with 24 hour expiry (resets daily)
    await redis.set(key, current + 1, { ex: 86400 });
  } catch (error) {
    console.error("[QStash] Failed to increment usage:", error);
  }
}

/**
 * Get current QStash usage
 */
export async function getQStashUsage(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}> {
  try {
    const used = (await redis.get<number>(QSTASH_USAGE_KEY)) || 0;
    const remaining = QSTASH_DAILY_LIMIT - used;
    const percentage = (used / QSTASH_DAILY_LIMIT) * 100;

    return {
      used,
      limit: QSTASH_DAILY_LIMIT,
      remaining,
      percentage,
    };
  } catch (error) {
    console.error("[QStash] Failed to get usage:", error);
    return {
      used: 0,
      limit: QSTASH_DAILY_LIMIT,
      remaining: QSTASH_DAILY_LIMIT,
      percentage: 0,
    };
  }
}

/**
 * Schedule a recurring job (critical - always counts)
 */
export async function scheduleRecurringJob(config: {
  name: string;
  url: string;
  cron: string;
  body?: Record<string, any>;
  headers?: Record<string, string>;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}${config.url}`;

  await qstash.schedules.create({
    destination: fullUrl,
    cron: config.cron,
    body: JSON.stringify(config.body || {}),
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  });

  console.log(`[QStash] Scheduled job: ${config.name} (${config.cron})`);
}

/**
 * Publish a message (checks quota first)
 */
export async function publishMessage(config: {
  url: string;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  delay?: number;
  critical?: boolean; // If true, uses critical reserve
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check quota
  if (!(await hasQStashQuota(config.critical))) {
    console.warn("[QStash] Daily quota exceeded, skipping message");
    return { success: false, error: "Daily quota exceeded" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fullUrl = `${appUrl}${config.url}`;

  try {
    const result = await qstash.publishJSON({
      url: fullUrl,
      body: config.body || {},
      headers: config.headers,
      delay: config.delay,
    });

    // Increment usage counter
    await incrementQStashUsage();

    console.log(`[QStash] Message published: ${config.url}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[QStash] Failed to publish message:", error);
    return { success: false, error: "Failed to publish message" };
  }
}

/**
 * Batch publish messages (more efficient)
 */
export async function publishMessageBatch(
  messages: Array<{
    url: string;
    body?: Record<string, any>;
    delay?: number;
  }>,
  critical: boolean = false
): Promise<{ success: boolean; published: number; skipped: number }> {
  const available = await hasQStashQuota(critical);
  if (!available) {
    console.warn("[QStash] Daily quota exceeded, skipping batch");
    return { success: false, published: 0, skipped: messages.length };
  }

  const usage = await getQStashUsage();
  const maxPublish = Math.min(
    messages.length,
    usage.remaining - (critical ? 0 : QSTASH_CRITICAL_RESERVE)
  );

  let published = 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (let i = 0; i < maxPublish; i++) {
    const msg = messages[i];
    try {
      await qstash.publishJSON({
        url: `${appUrl}${msg.url}`,
        body: msg.body || {},
        delay: msg.delay,
      });
      published++;
      await incrementQStashUsage();
    } catch (error) {
      console.error(`[QStash] Failed to publish message ${i}:`, error);
    }
  }

  console.log(`[QStash] Batch published: ${published}/${messages.length}`);
  return {
    success: true,
    published,
    skipped: messages.length - published,
  };
}

/**
 * Verify QStash signature
 */
export async function verifyQStashSignature(
  signature: string,
  body: string
): Promise<boolean> {
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!currentKey || !nextKey) {
    throw new Error("QStash signing keys are not set");
  }

  try {
    const { Receiver } = await import("@upstash/qstash");
    const receiver = new Receiver({
      currentSigningKey: currentKey,
      nextSigningKey: nextKey,
    });
    await receiver.verify({
      signature,
      body,
    });
    return true;
  } catch (error) {
    console.error("[QStash] Signature verification failed:", error);
    return false;
  }
}
