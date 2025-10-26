import { scheduleRecurringJob, qstash } from "../services/qstash";

async function setupSchedules() {
  try {
    console.log("🚀 Setting up QStash schedules...\n");

    // Delete existing schedules first
    console.log("🗑️  Removing existing schedules...");
    const existingSchedules = await qstash.schedules.list();
    for (const schedule of existingSchedules) {
      await qstash.schedules.delete(schedule.scheduleId);
      console.log(`   ✓ Deleted schedule: ${schedule.scheduleId}`);
    }
    console.log("");

    // 1. Hourly global update (24/day)
    console.log("⏰ Creating hourly global updates schedule...");
    await scheduleRecurringJob({
      name: "Hourly Global Updates",
      url: "/api/qstash/global-update",
      cron: "0 * * * *", // Every hour at :00
    });
    console.log("   ✓ Created: Every hour at :00\n");

    // 2. Batch onboarding reminders - every 6 hours (4/day)
    console.log("📧 Creating batch onboarding reminders schedule...");
    await scheduleRecurringJob({
      name: "Batch Onboarding Reminders",
      url: "/api/qstash/batch-onboarding",
      cron: "0 */6 * * *", // Every 6 hours
    });
    console.log("   ✓ Created: Every 6 hours\n");

    // 3. Batch goal reminders - once daily at 8 PM UTC (1/day)
    console.log("🎯 Creating batch goal reminders schedule...");
    await scheduleRecurringJob({
      name: "Batch Goal Reminders",
      url: "/api/qstash/batch-goal-reminders",
      cron: "0 20 * * *", // 8 PM UTC daily
    });
    console.log("   ✓ Created: Daily at 8 PM UTC\n");

    console.log("✅ QStash schedules configured successfully!\n");
    console.log("📊 Expected daily usage:");
    console.log("   - Hourly global updates: 24 messages/day");
    console.log("   - Batch onboarding: 4 messages/day");
    console.log("   - Batch goal reminders: 1 message/day");
    console.log("   ────────────────────────────────────");
    console.log("   - Total scheduled: 29 messages/day");
    console.log("   - Available for ad-hoc: ~471 messages/day");
    console.log("   - Daily limit: 500 messages/day\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to setup schedules:", error);
    process.exit(1);
  }
}

setupSchedules();

