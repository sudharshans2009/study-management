# Upstash Integration Documentation

## Overview

This application uses Upstash's serverless data platform for:
- **Redis**: Caching, distributed locking, rate limiting
- **QStash**: Scheduled cron jobs and message queuing
- **RateLimit**: Sliding window rate limiting for API endpoints
- **Realtime**: Server-sent events for live updates
- **Workflow** (optional): Durable serverless functions for complex multi-step processes

## Architecture

### Daily QStash Usage Budget

QStash free tier: **500 messages/day**

**Current Allocation:**
- Hourly global updates: 24 messages/day
- Batch onboarding reminders: 4 messages/day (every 6 hours)
- Daily goal reminders: 1 message/day (8 PM UTC)
- **Total scheduled**: 29 messages/day
- **Available for ad-hoc**: 471 messages/day

### Redis Cache Strategy

**Cache Keys:**
- `user:stats:{userId}` - TTL: 15 minutes
- `user:goals:{userId}` - TTL: 30 minutes
- `user:sessions:{userId}` - TTL: 5 minutes
- `leaderboard:{metric}:{period}` - TTL: 1 hour
- `global:update:lock` - TTL: 5 minutes

**Usage:**
- Automatic invalidation on data mutations
- Pattern-based batch invalidation
- Fail-open strategy for cache misses

### Rate Limiting

**Tiers:**
- API endpoints: 10 requests / 10 seconds per IP
- Auth endpoints: 5 requests / minute per IP
- Global updates: 1 request / 5 minutes globally
- Session creation: 30 requests / hour per user

**Implementation:**
- Sliding window algorithm via Upstash RateLimit
- Fail-open on rate limit errors
- Per-IP and per-user tracking

## Setup

### 1. Environment Variables

**Get your credentials from [Upstash Console](https://console.upstash.com):**

**Redis:**
- Create a Redis database
- Copy REST URL and REST Token

**QStash:**
- Go to QStash section
- Copy all tokens and signing keys

Add to `.env.local`:

```env
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Upstash QStash
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# Your app URL (for QStash callbacks)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**How to get credentials:**
1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database (select serverless)
3. Copy REST URL and token from database details
4. Create a new QStash project
5. Copy QStash token and signing keys

### 2. Install Dependencies

```bash
bun install
```

Packages installed:
- `@upstash/redis@1.35.6`
- `@upstash/qstash@2.8.4`
- `@upstash/ratelimit@2.0.6`
- `@upstash/realtime@0.3.0`
- `@upstash/workflow@0.2.21`

### 3. Configure QStash Schedules

**⚠️ Important:** QStash requires a publicly accessible URL. It cannot call localhost addresses.

**Option 1: Production Setup (Recommended)**

After deploying to Vercel or your hosting provider:

```bash
# Update .env.local with production URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Run setup
bun run workflow:setup
```

**Option 2: Local Development with Tunnel**

Use a tunnel service to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start your app
bun run dev

# In another terminal, start tunnel
ngrok http 3000

# Update .env.local with ngrok URL
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io

# Run setup
bun run workflow:setup
```

**Option 3: Use Workflow-based Setup via API**

After deploying, trigger setup remotely:

```bash
curl -X POST https://your-app.vercel.app/api/workflow/setup-qstash
```

**Benefits of Workflow approach**:
- ✅ Automatic retries on failures
- ✅ State persists across server restarts
- ✅ Better error handling and logging
- ✅ Can be triggered remotely
- ✅ Failure notifications

See [Workflow Documentation](./WORKFLOWS.md) for more details.

**Schedules Created**:
- **Hourly Global Updates**: `0 * * * *` (every hour at :00)
  - Endpoint: `/api/qstash/global-update`
  - Processes all users needing stats/leaderboard updates
  
- **Batch Onboarding Reminders**: `0 */6 * * *` (every 6 hours)
  - Endpoint: `/api/qstash/batch-onboarding`
  - Sends welcome emails to recent signups
  - Processes max 50 users per batch
  
- **Daily Goal Reminders**: `0 20 * * *` (8 PM UTC)
  - Endpoint: `/api/qstash/batch-goal-reminders`
  - Notifies users with incomplete daily goals
  - Processes max 100 users per batch

### 4. Verify Setup

Check the monitoring dashboard:

```
https://your-app.vercel.app/admin/monitoring
```

Should display:
- Redis cache key count
- Active QStash schedules (3)
- QStash daily usage
- Recent global updates

## Usage

### Caching Data

```typescript
import { getCachedData, invalidateCache } from "@/lib/redis";

// Get cached or fetch fresh data
const stats = await getCachedData(
  `user:stats:${userId}`,
  async () => {
    // Fetch logic
    return await db.query.userStats.findFirst({ where: eq(userStats.userId, userId) });
  },
  900 // TTL in seconds (15 minutes)
);

// Invalidate cache after mutation
await invalidateCache(`user:stats:${userId}`);
```

### Rate Limiting

```typescript
import { apiRateLimit, checkRateLimit } from "@/lib/rate-limit";

// In API routes
export async function POST(request: Request) {
  const { success } = await checkRateLimit(apiRateLimit, request);
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }
  
  // Process request...
}
```

### Publishing QStash Messages

```typescript
import { publishMessage, hasQStashQuota } from "@/lib/qstash";

// Check quota before sending
if (!await hasQStashQuota()) {
  throw new Error("QStash daily quota exceeded");
}

// Send message
await publishMessage({
  url: "https://your-app.com/api/webhook",
  body: { userId: "123", action: "notify" },
  headers: { "Content-Type": "application/json" },
});
```

### Batch Publishing

```typescript
import { publishMessageBatch } from "@/lib/qstash";

const users = await db.query.users.findMany();
const messages = users.map(user => ({
  url: `${process.env.NEXT_PUBLIC_APP_URL}/api/notify`,
  body: JSON.stringify({ userId: user.id }),
}));

// Automatically respects quota
await publishMessageBatch(messages);
```

### Realtime Events

**Server-side (emit events):**

```typescript
import { realtime } from "@/lib/realtime";

// Emit session completion
await realtime.emit("sessionCompleted", {
  userId: "user-123",
  sessionId: "session-456",
  duration: 1800, // 30 minutes in seconds
  timestamp: Date.now(),
});

// Emit goal progress
await realtime.emit("goalProgress", {
  userId: "user-123",
  goalId: "goal-789",
  progress: 15,
  target: 30,
  timestamp: Date.now(),
});
```

**Client-side (listen for events):**

```tsx
"use client";

import { useRealtime } from "@upstash/realtime/react";
import { RealtimeEvents } from "@/lib/realtime";

export function DashboardLive({ userId }: { userId: string }) {
  const { data, error } = useRealtime<RealtimeEvents>(userId, {
    url: "/api/realtime",
    history: 10, // Get last 10 messages
  });

  useEffect(() => {
    if (data?.sessionCompleted) {
      toast.success(`Session completed: ${data.sessionCompleted.duration}s`);
    }
    
    if (data?.goalProgress) {
      // Update UI with live progress
      setProgress(data.goalProgress.progress);
    }
  }, [data]);

  return <div>Live updates enabled</div>;
}
```

### Available Realtime Events

| Event | Payload | Description |
|-------|---------|-------------|
| `sessionStarted` | `{ userId, sessionId, subjectId?, timestamp }` | Study session started |
| `sessionCompleted` | `{ userId, sessionId, duration, timestamp }` | Study session finished |
| `sessionPaused` | `{ userId, sessionId, timestamp }` | Study session paused |
| `goalProgress` | `{ userId, goalId, progress, target, timestamp }` | Goal progress updated |
| `goalCompleted` | `{ userId, goalId, title, timestamp }` | Goal completed |
| `goalStreak` | `{ userId, goalId, streak, timestamp }` | Streak updated |
| `leaderboardRankChange` | `{ userId, metric, oldRank?, newRank, score, timestamp }` | User rank changed |
| `leaderboardUpdated` | `{ metric, period, timestamp }` | Leaderboard recalculated |
| `notificationInfo` | `{ userId, message, timestamp }` | Info notification |
| `notificationSuccess` | `{ userId, message, timestamp }` | Success notification |
| `notificationWarning` | `{ userId, message, timestamp }` | Warning notification |
| `globalUpdateStarted` | `{ triggeredBy, timestamp }` | Global update started |
| `globalUpdateCompleted` | `{ processedUsers, timestamp }` | Global update finished |

## QStash Endpoints

### Global Update (`/api/qstash/global-update`)

**Trigger:** Hourly via QStash cron

**Purpose:** Process global lazy updates for all users

**Logic:**
1. Verify QStash signature
2. Check rate limit (1 per 5 minutes)
3. Acquire Redis lock (prevents concurrent runs)
4. Get users needing updates
5. Process each user's stats, leaderboard, goals
6. Log update to database
7. Release lock

**Response:**
```json
{
  "success": true,
  "processedUsers": 42,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Batch Onboarding (`/api/qstash/batch-onboarding`)

**Trigger:** Every 6 hours via QStash cron

**Purpose:** Send welcome emails to recent signups

**Logic:**
1. Verify QStash signature
2. Find users who signed up 5+ minutes ago
3. Filter users who haven't received onboarding email
4. Process max 50 users per batch
5. Send emails via Resend/SendGrid (TODO)
6. Mark users as onboarded

**Response:**
```json
{
  "success": true,
  "processedUsers": 12,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Batch Goal Reminders (`/api/qstash/batch-goal-reminders`)

**Trigger:** Daily at 8 PM UTC via QStash cron

**Purpose:** Remind users with incomplete daily goals

**Logic:**
1. Verify QStash signature
2. Find users with active daily goals
3. Check who hasn't studied today
4. Process max 100 users per batch
5. Send reminder emails (TODO)
6. Log reminders sent

**Response:**
```json
{
  "success": true,
  "processedUsers": 23,
  "totalGoals": 45,
  "timestamp": "2024-01-15T20:00:00.000Z"
}
```

## Monitoring

Access the admin dashboard at `/admin/monitoring` to view:

### Redis Stats
- Total cache keys
- Memory usage (from Redis info)

### QStash Stats
- Active schedules count
- Daily usage (used/limit/percentage)
- Color-coded progress bar:
  - 🟢 Green: 0-70% usage
  - 🟡 Yellow: 70-90% usage
  - 🔴 Red: 90-100% usage

### Schedule Details
- Schedule name
- Cron expression
- Destination endpoint
- Creation timestamp

### Recent Updates
- Last 10 global updates
- Processed user count
- Trigger source (lazy, qstash-hourly, manual)
- Timestamp

### Usage Breakdown
- Scheduled messages per day
- Available quota remaining

## Troubleshooting

### QStash signature verification fails

**Problem:** `Invalid signature` errors in logs

**Solutions:**
1. Check `QSTASH_CURRENT_SIGNING_KEY` in environment variables
2. Verify `QSTASH_NEXT_SIGNING_KEY` is set (for key rotation)
3. Ensure `NEXT_PUBLIC_APP_URL` matches your deployed URL
4. Check QStash console for key rotation events

### Rate limit exceeded

**Problem:** 429 Too Many Requests responses

**Solutions:**
1. Review rate limit configurations in `lib/rate-limit.ts`
2. Check if legitimate traffic is being blocked
3. Consider increasing limits for authenticated users
4. Implement exponential backoff in client

### Global updates not running

**Problem:** No updates in monitoring dashboard

**Solutions:**
1. Verify QStash schedules exist: `bun run setup:qstash`
2. Check QStash dashboard for failed deliveries
3. Review logs for rate limit or lock acquisition failures
4. Ensure Redis is accessible (check `UPSTASH_REDIS_REST_URL`)

### Cache not invalidating

**Problem:** Stale data displayed after mutations

**Solutions:**
1. Verify `invalidateCache()` called after DB writes
2. Check Redis connection (test with `redis.ping()`)
3. Use `invalidateCachePattern()` for batch invalidation
4. Review cache key naming consistency

### QStash quota exceeded

**Problem:** `QStash daily quota exceeded` errors

**Solutions:**
1. Check usage in monitoring dashboard
2. Review message volume in QStash console
3. Reduce batch sizes in cron jobs
4. Implement priority system (critical vs. non-critical)
5. Consider upgrading QStash plan

### Realtime events not received

**Problem:** Client not receiving SSE updates

**Solutions:**
1. Verify `/api/realtime` endpoint is accessible
2. Check browser console for connection errors
3. Ensure Redis is properly configured
4. Test event emission from server actions
5. Verify `useRealtime` hook userId matches emitted events

## Performance Optimization

### Cache Hit Rate
- Target: >80% cache hit rate
- Monitor: Add Redis `INFO` command tracking
- Optimize: Adjust TTLs based on access patterns

### QStash Usage
- Monitor daily usage trends
- Batch similar operations
- Use `publishMessageBatch()` for efficiency
- Reserve quota for critical operations

### Rate Limiting
- Review limits monthly based on traffic
- Implement tiered limits (free vs. paid users)
- Use Redis for distributed rate limiting across regions

### Realtime Connections
- Limit concurrent SSE connections per user
- Implement heartbeat mechanism
- Close idle connections after timeout
- Use Redis pub/sub for multi-server deployments

## Migration from Vercel Cron

**Old Setup (Vercel Cron):**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 * * * *"
  }]
}
```

**New Setup (QStash):**
- Removed `vercel.json` cron configuration
- Deleted `/api/cron/cleanup` endpoint
- Created QStash-based endpoints with signature verification
- Added rate limiting and distributed locking
- Implemented batch processing for quota efficiency

**Benefits:**
- ✅ Better observability (QStash dashboard)
- ✅ Signature verification for security
- ✅ Automatic retries on failure
- ✅ Message batching support
- ✅ Usage tracking and quota management
- ✅ No vendor lock-in (can migrate to other cron services)

## Next Steps

### Email Integration
Add email service for notifications:
- Install Resend or SendGrid SDK
- Update batch onboarding endpoint
- Update batch goal reminders endpoint
- Add email templates

### Workflow Integration
For complex multi-step processes, this application uses Upstash Workflow.

**📘 See [WORKFLOWS.md](./WORKFLOWS.md) for complete documentation.**

**Available Workflows**:
1. **QStash Setup** (`/api/workflow/setup-qstash`) - Durable schedule configuration
2. **User Onboarding** (`/api/workflow/onboarding`) - 4-day email sequence

**Quick Example**:
```typescript
import { serve } from "@upstash/workflow/nextjs";

export const { POST } = serve<{ userId: string; email: string }>(
  async (context) => {
    const { userId, email } = context.requestPayload;

    // Step 1: Send welcome email
    await context.run("welcome-email", async () => {
      await sendEmail(email, "Welcome!");
    });
    
    // Wait 1 day
    await context.sleep("wait-1-day", 60 * 60 * 24);
    
    // Step 2: Check activity and send reminder
    const hasActivity = await context.run("check-activity", async () => {
      return await checkUserActivity(userId);
    });

    if (!hasActivity) {
      await context.run("reminder", async () => {
        await sendEmail(email, "Get started!");
      });
    }

    return { success: true };
  },
  { retries: 3 }
);
```

**Key Features**:
- ✅ Durable execution (survives server restarts)
- ✅ Automatic retries on failures  
- ✅ Long-running (days/weeks between steps)
- ✅ State persistence across steps
- ✅ Conditional logic support
- ✅ Built-in observability

**Use Cases**:
- Multi-day onboarding sequences
- Payment retry workflows with delays
- Streak recovery reminders
- Long-running data processing
- Scheduled content delivery
- Trial expiration flows

**Monitoring**: https://console.upstash.com/workflow

### Analytics Integration
Track key metrics:
- Cache hit/miss rates
- QStash message counts by endpoint
- Rate limit trigger frequency
- Global update processing times
- Realtime connection counts

## Security

### QStash Signature Verification
All QStash endpoints verify signatures:
```typescript
import { verifyQStashSignature } from "@/lib/qstash";

export async function POST(request: Request) {
  const isValid = await verifyQStashSignature(request);
  if (!isValid) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Process request...
}
```

### Redis Security
- Use REST API (not direct Redis protocol)
- Enable TLS for connections
- Rotate tokens regularly
- Implement IP allowlisting in production

### Rate Limit Bypass Prevention
- Use cryptographic identifiers for users
- Combine IP and user-based limiting
- Implement CAPTCHA for repeated violations
- Log and alert on suspicious patterns

## Resources

- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Upstash QStash Docs](https://docs.upstash.com/qstash)
- [Upstash RateLimit Docs](https://github.com/upstash/ratelimit)
- [Upstash Realtime Docs](https://upstash.com/docs/oss/sdks/ts/realtime/overview)
- [Upstash Workflow Docs](https://upstash.com/docs/workflow/getstarted)
- [QStash Dashboard](https://console.upstash.com/qstash)
- [Redis Dashboard](https://console.upstash.com/redis)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review Upstash documentation
3. Check application logs at Vercel dashboard
4. Verify environment variables are set correctly
5. Test endpoints manually with Postman/curl

## License

MIT
