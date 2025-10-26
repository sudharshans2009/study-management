import { redis } from "@/services/redis";
import { qstash, getQStashUsage } from "@/services/qstash";
import { db } from "@/database/drizzle";
import { globalUpdate } from "@/database/schema";
import { desc } from "drizzle-orm";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MonitoringPage() {
  // Get Redis info
  let cacheKeys: string[] = [];
  try {
    cacheKeys = await redis.keys("*");
  } catch (error) {
    console.error("Failed to get cache keys:", error);
  }

  // Get QStash schedules
  let schedules: any[] = [];
  try {
    schedules = await qstash.schedules.list();
  } catch (error) {
    console.error("Failed to get schedules:", error);
  }

  // Get QStash usage
  const qstashUsage = await getQStashUsage();

  // Get recent global updates
  let recentUpdates: any[] = [];
  try {
    recentUpdates = await db
      .select()
      .from(globalUpdate)
      .orderBy(desc(globalUpdate.createdAt))
      .limit(10);
  } catch (error) {
    console.error("Failed to get recent updates:", error);
  }

  return (
    <div className="container p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">System Monitoring</h1>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Redis Cache */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Redis Cache</h2>
          <p className="text-4xl font-bold mb-2">{cacheKeys.length}</p>
          <p className="text-sm text-muted-foreground">Cached Keys</p>
        </div>

        {/* QStash Schedules */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">QStash Schedules</h2>
          <p className="text-4xl font-bold mb-2">{schedules.length}</p>
          <p className="text-sm text-muted-foreground">Active Cron Jobs</p>
        </div>

        {/* QStash Usage */}
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">QStash Usage Today</h2>
          <div className="space-y-3">
            <div>
              <p className="text-4xl font-bold">
                {qstashUsage.used}
                <span className="text-lg text-muted-foreground">
                  /{qstashUsage.limit}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  qstashUsage.percentage > 80
                    ? "bg-red-500"
                    : qstashUsage.percentage > 60
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(qstashUsage.percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {qstashUsage.remaining} remaining (
              {(100 - qstashUsage.percentage).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="mb-8 border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Active QStash Schedules</h2>
        {schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((s: any) => (
              <div
                key={s.scheduleId}
                className="flex justify-between items-center p-3 bg-secondary rounded-lg"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{s.cron}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.destination}
                  </p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No schedules configured. Run{" "}
            <code className="bg-secondary px-2 py-1 rounded">
              bun run setup:qstash
            </code>{" "}
            to set up schedules.
          </p>
        )}
      </div>

      {/* Recent Updates */}
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Recent Global Updates</h2>
        {recentUpdates.length > 0 ? (
          <div className="space-y-2">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                className="flex justify-between items-center p-3 bg-secondary rounded-lg text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {update.processedUsers || 0} users
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {update.updateType}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                  {update.triggeredBy || "system"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent updates found.
          </p>
        )}
      </div>

      {/* Usage Breakdown */}
      <div className="mt-8 border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Daily QStash Allocation</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Scheduled Jobs</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Hourly global updates: 24 messages</li>
              <li>• Batch onboarding (every 6h): 4 messages</li>
              <li>• Batch goal reminders (daily): 1 message</li>
              <li className="font-medium text-foreground pt-2">
                Total: 29 messages/day
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Available Budget</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Daily limit: 500 messages</li>
              <li>• Scheduled jobs: 29 messages</li>
              <li>• Critical reserve: 100 messages</li>
              <li className="font-medium text-foreground pt-2">
                Available: ~371 messages/day
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
