# Getting Started with SS.Study

> **Document Type:** Installation & Setup Guide  
> **Difficulty:** Beginner  
> **Time Required:** 15-20 minutes  
> **Last Updated:** October 22, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing the Setup](#testing-the-setup)
7. [OAuth Configuration](#oauth-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## Prerequisites

### Required Software

- **Node.js** 18.0.0 or higher (or **Bun** runtime - recommended)
- **Git** for version control
- **PostgreSQL** database (cloud or local)

### Recommended Tools

- **Visual Studio Code** with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
- **Bun** (faster than npm/yarn/pnpm)
- **Drizzle Kit** (installed as dependency)

### External Services

- **Neon** account (free PostgreSQL database) - [neon.tech](https://neon.tech)
- **Resend** account (email service) - [resend.com](https://resend.com)
- **Google Cloud** (optional, for OAuth) - [console.cloud.google.com](https://console.cloud.google.com)
- **GitHub** (optional, for OAuth) - [github.com/settings/developers](https://github.com/settings/developers)

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd assist

# Or if using SSH
git clone git@github.com:your-username/assist.git
cd assist
```

### Step 2: Install Dependencies

**Using Bun (Recommended):**
```bash
bun install
```

**Using npm:**
```bash
npm install
```

**Using yarn:**
```bash
yarn install
```

**Using pnpm:**
```bash
pnpm install
```

---

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### Step 2: Configure Required Variables

Open `.env.local` and configure the following:

#### Database Configuration

```bash
# Get from Neon.tech or your PostgreSQL provider
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

**How to get DATABASE_URL from Neon:**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Paste into `.env.local`

#### Better Auth Configuration

```bash
# Generate a secure random secret
BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Set your application URL
BETTER_AUTH_URL=http://localhost:3000
```

**Generate secret on Windows (PowerShell):**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
Write-Output "BETTER_AUTH_SECRET=$secret"
```

#### Email Configuration (Resend)

```bash
# Get from resend.com
RESEND_TOKEN=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**How to get RESEND_TOKEN:**
1. Create account at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create new API key
4. Copy and paste into `.env.local`

#### Cron Jobs Configuration

```bash
# Generate another secure random secret for cron jobs
CRON_SECRET=$(openssl rand -base64 32)
```

### Step 3: Optional OAuth Configuration

See [OAuth Configuration](#oauth-configuration) section below for detailed setup.

---

## Database Setup

### Step 1: Verify Database Connection

Test your database connection:

```bash
# Using Bun
bun x drizzle-kit studio

# Using npm
npx drizzle-kit studio
```

If Drizzle Studio opens at `http://localhost:4983`, your connection works!

### Step 2: Push Database Schema

```bash
# Push the schema to your database
bun x drizzle-kit push

# Follow the prompts and confirm the changes
```

**What this does:**
- Creates all necessary tables (user, session, account, profile, etc.)
- Sets up relationships and constraints
- Applies indexes for performance

### Step 3: Verify Tables Created

Open Drizzle Studio again:

```bash
bun x drizzle-kit studio
```

You should see these tables:
- ✅ user
- ✅ session
- ✅ account
- ✅ verification
- ✅ profile
- ✅ subject
- ✅ study_session
- ✅ goal

---

## Running the Application

### Development Mode

```bash
# Start the development server
bun dev

# Or with npm
npm run dev
```

**Access the application:**
- Open browser to [http://localhost:3000](http://localhost:3000)
- You should see the landing page

### Production Build

```bash
# Build for production
bun run build

# Start production server
bun start
```

---

## Testing the Setup

### Test 1: Landing Page

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. ✅ Landing page loads with hero section
3. ✅ "Sign In" and "Sign Up" buttons visible

### Test 2: Sign Up Flow

1. Click "Sign Up" button
2. Fill out the registration form:
   - Name: Test User
   - Email: your-verified-email@example.com (use your real email)
   - Password: TestPassword123!
   - Confirm Password: TestPassword123!
3. ✅ Account created successfully
4. ✅ Redirected to email verification page

### Test 3: Email Verification

1. Check your email inbox
2. ✅ Verification email received
3. Click verification link
4. ✅ Email verified successfully

### Test 4: Profile Setup

1. Sign in with your credentials
2. ✅ Redirected to setup wizard
3. Complete all 3 steps:
   - Step 1: Enter full name
   - Step 2: Set daily goal
   - Step 3: Add study subjects
4. ✅ Redirected to dashboard

### Test 5: Dashboard Access

1. ✅ Dashboard loads successfully
2. ✅ User menu shows your name/avatar
3. ✅ Navigation works
4. ✅ Theme toggle works

---

## OAuth Configuration

### Google OAuth Setup

#### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen:
   - User Type: External
   - App Name: SS.Study
   - Support Email: your-email@example.com
   - Developer Email: your-email@example.com

#### Step 2: Configure OAuth Client

- Application Type: Web application
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://your-domain.com` (production)
- Authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google`
  - `https://your-domain.com/api/auth/callback/google` (production)

#### Step 3: Add to Environment

```bash
GOOGLE_CLIENT_ID=xxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

### GitHub OAuth Setup

#### Step 1: Register OAuth App

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Application Name: SS.Study
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"

#### Step 2: Generate Client Secret

1. Click "Generate a new client secret"
2. Copy the client secret (shown only once!)

#### Step 3: Add to Environment

```bash
GITHUB_CLIENT_ID=Ov23xxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 4: Restart Server

```bash
# Stop the dev server (Ctrl+C)
# Start again
bun dev
```

#### Step 5: Test OAuth

1. Go to sign in page
2. ✅ "Continue with Google" button visible (if configured)
3. ✅ "Continue with GitHub" button visible (if configured)
4. Click button and authorize
5. ✅ Successfully signed in

---

## Troubleshooting

### Database Connection Errors

**Error:** `connection refused`

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check database is accessible
3. Ensure SSL mode is configured correctly
4. Test connection with database client

**Error:** `password authentication failed`

**Solutions:**
1. Double-check username and password
2. Ensure special characters are URL-encoded
3. Try regenerating database password

### Email Not Sending

**Error:** Verification email not received

**Solutions:**
1. Check spam/junk folder
2. Verify RESEND_TOKEN is correct
3. Check Resend dashboard for logs
4. Ensure domain is verified (for production)
5. In testing mode, only verified email receives emails

### OAuth Not Working

**Error:** OAuth redirect fails

**Solutions:**
1. Verify redirect URI matches exactly (including trailing slash)
2. Check client ID and secret are correct
3. Ensure OAuth app is not restricted
4. Clear browser cookies and try again

### Build Errors

**Error:** TypeScript errors during build

**Solutions:**
1. Run `bun install` to ensure all dependencies installed
2. Check for missing type definitions
3. Review error messages for specific issues

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Find process using port 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id <PID>

# Or use a different port
PORT=3001 bun dev
```

---

## Next Steps

### Essential Reading

1. **[Project Structure](./PROJECT_STRUCTURE.md)** - Understand the codebase
2. **[Authentication System](./AUTH.md)** - Learn about auth implementation
3. **[Theme Guide](./THEME_GUIDE.md)** - Customize the UI
4. **[Testing Guide](./TESTING_GUIDE.md)** - Test your installation

### Feature Development

1. Explore the dashboard
2. Try creating study sessions
3. Set up goals
4. Check analytics page
5. Customize your profile

### Advanced Configuration

1. **[Timezone System](./TIMEZONE_SYSTEM.md)** - Configure timezone-aware features
2. **[Cron Setup](./CRON_SETUP.md)** - Set up scheduled jobs
3. **[Media System](./MEDIA_QUICKSTART.md)** - Add file uploads
4. **[React Query](./REACT_QUERY_MIGRATION.md)** - Understand data fetching

---

## Summary

### Your Development Environment Now Includes

✅ **Complete Authentication System**
- Email/password authentication
- Google & GitHub OAuth (if configured)
- Email verification
- Password reset functionality

✅ **Database Schema**
- 8 tables with relationships
- Indexes for performance
- Type-safe with Drizzle ORM

✅ **User Interface**
- Landing page
- Authentication pages
- Dashboard (protected)
- Profile setup wizard
- Theme system (light/dark)

✅ **Development Tools**
- React Query DevTools
- Drizzle Studio
- Hot reload development
- TypeScript type checking

### Project Statistics

- **Total Files:** 100+ files
- **Components:** 50+ React components
- **Server Actions:** 15+ server actions
- **Documentation:** 35+ markdown files
- **Database Tables:** 8 tables
- **Routes:** 12+ pages

---

## Common Development Commands

```bash
# Development
bun dev                        # Start dev server
bun run build                  # Build for production
bun start                      # Start production server

# Database
bun x drizzle-kit studio       # Open database viewer
bun x drizzle-kit push         # Push schema changes
bun x drizzle-kit generate     # Generate migrations

# Code Quality  
bun lint                       # Run ESLint
bun typecheck                  # Check TypeScript (if configured)

# Dependencies
bun install                    # Install dependencies
bun add <package>              # Add new package
bun remove <package>           # Remove package
bun update                     # Update all packages
```

---

## Environment Variables Reference

### Required for Basic Functionality

```bash
DATABASE_URL=                  # PostgreSQL connection string
BETTER_AUTH_SECRET=            # Random secret (32+ characters)
BETTER_AUTH_URL=               # http://localhost:3000 (dev)
RESEND_TOKEN=                  # Resend API key
CRON_SECRET=                   # Random secret for cron jobs
```

### Optional for OAuth

```bash
GOOGLE_CLIENT_ID=              # Google OAuth client ID
GOOGLE_CLIENT_SECRET=          # Google OAuth secret
GITHUB_CLIENT_ID=              # GitHub OAuth client ID
GITHUB_CLIENT_SECRET=          # GitHub OAuth secret
```

---

## Quick Reference Links

### Documentation
- [README](./README.md) - Project overview
- [Table of Contents](./TABLE_OF_CONTENTS.md) - All documentation
- [Quick Start](./QUICK_START.md) - 5-minute guide
- [Current State](./CURRENT_STATE.md) - Feature status

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Support & Help

### Getting Help

1. **Check Documentation:** Review [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md)
2. **Search Issues:** Look for similar problems in existing issues
3. **Review Logs:** Check browser console and server logs
4. **Test Environment:** Verify all environment variables are set

### Common Questions

**Q: Can I use npm instead of Bun?**  
A: Yes! All commands work with npm/yarn/pnpm. Just replace `bun` with your package manager.

**Q: Do I need to configure OAuth?**  
A: No, OAuth is optional. Email/password auth works without it.

**Q: Can I use a different database?**  
A: The app is configured for PostgreSQL. Other databases require schema modifications.

**Q: Is this production-ready?**  
A: Yes! The authentication and core features are production-ready. Review security settings before deploying.

---

**You're all set!** 🎉

Your development environment is configured and ready for feature development.

**Next:** Review [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) to understand the codebase organization.

---

**Document Version:** 2.0  
**Last Updated:** October 22, 2025  
**Maintained by:** SS.Study Team

### 🎯 Pages
1. **Sign In** (`/signin`) - Login with email/password or social auth
2. **Sign Up** (`/signup`) - Create new account
3. **Setup** (`/setup`) - 3-step profile completion wizard
4. **Forgot Password** (`/forgot-password`) - Request password reset
5. **Dashboard** (`/dashboard`) - Protected dashboard page

### 🔧 Components

#### Auth Components (`/components/auth/`)
- `sign-in-form.tsx` - Sign in form with validation
- `sign-up-form.tsx` - Sign up form with password confirmation
- `setup-profile-form.tsx` - Multi-step profile setup wizard
- `social-auth-buttons.tsx` - Google & GitHub OAuth buttons
- `auth-layout.tsx` - Shared layout for auth pages

#### Layout Components (`/components/layout/`)
- `navbar.tsx` - Sticky navigation bar
- `user-menu-client.tsx` - Shows Sign In/Up or user dropdown
- `navigation-links.tsx` - Main navigation links
- `logo.tsx` - App logo component
- `footer.tsx` - App footer

### ⚙️ Server Actions (`/actions/`)
- `auth-actions.ts` - All authentication operations
  - `signInAction` - Email/password sign in
  - `signUpAction` - Create account
  - `signOutAction` - Logout
  - `forgotPasswordAction` - Password reset
  - `getSessionAction` - Get current session
  
- `setup-actions.ts` - Profile setup operations
  - `setupProfileAction` - Complete profile setup

### 📋 Validation Schemas (`/lib/validations/auth.ts`)
- `signInSchema` - Email + Password
- `signUpSchema` - Email + Password + Confirmation
- `setupProfileSchema` - Full Name + Subjects + Daily Goal
- `forgotPasswordSchema` - Email only
- `resetPasswordSchema` - New password + Confirmation

### 🎣 Hooks (`/hooks/`)
- `use-auth.ts` - Get current user and auth state
- `use-timer.ts` - Countdown timer functionality
- `use-stopwatch.ts` - Stopwatch functionality

### 🛠️ Utilities (`/lib/`)
- `auth-utils.ts` - Email validation, password strength, etc.
- `time-utils.ts` - Time formatting and calculations

### 🔌 API Routes
- `/api/auth/[...all]` - Better Auth API handler

## Setup Instructions

### 1. Environment Variables
Create `.env` file with:
```env
DATABASE_URL=your_neon_postgresql_url
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
RESEND_TOKEN=optional_for_emails
```

### 2. Database Setup
```bash
# Generate Better Auth schema
bun x @better-auth/cli generate

# Push schema to database
bun x drizzle-kit push
```

### 3. Run Development Server
```bash
bun run dev
```

### 4. Test the Flow

1. **Visit** `http://localhost:3000`
2. **Click** "Sign Up" button
3. **Fill** registration form
4. **Complete** 3-step profile setup:
   - Enter full name
   - Add study subjects with colors
   - Set daily study goal
5. **Redirected** to dashboard

## Key Features

### ✨ Sign In/Up Forms
- Real-time validation with Zod
- Loading states
- Error handling
- Social auth buttons (Google/GitHub)
- Password visibility toggle
- Responsive design

### 🎨 Profile Setup Wizard
- 3-step progress indicator
- Dynamic subject management
- Color picker for subjects
- Range slider for daily goal
- Form persistence
- Step validation

### 🔒 Security
- Password hashing via Better Auth
- CSRF protection
- Rate limiting (configured)
- Email verification (ready)
- Session management

### 📱 User Experience
- Responsive on all devices
- Accessible forms
- Clear error messages
- Loading indicators
- Auto-redirect after auth

## File Structure
```
actions/
  ├── auth-actions.ts       # Sign in, sign up, sign out
  └── setup-actions.ts      # Profile setup

app/
  ├── signin/page.tsx       # Sign in page
  ├── signup/page.tsx       # Sign up page
  ├── setup/page.tsx        # Setup wizard
  ├── forgot-password/      # Password reset
  ├── dashboard/            # Protected page
  └── api/auth/[...all]/    # Better Auth API

components/
  ├── auth/
  │   ├── sign-in-form.tsx
  │   ├── sign-up-form.tsx
  │   ├── setup-profile-form.tsx
  │   ├── social-auth-buttons.tsx
  │   └── auth-layout.tsx
  └── layout/
      ├── navbar.tsx
      ├── user-menu-client.tsx
      └── ...

lib/
  ├── auth.ts               # Better Auth config
  ├── auth-utils.ts         # Helper functions
  └── validations/
      └── auth.ts           # Zod schemas

hooks/
  └── use-auth.ts           # Auth state hook
```

## Next Steps

### Immediate TODO
1. ✅ Set up environment variables
2. ✅ Run database migrations
3. ✅ Test sign up flow
4. ✅ Test sign in flow
5. ✅ Test profile setup

### Future Enhancements
- [ ] Email verification implementation
- [ ] Password reset flow
- [ ] OAuth provider callbacks
- [ ] Implement subject creation in DB
- [ ] Implement goal creation in DB
- [ ] Add profile editing
- [ ] Add account settings page
- [ ] Add session timeout handling

## Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Ensure database is accessible
- Run `bun x @better-auth/cli generate`

### OAuth Not Working
- Verify OAuth credentials in `.env`
- Check redirect URIs in OAuth console
- Ensure `NEXT_PUBLIC_URL` is correct

### Form Validation Errors
- Check Zod schemas in `/lib/validations/auth.ts`
- Verify form field names match schema
- Check browser console for errors

## Resources

- [Better Auth Docs](https://www.better-auth.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Created by:** AI Assistant
**Date:** October 20, 2025
**Version:** 1.0.0
