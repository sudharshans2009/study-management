#!/usr/bin/env tsx

/**
 * Trigger QStash setup workflow
 * 
 * This script triggers the Upstash Workflow-based QStash setup process.
 * Unlike the direct setup script, this uses workflows which provide:
 * - Automatic retries on failures
 * - State persistence (can resume after crashes)
 * - Better observability via workflow dashboard
 * 
 * Usage:
 *   bun run workflow:setup
 */

import { config } from "dotenv";

// Load environment variables
config();

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function triggerWorkflowSetup() {
  console.log("🚀 Triggering QStash setup workflow...\n");

  try {
    const response = await fetch(`${appUrl}/api/workflow/setup-qstash`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        force: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Workflow trigger failed: ${error}`);
    }

    const result = await response.json();

    console.log("✓ Workflow triggered successfully!\n");
    console.log("📊 Summary:");
    console.log(`  Schedules deleted: ${result.summary.deleted}`);
    console.log(`  Schedules created: ${result.summary.created}`);
    console.log(`  Failures: ${result.summary.failed}\n`);

    if (result.schedules && result.schedules.length > 0) {
      console.log("📅 Created Schedules:");
      result.schedules.forEach((schedule: any) => {
        console.log(`\n  ${schedule.name}`);
        console.log(`    Cron: ${schedule.cron}`);
        console.log(`    Endpoint: ${schedule.destination}`);
        console.log(`    Schedule ID: ${schedule.scheduleId}`);
      });
    }

    if (result.usage) {
      console.log("\n📈 Daily Usage Allocation:");
      console.log(`  Hourly updates: ${result.usage.breakdown.hourlyUpdates}/day`);
      console.log(`  Batch onboarding: ${result.usage.breakdown.batchOnboarding}/day`);
      console.log(`  Daily reminders: ${result.usage.breakdown.dailyReminders}/day`);
      console.log(`  Total scheduled: ${result.usage.scheduled}/day`);
      console.log(`  Available: ${result.usage.available}/day`);
      console.log(`  Limit: ${result.usage.limit}/day\n`);
    }

    if (result.failures && result.failures.length > 0) {
      console.error("❌ Some schedules failed to create:");
      result.failures.forEach((failure: any) => {
        console.error(`  ${failure.name}: ${failure.error}`);
      });
      process.exit(1);
    }

    console.log("✅ QStash setup completed successfully!");
    console.log("\n📱 Monitor your workflows at:");
    console.log("   https://console.upstash.com/workflow\n");

  } catch (error) {
    console.error("❌ Failed to trigger workflow:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

triggerWorkflowSetup();
