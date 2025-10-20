# Quick Start Guide - Authentication System

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup (2 min)

1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Add your database URL (get free one from [Neon](https://neon.tech)):
   ```env
   DATABASE_URL=postgresql://user:pass@host/db
   ```

3. Add Resend token (get free one from [Resend](https://resend.com)):
   ```env
   RESEND_TOKEN=re_xxxxx
   ```

### Step 2: Database Migration (1 min)

```bash
# Push schema to database
bun x drizzle-kit push
```

### Step 3: Start Development (1 min)

```bash
bun run dev
```

Visit http://localhost:3000 and test:
- ✅ Sign up with email/password
- ✅ Complete profile setup
- ✅ Sign in

### Step 4: Add OAuth (Optional - 5 min each)

#### Google OAuth
1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Add to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```

#### GitHub OAuth
1. Visit [GitHub Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set callback: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
   ```env
   GITHUB_CLIENT_ID=your-id
   GITHUB_CLIENT_SECRET=your-secret
   ```

## 📦 What's Included

### Pages
- `/signin` - Email/password sign in + OAuth
- `/signup` - Create new account + OAuth  
- `/setup` - 3-step profile wizard
- `/forgot-password` - Password reset

### Components
- `<BackToHomeButton />` - Return to home
- `<SocialAuthButtons />` - Google & GitHub OAuth
- `<SignInForm />` - Sign in form
- `<SignUpForm />` - Sign up form
- `<SetupProfileForm />` - Profile wizard

### Hooks
- `useAuth()` - Get current user & session
- `useRequireAuth()` - Protect pages
- `useRedirectIfAuthenticated()` - Redirect logged-in users

### Actions
- `signInAction()` - Sign in
- `signUpAction()` - Sign up
- `signOutAction()` - Sign out
- `forgotPasswordAction()` - Request reset
- `setupProfileAction()` - Save profile

## 🎯 Common Tasks

### Get Current User
```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Hello {user.name}!</div>;
}
```

### Protect a Page
```typescript
import { useRequireAuth } from "@/hooks/use-auth";

export default function ProtectedPage() {
  useRequireAuth(); // Auto-redirects if not logged in
  
  return <div>Protected content</div>;
}
```

### Add Back Button
```typescript
import { BackToHomeButton } from "@/components/auth/back-to-home-button";

<BackToHomeButton variant="ghost" />
```

### Sign Out
```typescript
import { signOutAction } from "@/actions/auth-actions";

async function handleSignOut() {
  await signOutAction();
  router.push("/");
}
```

## 🗄️ Database Tables

Your database includes:
- **user** - User accounts
- **session** - Active sessions
- **account** - OAuth accounts
- **verification** - Email tokens
- **profile** - User profiles with daily goals
- **subject** - Study subjects with colors
- **study_session** - Study time tracking
- **goal** - User goals

## 📧 Email Templates

Automatic emails for:
- ✅ Welcome (after signup)
- ✅ Verification (optional)
- ✅ Password reset
- ✅ Goal reminders
- ✅ Streak reminders

Enable in `lib/auth.ts`:
```typescript
emailVerification: {
  sendOnSignUp: true,  // Change to true
  // ...
}
```

## 🔒 Security

✅ **Enabled**:
- Rate limiting (10 req/min)
- Password hashing
- Session tokens
- CSRF protection
- SQL injection protection
- XSS protection

## 📚 Full Documentation

- [Complete Setup Guide](./AUTHENTICATION_SETUP.md)
- [Update Summary](./UPDATE_SUMMARY.md)
- [Project Structure](./PROJECT_STRUCTURE.md)

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Check your DATABASE_URL in .env.local
# Verify it's a valid PostgreSQL connection string
```

### OAuth not working
```bash
# 1. Check callback URLs match in provider settings
# 2. Verify client ID and secret are correct
# 3. Make sure NEXT_PUBLIC_URL is set correctly
```

### Emails not sending
```bash
# 1. Verify RESEND_TOKEN is valid
# 2. Check domain is verified in Resend
# 3. Enable email verification in lib/auth.ts
```

## 🎉 You're Ready!

Your authentication system is complete with:
- ✅ Email/password auth
- ✅ Google & GitHub OAuth
- ✅ Profile setup wizard
- ✅ Email notifications
- ✅ Back to home buttons
- ✅ Full documentation

Start building your app features! 🚀
