import { serve } from "@upstash/workflow/nextjs";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
    destination: `${baseUrl}/api/qstash/global-update`,
    description: "Hourly global stats and leaderboard updates",
  },
  {
    name: "batch-onboarding-reminders",
    cron: "0 */6 * * *",
    destination: `${baseUrl}/api/qstash/batch-onboarding`,
    description: "Batch onboarding reminder emails every 6 hours",
  },
  {
    name: "batch-goal-reminders-daily",
    cron: "0 20 * * *",
    destination: `${baseUrl}/api/qstash/batch-goal-reminders`,
    description: "Daily goal reminder emails at 8 PM UTC",
  },
];

/**
 * Workflow-based QStash setup endpoint
 * 
 * This provides a durable, retry-capable setup process for QStash schedules.
 * 
 * Benefits over simple script:
 * - Automatic retries on failure
 * - State persistence (can resume after crashes)
 * - Better error handling and logging
 * - No need for local execution
 * - Can be triggered via API or manually
 * 
 * Usage:
 * POST /api/workflow/setup-qstash
 * 
 * Or via CLI:
 * curl -X POST https://your-app.vercel.app/api/workflow/setup-qstash
 */
export const { POST } = serve<{ force?: boolean }>(
  async (context) => {
    const force = context.requestPayload?.force || false;

    // Step 1: List existing schedules
    const existingSchedules = await context.run("list-schedules", async () => {
      console.log("[Workflow] Fetching existing QStash schedules...");
      try {
        const schedules = await qstashClient.schedules.list();
        console.log(`[Workflow] Found ${schedules.length} existing schedules`);
        return schedules;
      } catch (error) {
        console.error("[Workflow] Failed to list schedules:", error);
        throw error;
      }
    });

    // Step 2: Delete existing schedules (if any)
    if (existingSchedules.length > 0) {
      await context.run("delete-schedules", async () => {
        console.log(`[Workflow] Deleting ${existingSchedules.length} existing schedules...`);
        
        for (const schedule of existingSchedules) {
          try {
            await qstashClient.schedules.delete(schedule.scheduleId);
            console.log(`[Workflow] Deleted schedule: ${schedule.scheduleId}`);
          } catch (error) {
            console.error(`[Workflow] Failed to delete schedule ${schedule.scheduleId}:`, error);
            // Continue with other deletions
          }
        }
        
        return { deleted: existingSchedules.length };
      });

      // Wait a moment for deletions to propagate
      await context.sleep("wait-after-delete", 2);
    }

    // Step 3: Create new schedules
    const results = await context.run("create-schedules", async () => {
      console.log(`[Workflow] Creating ${schedules.length} new schedules...`);
      
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

          console.log(`[Workflow] ✓ Created schedule: ${config.name}`);
          console.log(`  Cron: ${config.cron}`);
          console.log(`  Destination: ${config.destination}`);
          console.log(`  Schedule ID: ${schedule.scheduleId}`);

          created.push({
            name: config.name,
            scheduleId: schedule.scheduleId,
            cron: config.cron,
            destination: config.destination,
            description: config.description,
          });
        } catch (error) {
          console.error(`[Workflow] ✗ Failed to create schedule: ${config.name}`, error);
          failed.push({
            name: config.name,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return { created, failed };
    });

    // Step 4: Calculate usage statistics
    const usage = await context.run("calculate-usage", async () => {
      const hourlyMessages = 24; // Global updates every hour
      const sixHourlyMessages = 4; // Onboarding every 6 hours
      const dailyMessages = 1; // Goal reminders daily at 8 PM

      const totalScheduled = hourlyMessages + sixHourlyMessages + dailyMessages;
      const totalLimit = 500; // QStash free tier limit
      const available = totalLimit - totalScheduled;

      console.log("\n[Workflow] Usage Breakdown:");
      console.log(`  Hourly global updates: ${hourlyMessages}/day`);
      console.log(`  Batch onboarding: ${sixHourlyMessages}/day`);
      console.log(`  Daily goal reminders: ${dailyMessages}/day`);
      console.log(`  Total scheduled: ${totalScheduled}/day`);
      console.log(`  Available for ad-hoc: ${available}/day`);

      return {
        scheduled: totalScheduled,
        limit: totalLimit,
        available,
        breakdown: {
          hourlyUpdates: hourlyMessages,
          batchOnboarding: sixHourlyMessages,
          dailyReminders: dailyMessages,
        },
      };
    });

    // Return summary
    return {
      success: results.failed.length === 0,
      summary: {
        deleted: existingSchedules.length,
        created: results.created.length,
        failed: results.failed.length,
      },
      schedules: results.created,
      failures: results.failed,
      usage,
      timestamp: new Date().toISOString(),
    };
  },
  {
    // Workflow configuration
    retries: 3, // Retry failed steps up to 3 times
    failureUrl: `${baseUrl}/api/workflow/setup-qstash/failure`, // Optional: handle failures
  }
);

/**
 * Example response:
 * {
 *   "success": true,
 *   "summary": {
 *     "deleted": 3,
 *     "created": 3,
 *     "failed": 0
 *   },
 *   "schedules": [
 *     {
 *       "name": "global-update-hourly",
 *       "scheduleId": "scd_abc123",
 *       "cron": "0 * * * *",
 *       "destination": "https://your-app.com/api/qstash/global-update",
 *       "description": "Hourly global stats and leaderboard updates"
 *     }
 *   ],
 *   "failures": [],
 *   "usage": {
 *     "scheduled": 29,
 *     "limit": 500,
 *     "available": 471,
 *     "breakdown": {
 *       "hourlyUpdates": 24,
 *       "batchOnboarding": 4,
 *       "dailyReminders": 1
 *     }
 *   },
 *   "timestamp": "2024-01-15T10:30:00.000Z"
 * }
 */
