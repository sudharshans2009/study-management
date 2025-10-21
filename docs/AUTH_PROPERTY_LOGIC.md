# Authentication Property Logic

## Clear Separation of Concerns

### Email Verification = `emailVerified` Property

**Purpose:** Tracks whether the user has verified their email address

**Type:** `boolean`

**Values:**
- `false` - Email not verified yet
- `true` - Email has been verified

**Usage:**
```typescript
// Check if user needs to verify email
if (!user.emailVerified) {
  router.push("/verify-email");
}
```

### Onboarding Completion = `onboardingStatus` Property

**Purpose:** Tracks the user's overall onboarding progress

**Type:** `"pending_verification" | "pending_setup" | "completed"`

**Values:**
- `"pending_verification"` - Just signed up, awaiting email verification
- `"pending_setup"` - Email verified, needs to complete profile setup
- `"completed"` - Fully onboarded and ready to use the app

**Usage:**
```typescript
// Check if user needs to complete setup
if (user.onboardingStatus !== "completed") {
  router.push("/setup");
}
```

## The Logic Flow

### Sign Up
```typescript
// After signup
user.emailVerified = false
user.onboardingStatus = "pending_verification"
→ Redirect to /verify-email
```

### Email Verification
```typescript
// After clicking verification link
user.emailVerified = true
user.onboardingStatus = "pending_setup"
→ Can now sign in and go to /setup
```

### Complete Setup
```typescript
// After completing profile setup
user.emailVerified = true (unchanged)
user.onboardingStatus = "completed"
→ Redirect to /dashboard
```

## Route Protection Logic

### Sign In Redirects

```typescript
// Check email verification FIRST (using emailVerified)
if (!user.emailVerified) {
  router.push("/verify-email");
  return;
}

// Then check onboarding completion (using onboardingStatus)
if (user.onboardingStatus !== "completed") {
  router.push("/setup");
  return;
}

// Fully verified and onboarded
router.push("/dashboard");
```

### Setup Page Access

```typescript
// 1. Must be authenticated
if (!user) {
  router.push("/signin");
  return;
}

// 2. Must have verified email (check emailVerified)
if (!user.emailVerified) {
  router.push("/verify-email");
  return;
}

// 3. Must not be completed (check onboardingStatus)
if (user.onboardingStatus === "completed") {
  router.push("/dashboard");
  return;
}

// Can access setup page
```

### Verify Email Page Access

```typescript
// Must be authenticated
if (!user) {
  router.push("/signin");
  return;
}

// If already verified (check emailVerified)
if (user.emailVerified) {
  // Check if setup is completed
  if (user.onboardingStatus === "completed") {
    router.push("/dashboard");
  } else {
    router.push("/setup");
  }
  return;
}

// Can access verify-email page
```

## useAuth Hook Properties

```typescript
const {
  user,                     // User object with emailVerified and onboardingStatus
  isAuthenticated,          // Boolean: logged in?
  onboardingStatus,         // "pending_verification" | "pending_setup" | "completed"
  needsVerification,        // !user.emailVerified (checks emailVerified property)
  needsSetup,              // user.emailVerified && onboardingStatus !== "completed"
  isOnboarded,             // onboardingStatus === "completed"
} = useAuth();
```

## Why This Separation?

### Single Responsibility Principle

**`emailVerified`** - One job: Track email verification state
- Simple boolean
- Clear meaning
- Standard across auth systems

**`onboardingStatus`** - One job: Track overall onboarding progress
- Provides context about user's journey
- Can be expanded with more states if needed
- Better for analytics and tracking

### Benefits

1. **Clarity** - Each property has a clear, single purpose
2. **Flexibility** - Can add more onboarding states without affecting email verification
3. **Standards** - `emailVerified` is a standard property in auth systems
4. **Debugging** - Easier to understand what's wrong when issues occur
5. **Analytics** - Can track email verification and onboarding separately

## Examples

### Example 1: User Just Signed Up

```typescript
{
  emailVerified: false,
  onboardingStatus: "pending_verification"
}

// Logic:
needsVerification: true  // Check emailVerified
needsSetup: false        // Not verified yet, so can't setup
isOnboarded: false       // Not completed
```

### Example 2: User Verified Email

```typescript
{
  emailVerified: true,
  onboardingStatus: "pending_setup"
}

// Logic:
needsVerification: false // Email is verified
needsSetup: true         // Verified but not completed
isOnboarded: false       // Not completed
```

### Example 3: User Completed Onboarding

```typescript
{
  emailVerified: true,
  onboardingStatus: "completed"
}

// Logic:
needsVerification: false // Email is verified
needsSetup: false        // Already completed
isOnboarded: true        // Fully onboarded
```

## Code Patterns

### ✅ Good: Check Specific Properties

```typescript
// Check email verification
if (!user.emailVerified) {
  // Handle unverified email
}

// Check onboarding completion
if (user.onboardingStatus !== "completed") {
  // Handle incomplete onboarding
}
```

### ❌ Bad: Mixing Concerns

```typescript
// Don't check onboardingStatus for email verification
if (user.onboardingStatus === "pending_verification") {
  // This works but is less clear
}

// Instead use:
if (!user.emailVerified) {
  // Much clearer intent
}
```

## Summary

- **Email Verification** → Check `emailVerified` property (boolean)
- **Onboarding Completion** → Check `onboardingStatus` property (enum)
- **Always check in order:** emailVerified FIRST, then onboardingStatus
- **Clear separation** = Better code, easier debugging, more maintainable
