# Authentication System Documentation

## Overview
This authentication system uses Better Auth with Drizzle ORM, Next.js Server Actions, Zod validation, and React Hook Form.

## Pages

### Sign In (`/signin`)
- Email/password authentication
- Social auth (Google, GitHub)
- Forgot password link
- Form validation with Zod

### Sign Up (`/signup`)
- Create new account
- Email verification required
- Password confirmation
- Social auth options

### Setup (`/setup`)
- 3-step profile completion
  1. Personal information (full name)
  2. Study subjects with color coding
  3. Daily study goal

### Forgot Password (`/forgot-password`)
- Email-based password reset
- Token verification

## Components

### Forms
- `SignInForm` - Email/password sign in
- `SignUpForm` - Account creation
- `SetupProfileForm` - Multi-step profile setup
- `SocialAuthButtons` - OAuth providers

### Layouts
- `AuthLayout` - Shared auth page layout
- `AuthDivider` - "Or continue with" separator

### Navigation
- `UserMenu` - Shows Sign In/Sign Up or user dropdown

## Server Actions

### Auth Actions (`/actions/auth-actions.ts`)
- `signInAction` - Authenticate user
- `signUpAction` - Create new account
- `signOutAction` - End session
- `forgotPasswordAction` - Request password reset
- `getSessionAction` - Get current session

### Setup Actions (`/actions/setup-actions.ts`)
- `setupProfileAction` - Complete profile setup

## Validation Schemas (`/lib/validations/auth.ts`)
- `signInSchema` - Sign in validation
- `signUpSchema` - Sign up with password confirmation
- `setupProfileSchema` - Profile setup validation
- `forgotPasswordSchema` - Email validation
- `resetPasswordSchema` - Password reset validation

## Hooks

### `useAuth`
Returns current user, loading state, and authentication status.

```tsx
const { user, isLoading, isAuthenticated } = useAuth();
```

## Utilities (`/lib/auth-utils.ts`)
- `isValidEmail` - Email format validation
- `validatePasswordStrength` - Password strength checker
- `formatDisplayName` - Format user names
- `getInitials` - Get user initials for avatar

## API Routes

### `/api/auth/[...all]`
Better Auth API handler for all auth operations.

## Environment Variables Required

```env
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
RESEND_TOKEN=your_resend_token (for emails)
```

## TODO
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Create subjects in database on setup
- [ ] Create daily goals in database
- [ ] Add OAuth callback handlers
- [ ] Implement middleware authentication
- [ ] Add email templates
- [ ] Add rate limiting
- [ ] Add CSRF protection
