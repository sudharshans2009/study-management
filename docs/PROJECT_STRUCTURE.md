# Project Structure - StudyFlow

## Directory Organization

### Route Groups

The application uses Next.js route groups to organize pages with different layouts:

```
app/
├── (auth)/              # Authentication pages - NO NAVBAR
│   ├── layout.tsx       # Auth layout (minimal, no navbar)
│   ├── signin/          # Sign in page
│   ├── signup/          # Sign up page
│   ├── setup/           # Profile setup wizard
│   └── forgot-password/ # Password reset
│
├── (app)/               # Dashboard pages - WITH NAVBAR
│   ├── layout.tsx       # App layout (includes navbar)
│   ├── dashboard/       # Main dashboard
│   ├── timer/           # Study timer
│   ├── sessions/        # Session history
│   ├── stats/           # Statistics & analytics
│   ├── goals/           # Goals management
│   ├── rooms/           # Study rooms
│   ├── leaderboard/     # Rankings
│   ├── profile/         # User profile
│   ├── notifications/   # Notifications
│   └── settings/        # Settings
│
├── api/                 # API routes
│   └── auth/            # Better Auth API handler
│
├── layout.tsx           # Root layout (no navbar/footer)
└── page.tsx             # Home page (custom home navbar + footer)
```

## Layout Strategy

### 1. Root Layout (`app/layout.tsx`)
- **Purpose**: Minimal wrapper for all pages
- **Includes**: Only HTML structure and font setup
- **Does NOT include**: Navbar or Footer
- **Applies to**: All pages

### 2. Auth Layout (`app/(auth)/layout.tsx`)
- **Purpose**: Clean layout for authentication flows
- **Includes**: Minimal wrapper only
- **Does NOT include**: Navbar or Footer
- **Applies to**: `/signin`, `/signup`, `/setup`, `/forgot-password`

### 3. App Layout (`app/(app)/layout.tsx`)
- **Purpose**: Full application layout for logged-in users
- **Includes**: Main Navbar
- **Does NOT include**: Footer
- **Applies to**: All dashboard pages (`/dashboard`, `/timer`, `/sessions`, etc.)

### 4. Home Page (`app/page.tsx`)
- **Purpose**: Landing page with custom layout
- **Includes**: HomeNavbar (simplified) + Footer
- **Special**: Has its own navbar variant

## Component Organization

### Layout Components (`/components/layout/`)

```
components/layout/
├── navbar.tsx           # Full navbar (for app pages)
├── home-navbar.tsx      # Simplified navbar (for home page)
├── user-menu-client.tsx # User menu with auth state
├── navigation-links.tsx # Navigation menu items
├── logo.tsx             # App logo
└── footer.tsx           # Footer component
```

### Auth Components (`/components/auth/`)

```
components/auth/
├── sign-in-form.tsx
├── sign-up-form.tsx
├── setup-profile-form.tsx
├── social-auth-buttons.tsx
└── auth-layout.tsx
```

### Home Components (`/components/home/`)

```
components/home/
├── hero-section.tsx
├── features-section.tsx
├── stats-section.tsx
└── cta-section.tsx
```

### UI Components (`/components/ui/`)
- shadcn/ui components (button, card, form, etc.)

## Server Actions (`/actions/`)

```
actions/
├── auth-actions.ts    # Authentication operations
├── setup-actions.ts   # Profile setup
└── study-actions.ts   # Study session operations
```

## Services (`/services/`)

```
services/
├── email.ts          # Email sending service
└── analytics.ts      # Analytics calculations
```

## Utilities (`/lib/`)

```
lib/
├── auth.ts           # Better Auth config
├── config.ts         # App configuration
├── utils.ts          # General utilities
├── auth-utils.ts     # Auth helper functions
├── time-utils.ts     # Time formatting
└── validations/
    └── auth.ts       # Zod validation schemas
```

## Hooks (`/hooks/`)

```
hooks/
├── use-auth.ts       # Authentication state
├── use-timer.ts      # Timer functionality
├── use-stopwatch.ts  # Stopwatch functionality
└── use-mobile.ts     # Mobile detection
```

## Database (`/database/`)

```
database/
├── drizzle.ts        # Drizzle ORM client
└── schema.ts         # Database schema
```

## Navigation Flow

### Home Page (`/`)
- **Layout**: Home Navbar + Content + Footer
- **Navbar**: Logo + Sign In/Sign Up (or User Menu if logged in)
- **Purpose**: Marketing/landing page

### Auth Pages (`/signin`, `/signup`, `/setup`, `/forgot-password`)
- **Layout**: Clean, centered content only
- **Navbar**: None
- **Purpose**: Authentication flows without distraction

### App Pages (`/dashboard`, `/timer`, `/sessions`, etc.)
- **Layout**: Full Navbar + Content
- **Navbar**: Logo + Navigation Links + User Menu
- **Purpose**: Main application features

## URL Structure

```
/                      → Home page (HomeNavbar + Footer)
/signin                → Sign in (No navbar)
/signup                → Sign up (No navbar)
/setup                 → Profile setup (No navbar)
/forgot-password       → Password reset (No navbar)
/dashboard             → Dashboard (Full navbar)
/timer                 → Study timer (Full navbar)
/sessions              → Session history (Full navbar)
/stats                 → Statistics (Full navbar)
/goals                 → Goals (Full navbar)
/rooms                 → Study rooms (Full navbar)
/leaderboard           → Rankings (Full navbar)
/profile               → User profile (Full navbar)
/notifications         → Notifications (Full navbar)
/settings              → Settings (Full navbar)
```

## Benefits of This Structure

1. ✅ **Clean Separation**: Auth flows are isolated from app pages
2. ✅ **Different Layouts**: Each section has appropriate UI
3. ✅ **Better UX**: No navbar distraction during signup/login
4. ✅ **Organized**: Easy to find and maintain files
5. ✅ **Scalable**: Easy to add new pages to each section
6. ✅ **Type-Safe**: All routes benefit from TypeScript
7. ✅ **SEO-Friendly**: Proper metadata per route group

## Layout Hierarchy

```
RootLayout (html, body, fonts)
│
├── HomeNavbar + Page + Footer   → / (home)
│
├── (auth) Layout                → Auth pages
│   └── No additional UI
│       ├── /signin
│       ├── /signup
│       ├── /setup
│       └── /forgot-password
│
└── (app) Layout                 → App pages
    └── Navbar
        ├── /dashboard
        ├── /timer
        ├── /sessions
        ├── /stats
        ├── /goals
        ├── /rooms
        ├── /leaderboard
        ├── /profile
        ├── /notifications
        └── /settings
```

## File Naming Conventions

- `page.tsx` - Route page component
- `layout.tsx` - Route layout component
- `loading.tsx` - Loading UI (if needed)
- `error.tsx` - Error boundary (if needed)
- `not-found.tsx` - 404 page (if needed)

## Component Naming Conventions

- PascalCase for components: `SignInForm`, `UserMenu`
- kebab-case for files: `sign-in-form.tsx`, `user-menu.tsx`
- Descriptive names: `use-auth.ts`, not `auth.ts`
- Action suffix for actions: `signInAction`, `setupProfileAction`
