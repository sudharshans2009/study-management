# Onboarding Flow Documentation

## Overview

The application now implements a comprehensive three-stage onboarding flow:

1. **Verification** - User signs up and must verify their email
2. **Setup** - After verification, user completes their profile setup
3. **Completed** - User gains full access to the application

## User Flow

### 1. Sign Up (`/signup`)

```
User fills out signup form
  ↓
Account created with onboardingStatus = "pending_verification"
  ↓
Verification email sent
  ↓
User redirected to /verify-email (NOT logged in)
```

**Key Points:**
- User is **NOT automatically logged in** after signup
- `onboardingStatus` is set to `"pending_verification"`
- Verification email is sent (if email service is configured)

### 2. Email Verification (`/verify-email`)

```
User clicks verification link in email
  ↓
Better Auth handles verification
  ↓
onboardingStatus updated to "pending_setup"
  ↓
User can now sign in and will be redirected to /setup
```

**Key Points:**
- User must verify email before accessing setup
- After verification, `onboardingStatus` changes to `"pending_setup"`
- User is redirected to `/setup` after signing in

### 3. Profile Setup (`/setup`)

```
User completes setup form:
  - Personal information (name)
  - Study subjects
  - Daily study goal
  ↓
Profile and subjects saved to database
  ↓
onboardingStatus updated to "completed"
  ↓
User redirected to /dashboard
```

**Key Points:**
- Only accessible if `onboardingStatus === "pending_setup"`
- Upon completion, `onboardingStatus` changes to `"completed"`
- User gains full access to the application

### 4. Sign In (`/signin`)

```
User signs in
  ↓
Check onboardingStatus:
  - "pending_verification" → Redirect to /verify-email
  - "pending_setup" → Redirect to /setup
  - "completed" → Redirect to /dashboard
```

## Database Schema

### User Table

Added `onboardingStatus` field:

```typescript
onboardingStatus: text("onboarding_status", {
  enum: ["pending_verification", "pending_setup", "completed"],
})
  .default("pending_verification")
  .notNull()
```

**Possible Values:**
- `pending_verification` - User signed up but hasn't verified email
- `pending_setup` - Email verified but hasn't completed profile setup
- `completed` - Full onboarding completed

## Code Organization

### Services (`/services`)

**`services/onboarding.ts`** - Onboarding status management:
- `updateOnboardingStatus(userId, status)` - Update user's onboarding status
- `getOnboardingStatus(userId)` - Get current status
- `markUserAsVerified(userId)` - Update after email verification
- `completeOnboarding(userId)` - Mark as fully onboarded

**`services/email.ts`** - Email services:
- `sendVerificationEmail(to, name, verificationUrl)` - Send verification email
- `sendPasswordResetEmail(to, name, resetUrl)` - Password reset
- `sendWelcomeEmail(to, name)` - Welcome email after onboarding

**`services/analytics.ts`** - Analytics tracking

### Actions (`/actions`)

**`actions/setup-actions.ts`** - Profile setup:
- `setupProfileAction(data)` - Create profile, subjects, and mark onboarding complete

**`actions/auth-actions.ts`** - Authentication:
- `getSessionAction()` - Get current session
- Other auth utilities

**`actions/study-actions.ts`** - Study session management

### Hooks (`/hooks`)

**`hooks/use-auth.ts`** - Authentication state management:

```typescript
export function useAuth(): UseAuthReturn {
  user: User | null;
  session: null; // Deprecated
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStatus: OnboardingStatus | null;
  needsVerification: boolean; // true if pending_verification
  needsSetup: boolean; // true if pending_setup
  isOnboarded: boolean; // true if completed
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**New Helper Hooks:**

```typescript
// Protect routes - redirects based on onboarding status
useRequireAuth(requireOnboarded = true)

// Redirect authenticated users from signin/signup
useRedirectIfAuthenticated()
```

### Components (`/components`)

**Auth Components:**
- `components/auth/sign-up-form.tsx` - Sign up form (redirects to verify-email)
- `components/auth/sign-in-form.tsx` - Sign in form (redirects based on status)
- `components/auth/verify-email-content.tsx` - Email verification page
- `components/auth/setup-profile-form.tsx` - Profile setup form
- `components/auth/back-to-home-button.tsx` - Navigation helper

**UI Components:** Located in `components/ui/`

### Lib (`/lib`)

**`lib/auth.ts`** - Better Auth configuration:
- Email verification callbacks
- `onVerificationSuccess` hook - Updates onboarding status
- Session configuration

**`lib/auth-client.ts`** - Client-side auth utilities:
- `authClient` - Better Auth client instance
- Exports: `useSession`, `signIn`, `signOut`, `signUp`

**`lib/config.ts`** - Application configuration
**`lib/utils.ts`** - Utility functions
**`lib/time-utils.ts`** - Time formatting utilities

**`lib/validations/auth.ts`** - Zod schemas:
- `signUpSchema`
- `signInSchema`
- `setupProfileSchema`

## Authentication Flow Details

### Sign Up Flow

1. User fills form on `/signup`
2. `authClient.signUp.email()` called (client-side)
3. Better Auth creates user with `onboardingStatus: "pending_verification"`
4. Verification email sent via `lib/auth.ts` → `services/email.ts`
5. User redirected to `/verify-email`

### Email Verification Flow

1. User clicks link in email (format: `/api/auth/verify-email?token=...`)
2. Better Auth handles verification
3. `onVerificationSuccess` callback triggered in `lib/auth.ts`
4. Database updated:
   ```typescript
   emailVerified: true
   onboardingStatus: "pending_setup"
   ```
5. User can now sign in

### Setup Flow

1. User signs in → redirected to `/setup` (based on onboardingStatus)
2. User fills setup form
3. `setupProfileAction()` called:
   - Creates/updates profile
   - Creates study subjects
   - Updates `onboardingStatus: "completed"`
4. User redirected to `/dashboard`

### Subsequent Sign Ins

```typescript
// In sign-in-form.tsx
const onboardingStatus = result.data?.user?.onboardingStatus;

if (onboardingStatus === "pending_verification") {
  router.push("/verify-email");
} else if (onboardingStatus === "pending_setup") {
  router.push("/setup");
} else {
  router.push("/dashboard");
}
```

## Route Protection

### useRequireAuth Hook

```typescript
// In protected pages
const { isAuthenticated, isLoading, onboardingStatus } = useRequireAuth();

// Automatically redirects:
// - Not authenticated → /signin
// - pending_verification → /verify-email
// - pending_setup → /setup
```

### useRedirectIfAuthenticated Hook

```typescript
// In /signin and /signup pages
useRedirectIfAuthenticated();

// Automatically redirects authenticated users based on onboarding status
```

## Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL=your_postgres_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_TOKEN=your_resend_api_token

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Testing the Flow

### Test Case 1: Complete Onboarding Flow

1. Go to `/signup`
2. Fill form and submit
3. Should redirect to `/verify-email`
4. Check email for verification link
5. Click verification link
6. Sign in at `/signin`
7. Should redirect to `/setup`
8. Complete setup form
9. Should redirect to `/dashboard`
10. Sign out and sign in again → should go directly to `/dashboard`

### Test Case 2: Interrupted Flow

**Scenario: User signs up but doesn't verify**

1. Sign up → redirected to `/verify-email`
2. Close browser
3. Later, try to sign in
4. Should redirect to `/verify-email` (still pending_verification)

**Scenario: User verifies but doesn't complete setup**

1. Sign up and verify email
2. Land on `/setup` but close browser
3. Later, sign in
4. Should redirect to `/setup` (still pending_setup)

### Test Case 3: Direct URL Access

- Try accessing `/dashboard` without completing onboarding → redirected appropriately
- Try accessing `/setup` without verification → redirected to `/verify-email`
- Try accessing `/signup` while logged in → redirected based on status

## Console Logging

The application includes comprehensive logging:

```
📧 Attempting to send verification email to: user@example.com
✅ Verification email sent successfully to: user@example.com
✅ Email verified for user abc123, updating onboarding status to pending_setup
✅ Onboarding status updated to pending_setup
🎉 Onboarding completed for user abc123
```

## Error Handling

### Email Service Failures

If email sending fails (e.g., Resend testing mode limitation):
- User signup still succeeds
- Warning logged to console
- User can manually navigate to verification link if needed

### Database Failures

All database operations wrapped in try-catch with proper error messages returned to the client.

## Migration

To apply the onboarding status field to existing users:

```bash
bun x drizzle-kit push
```

This adds the `onboarding_status` column with default value `"pending_verification"`.

**For existing users:** You may want to manually update their status:

```sql
UPDATE "user" 
SET onboarding_status = 'completed' 
WHERE email_verified = true 
AND id IN (SELECT user_id FROM profile WHERE setup_completed = true);
```

## Future Enhancements

1. **Resend Verification Email** - Button to resend verification email
2. **Skip Setup Option** - Allow users to skip setup and complete later
3. **Onboarding Progress Bar** - Visual indicator across all pages
4. **Welcome Email** - Send after onboarding completion
5. **OAuth Onboarding** - Handle status for social login users
6. **Admin Override** - Allow admins to manually update onboarding status

## Files Modified

### Created:
- `services/onboarding.ts`
- `components/auth/verify-email-content.tsx`
- `app/(auth)/verify-email/page.tsx`
- `docs/ONBOARDING_FLOW.md` (this file)

### Updated:
- `database/schema.ts` - Added `onboardingStatus` field
- `lib/auth.ts` - Added `onVerificationSuccess` callback, disabled auto-login
- `hooks/use-auth.ts` - Added onboarding status helpers
- `components/auth/sign-up-form.tsx` - Redirect to verify-email
- `components/auth/sign-in-form.tsx` - Smart redirect based on status
- `app/(auth)/setup/page.tsx` - Check onboarding status
- `actions/setup-actions.ts` - Mark onboarding complete
- `components/auth/setup-profile-form.tsx` - Updated redirect logic

## Support

For issues or questions about the onboarding flow:
1. Check console logs for detailed status updates
2. Verify database onboarding_status field
3. Check Better Auth session data
4. Review error messages in forms
