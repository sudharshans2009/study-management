# Authentication System Setup Guide

## Overview

This application uses **Better Auth** for authentication with the following features:
- ✅ Email/Password authentication
- ✅ Google OAuth2
- ✅ GitHub OAuth2
- ✅ Email verification
- ✅ Password reset
- ✅ Profile setup wizard
- ✅ Back to home button on all auth pages

## Directory Structure

```
/actions/
  auth-actions.ts      # Server actions for authentication
  setup-actions.ts     # Server actions for profile setup
  
/components/auth/
  auth-layout.tsx              # Shared layout for auth pages
  back-to-home-button.tsx      # Reusable back to home button
  sign-in-form.tsx             # Sign in form component
  sign-up-form.tsx             # Sign up form component
  setup-profile-form.tsx       # 3-step profile setup wizard
  social-auth-buttons.tsx      # Google & GitHub OAuth buttons
  
/app/(auth)/
  signin/              # Sign in page
  signup/              # Sign up page
  setup/               # Profile setup page
  forgot-password/     # Password reset request page
  
/hooks/
  use-auth.ts          # Client-side auth hooks
  
/services/
  email.ts             # Email sending service (Resend)
  
/lib/
  auth.ts              # Better Auth server configuration
  auth-client.ts       # Better Auth client configuration
  config.ts            # Environment configuration
  validations/auth.ts  # Zod schemas for auth forms
  
/database/
  schema.ts            # Database schema (Drizzle ORM)
  drizzle.ts           # Database client
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string from Neon
- `RESEND_TOKEN` - API key from Resend for emails
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google OAuth credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `NEXT_PUBLIC_URL` - Your app URL (http://localhost:3000 for dev)

### 2. Database Setup

Run the following commands to set up your database:

```bash
# Generate migration files
bun x drizzle-kit generate

# Push schema to database
bun x drizzle-kit push

# Or run Better Auth CLI to auto-generate tables
bun x @better-auth/cli generate
```

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing one
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to `.env.local`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github` (development)
   - `https://yourdomain.com/api/auth/callback/github` (production)
4. Copy Client ID and Client Secret to `.env.local`

### 4. Email Service Setup

1. Sign up for [Resend](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key
4. Add it to `.env.local` as `RESEND_TOKEN`
5. Update email sender in `services/email.ts`:
   ```typescript
   from: "Your App <noreply@yourdomain.com>"
   ```

## Database Schema

### Core Tables (Better Auth)
- **user** - User accounts
- **session** - Active sessions
- **account** - OAuth provider accounts
- **verification** - Email verification tokens

### App Tables
- **profile** - User profile with daily goals and setup status
- **subject** - Study subjects with colors
- **study_session** - Study time tracking
- **goal** - User goals and targets

## Authentication Flow

### Email/Password Sign Up
1. User fills sign up form → `SignUpForm`
2. Form submits to `signUpAction` (server action)
3. Better Auth creates account
4. Email verification sent (if enabled)
5. Redirect to `/setup` for profile completion
6. User completes 3-step wizard → `SetupProfileForm`
7. Setup saves to database → `setupProfileAction`
8. Redirect to `/dashboard`

### Email/Password Sign In
1. User fills sign in form → `SignInForm`
2. Form submits to `signInAction` (server action)
3. Better Auth validates credentials
4. Session created
5. Redirect to `/dashboard`

### OAuth Sign In (Google/GitHub)
1. User clicks OAuth button → `SocialAuthButtons`
2. Redirect to provider authorization
3. Provider redirects back to `/api/auth/callback/{provider}`
4. Better Auth processes callback
5. Account linked or created
6. Redirect to `/dashboard` or `/setup` (if first time)

### Password Reset
1. User requests reset → `ForgotPasswordPage`
2. Form submits to `forgotPasswordAction`
3. Reset email sent with token
4. User clicks link in email
5. User sets new password (TODO: create reset page)
6. Redirect to `/signin`

## Client-Side Hooks

### useAuth()
Get current authentication state:

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, session, isLoading, isAuthenticated, refetch } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### useRequireAuth()
Protect pages - redirects to signin if not authenticated:

```typescript
import { useRequireAuth } from "@/hooks/use-auth";

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Protected content</div>;
}
```

### useRedirectIfAuthenticated()
Redirect authenticated users away from auth pages:

```typescript
import { useRedirectIfAuthenticated } from "@/hooks/use-auth";

function SignInPage() {
  useRedirectIfAuthenticated("/dashboard");
  
  return <SignInForm />;
}
```

## Server Actions

All authentication actions are in `actions/auth-actions.ts`:

- `signInAction(data)` - Email/password sign in
- `signUpAction(data)` - Create new account
- `signOutAction()` - Sign out current user
- `forgotPasswordAction(data)` - Request password reset
- `getSessionAction()` - Get current session

Setup actions in `actions/setup-actions.ts`:

- `setupProfileAction(data)` - Complete user profile setup

## Components

### BackToHomeButton
Reusable button to return to home page:

```typescript
import { BackToHomeButton } from "@/components/auth/back-to-home-button";

<BackToHomeButton variant="ghost" />
```

### SocialAuthButtons
Google and GitHub OAuth buttons:

```typescript
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

<SocialAuthButtons />
```

### AuthLayout
Shared layout for auth pages with title, description, and footer:

```typescript
import { AuthLayout } from "@/components/auth/auth-layout";

<AuthLayout
  title="Welcome back"
  description="Sign in to continue"
  footer={{
    text: "Don't have an account?",
    linkText: "Sign up",
    linkHref: "/signup"
  }}
>
  {/* Auth form content */}
</AuthLayout>
```

## Email Templates

Three email templates are included in `services/email.ts`:

1. **Verification Email** - Sent on sign up
2. **Password Reset Email** - Sent on forgot password
3. **Welcome Email** - Sent after successful verification

Each template is fully styled with HTML and includes:
- Responsive design
- Branded gradient header
- Clear call-to-action button
- Alternative text link
- Professional footer

## Testing

### Manual Testing Checklist

#### Sign Up Flow
- [ ] Fill form with valid data
- [ ] Verify validation errors work
- [ ] Check email verification sent (if enabled)
- [ ] Complete profile setup wizard
- [ ] Verify data saved to database
- [ ] Redirect to dashboard

#### Sign In Flow
- [ ] Sign in with correct credentials
- [ ] Verify error with wrong password
- [ ] Verify error with non-existent email
- [ ] Check redirect to dashboard
- [ ] Verify session persists on refresh

#### OAuth Flow
- [ ] Click Google button
- [ ] Authorize on Google
- [ ] Verify redirect back to app
- [ ] Check account created/linked
- [ ] Verify session created

#### Password Reset Flow
- [ ] Request password reset
- [ ] Check email received
- [ ] Click reset link
- [ ] Set new password (TODO)
- [ ] Sign in with new password

#### Profile Setup
- [ ] Step 1: Enter full name
- [ ] Step 2: Add subjects with colors
- [ ] Step 3: Set daily goal (slider)
- [ ] Verify all data saved
- [ ] Check redirect to dashboard

## Troubleshooting

### "No database connection" error
- Ensure `DATABASE_URL` is set in `.env.local`
- Run `bun x drizzle-kit push` to create tables
- Check database connection in Neon dashboard

### OAuth redirect errors
- Verify callback URLs match in OAuth provider settings
- Check `NEXT_PUBLIC_URL` matches your current domain
- Ensure client ID and secret are correct

### Email not sending
- Verify `RESEND_TOKEN` is valid
- Check domain is verified in Resend
- Enable email verification in `lib/auth.ts`:
  ```typescript
  requireEmailVerification: true,
  sendOnSignUp: true,
  ```

### Session not persisting
- Check cookies are enabled in browser
- Verify `BETTER_AUTH_SECRET` is set
- Clear browser cache and cookies

## Production Checklist

- [ ] Set production `NEXT_PUBLIC_URL`
- [ ] Update OAuth callback URLs to production domain
- [ ] Verify domain in Resend
- [ ] Update email sender address
- [ ] Enable email verification
- [ ] Set strong `BETTER_AUTH_SECRET`
- [ ] Configure rate limiting
- [ ] Add CSRF protection
- [ ] Set up database backups
- [ ] Configure monitoring

## API Routes

Better Auth handles all API routes automatically:

- `POST /api/auth/sign-in/email` - Email/password sign in
- `POST /api/auth/sign-up/email` - Email/password sign up
- `GET /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- `POST /api/auth/forget-password` - Request password reset
- `GET /api/auth/{provider}` - Start OAuth flow
- `GET /api/auth/callback/{provider}` - OAuth callback

## Security Features

✅ Rate limiting (10 requests per minute)
✅ Password hashing (bcrypt)
✅ Session tokens
✅ CSRF protection
✅ SQL injection prevention (Drizzle ORM)
✅ XSS protection (React)
✅ Email verification
✅ Password reset tokens

## Next Steps

1. Create `/reset-password` page for completing password reset
2. Add middleware for route protection
3. Implement email verification flow
4. Add 2FA support
5. Add account settings page
6. Implement session management UI
7. Add audit logs
8. Set up monitoring and alerts

## Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
