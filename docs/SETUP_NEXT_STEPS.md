# ✅ Setup Complete - Next Steps

The Upstash Workflow integration has been successfully implemented! Here's what you need to do to get started:

## 📋 Current Status

✅ **Completed:**
- Redis client and caching utilities
- QStash client with usage tracking
- Rate limiting configuration
- QStash cron endpoints (3)
- Realtime SSE endpoint
- Workflow setup script
- Comprehensive documentation
- Monitoring dashboard

⏳ **Requires Configuration:**
- Upstash credentials in `.env.local`

## 🚀 How to Get Started

### Step 1: Get Upstash Credentials (5 minutes)

1. Visit **https://console.upstash.com**
2. Sign up or log in

**For Redis:**
3. Click "Create Database"
4. Select "Serverless" and choose a region
5. Copy the **REST URL** and **REST Token**

**For QStash:**
6. Go to QStash section
7. Copy these values:
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`

### Step 2: Configure Environment (2 minutes)

Create `.env.local` file in the project root:

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXm5AAIncD...

# Upstash QStash
QSTASH_TOKEN=eyJVc2...
QSTASH_CURRENT_SIGNING_KEY=sig_...
QSTASH_NEXT_SIGNING_KEY=sig_...

# App URL (change in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Setup QStash Schedules (1 minute)

**⚠️ Important: QStash requires a public URL**

QStash cannot call localhost addresses. You have two options:

**Option A: Production Setup (Recommended)**
1. Deploy your app to Vercel first
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
3. Run the setup:
   ```bash
   bun run workflow:setup
   ```

**Option B: Local Development with Tunnel**
1. Install ngrok: `npm install -g ngrok`
2. Start your app: `bun run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```
6. Run setup: `bun run workflow:setup`

**Option C: Skip for Now**
You can develop locally without QStash schedules and set them up when deploying to production.

The setup will:
- Delete any existing schedules
- Create 3 new schedules:
  - ✅ Hourly global updates
  - ✅ Batch onboarding (every 6h)
  - ✅ Daily goal reminders (8 PM UTC)
- Show usage allocation (29/500 messages/day)

### Step 4: Start the App (1 second)

```bash
bun run dev
```

### Step 5: Verify Everything Works

1. **Open monitoring dashboard:**
   ```
   http://localhost:3000/admin/monitoring
   ```

2. **Check for:**
   - ✅ Redis cache statistics
   - ✅ 3 active QStash schedules
   - ✅ Daily usage showing 29/500

3. **View schedules in Upstash:**
   - Visit https://console.upstash.com/qstash
   - You should see 3 active schedules

## 📚 What's Available

### Scripts

```bash
bun run workflow:setup    # Setup QStash schedules (recommended)
bun run setup:qstash      # Alternative simple setup
bun run dev               # Start development server
bun run build             # Build for production
```

### Endpoints

| Endpoint | Purpose | Trigger |
|----------|---------|---------|
| `/api/qstash/global-update` | Update all users | Hourly |
| `/api/qstash/batch-onboarding` | Onboarding emails | Every 6h |
| `/api/qstash/batch-goal-reminders` | Goal reminders | Daily 8PM |
| `/api/realtime` | Server-sent events | Client connection |
| `/api/workflow/setup-qstash` | Durable setup | Manual/API |
| `/api/workflow/onboarding` | 4-day email flow | Manual/API |
| `/admin/monitoring` | Dashboard | Browser |

### Documentation

| File | Description |
|------|-------------|
| [README_UPSTASH.md](../README_UPSTASH.md) | Overview and quick start |
| [docs/UPSTASH_INTEGRATION.md](./UPSTASH_INTEGRATION.md) | Complete integration guide |
| [docs/WORKFLOWS.md](./WORKFLOWS.md) | Workflow patterns and examples |

## 🎯 Key Features

### 1. Caching (Redis)
```typescript
import { getCachedData } from "@/lib/redis";

const stats = await getCachedData(
  `user:stats:${userId}`,
  async () => fetchStats(userId),
  900 // 15 minutes
);
```

### 2. Rate Limiting
```typescript
import { apiRateLimit, checkRateLimit } from "@/lib/rate-limit";

const { success } = await checkRateLimit(apiRateLimit, request);
if (!success) return new Response("Too many requests", { status: 429 });
```

### 3. Scheduled Jobs (QStash)
- Hourly: Process all user updates
- Every 6h: Send onboarding emails
- Daily 8PM: Send goal reminders

### 4. Realtime Events (SSE)
```typescript
// Server
import { realtime } from "@/lib/realtime";
await realtime.emit("sessionCompleted", { userId, duration, timestamp });

// Client
import { useRealtime } from "@upstash/realtime/react";
const { data } = useRealtime(userId, { url: "/api/realtime" });
```

### 5. Durable Workflows
```typescript
// Multi-day email sequences with automatic retries
POST /api/workflow/onboarding
Body: { userId, email, name }
```

## 🔧 Configuration

### QStash Usage (Free Tier)

| Schedule | Frequency | Messages/Day |
|----------|-----------|--------------|
| Global Updates | Hourly | 24 |
| Onboarding | Every 6h | 4 |
| Goal Reminders | Daily | 1 |
| **Total** | | **29** |
| **Available** | | **471** |

### Cache TTLs

| Data Type | TTL |
|-----------|-----|
| User Stats | 15 min |
| User Goals | 30 min |
| Sessions | 5 min |
| Leaderboard | 1 hour |

### Rate Limits

| Type | Limit |
|------|-------|
| API | 10 req / 10s per IP |
| Auth | 5 req / min per IP |
| Global Update | 1 req / 5min |
| Sessions | 30 req / hour per user |

## 🐛 Troubleshooting

### "QSTASH_TOKEN not found"

**Fix:** Add credentials to `.env.local` (see Step 2 above)

### "invalid destination url: endpoint resolves to a loopback address"

**Cause:** QStash cannot call localhost/127.0.0.1

**Solution 1 - Production (Recommended):**
```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Update .env.local
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 3. Run setup
bun run workflow:setup
```

**Solution 2 - Local with Tunnel:**
```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start app
bun run dev

# 3. Start tunnel (in another terminal)
ngrok http 3000

# 4. Update .env.local with ngrok URL
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io

# 5. Run setup
bun run workflow:setup
```

**Solution 3 - Skip for Now:**
You can develop without QStash schedules and set them up later when deploying.

### Schedules not running

**Check:**
1. Visit https://console.upstash.com/qstash
2. Verify 3 schedules are active
3. Check "Last Run" timestamps
4. Review delivery logs

### Monitoring dashboard shows 0 schedules

**Fix:**
1. Ensure schedules were created: `bun run workflow:setup`
2. Verify QSTASH_TOKEN in `.env.local`
3. Check Upstash console for schedules

## 📊 Monitoring

### Local Dashboard
```
http://localhost:3000/admin/monitoring
```

Shows:
- Redis cache stats
- QStash schedules (3)
- Daily usage (29/500)
- Recent updates

### Upstash Console

**QStash:**
- https://console.upstash.com/qstash
- View schedules, runs, logs

**Redis:**
- https://console.upstash.com/redis
- Monitor memory, operations

**Workflows:**
- https://console.upstash.com/workflow
- Track workflow runs

## 🎓 Learn More

### Upstash Docs
- [Redis](https://docs.upstash.com/redis)
- [QStash](https://docs.upstash.com/qstash)
- [Workflow](https://upstash.com/docs/workflow/getstarted)
- [Realtime](https://upstash.com/docs/oss/sdks/ts/realtime/overview)

### Project Docs
- Read [UPSTASH_INTEGRATION.md](./UPSTASH_INTEGRATION.md) for detailed usage
- Read [WORKFLOWS.md](./WORKFLOWS.md) for workflow patterns
- Check [README_UPSTASH.md](../README_UPSTASH.md) for architecture

## ✨ Next Steps (Optional)

### 1. Email Integration
- Install Resend: `bun add resend`
- Update batch endpoints with email sending
- Add email templates

### 2. Custom Workflows
- Create payment retry workflow
- Add streak recovery reminders
- Implement trial expiration

### 3. Enhanced Monitoring
- Add Sentry for error tracking
- Implement usage alerts
- Create analytics dashboard

### 4. Production Deployment
- Add environment variables to Vercel
- Update NEXT_PUBLIC_APP_URL
- Run setup: `curl -X POST https://your-app.vercel.app/api/workflow/setup-qstash`
- Monitor in Upstash console

## 🎉 You're All Set!

Once you complete Steps 1-5 above, you'll have:
- ✅ Distributed caching with Redis
- ✅ Automated cron jobs with QStash
- ✅ Rate limiting on all endpoints
- ✅ Real-time updates via SSE
- ✅ Durable workflows for complex processes
- ✅ Comprehensive monitoring

**Need help?** Check the troubleshooting sections in the documentation files.
