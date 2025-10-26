# Upstash Integration Summary

This application uses Upstash's serverless platform for caching, scheduling, rate limiting, realtime updates, and durable workflows.

## 🚀 Quick Start

### 1. Get Upstash Credentials

Visit [Upstash Console](https://console.upstash.com) and get your credentials:

**Redis:**
1. Create a new Redis database (or select existing)
2. Copy REST URL and REST Token

**QStash:**
1. Go to QStash section
2. Copy QSTASH_TOKEN
3. Copy QSTASH_CURRENT_SIGNING_KEY
4. Copy QSTASH_NEXT_SIGNING_KEY

### 2. Configure Environment Variables

Create `.env.local` file:

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Upstash QStash
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your Vercel URL in production
```

### 3. Install Dependencies

```bash
bun install
```

### 4. Setup QStash Schedules

**⚠️ Important:** QStash requires a public URL (cannot use localhost)

**For Production:**
```bash
# After deploying to Vercel, update .env.local:
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Then run setup:
bun run workflow:setup
```

**For Local Development (Optional):**
```bash
# Use ngrok or similar tunnel service:
ngrok http 3000

# Update .env.local with tunnel URL:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io

# Run setup:
bun run workflow:setup
```

**Or Skip for Now:**
You can develop locally without QStash schedules and configure them after deployment.

### 5. Start Development Server

```bash
bun run dev
```

### 6. Verify Setup

Visit the monitoring dashboard:
```
http://localhost:3000/admin/monitoring
```

Should show:
- ✅ 3 active QStash schedules
- ✅ Redis cache statistics
- ✅ Daily usage: 29/500 messages

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [UPSTASH_INTEGRATION.md](./docs/UPSTASH_INTEGRATION.md) | Complete integration guide: setup, usage, monitoring |
| [WORKFLOWS.md](./docs/WORKFLOWS.md) | Workflow documentation: patterns, examples, best practices |

## 🏗️ Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Upstash Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Redis        │  │ QStash       │  │ Workflow     │     │
│  │ Cache/Locks  │  │ Cron Jobs    │  │ Durable Fns  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ RateLimit    │  │ Realtime     │                        │
│  │ API Protect  │  │ Live Events  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  lib/                 app/api/                               │
│  ├─ redis.ts         ├─ qstash/                             │
│  ├─ qstash.ts        │  ├─ global-update/                   │
│  ├─ rate-limit.ts    │  ├─ batch-onboarding/               │
│  ├─ realtime.ts      │  └─ batch-goal-reminders/           │
│  └─ ...              ├─ realtime/                           │
│                      └─ workflow/                            │
│                         ├─ setup-qstash/                     │
│                         └─ onboarding/                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Scheduled Jobs (QStash)**:
```
QStash Cron → /api/qstash/* → Process Users → Update Redis → Emit Realtime
  (hourly)      (verify sig)    (with locks)    (invalidate)   (notify)
```

**Realtime Updates (SSE)**:
```
Client (useRealtime) ←─ SSE ←─ /api/realtime ←─ Redis Pub/Sub ←─ Server Actions
   (React hook)                 (handle)          (Realtime)       (emit events)
```

**Durable Workflows**:
```
Trigger → /api/workflow/* → Workflow Steps → Sleep → Resume → Complete
          (POST)           (with retries)    (days)   (auto)   (result)
```

## 📊 Resource Usage

### QStash Daily Allocation

| Job | Schedule | Messages/Day |
|-----|----------|-------------|
| Global Updates | Every hour (`0 * * * *`) | 24 |
| Batch Onboarding | Every 6 hours (`0 */6 * * *`) | 4 |
| Goal Reminders | Daily 8PM (`0 20 * * *`) | 1 |
| **Total Scheduled** | | **29** |
| **Available for Ad-hoc** | | **471** |
| **Limit (Free Tier)** | | **500** |

### Redis Cache TTLs

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `user:stats:{id}` | 15 min | User statistics |
| `user:goals:{id}` | 30 min | User goals |
| `user:sessions:{id}` | 5 min | Study sessions |
| `leaderboard:{metric}:{period}` | 1 hour | Leaderboard rankings |
| `global:update:lock` | 5 min | Update coordination |

### Rate Limits

| Endpoint | Limit | Scope |
|----------|-------|-------|
| API endpoints | 10 req / 10s | Per IP |
| Auth endpoints | 5 req / min | Per IP |
| Global updates | 1 req / 5min | Global |
| Session creation | 30 req / hour | Per User |

## 🛠️ Available Scripts

```bash
# QStash Setup
bun run setup:qstash        # Direct setup script
bun run workflow:setup      # Workflow-based setup (recommended)

# Database
bun run db:push             # Push schema to database
bun run db:studio           # Open Drizzle Studio

# Development
bun run dev                 # Start dev server
bun run build               # Build for production
bun run start               # Start production server
```

## 🔧 Configuration Files

```
c:\Users\bsoun\Documents\Codebase\assist\
├── lib/
│   ├── redis.ts              # Redis client, cache utilities
│   ├── qstash.ts             # QStash client, message queue
│   ├── rate-limit.ts         # Rate limiting config
│   └── realtime.ts           # Realtime event schema
├── app/api/
│   ├── qstash/               # QStash cron endpoints
│   │   ├── global-update/
│   │   ├── batch-onboarding/
│   │   └── batch-goal-reminders/
│   ├── realtime/             # SSE endpoint
│   └── workflow/             # Workflow endpoints
│       ├── setup-qstash/
│       └── onboarding/
├── scripts/
│   ├── setup-qstash-schedules.ts      # Direct setup
│   └── trigger-workflow-setup.ts      # Workflow trigger
└── docs/
    ├── UPSTASH_INTEGRATION.md         # Main docs
    └── WORKFLOWS.md                   # Workflow guide
```

## 📈 Monitoring

### Admin Dashboard

Access at `/admin/monitoring` to view:
- Redis cache statistics
- QStash schedule status
- Daily usage (with progress bar)
- Recent global updates
- Schedule details

### External Dashboards

- **QStash**: https://console.upstash.com/qstash
- **Redis**: https://console.upstash.com/redis
- **Workflow**: https://console.upstash.com/workflow

## 🔒 Security

- ✅ QStash signature verification on all cron endpoints
- ✅ Rate limiting on API/auth endpoints
- ✅ Redis-based distributed locking
- ✅ Environment variable validation
- ✅ Fail-safe error handling

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| QStash signature invalid | Check `QSTASH_CURRENT_SIGNING_KEY` in env |
| Rate limit errors | Review limits in `lib/rate-limit.ts` |
| Cache not invalidating | Verify Redis connection and key names |
| Workflow stuck | Check Upstash console for errors |
| Realtime not working | Verify `/api/realtime` is accessible |

See [UPSTASH_INTEGRATION.md](./docs/UPSTASH_INTEGRATION.md#troubleshooting) for detailed solutions.

## 🎯 Key Features

### 1. Global Lazy Updates
- **Trigger**: Hourly via QStash or on-demand
- **Purpose**: Update user stats, leaderboards, goals
- **Protection**: Redis locks + rate limiting
- **Monitoring**: Admin dashboard

### 2. Batch Processing
- **Onboarding**: Every 6 hours, max 50 users
- **Goal Reminders**: Daily at 8PM, max 100 users
- **Optimization**: Batch to conserve QStash quota

### 3. Realtime Events
- **Transport**: Server-Sent Events (SSE)
- **Events**: Sessions, goals, leaderboard, notifications
- **Client**: `useRealtime` React hook
- **Server**: `realtime.emit()` from actions

### 4. Durable Workflows
- **Setup Workflow**: Configure QStash with retries
- **Onboarding Workflow**: 4-day email sequence
- **Features**: State persistence, long sleeps, retries

## 🔄 Migration Notes

### From Vercel Cron

**Changes**:
- ❌ Removed `vercel.json` cron config
- ❌ Deleted `/api/cron/cleanup` endpoint
- ✅ Added QStash-based endpoints with signature verification
- ✅ Added rate limiting and locking
- ✅ Added comprehensive monitoring

**Benefits**:
- Better observability
- Signature verification
- Automatic retries
- Batch processing
- Usage tracking
- No vendor lock-in

## 📦 Dependencies

```json
{
  "@upstash/redis": "^1.35.6",
  "@upstash/qstash": "^2.8.4",
  "@upstash/ratelimit": "^2.0.6",
  "@upstash/realtime": "^0.3.0",
  "@upstash/workflow": "^0.2.21"
}
```

## 🎓 Learning Resources

- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Upstash QStash Docs](https://docs.upstash.com/qstash)
- [Upstash Workflow Docs](https://upstash.com/docs/workflow/getstarted)
- [Upstash Realtime Docs](https://upstash.com/docs/oss/sdks/ts/realtime/overview)

## 💡 Next Steps

1. **Email Integration**
   - Install Resend/SendGrid
   - Update batch endpoints
   - Add email templates

2. **Enhanced Workflows**
   - Payment retry sequences
   - Streak recovery flows
   - Multi-step content delivery

3. **Analytics**
   - Track cache hit rates
   - Monitor QStash usage trends
   - Alert on quota thresholds

4. **Optimization**
   - Tune cache TTLs based on usage
   - Adjust rate limits for scale
   - Optimize workflow step counts

## 📄 License

MIT

---

**Questions?** See the [full documentation](./docs/UPSTASH_INTEGRATION.md) or check the [troubleshooting guide](./docs/UPSTASH_INTEGRATION.md#troubleshooting).
