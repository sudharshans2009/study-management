# Vercel Cron Job Setup (Timezone-Aware with Exact Matching)

This project includes an automatic cron job that resets goal periods **exactly at each user's local midnight** (timezone-aware).

## How It Works

The system uses a **precise 30-minute cron job** with exact timezone matching:

1. **Every 30 Minutes**: Cron runs at :00 and :30 (e.g., 00:00, 00:30, 01:00, 01:30 UTC, etc.)
2. **Exact Matching**: For each user, checks if their local time is **exactly** midnight (hour 0, minute 0 or 30)
3. **Selective Processing**: Only resets goals for users at their exact midnight
4. **One Reset Per Day**: Each user gets processed exactly once per day when their midnight hits

### Example Timeline
- **User in India (GMT+5:30)**: Midnight at 00:00 IST = 18:30 UTC → Processed at **18:30 UTC** ✅
- **User in NYC (GMT-5:00)**: Midnight at 00:00 EST = 05:00 UTC → Processed at **05:00 UTC** ✅
- **User in Shanghai (GMT+8:00)**: Midnight at 00:00 CST = 16:00 UTC → Processed at **16:00 UTC** ✅

The 30-minute interval ensures all timezones (both :00 and :30 offsets) are covered precisely.

## Configuration

### 1. Vercel Cron Configuration
The `vercel.json` file is already configured with:
```json
{
  "crons": [
    {
      "path": "/api/cron/reset-goals",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

This runs the goal period reset job **every 30 minutes** (at :00 and :30).

### 2. Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `CRON_SECRET`
   - **Value**: A secure random string (generate with `openssl rand -base64 32`)
   - **Environment**: Production, Preview, Development

Example value:
```
cron_8k3j9d2f8h3k9d2f8h3k9d2f8h3k9d2f
```

### 3. Update Local Environment

Add the same `CRON_SECRET` to your `.env.local` file:
```bash
CRON_SECRET=your-secure-random-string-here
```

## Detailed Flow

1. **Vercel Cron** triggers the endpoint at `/api/cron/reset-goals` every 30 minutes (at :00 and :30)
2. The endpoint verifies the `Authorization: Bearer {CRON_SECRET}` header
3. `checkAndResetGoalPeriods()` function runs to:
   - Query all users with their timezone preferences
   - For each user, check if `isAtUserMidnight(timezone)` returns true
   - Skip users whose local time is NOT exactly midnight (hour 0, minute 0 or 30)
   - For users at their exact midnight:
     - Find all active goals with expired periods
     - Calculate if each period was completed (progress ≥ target)
     - Update streaks (increment if completed, reset if missed)
     - Move to the next period window
4. Users see toast notifications when they next visit the app

## User Timezone Setup

Users configure their timezone during onboarding (step 3) or in settings:
- **Auto-detection**: Browser timezone detected automatically
- **14 Supported Timezones**: UTC, India, US zones (4), Europe (3), Asia (3), Pacific (2)
- **Default**: Asia/Kolkata (India Standard Time)

Goals reset at **midnight in the user's timezone**, not UTC.

## Backup Mechanism

The app also includes a **client-side backup check** that runs:
- On app mount (when user visits the goals page)
- Every 30 minutes while the app is open (aligned with cron schedule)

This ensures period resets happen even if the cron job fails. The same timezone-aware logic applies—only processes goals when user's local time is exactly midnight.

## Testing the Cron Job

### Test Locally
```bash
# Generate a CRON_SECRET
openssl rand -base64 32

# Add to .env.local
echo "CRON_SECRET=your-generated-secret" >> .env.local

# Start dev server
bun run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/cron/reset-goals \
  -H "Authorization: Bearer your-generated-secret"
```

### Test in Production
```bash
curl -X POST https://your-domain.vercel.app/api/cron/reset-goals \
  -H "Authorization: Bearer your-production-cron-secret"
```

## Cron Schedule

The schedule is set to `*/30 * * * *` (every 30 minutes) for precise timezone-aware processing.

**Do NOT change this to less frequent**:
- ❌ `0 0 * * *` (daily) - Won't work for timezone-aware resets
- ❌ `0 * * * *` (hourly) - Will miss timezones with :30 offsets (like India GMT+5:30)
- ❌ `0 */6 * * *` (every 6 hours) - Will miss many users

**Why every 30 minutes?**
- **Covers :00 and :30 offsets**: Timezones like India (GMT+5:30) have 30-minute offsets
- **Exact matching**: Only processes users when their local time is exactly midnight (hour 0, minute 0 or 30)
- **Universal coverage**: All timezones in the world either have :00 or :30 offsets
- **Efficient**: Each user processed exactly once per day at their precise midnight

**Alternative schedules NOT recommended:**
- `* * * * *` (every minute) - Wasteful, no benefit over 30-minute schedule
- More frequent than 30 minutes - No additional timezones to cover

## Monitoring

Check the Vercel **Logs** tab to monitor cron job executions:
1. Go to your project in Vercel
2. Click **Logs** in the navigation
3. Filter by `/api/cron/reset-goals` to see execution logs

## Troubleshooting

**Cron job not running?**
- Verify `CRON_SECRET` is set in Vercel environment variables
- Check the Vercel Logs for any errors
- Ensure your Vercel plan supports Cron Jobs (Hobby and Pro plans do)

**401 Unauthorized errors?**
- The `CRON_SECRET` in Vercel environment variables must match the one sent in the `Authorization` header
- Redeploy after adding environment variables

**Goals not resetting at my midnight?**
1. Check your timezone setting:
   - Go to Profile page → Study Settings → Timezone
   - Verify timezone matches your location
2. Check the logs in Vercel:
   - Look for `usersProcessed` in cron response
   - Should be > 0 exactly when your local time hits midnight
3. The client-side backup will still work if cron fails
4. Exact matching rules:
   - Reset only happens when local time is EXACTLY 00:00 or 00:30
   - If your timezone offset is :00 (like NYC), reset at 00:00
   - If your timezone offset is :30 (like India), reset at 00:30

**User in unsupported timezone?**
- The system falls back to the nearest supported timezone
- 14 timezones cover most of the world's major regions
- If needed, add more timezones to `lib/timezone-utils.ts`

**Testing timezone logic?**
```typescript
// In browser console on goals page
import { isAtUserMidnight } from '@/lib/timezone-utils';

// Test if it's exactly midnight in different timezones
console.log('UTC:', isAtUserMidnight('UTC'));
console.log('India:', isAtUserMidnight('Asia/Kolkata'));
console.log('NYC:', isAtUserMidnight('America/New_York'));
```

**Performance concerns?**
- The system only processes users at their exact midnight
- Typical execution (every 30 minutes): 
  - Queries all users (~100-1000ms depending on DB size)
  - Filters to ~2% of users (30 min / 24 hours)
  - Processes only filtered users' goals
- Result: 98% of users skipped each run, minimal server load
- With exact matching, even fewer users processed per run (only those with matching offset)
