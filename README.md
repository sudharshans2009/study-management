# StudyFlow - Study & Productivity App

A modern study tracking and productivity application built with Next.js 15, Better Auth, Drizzle ORM, and shadcn/ui.

## Features

### 🔐 Authentication
- Email/Password authentication with Better Auth
- Social login (Google, GitHub)
- Email verification
- Password reset functionality
- Multi-step profile setup

### 📊 Study Tracking
- Study timer (Pomodoro, Stopwatch, Basic)
- Session history and analytics
- Subject/category management
- Goal setting (daily, weekly, monthly)
- Streak tracking

### 🏆 Gamification
- Achievements and badges
- Level system
- Leaderboards
- Study rooms (social studying)

### 📱 Responsive Design
- Mobile-first approach
- Dark mode support
- Accessible components

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (recommended: Neon)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd assist
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# App URLs
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Email (Optional - for verification emails)
RESEND_TOKEN=your_resend_api_key
```

4. Generate database schema:
```bash
bun x @better-auth/cli generate
bun x drizzle-kit push
```

5. Run the development server:
```bash
bun run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── signin/              # Sign in page
│   ├── signup/              # Sign up page
│   ├── setup/               # Profile setup
│   ├── forgot-password/     # Password reset
│   ├── api/                 # API routes
│   │   └── auth/            # Better Auth API
│   ├── dashboard/           # Dashboard page
│   ├── timer/               # Study timer
│   ├── sessions/            # Session history
│   ├── stats/               # Statistics
│   ├── goals/               # Goals management
│   ├── rooms/               # Study rooms
│   └── leaderboard/         # Leaderboards
├── components/              # React components
│   ├── auth/                # Auth components
│   ├── home/                # Home page sections
│   ├── layout/              # Layout components
│   └── ui/                  # shadcn/ui components
├── actions/                 # Server actions
│   ├── auth-actions.ts      # Authentication
│   ├── setup-actions.ts     # Profile setup
│   └── study-actions.ts     # Study sessions
├── services/                # Business logic
│   ├── analytics.ts         # Analytics service
│   └── email.ts             # Email service
├── lib/                     # Utilities
│   ├── auth.ts              # Better Auth config
│   ├── config.ts            # App configuration
│   ├── utils.ts             # General utilities
│   ├── auth-utils.ts        # Auth utilities
│   ├── time-utils.ts        # Time formatting
│   └── validations/         # Zod schemas
├── hooks/                   # Custom React hooks
│   ├── use-auth.ts          # Auth hook
│   ├── use-timer.ts         # Timer hook
│   ├── use-stopwatch.ts     # Stopwatch hook
│   └── use-mobile.ts        # Mobile detection
├── database/                # Database
│   ├── drizzle.ts           # Drizzle client
│   └── schema.ts            # Database schema
└── docs/                    # Documentation
    └── AUTH.md              # Auth documentation
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## Database Commands

- `bun x drizzle-kit generate` - Generate migrations
- `bun x drizzle-kit push` - Push schema to database
- `bun x drizzle-kit studio` - Open Drizzle Studio
- `bun x @better-auth/cli generate` - Generate Better Auth schema

## Authentication Flow

1. **Sign Up** (`/signup`)
   - User creates account with email/password
   - Form validated with Zod
   - Account created via Better Auth
   - Redirected to setup page

2. **Profile Setup** (`/setup`)
   - 3-step wizard:
     - Personal info (full name)
     - Study subjects with colors
     - Daily study goal
   - Data saved via server actions
   - Redirected to dashboard

3. **Sign In** (`/signin`)
   - Email/password or OAuth
   - Session created
   - Redirected to dashboard

## Features Implementation Status

### ✅ Completed
- [x] Authentication (Sign In, Sign Up)
- [x] Profile Setup (3-step wizard)
- [x] Home Page with sections
- [x] Navigation & Layout
- [x] Form validation with Zod
- [x] Server Actions
- [x] Database schema
- [x] User menu with auth state
- [x] Forgot password page

### 🚧 In Progress
- [ ] Study Timer functionality
- [ ] Session tracking
- [ ] Statistics dashboard
- [ ] Goals management
- [ ] Study rooms
- [ ] Achievements system

### 📋 Planned
- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth integration
- [ ] Real-time features
- [ ] Mobile app (React Native)
- [ ] API documentation

## Documentation

- [Authentication Guide](./docs/AUTH.md)

## Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

## License

MIT License - see LICENSE file for details

## Support

For support, email support@studyflow.app or open an issue on GitHub.
