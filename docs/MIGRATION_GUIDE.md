# Onboarding Status Migration Guide

## Overview

This guide helps you migrate existing users to the new onboarding flow system.

## What Changed

### Database Schema

Added `onboardingStatus` column to the `user` table:

```sql
ALTER TABLE "user" 
ADD COLUMN onboarding_status text 
DEFAULT 'pending_verification' 
NOT NULL 
CHECK (onboarding_status IN ('pending_verification', 'pending_setup', 'completed'));
```

## Migration Already Applied

The database migration was run with:
```bash
bun x drizzle-kit push
```

This automatically:
- ✅ Added the `onboarding_status` column
- ✅ Set default value to `'pending_verification'` for all users
- ✅ Applied NOT NULL constraint

## Post-Migration: Update Existing Users

All existing users now have `onboarding_status = 'pending_verification'`, but many have already completed onboarding. Here's how to fix that:

### Option 1: Update All Verified Users with Profiles (Recommended)

This SQL will mark users as completed if they:
- Have verified their email (`email_verified = true`)
- Have completed their profile setup (`profile.setup_completed = true`)

```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE email_verified = true 
  AND id IN (
    SELECT user_id 
    FROM profile 
    WHERE setup_completed = true
  );
```

### Option 2: Update All Verified Users

If you want to mark ALL email-verified users as completed (regardless of profile):

```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE email_verified = true;
```

### Option 3: Manual Update per User

For specific users:

```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE email = 'user@example.com';
```

## Verification

After running the migration SQL, verify the changes:

```sql
-- Check distribution of onboarding statuses
SELECT 
  onboarding_status, 
  COUNT(*) as count 
FROM "user" 
GROUP BY onboarding_status;

-- Check users who might need attention
SELECT 
  id, 
  email, 
  email_verified, 
  onboarding_status,
  (SELECT setup_completed FROM profile WHERE user_id = "user".id) as has_profile
FROM "user" 
WHERE onboarding_status != 'completed'
ORDER BY created_at DESC;
```

## Testing After Migration

1. **Test existing user login:**
   - Sign in with an existing account
   - Should go directly to dashboard (if status = 'completed')
   - Should not be redirected to setup/verify-email

2. **Test new user signup:**
   - Create a new account
   - Should receive verification email
   - Should be redirected to `/verify-email`
   - After verifying, should go to `/setup`
   - After setup, should go to `/dashboard`

3. **Test interrupted flows:**
   - Create account but don't verify
   - Try to sign in → should redirect to `/verify-email`

## Common Issues

### Issue: Existing users stuck on verify-email page

**Cause:** Their `onboarding_status` is still `'pending_verification'` even though `email_verified = true`

**Fix:**
```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE email_verified = true 
  AND onboarding_status = 'pending_verification';
```

### Issue: Users redirected to setup even though they have a profile

**Cause:** `onboarding_status` is `'pending_setup'` but profile exists

**Fix:**
```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE id IN (SELECT user_id FROM profile WHERE setup_completed = true)
  AND onboarding_status != 'completed';
```

### Issue: OAuth users have wrong status

**Cause:** OAuth users auto-verify email but may not have completed setup

**Fix:** Check if they have a profile, update accordingly:
```sql
-- Mark OAuth users with profiles as completed
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE id IN (
    SELECT u.id 
    FROM "user" u
    INNER JOIN account a ON a.user_id = u.id
    INNER JOIN profile p ON p.user_id = u.id
    WHERE a.provider_id IN ('google', 'github')
      AND p.setup_completed = true
  );
```

## Rollback (Emergency Only)

If you need to rollback the changes:

```sql
-- Remove the column (will lose all onboarding status data!)
ALTER TABLE "user" DROP COLUMN onboarding_status;
```

**Warning:** This will require reverting code changes as well.

## Next Steps

After migration:

1. ✅ Run the appropriate UPDATE query for your users
2. ✅ Verify with the check queries
3. ✅ Test login with existing accounts
4. ✅ Test new user signup flow
5. ✅ Monitor application logs for any issues

## Support

If you encounter issues:

1. Check the console logs - they show detailed onboarding status info
2. Query the database directly to see user's current status
3. Use the verification queries above
4. Check `docs/ONBOARDING_FLOW.md` for full flow documentation
