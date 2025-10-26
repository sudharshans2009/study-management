#!/usr/bin/env tsx

/**
 * Direct QStash setup script with workflow-like structure
 * 
 * This script directly configures QStash schedules without requiring
 * the Next.js server to be running. It uses the same logic as the
 * workflow endpoint but runs locally.
 * 
 * Usage:
 *   bun run workflow:setup
 */

import { config } from "dotenv";
import { Client } from "@upstash/qstash";

// Load environment variables
config({ path: ".env.local" });

const qstashToken = process.env.QSTASH_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!qstashToken) {
  console.error("❌ QSTASH_TOKEN not found in environment variables");
  console.error("   Please add it to your .env.local file\n");
  process.exit(1);
}

// Check if using localhost
const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1") || appUrl.includes("::1");

if (isLocalhost) {
  console.error("❌ Cannot use localhost URL with QStash");
  console.error("   QStash cannot call localhost/loopback addresses\n");
  console.error("� See detailed guide: docs/QSTASH_LOCALHOST_ISSUE.md\n");
  console.error("💡 Quick Solutions:");
  console.error("\n1️⃣  Production Setup (Recommended):");
  console.error("   • Deploy to Vercel first");
  console.error("   • Update NEXT_PUBLIC_APP_URL in .env.local");
  console.error("   • Run: bun run workflow:setup\n");
  console.error("2️⃣  Local Testing with Tunnel:");
  console.error("   • Install ngrok: npm install -g ngrok");
  console.error("   • Start tunnel: ngrok http 3000");
  console.error("   • Update NEXT_PUBLIC_APP_URL with ngrok URL");
  console.error("   • Run: bun run workflow:setup\n");
  console.error("3️⃣  Skip for Now:");
  console.error("   • Develop without QStash schedules");
  console.error("   • Setup later when deploying to production");
  console.error("   • Most features work fine without schedules\n");
  process.exit(1);
}

const qstashClient = new Client({
  token: qstashToken,
});

interface ScheduleConfig {
  name: string;
  cron: string;
  destination: string;
  description: string;
}

const schedules: ScheduleConfig[] = [
  {
    name: "global-update-hourly",
    cron: "0 * * * *",
    destination: `${appUrl}/api/qstash/global-update`,
    description: "Hourly global stats and leaderboard updates",
  },
  {
    name: "batch-onboarding-reminders",
    cron: "0 */6 * * *",
    destination: `${appUrl}/api/qstash/batch-onboarding`,
    description: "Batch onboarding reminder emails every 6 hours",
  },
  {
    name: "batch-goal-reminders-daily",
    cron: "0 20 * * *",
    destination: `${appUrl}/api/qstash/batch-goal-reminders`,
    description: "Daily goal reminder emails at 8 PM UTC",
  },
];

async function setupQStashSchedules() {
  console.log("🚀 Setting up QStash schedules...\n");
  console.log(`📍 App URL: ${appUrl}\n`);

  try {
    // Step 1: List existing schedules
    console.log("📋 Step 1: Fetching existing schedules...");
    const existingSchedules = await qstashClient.schedules.list();
    console.log(`   Found ${existingSchedules.length} existing schedules\n`);

    // Step 2: Delete existing schedules (if any)
    if (existingSchedules.length > 0) {
      console.log(`🗑️  Step 2: Deleting ${existingSchedules.length} existing schedules...`);
      
      for (const schedule of existingSchedules) {
        try {
          await qstashClient.schedules.delete(schedule.scheduleId);
          console.log(`   ✓ Deleted: ${schedule.scheduleId}`);
        } catch (error) {
          console.error(`   ✗ Failed to delete ${schedule.scheduleId}:`, error);
        }
      }
      
      console.log("   Waiting 2 seconds for propagation...\n");
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log("⏩ Step 2: No existing schedules to delete\n");
    }

    // Step 3: Create new schedules
    console.log(`📅 Step 3: Creating ${schedules.length} new schedules...`);
    
    const created = [];
    const failed = [];

    for (const config of schedules) {
      try {
        const schedule = await qstashClient.schedules.create({
          destination: config.destination,
          cron: config.cron,
          body: JSON.stringify({
            triggeredBy: "workflow-setup",
            timestamp: Date.now(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(`   ✓ ${config.name}`);
        console.log(`     Cron: ${config.cron}`);
        console.log(`     Destination: ${config.destination}`);
        console.log(`     Schedule ID: ${schedule.scheduleId}`);

        created.push({
          name: config.name,
          scheduleId: schedule.scheduleId,
          cron: config.cron,
          destination: config.destination,
          description: config.description,
        });
      } catch (error) {
        console.error(`   ✗ Failed: ${config.name}`);
        console.error(`     Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        
        failed.push({
          name: config.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    console.log();

    // Step 4: Calculate usage statistics
    const hourlyMessages = 24; // Global updates every hour
    const sixHourlyMessages = 4; // Onboarding every 6 hours
    const dailyMessages = 1; // Goal reminders daily at 8 PM

    const totalScheduled = hourlyMessages + sixHourlyMessages + dailyMessages;
    const totalLimit = 500; // QStash free tier limit
    const available = totalLimit - totalScheduled;

    console.log("📊 Summary:");
    console.log(`   Deleted: ${existingSchedules.length}`);
    console.log(`   Created: ${created.length}`);
    console.log(`   Failed: ${failed.length}\n`);

    if (failed.length > 0) {
      console.error("❌ Some schedules failed to create:");
      failed.forEach((failure) => {
        console.error(`   ${failure.name}: ${failure.error}`);
      });
      console.log();
    }

    console.log("📈 Daily Usage Allocation:");
    console.log(`   Hourly global updates: ${hourlyMessages}/day`);
    console.log(`   Batch onboarding: ${sixHourlyMessages}/day`);
    console.log(`   Daily goal reminders: ${dailyMessages}/day`);
    console.log(`   ────────────────────────────────`);
    console.log(`   Total scheduled: ${totalScheduled}/day`);
    console.log(`   Available for ad-hoc: ${available}/day`);
    console.log(`   Limit (free tier): ${totalLimit}/day\n`);

    if (failed.length === 0) {
      console.log("✅ QStash setup completed successfully!");
      console.log("\n📱 Monitor your schedules at:");
      console.log("   https://console.upstash.com/qstash");
      console.log("\n📊 View monitoring dashboard:");
      console.log(`   ${appUrl}/admin/monitoring\n`);
    } else {
      console.error("⚠️  Setup completed with errors");
      process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Setup failed:");
    console.error(error instanceof Error ? error.message : error);
    console.error("\nTroubleshooting:");
    console.error("  1. Verify QSTASH_TOKEN is set correctly");
    console.error("  2. Check your internet connection");
    console.error("  3. Ensure QStash service is accessible");
    console.error("  4. Review Upstash console for issues\n");
    process.exit(1);
  }
}

setupQStashSchedules();
