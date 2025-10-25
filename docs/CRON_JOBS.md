# Cron Jobs Configuration

This document describes the automated cron jobs configured for the Study Assist application.

## Overview

The application uses cron jobs to perform periodic background tasks. These jobs are configured to run on Vercel Cron (or any compatible cron service) and require authentication via a secret token.

## Environment Variables

Add the following environment variable to your `.env` or Vercel environment settings:

```env
CRON_SECRET=your-secure-random-string-here
```

**Important:** Use a strong, random string for `CRON_SECRET` to prevent unauthorized access to cron endpoints.

## Configured Cron Jobs

### 1. Update Leaderboard Scores
- **Path:** `/api/cron/update-scores`
- **Schedule:** Daily at midnight UTC (`0 0 * * *`)
- **Purpose:** Pre-calculate and cache leaderboard scores to improve performance
- **Description:** Processes all users and updates their composite scores based on study time, sessions, goals, streaks, and focus scores.

### 2. Update Streaks
- **Path:** `/api/cron/update-streaks`
- **Schedule:** Daily at midnight UTC (`0 0 * * *`)
- **Purpose:** Update user study streaks based on their timezone
- **Description:** 
  - Checks each user's activity in their local timezone
  - Updates current streaks for active goals
  - Breaks streaks if users haven't studied for a full day
  - Updates longest streak records
  - Timezone-aware to ensure fair tracking globally

### 3. Reset Goals
- **Path:** `/api/cron/reset-goals`
- **Schedule:** Daily at midnight UTC (`0 0 * * *)
- **Purpose:** Reset periodic goals (daily, weekly, monthly) based on user timezone
- **Description:** Resets goal progress when the period ends, maintaining streak information.

## Deployment

### Vercel Deployment

The cron jobs are automatically configured via `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-goals",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/update-streaks",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/update-scores",
      "schedule": "0 0 * * *"
    }
  ]
}
```

When deployed to Vercel:
1. Vercel automatically reads the `vercel.json` configuration
2. Cron jobs are created and managed by Vercel
3. The `CRON_SECRET` is automatically included in requests from Vercel Cron

### Manual Setup (Other Platforms)

If deploying to other platforms, you'll need to configure external cron services:

1. **GitHub Actions:**
   - Create `.github/workflows/cron-jobs.yml`
   - Use `schedule` with cron syntax
   - Call endpoints with the `CRON_SECRET` in the Authorization header

2. **External Cron Service (e.g., cron-job.org, EasyCron):**
   - Set up HTTP GET requests to each endpoint
   - Include header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Configure the appropriate schedules

Example curl command:
```bash
curl -X GET https://your-app.vercel.app/api/cron/update-scores \
  -H "Authorization: Bearer your-cron-secret"
```

## Timezone Handling

All cron jobs are timezone-aware:

- **Daily calculations** use the user's timezone stored in the database (`user.timezone`)
- Default timezone is `Asia/Kolkata` if not set
- Dates are calculated in the user's local timezone and converted to UTC for database queries
- This ensures users worldwide get fair and accurate tracking

## Monitoring

To monitor cron job execution:

1. Check Vercel Cron logs in the Vercel dashboard
2. Review application logs for `[Cron]` prefixed messages
3. Monitor the response from each endpoint for success/error status

## Security

- All cron endpoints require the `CRON_SECRET` in the Authorization header
- Requests without proper authorization return 401 Unauthorized
- Never expose the `CRON_SECRET` in client-side code or public repositories

## Testing Locally

To test cron jobs during development:

```bash
# Test update scores
curl -X GET http://localhost:3000/api/cron/update-scores \
  -H "Authorization: Bearer your-cron-secret"

# Test update streaks
curl -X GET http://localhost:3000/api/cron/update-streaks \
  -H "Authorization: Bearer your-cron-secret"

# Test reset goals
curl -X GET http://localhost:3000/api/cron/reset-goals \
  -H "Authorization: Bearer your-cron-secret"
```

## Troubleshooting

**Cron job returns 401:**
- Verify `CRON_SECRET` environment variable is set correctly
- Ensure the Authorization header matches: `Bearer ${CRON_SECRET}`

**Streaks not updating:**
- Check user timezone settings in the database
- Verify study sessions have correct timestamps
- Review logs for specific user errors

**Scores not reflecting changes:**
- Ensure hourly score update is running
- Check if leaderboard queries are using cached data
- Verify composite score calculation logic

## Performance Considerations

- The streak update job processes all users but is designed to be efficient
- Database queries are optimized with proper indexes
- Consider implementing pagination or batch processing for large user bases (>10,000 users)
- Monitor execution time and adjust schedules if needed
