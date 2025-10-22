# SS.Study - Study Application Platform

> **Version:** 2.0  
> **Last Updated:** October 22, 2025  
> **Status:** Production Ready

---

## 📖 Overview

SS.Study is a comprehensive study management platform built with Next.js 15, featuring time tracking, goal management, analytics, and intelligent onboarding. The application helps students organize their study sessions, track progress, and maintain streaks across multiple subjects.

### Key Features

- ✅ **Complete Authentication System** - Email/password + OAuth (Google, GitHub)
- ✅ **Smart Onboarding Flow** - Three-stage verification → setup → completion
- ✅ **Study Timer** - Pomodoro, stopwatch, and countdown timer modes
- ✅ **Goal Tracking** - Daily/weekly/monthly goals with streak tracking
- ✅ **Analytics Dashboard** - Comprehensive statistics and insights
- ✅ **Timezone-Aware** - Goals reset at user's local midnight
- ✅ **Theme System** - Light/dark mode with smooth transitions
- ✅ **Media Management** - Avatar uploads and file management
- ✅ **Email Notifications** - Verification, reminders, and updates

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** (recommended)
- **PostgreSQL** database (we recommend [Neon](https://neon.tech))
- **Resend** account for emails (free tier available)

### Installation (5 Minutes)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd assist

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Push database schema
bun x drizzle-kit push

# 5. Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready!

**📘 Detailed Setup:** See [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📚 Documentation

### 🎯 Start Here

| Document | Purpose | Best For |
|----------|---------|----------|
| [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md) | Complete documentation index | Finding any documentation |
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup guide | Getting started quickly |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Comprehensive setup | First-time installation |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Project status & features | Understanding what's built |

### 🔐 Authentication & Onboarding

| Document | Purpose |
|----------|---------|
| [AUTH.md](./AUTH.md) | Authentication system overview |
| [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) | Complete auth configuration |
| [AUTH_FLOW_FIXES.md](./AUTH_FLOW_FIXES.md) | Auth flow improvements |
| [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) | User onboarding documentation |

### 🎨 UI & Design

| Document | Purpose |
|----------|---------|
| [THEME_GUIDE.md](./THEME_GUIDE.md) | Complete theming system |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Project organization |
| [LAYOUT_ARCHITECTURE.md](./LAYOUT_ARCHITECTURE.md) | Layout system details |

### 📊 Features

| Document | Purpose |
|----------|---------|
| [STATS_PAGE.md](./STATS_PAGE.md) | Analytics and statistics |
| [TIMEZONE_SYSTEM.md](./TIMEZONE_SYSTEM.md) | Timezone-aware features |
| [TESTING_PERSISTENT_TIMER.md](./TESTING_PERSISTENT_TIMER.md) | Timer persistence |

### 🛠️ Development

| Document | Purpose |
|----------|---------|
| [REACT_QUERY_MIGRATION.md](./REACT_QUERY_MIGRATION.md) | Data fetching patterns |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Testing procedures |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Database migrations |

### 📁 Media & Files

| Document | Purpose |
|----------|---------|
| [README_MEDIA.md](./README_MEDIA.md) | Complete media system |
| [MEDIA_QUICKSTART.md](./MEDIA_QUICKSTART.md) | Quick media reference |
| [MEDIA_EXAMPLES.md](./MEDIA_EXAMPLES.md) | Code examples |

---

## 🏗️ Tech Stack

### Core
- **Framework:** Next.js 15.1.6 (App Router)
- **Language:** TypeScript 5.x
- **Runtime:** Bun (recommended) or Node.js 18+
- **UI Library:** React 19.0.0

### Authentication
- **Auth:** Better Auth 1.3.28
- **OAuth:** Google & GitHub
- **Email:** Resend 6.2.0

### Database
- **ORM:** Drizzle ORM 0.44.6
- **Database:** PostgreSQL (Neon)
- **Migrations:** Drizzle Kit

### State & Data
- **Data Fetching:** TanStack Query 5.90.5
- **Forms:** React Hook Form 7.65.0
- **Validation:** Zod 4.1.12

### UI & Styling
- **Styling:** Tailwind CSS 4.0.x
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Theme:** next-themes

---

## 📁 Project Structure

```
assist/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (no navbar)
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── setup/
│   │   └── verify-email/
│   ├── (app)/               # App pages (with navbar)
│   │   ├── dashboard/
│   │   ├── timer/
│   │   ├── sessions/
│   │   ├── stats/
│   │   ├── goals/
│   │   └── profile/
│   └── api/                 # API routes
│       ├── auth/            # Better Auth endpoints
│       ├── media/           # Media serving
│       └── cron/            # Scheduled jobs
│
├── components/              # React components
│   ├── auth/               # Authentication UI
│   ├── timer/              # Timer components
│   ├── stats/              # Analytics charts
│   ├── layout/             # Navigation & layout
│   ├── media/              # File upload
│   └── ui/                 # shadcn/ui components
│
├── actions/                # Server actions
│   ├── auth-actions.ts
│   ├── setup-actions.ts
│   ├── study-actions.ts
│   ├── goals-actions.ts
│   └── stats-actions.ts
│
├── services/               # External services
│   ├── email.ts
│   ├── onboarding.ts
│   └── analytics.ts
│
├── hooks/                  # React hooks
│   ├── use-auth.ts
│   ├── use-timer.ts
│   ├── use-goal-period-check.ts
│   └── use-media-upload.ts
│
├── lib/                    # Utilities & config
│   ├── auth.ts
│   ├── config.ts
│   ├── utils.ts
│   ├── timezone-utils.ts
│   ├── time-utils.ts
│   └── validations/
│
├── database/               # Database schema
│   ├── schema.ts
│   └── drizzle.ts
│
└── docs/                   # Documentation
    ├── README.md (this file)
    ├── TABLE_OF_CONTENTS.md
    └── ... (35+ docs)
```

---

## 🔑 Environment Variables

Required in `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Better Auth
BETTER_AUTH_SECRET=<random-secret>
BETTER_AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_TOKEN=re_xxxxx

# OAuth (Optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GITHUB_CLIENT_ID=Ov23xxx
GITHUB_CLIENT_SECRET=xxx

# Cron Jobs
CRON_SECRET=<random-secret>
```

**🔐 Template:** See [.env.example](./.env.example)

---

## 🎯 Key Features Explained

### Authentication System
- **Email/Password:** Secure authentication with password hashing
- **OAuth:** Google and GitHub social login
- **Email Verification:** Resend-powered verification emails
- **Password Reset:** Token-based password recovery
- **Session Management:** React Query-based session handling

### Onboarding Flow
Three-stage process ensures complete user setup:
1. **Email Verification** - User verifies their email address
2. **Profile Setup** - 3-step wizard (name, goals, subjects)
3. **Completion** - Full access granted

### Study Timer
Multiple timer modes for different study techniques:
- **Pomodoro:** 25-min focus + 5-min break cycles
- **Timer:** Custom countdown timer
- **Stopwatch:** Open-ended time tracking
- **Persistence:** Recovers sessions after crashes

### Goal Tracking
Smart goal management with timezone awareness:
- **Daily/Weekly/Monthly:** Flexible goal periods
- **Streak Tracking:** Maintain study streaks
- **Timezone-Aware:** Resets at user's local midnight
- **Progress Tracking:** Visual progress indicators

### Analytics Dashboard
Comprehensive statistics and insights:
- **Time Distribution:** Study time over periods
- **Subject Breakdown:** Time by subject (pie chart)
- **Session Types:** Analysis by timer type
- **Focus Scores:** Performance metrics
- **Productivity Insights:** Best days/times

### Theme System
Modern, accessible theming:
- **OKLCH Colors:** Perceptually uniform colors
- **Light/Dark Mode:** Smooth theme switching
- **System Detection:** Follows OS preference
- **Consistent Design:** All components themed

---

## 🧪 Testing

### Run Tests

```bash
# Authentication flow
# Follow TESTING_GUIDE.md for comprehensive tests

# Timer persistence
# See TESTING_PERSISTENT_TIMER.md for timer tests

# Manual testing
bun dev
# Navigate to http://localhost:3000
```

### Test Accounts

```bash
# Use your verified email for testing
# (Resend testing mode restriction)
Email: your-verified-email@example.com
Password: TestPassword123!
```

---

## 🔄 Common Commands

```bash
# Development
bun dev                       # Start dev server
bun build                     # Build for production
bun start                     # Start production server

# Database
bun x drizzle-kit push        # Push schema changes
bun x drizzle-kit studio      # Open Drizzle Studio
bun x drizzle-kit generate    # Generate migrations

# Code Quality
bun lint                      # Run ESLint
bun format                    # Format code (if configured)

# Dependencies
bun install                   # Install dependencies
bun add <package>             # Add package
bun remove <package>          # Remove package
```

---

## 📊 Database Schema

### Core Tables

- **user** - User accounts and profiles
- **session** - Active sessions
- **account** - OAuth accounts
- **verification** - Email verification tokens
- **profile** - User profiles with goals
- **subject** - Study subjects with colors
- **study_session** - Study time tracking
- **goal** - User goals with streaks

**📘 Details:** Run `bun x drizzle-kit studio` to explore schema

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
bun add -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - RESEND_TOKEN
# - CRON_SECRET
# - (Optional) OAuth credentials

# 4. Set up cron jobs (automatic with vercel.json)
```

### Environment Setup

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy to apply changes

**📘 Cron Setup:** See [CRON_SETUP.md](./CRON_SETUP.md)

---

## 🤝 Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes**
   - Follow existing code patterns
   - Update documentation
   - Add tests if applicable

3. **Test thoroughly**
   - Manual testing in browser
   - Check React Query DevTools
   - Verify database changes

4. **Submit PR**
   - Clear description
   - Link related issues
   - Update relevant docs

### Code Standards

- **TypeScript:** Strict mode enabled
- **Formatting:** Follow existing patterns
- **Components:** Functional components with hooks
- **State:** React Query for server state
- **Styling:** Tailwind CSS utilities

---

## 📞 Support & Resources

### Documentation
- **Complete Index:** [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md)
- **Quick Start:** [QUICK_START.md](./QUICK_START.md)
- **Current Status:** [CURRENT_STATE.md](./CURRENT_STATE.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)

### Troubleshooting

Common issues and solutions:

| Issue | Solution | Reference |
|-------|----------|-----------|
| Database connection fails | Check DATABASE_URL | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| OAuth not working | Verify redirect URIs | [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) |
| Emails not sending | Check RESEND_TOKEN | [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md) |
| Goals not resetting | Verify CRON_SECRET | [CRON_SETUP.md](./CRON_SETUP.md) |
| Theme issues | Check ThemeProvider | [THEME_GUIDE.md](./THEME_GUIDE.md) |

---

## 🗺️ Roadmap

### Completed ✅
- [x] Authentication system
- [x] Onboarding flow
- [x] Study timer with persistence
- [x] Goal tracking
- [x] Analytics dashboard
- [x] Theme system
- [x] Media uploads
- [x] Timezone awareness
- [x] Email notifications

### In Progress 🚧
- [ ] Mobile app (React Native)
- [ ] Social features (study groups)
- [ ] Achievements system
- [ ] Export data to PDF

### Planned 📋
- [ ] AI study recommendations
- [ ] Calendar integration
- [ ] Study notes/flashcards
- [ ] Collaboration features
- [ ] Public API

---

## 📄 License

MIT License

Copyright (c) 2025 Sudharshan S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Better Auth](https://www.better-auth.com/) by Better Auth Team
- [TanStack Query](https://tanstack.com/query/) by TanStack
- [Drizzle ORM](https://orm.drizzle.team/) by Drizzle Team
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- [Tailwind CSS](https://tailwindcss.com/) by Tailwind Labs

---

**Version:** 2.0  
**Last Updated:** October 22, 2025  
**Maintained by:** SS.Study Team

**📚 Complete Documentation:** [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md)
