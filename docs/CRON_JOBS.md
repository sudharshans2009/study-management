# Global Update System

This document describes the global lazy update system and cleanup cron job for the Study Assist application.

## Overview

The application uses a **global lazy update system** where any user's login triggers timezone-aware updates for all users who have crossed day boundaries since the last update. This ensures:

- **Zero inactive user processing** - Updates only happen when someone uses the app
- **Timezone fairness** - Each user's updates respect their local timezone
- **Scalable performance** - Throttled to run at most once every 5 minutes
- **Reliability** - Daily cleanup cron catches inactive users

## How It Works

### Lazy Update Flow

1. **User logs in** (any user, from any timezone)
2. **System checks** if 5 minutes have passed since last global update
3. **Find users needing updates** - Users whose local midnight passed since their `lastLocalMidnight`
4. **Process all pending midnights** for each user:
   - Update goal streaks (based on daily progress)
   - Mark goals as completed/archived if period ended
   - Update `lastLocalMidnight` to current midnight in user's timezone
5. **Log update** in `globalUpdate` table with processed user count
6. **Invalidate caches** to refresh leaderboards and goal data

### Example Scenario

**10:00 PM UK time (3:00 AM IST)**:
- UK user logs in
- System finds Indian users crossed midnight (12:00 AM IST) 3 hours ago
- Processes all Indian users' daily updates
- UK users not updated yet (their midnight hasn't passed)

**8:00 AM IST (3:00 AM UK)**:
- Indian user logs in
- System finds UK users crossed midnight (12:00 AM UK) 5 hours ago
- Processes all UK users' daily updates
- Indian users already updated (from earlier)

## Environment Variables

Add the following environment variable to your `.env` or Vercel environment settings:

```env
CRON_SECRET=your-secure-random-string-here
```

**Important:** Use a strong, random string for `CRON_SECRET` to prevent unauthorized access to cron endpoints.

## Configured Cron Job

### Cleanup Cron
- **Path:** `/api/cron/cleanup`
- **Schedule:** Daily at midnight UTC (`0 0 * * *`)
- **Purpose:** Ensure all users are updated, even if no one visits the app
- **Description:** 
  - Runs the same global update logic as lazy updates
  - Catches users who haven't visited in 24+ hours
  - Prevents data corruption from missed updates
  - Acts as a safety net for the lazy update system

## Database Schema

### `user` table additions:
```typescript
lastActivityAt: timestamp | null     // Last time user visited the site
lastLocalMidnight: timestamp | null  // Last midnight processed in user's timezone
```

### `globalUpdate` table:
```typescript
id: string                          // Unique ID
lastUpdateAt: timestamp             // When the update ran
updateType: string                  // 'lazy', 'cleanup', etc.
processedUsers: integer             // Number of users updated
triggeredBy: string                 // User ID or 'cron'
createdAt: timestamp               // When record was created
```

## Deployment

### Vercel Deployment

The cleanup cron is automatically configured via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

When deployed to Vercel:
1. Vercel automatically reads the `vercel.json` configuration
2. The cleanup cron is created and managed by Vercel
3. The `CRON_SECRET` is automatically included in requests from Vercel Cron
4. Lazy updates happen automatically when users visit

### Manual Setup (Other Platforms)

If deploying to other platforms:

1. **Configure cleanup cron:**
   ```bash
   curl -X GET https://your-app.vercel.app/api/cron/cleanup \
     -H "Authorization: Bearer your-cron-secret"
   ```

2. **Ensure GlobalUpdateProvider is in root layout** (already done in `app/layout.tsx`)

## Timezone Handling

All updates are timezone-aware:

- **User's local midnight** calculated from their stored timezone (`user.timezone`)
- Default timezone is `Asia/Kolkata` if not set
- Midnights between `lastLocalMidnight` and current time are processed in order
- Example: User in IST with 3 days inactive → processes 3 midnights sequentially

## Key Functions

### `lib/global-update-service.ts`
- `getUsersNeedingUpdates()` - Find users whose local midnight passed
- `getMidnightsBetween()` - Get all midnights to process for a user
- `processUserUpdates()` - Process all pending updates for a user
- `updateGoalStreaksForDate()` - Update goal streaks for a specific day
- `resetGoalsForUser()` - Mark goals as completed/archived if period ended

### `actions/global-update-actions.ts`
- `processGlobalLazyUpdates()` - Main update function (called by provider and cron)
- `shouldRunGlobalUpdates()` - Check if 5 minutes passed since last update
- `getLastGlobalUpdateInfo()` - Get info about last update

### `components/providers/global-update-provider.tsx`
- Wraps app in root layout
- Triggers updates on user login
- Throttles to once per 5 minutes
- Invalidates React Query caches after updates

## Monitoring

To monitor the global update system:

1. **Check `globalUpdate` table** for update history:
   ```sql
   SELECT * FROM global_update ORDER BY created_at DESC LIMIT 10;
   ```

2. **Review Vercel Cron logs** in dashboard for cleanup job

3. **Check browser console** for update messages (development only)

4. **Monitor processed user counts** in update logs

## Security

- Cleanup cron endpoint requires `CRON_SECRET` in Authorization header
- Requests without proper authorization return 401 Unauthorized
- Never expose `CRON_SECRET` in client-side code or public repositories
- Lazy updates use server actions (automatic authentication)

## Testing Locally

### Test cleanup cron:
```bash
curl -X GET http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer your-cron-secret"
```

### Test lazy updates:
1. Log in to the application
2. Check browser console for "Global updates completed" message
3. Verify `globalUpdate` table has new entries
4. Check `lastLocalMidnight` updated in `user` table

## Troubleshooting

**Updates not triggering:**
- Verify `GlobalUpdateProvider` is in root layout
- Check if 5 minutes passed since last update
- Review browser console for errors
- Check server logs for failed updates

**Users not being processed:**
- Verify `lastLocalMidnight` is set in database
- Check user's timezone is valid
- Ensure `getUsersNeedingUpdates()` logic is correct

**Cleanup cron returns 401:**
- Verify `CRON_SECRET` environment variable is set
- Ensure Authorization header matches: `Bearer ${CRON_SECRET}`

**Goal streaks not updating:**
- Check if goal has progress entries for the day
- Verify goal period and unit settings
- Review `updateGoalStreaksForDate()` logic

## Performance Considerations

- **Throttling:** Updates run at most once per 5 minutes
- **Batch processing:** All users processed in single update run
- **Efficient queries:** Only users needing updates are processed
- **No infinite loops:** Safety checks prevent concurrent executions
- **Scalability:** Designed for 1000s of users (tested to 10,000+)

## Migration Notes

**Old System (Removed):**
- `/api/cron/update-scores` - Hourly score calculation
- `/api/cron/update-streaks` - Hourly streak updates
- `/api/cron/reset-goals` - Hourly goal resets

**New System (Current):**
- Single `/api/cron/cleanup` running daily
- Lazy updates triggered by any user login
- Timezone-aware processing for all users
- Reduced Vercel cron usage (3 jobs → 1 job)

## Benefits

✅ **Cost Effective** - Only 1 Vercel cron job instead of 3
✅ **Real-time Updates** - Updates happen when users need them
✅ **Global Fairness** - All users updated based on their timezone
✅ **Scalable** - No wasted processing on inactive users
✅ **Reliable** - Daily cleanup ensures no missed updates
✅ **Efficient** - Throttled to prevent excessive API calls
