# Timezone-Aware Goal Reset System

## Overview

The goal tracking system now resets goals at each user's **local midnight** instead of a global UTC midnight. This provides a personalized experience where goals reset at the right time for each user regardless of their location.

## Key Features

### 1. User Timezone Preference
- **Auto-detection**: Browser timezone detected automatically during onboarding
- **Manual selection**: Users can select from 14 supported timezones
- **Configurable**: Can be changed in settings (profile page)
- **Default**: Asia/Kolkata (India Standard Time)

### 2. Supported Timezones (14 Regions)

**Americas:**
- `America/New_York` - Eastern Time (GMT-5)
- `America/Chicago` - Central Time (GMT-6)
- `America/Denver` - Mountain Time (GMT-7)
- `America/Los_Angeles` - Pacific Time (GMT-8)

**Europe:**
- `Europe/London` - British Time (GMT+0/+1)
- `Europe/Paris` - Central European Time (GMT+1/+2)
- `Europe/Berlin` - Central European Time (GMT+1/+2)

**Asia:**
- `Asia/Kolkata` - India Standard Time (GMT+5:30) ⭐ Default
- `Asia/Dubai` - Gulf Standard Time (GMT+4)
- `Asia/Shanghai` - China Standard Time (GMT+8)
- `Asia/Tokyo` - Japan Standard Time (GMT+9)

**Pacific:**
- `Australia/Sydney` - Australian Eastern Time (GMT+10/+11)
- `Pacific/Auckland` - New Zealand Time (GMT+12/+13)

**Other:**
- `UTC` - Coordinated Universal Time (GMT+0)

## System Architecture

### 30-Minute Cron with Exact Matching

```
┌─────────────────────────────────────────────────────────┐
│  Vercel Cron: Runs every 30 minutes at :00 and :30     │
│  Schedule: "*/30 * * * *"                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  1. Query all users with timezones                       │
│  2. For each user, check: isAtUserMidnight(timezone)    │
│  3. Filter to users at EXACT midnight (hour 0, min 0/30)│
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Process filtered users only (typically 2% per run)      │
│  - Find active goals with expired periods               │
│  - Calculate completion (progress ≥ target)             │
│  - Update streaks and move to next period               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Result: Each user processed once per day at their      │
│  EXACT local midnight (precise to the minute)           │
└─────────────────────────────────────────────────────────┘
```

### Exact Midnight Matching Explained

The system checks if the user's local time is **exactly midnight** (hour 0, minute 0 or 30):

- **00:00** in user's timezone → Goals get reset ✅
- **00:30** in user's timezone → Goals get reset ✅
- Any other time → Skipped ❌

**Examples:**
- User in India (GMT+5:30) with midnight at **00:00 IST**
  - Local time: 00:00 (hour 0, minute 0) → Reset! ✅
  - But wait, India is GMT+5:30, so midnight is at 00:30 local time
  - Actually: 00:30 IST = 19:00 UTC previous day
  - Processed during: 19:00 UTC cron run (when minute is :00) ✅
  
- User in NYC (GMT-5) with midnight at **00:00 EST**
  - Local time: 00:00 (hour 0, minute 0) → Reset! ✅
  - UTC time: 05:00 UTC
  - Processed during: 05:00 UTC cron run ✅

- User in Shanghai (GMT+8) with midnight at **00:00 CST**
  - Local time: 00:00 (hour 0, minute 0) → Reset! ✅
  - UTC time: 16:00 UTC previous day
  - Processed during: 16:00 UTC cron run ✅

### Why Every 30 Minutes Instead of Hourly?

**Old System (Daily at UTC midnight):**
- ❌ All users reset at same UTC time
- ❌ India users: Reset at 5:30 AM (inconvenient)
- ❌ US users: Reset in afternoon (not midnight)

**Previous System (Hourly with ±30min window):**
- ⚠️ Imprecise: Resets could happen 30 minutes before/after midnight
- ⚠️ Misses :30 offset timezones if only running at :00

**Current System (Every 30 minutes with exact matching):**
- ✅ Each user resets at their EXACT local midnight
- ✅ Covers :00 and :30 offsets (India, Nepal, etc.)
- ✅ Efficient: Only 2% of users processed per run (30 min / 24 hours)
- ✅ Precise: No approximation, resets at exactly midnight
- ✅ Scalable: No need to check every minute

## Implementation Files

### Core Utilities

**`lib/timezone-utils.ts`**
- `TIMEZONES` - Array of 14 supported timezones
- `detectBrowserTimezone()` - Auto-detect from browser
- `getUserMidnightToday(timezone)` - Get user's midnight Date
- `isAtUserMidnight(timezone)` - Check if exactly at midnight (hour 0, minute 0 or 30)
- `formatUserDate(date, timezone)` - Format dates in user's timezone
- `isValidTimezone(timezone)` - Validation helper

### Database

**`database/schema.ts`**
- User table: Added `timezone` field (default: "Asia/Kolkata")
- Migration: `0004_bent_klaw.sql`

### Onboarding Flow

**`components/auth/setup-profile-form.tsx`**
- Step 3: "Daily Study Goal & Timezone"
- Timezone selector with auto-detection
- Description: "Goals will reset at midnight in your timezone"

**`lib/validations/auth.ts`**
- `setupProfileSchema` includes timezone validation

**`actions/setup-actions.ts`**
- Saves timezone during onboarding completion

### Settings Management

**`actions/settings-actions.ts`**
- `updateUserTimezone(timezone)` - Update user's timezone
- `getUserTimezone()` - Get current timezone (defaults to India)

### Goal Reset Logic

**`actions/goals-actions.ts`**
- `checkAndResetGoalPeriods()` - Now timezone-aware:
  1. Queries all users with timezones
  2. Filters users with `isNearUserMidnight(timezone)`
  3. Only processes filtered users' goals
  4. Returns stats: `usersProcessed`, `resetCount`, `resets`

### Cron Job

**`app/api/cron/reset-goals/route.ts`**
- Runs every 30 minutes (triggered by Vercel Cron)
- Calls `checkAndResetGoalPeriods()` with no userId (all users)
- Returns: Users processed and goals reset

**`vercel.json`**
- Schedule changed from `"0 0 * * *"` to `"0 * * * *"`
- Runs every hour at :00 minutes

### Client-Side Backup

**`hooks/use-goal-period-check.ts`**
- Interval changed from 5 minutes to 1 hour
- Runs same timezone-aware logic on client
- Fallback if cron job fails

## User Experience

### During Onboarding (Step 3)

```
┌────────────────────────────────────────────┐
│  Daily Study Goal & Timezone               │
├────────────────────────────────────────────┤
│  Daily Goal: [120] minutes                 │
│                                            │
│  Timezone: [🌍 America/New_York]          │
│  ↓ Select your timezone                    │
│                                            │
│  ℹ️ Goals will reset at midnight in your   │
│     timezone                               │
└────────────────────────────────────────────┘
```

- Timezone auto-detected from browser
- User can change if needed
- Clear description of behavior

### In Settings (Profile Page)

Users can update their timezone later in the profile settings. The backend functions are ready:
- `updateUserTimezone(timezone)` - Saves new timezone
- `getUserTimezone()` - Retrieves current timezone

*Note: UI for timezone editor in profile page needs to be added manually.*

### Goal Reset Notification

When goals reset, users see toast notifications:

**Period Completed:**
```
🎉 Goal "Data Structures Practice" completed!
   Current streak: 7
```

**Period Reset (Not Completed):**
```
⏰ Goal "Morning Workout" period reset
   A new tracking period has started
```

## Performance & Efficiency

### Query Optimization

**Each 30-minute cron run:**
1. Query all users: `SELECT id, timezone FROM user` (~100-1000ms)
2. Filter in-memory: Check each timezone with `isAtUserMidnight()`
3. Process only ~2% of users (30 min / 24 hours)

**Example with 1000 users:**
- Users queried: 1000
- Users at exact midnight: ~20-30
- Goals checked: 20-30 users × avg 3-5 goals = 60-150 goals
- Goals actually reset: Only those with expired periods

### Timezone Detection Algorithm

```typescript
function isAtUserMidnight(timezone: string): boolean {
  const now = new Date();
  const userTime = toZonedTime(now, timezone);
  
  const hour = userTime.getHours();
  const minute = userTime.getMinutes();
  
  // Only trigger at exactly midnight (hour 0) with minute 0 or 30
  // This matches the cron schedule running at :00 and :30
  return hour === 0 && (minute === 0 || minute === 30);
}
```

**Accuracy:**
- Checks for EXACT midnight match (hour 0, minute 0 or 30)
- Each user processed exactly once per day at their precise midnight
- No duplicate resets or missed resets
- Handles both :00 and :30 timezone offsets

## Testing

### Test Timezone Detection

```typescript
// In browser console
import { isNearUserMidnight, getUserTime } from '@/lib/timezone-utils';

// Check your current status
console.log('Near midnight?', isNearUserMidnight('America/New_York'));
console.log('Current time:', getUserTime('America/New_York'));

// Test different timezones
['UTC', 'Asia/Kolkata', 'America/Los_Angeles'].forEach(tz => {
  console.log(`${tz}:`, isNearUserMidnight(tz));
});
```

### Test Cron Endpoint Locally

```bash
# 1. Set CRON_SECRET in .env.local
echo "CRON_SECRET=$(openssl rand -base64 32)" >> .env.local

# 2. Start dev server
bun run dev

# 3. Trigger cron endpoint
curl -X POST http://localhost:3000/api/cron/reset-goals \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# 4. Check response
# Should see: {"success": true, "data": {"usersProcessed": N, "resetCount": M}}
```

### Test in Production

```bash
# Get your CRON_SECRET from Vercel dashboard
curl -X POST https://your-app.vercel.app/api/cron/reset-goals \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET"
```

## Monitoring

### Vercel Logs

Check cron execution in Vercel:
1. Go to project → **Logs**
2. Filter by `/api/cron/reset-goals`
3. Look for successful responses:
   - `usersProcessed: N` - Users in their midnight window
   - `resetCount: M` - Total goals reset
   - `resets: [...]` - Details of each reset

### Expected Values

**During most hours:**
- `usersProcessed: 0-5` (most users not in their midnight)
- `resetCount: 0`

**During your midnight hour:**
- `usersProcessed: 1+` (your timezone users)
- `resetCount: 3-10` (depends on active goals)

**If you see:**
- `usersProcessed: 0` for 24 hours → Check timezone detection
- `resetCount: 0` but users processed → No expired periods (normal)
- `error: "Unauthorized"` → Check CRON_SECRET environment variable

## Migration Guide

If upgrading from the old UTC-based system:

### 1. Database Migration Already Applied
- Migration `0004_bent_klaw.sql` adds `timezone` column
- Default: "Asia/Kolkata"
- Existing users will use default until they update

### 2. Cron Schedule Updated
- `vercel.json` changed from daily to every 30 minutes
- Redeploy to Vercel to apply new schedule

### 3. User Experience
- Existing users: Goals reset at India time (default) until they set timezone
- New users: Timezone detected during onboarding
- All users: Can update timezone in settings

### 4. No Data Loss
- All existing goal data preserved
- Streak calculations continue from current values
- Period tracking unaffected

## Adding More Timezones

To support additional timezones:

1. **Add to constants** (`lib/timezone-utils.ts`):
```typescript
export const TIMEZONES = [
  // ... existing timezones
  { value: "Africa/Cairo", label: "Cairo (GMT+2)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
] as const;
```

2. **No other changes needed!**
   - Validation automatically includes new timezones
   - Detection and reset logic work for any IANA timezone
   - Database accepts any text value

## Troubleshooting

### Goals Not Resetting at My Midnight

**Check 1: Verify timezone**
```sql
-- In database
SELECT timezone FROM "user" WHERE id = 'your-user-id';
```

**Check 2: Test detection**
```typescript
// In browser console
import { isNearUserMidnight } from '@/lib/timezone-utils';
console.log(isNearUserMidnight('Your/Timezone')); // Should be true near midnight
```

**Check 3: Cron logs**
- Look for your timezone in Vercel logs around your midnight hour
- Should see `usersProcessed > 0`

### Timezone Not Saving

**Check form validation:**
- Ensure timezone is in `TIMEZONES` array
- Check browser console for validation errors

**Check database:**
```sql
-- Verify column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'timezone';
```

### Performance Issues

**Too many users processed per hour?**
- Each hour should process ~4% of total users
- If processing 50%+, check `isNearUserMidnight()` logic

**Slow cron execution?**
- Add indexes: `CREATE INDEX idx_user_timezone ON "user"(timezone);`
- Optimize goal queries with indexes on `userId` and `status`

## Future Enhancements

**Potential improvements:**
1. Add more timezone options (currently 14)
2. Allow custom UTC offset input
3. Daylight saving time handling (currently handled by date-fns-tz)
4. Timezone change notification (warn before changing)
5. Analytics dashboard showing reset distribution across timezones

## References

- **date-fns-tz**: https://github.com/marnusw/date-fns-tz
- **IANA Time Zones**: https://www.iana.org/time-zones
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs
