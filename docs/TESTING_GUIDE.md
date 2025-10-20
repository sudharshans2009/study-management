# Quick Test Guide - Authentication Flow

## Prerequisites

1. **Development server running:**
   ```bash
   bun dev
   ```

2. **Environment variables configured in `.env.local`:**
   - ✅ DATABASE_URL (Neon PostgreSQL)
   - ✅ BETTER_AUTH_SECRET
   - ✅ BETTER_AUTH_URL=http://localhost:3000
   - ✅ RESEND_API_KEY (for email verification)
   - ✅ GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (optional)
   - ✅ GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET (optional)

3. **Database migrated:**
   ```bash
   bun x drizzle-kit push
   ```

---

## Test 1: Sign Up Flow (5 minutes)

### Steps:
1. **Open browser:** http://localhost:3000
2. **Click "Sign Up"** button in navbar
3. **Fill signup form:**
   - Name: Test User
   - Email: test@example.com (use a real email you can access)
   - Password: Password123!
   - Confirm Password: Password123!
4. **Click "Create Account"**

### Expected Results:
✅ Success message appears
✅ Automatically logged in (no manual signin needed)
✅ Redirected to `/setup` page
✅ Email verification alert shows (amber/yellow)
✅ Alert says "Email verification pending"
✅ Shows your email address

### What to Check:
- [ ] Check browser cookies: `better-auth.session_token` should exist
- [ ] Check email inbox: Verification email should be received
- [ ] Check Resend dashboard: Email should show as sent
- [ ] Open DevTools → Application → Cookies → confirm session token exists

---

## Test 2: Profile Setup (3 minutes)

### Steps:
1. **On `/setup` page, fill Step 1:**
   - Full Name: Test User
   - Click "Next"

2. **Fill Step 2:**
   - Select daily goal (e.g., 2 hours)
   - Click "Next"

3. **Fill Step 3:**
   - Add subject: "Mathematics" (click color circle to choose color)
   - Click "Add Subject" to add more (optional)
   - Click "Complete Setup"

### Expected Results:
✅ Form submits successfully
✅ Success message appears
✅ Redirected to `/dashboard`
✅ Dashboard shows email verification warning (red alert)

### What to Check:
- [ ] Open Drizzle Studio: `bun x drizzle-kit studio`
- [ ] Check `profile` table: Should have 1 row with your userId
- [ ] Check `subject` table: Should have rows for each subject you added
- [ ] Verify `setupCompleted` is `true` in profile table

---

## Test 3: Dashboard Email Verification Block (2 minutes)

### Steps:
1. **On `/dashboard` page, observe the UI**
2. **Try clicking "Complete Profile Setup"** button
3. **Click "I've Verified My Email"** button

### Expected Results:
✅ Red alert shows "Email Verification Required"
✅ Message explains you need to verify email
✅ Shows your email address
✅ "Complete Profile Setup" redirects to `/setup`
✅ "I've Verified My Email" refreshes the page

### What to Check:
- [ ] Dashboard content (study timer, goals, subjects cards) is NOT visible
- [ ] Only verification warning is shown
- [ ] Navigation bar still works
- [ ] User menu shows your avatar/name

---

## Test 4: Email Verification (3 minutes)

### Steps:
1. **Check your email inbox** (including spam folder)
2. **Open the verification email** from Better Auth
3. **Click the verification link**
4. **Should be redirected to the app**

### Expected Results:
✅ Verification link opens in browser
✅ User is signed in automatically
✅ Dashboard now shows full content (no warning)
✅ Green success alert on `/setup` page (if you visit it)

### What to Check:
- [ ] Open Drizzle Studio
- [ ] Check `user` table: `emailVerified` should be `true`
- [ ] Dashboard shows: "Welcome back, [Your Name]!"
- [ ] Dashboard shows 3 cards: Study Timer, Study Goals, Subjects
- [ ] No verification warning visible

---

## Test 5: Sign Out & Sign In (2 minutes)

### Steps:
1. **Click your avatar** in top-right corner
2. **Click "Sign Out"**
3. **Observe redirect** to home page
4. **Click "Sign In"** in navbar
5. **Fill signin form:**
   - Email: test@example.com
   - Password: Password123!
6. **Click "Sign In"**

### Expected Results:
✅ Signed out successfully
✅ Redirected to home page (`/`)
✅ Navbar shows "Sign In" and "Sign Up" buttons (no avatar)
✅ Sign in form loads
✅ Sign in successful
✅ Redirected to `/dashboard`
✅ Dashboard shows full content (email already verified)

### What to Check:
- [ ] Session cookie cleared on sign out
- [ ] Session cookie recreated on sign in
- [ ] React Query cache updated (check DevTools)
- [ ] User menu shows avatar again

---

## Test 6: Middleware Protection (3 minutes)

### Steps:
1. **Sign out if logged in**
2. **Try accessing `/setup` directly:** http://localhost:3000/setup
3. **Try accessing `/dashboard` directly:** http://localhost:3000/dashboard
4. **Sign in again**
5. **Try accessing `/signin` while logged in**
6. **Try accessing `/signup` while logged in**

### Expected Results:

**When NOT logged in:**
✅ `/setup` → Redirected to `/signin?from=/setup`
✅ `/dashboard` → Redirected to `/signin?from=/dashboard`

**When logged in:**
✅ `/signin` → Redirected to `/dashboard`
✅ `/signup` → Redirected to `/dashboard`
✅ `/setup` → Accessible (can re-edit profile)
✅ `/dashboard` → Accessible (if email verified)

---

## Test 7: OAuth Sign In (Optional - 5 minutes)

**Only if Google/GitHub OAuth is configured**

### Steps:
1. **Sign out if logged in**
2. **Go to `/signin` page**
3. **Click "Continue with Google"** or **"Continue with GitHub"**
4. **Authorize the app** in OAuth popup
5. **Observe redirect**

### Expected Results:
✅ OAuth popup opens
✅ Successfully authorized
✅ Account created (or signed in if exists)
✅ Redirected to `/dashboard` or `/setup`
✅ Email should be pre-verified (depends on OAuth provider)

---

## Common Issues & Solutions

### Issue: "Failed to create account"
**Check:**
- Database connection (DATABASE_URL correct?)
- Drizzle migration ran successfully?
- Email already exists in database?

### Issue: "Failed to sign in"
**Check:**
- Correct email and password?
- Account exists in `user` table?
- Session service running?

### Issue: No verification email received
**Check:**
- RESEND_API_KEY configured?
- Resend account has sending domain verified?
- Check spam folder
- Check Resend dashboard logs

### Issue: Setup form won't submit
**Check:**
- Browser console for errors
- Network tab for failed requests
- Database connection
- Session exists (user logged in)?

### Issue: Dashboard still shows warning after verification
**Check:**
- Hard refresh the page (Ctrl+Shift+R)
- Clear cookies and sign in again
- Check database: `user.emailVerified` should be `true`
- React Query cache might be stale

---

## Quick Debugging Tools

### 1. Browser DevTools
```
F12 → Application → Cookies → localhost
Look for: better-auth.session_token
```

### 2. React Query DevTools
```
Look for icon in bottom-right corner
Click to inspect queries and mutations
Check "session" query status
```

### 3. Drizzle Studio
```bash
bun x drizzle-kit studio
# Opens at http://localhost:4983
```

### 4. Server Logs
```
Terminal running `bun dev`
Look for:
- "Sign up error:"
- "Sign in error:"
- "Setup profile error:"
- "Verification email sent successfully to:"
```

### 5. Network Tab
```
F12 → Network tab
Filter: Fetch/XHR
Look for:
- /api/auth/signup
- /api/auth/signin
- /api/auth/session
- Actions: signUpAction, signInAction, setupProfileAction
```

---

## Success Criteria

✅ **All 7 tests pass without errors**
✅ **User can sign up → auto login → complete setup → verify email → access dashboard**
✅ **Session persists across page refreshes**
✅ **Middleware correctly protects routes**
✅ **Email verification works end-to-end**
✅ **Sign out and sign in work correctly**
✅ **Database tables populated correctly**

---

## Time Estimate

- **Full test suite:** ~20-25 minutes
- **Quick smoke test:** ~10 minutes (Tests 1, 2, 4, 5 only)
- **Minimal test:** ~5 minutes (Tests 1, 2, 5 only)

---

**Ready to test!** 🚀

Start your dev server and begin with Test 1.
