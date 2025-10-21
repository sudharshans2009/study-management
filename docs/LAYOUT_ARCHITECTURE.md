# Layout Architecture - Visual Guide

## Application Structure Overview

```
┌─────────────────────────────────────────────────────────┐
│                     ROOT LAYOUT                          │
│                  (html, body, fonts)                     │
│                  No navbar/footer                        │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐       ┌──────────┐      ┌──────────┐
   │  HOME  │       │  (auth)  │      │   (app)  │
   │  PAGE  │       │  LAYOUT  │      │  LAYOUT  │
   └────────┘       └──────────┘      └──────────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
```

## 1. Home Page Layout

```
┌───────────────────────────────────────────┐
│         HOME NAVBAR (Simple)              │
│  ┌────┐              ┌──────────────┐    │
│  │Logo│              │Sign In/Sign Up│    │
│  └────┘              └──────────────┘    │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│                                           │
│              HERO SECTION                 │
│                                           │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│             STATS SECTION                 │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│           FEATURES SECTION                │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│              CTA SECTION                  │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│                FOOTER                      │
│    Product | Company | Legal | Social     │
└───────────────────────────────────────────┘
```

**URL:** `/`
**Layout:** Custom (HomeNavbar + Footer)
**Purpose:** Landing/marketing page

---

## 2. Auth Pages Layout

```
┌───────────────────────────────────────────┐
│                                           │
│                                           │
│          ┌─────────────────┐             │
│          │                 │             │
│          │   AUTH FORM     │             │
│          │                 │             │
│          │  - Sign In      │             │
│          │  - Sign Up      │             │
│          │  - Setup        │             │
│          │  - Forgot Pwd   │             │
│          │                 │             │
│          └─────────────────┘             │
│                                           │
│                                           │
└───────────────────────────────────────────┘
```

**URLs:** `/signin`, `/signup`, `/setup`, `/forgot-password`
**Layout:** Minimal (no navbar, no footer)
**Purpose:** Focused authentication flow

---

## 3. App Pages Layout

```
┌───────────────────────────────────────────┐
│            FULL NAVBAR                     │
│  ┌────┐  [Timer][Sessions][Stats]  ┌───┐ │
│  │Logo│  [Goals][Rooms][Board]     │👤│ │
│  └────┘                             └───┘ │
└───────────────────────────────────────────┘
┌───────────────────────────────────────────┐
│                                           │
│                                           │
│          PAGE CONTENT                     │
│                                           │
│      - Dashboard                          │
│      - Timer                              │
│      - Sessions                           │
│      - Stats                              │
│      - Goals                              │
│      - Rooms                              │
│      - Leaderboard                        │
│      - Profile                            │
│      - Notifications                      │
│      - Settings                           │
│                                           │
│                                           │
└───────────────────────────────────────────┘
```

**URLs:** `/dashboard`, `/timer`, `/sessions`, etc.
**Layout:** Full navbar (no footer)
**Purpose:** Main application features

---

## Component Hierarchy

### Home Page
```
<html>
  <body>
    <HomeNavbar>
      <Logo />
      <UserMenu />  ← Shows Sign In/Up OR Avatar
    </HomeNavbar>
    
    <main>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
    </main>
    
    <Footer />
  </body>
</html>
```

### Auth Pages
```
<html>
  <body>
    <div className="min-h-screen">
      <AuthLayout>
        <SignInForm />     OR
        <SignUpForm />     OR
        <SetupForm />      OR
        <ForgotPasswordForm />
      </AuthLayout>
    </div>
  </body>
</html>
```

### App Pages
```
<html>
  <body>
    <Navbar>
      <Logo />
      <NavigationLinks />  ← Timer, Sessions, etc.
      <UserMenu />         ← Avatar + Dropdown
    </Navbar>
    
    <main>
      <PageContent />  ← Dashboard, Timer, etc.
    </main>
  </body>
</html>
```

---

## User Menu States

### Not Logged In
```
┌──────────────────────────┐
│  Sign In  │  Sign Up     │
└──────────────────────────┘
```

### Logged In
```
┌────┐
│ JD │  ← Avatar (initials)
└────┘
  │
  ▼
┌──────────────────┐
│ John Doe         │
│ john@example.com │
├──────────────────┤
│ 👤 Profile       │
│ 🔔 Notifications │
│ ⚙️  Settings     │
├──────────────────┤
│ 🚪 Log out       │
└──────────────────┘
```

---

## Navigation Flow

```
Landing Page (/)
    │
    ├── Sign Up ──→ /signup ──→ /setup ──→ /dashboard
    │
    └── Sign In ──→ /signin ──────────→ /dashboard
                                            │
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

---

## Responsive Behavior

### Desktop (> 768px)

**Home Navbar:**
```
┌──────────────────────────────────────────┐
│ [Logo SS.Study]      [Sign In][Sign Up] │
└──────────────────────────────────────────┘
```

**App Navbar:**
```
┌──────────────────────────────────────────────────┐
│ [Logo] [Timer][Sessions][Stats][Goals][Rooms]... [👤] │
└──────────────────────────────────────────────────┘
```

### Mobile (< 768px)

**Home Navbar:**
```
┌────────────────────┐
│ [Logo]      [Sign In][Sign Up] │
└────────────────────┘
```

**App Navbar:**
```
┌──────────────────┐
│ [Logo]   [👤][☰] │
└──────────────────┘
       Tap ☰ to open
           ▼
    ┌────────────┐
    │ Timer      │
    │ Sessions   │
    │ Stats      │
    │ Goals      │
    │ Rooms      │
    │ Leaderboard│
    └────────────┘
```

---

## Color Code Legend

📗 **Green** - Public (accessible to all)
📕 **Red** - Auth Only (requires login)
📘 **Blue** - Marketing (home page)

```
📘 /                    (Home)
📗 /signin              (Auth - Public)
📗 /signup              (Auth - Public)
📗 /setup               (Auth - Public)
📗 /forgot-password     (Auth - Public)
📕 /dashboard           (App - Protected)
📕 /timer               (App - Protected)
📕 /sessions            (App - Protected)
📕 /stats               (App - Protected)
📕 /goals               (App - Protected)
📕 /rooms               (App - Protected)
📕 /leaderboard         (App - Protected)
📕 /profile             (App - Protected)
📕 /notifications       (App - Protected)
📕 /settings            (App - Protected)
```

---

## Summary

✅ **3 Different Layout Strategies**
- Home: Custom navbar + footer
- Auth: No navbar, no footer
- App: Full navbar, no footer

✅ **Clean Separation**
- Marketing vs Auth vs App
- Clear visual hierarchy
- Proper user flow

✅ **Responsive Design**
- Mobile hamburger menu
- Desktop full navigation
- Adaptive user menu
