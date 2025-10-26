# 🚨 QStash Localhost Limitation

## The Issue

When you run `bun run workflow:setup` with `NEXT_PUBLIC_APP_URL=http://localhost:3000`, you'll see this error:

```
❌ Failed: global-update-hourly
   Error: {"error":"invalid destination url: endpoint resolves to a loopback address: ::1"}
```

## Why This Happens

**QStash cannot call localhost addresses** because:
- QStash runs on Upstash's servers (in the cloud)
- Your localhost is only accessible on your computer
- QStash needs a public URL to deliver messages

Think of it like this: 📬 A mail carrier (QStash) can't deliver to "my house" - they need a full address (public URL).

## ✅ Solutions

### Solution 1: Production Setup (Recommended) ⭐

**Best for:** Deploying to production

```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Update .env.local
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 3. Add environment variables to Vercel
#    (Go to Project Settings → Environment Variables)

# 4. Run setup
bun run workflow:setup
```

**Pros:**
- ✅ Permanent solution
- ✅ Production-ready
- ✅ No extra tools needed

**Cons:**
- ❌ Need to deploy first
- ❌ Can't test locally with real schedules

---

### Solution 2: Local Development with Tunnel 🔧

**Best for:** Testing QStash locally

```bash
# 1. Install ngrok
npm install -g ngrok
# OR
brew install ngrok  # Mac
# OR
choco install ngrok  # Windows

# 2. Start your app
bun run dev

# 3. In ANOTHER terminal, start tunnel
ngrok http 3000

# Output will show:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000

# 4. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# 5. Update .env.local
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io

# 6. Run setup
bun run workflow:setup

# 7. Keep ngrok running while testing
```

**Pros:**
- ✅ Test QStash locally
- ✅ See live webhook deliveries
- ✅ Debug in real-time

**Cons:**
- ❌ URL changes each time ngrok restarts
- ❌ Need to keep tunnel running
- ❌ Free ngrok has rate limits

**ngrok Alternatives:**
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/) (Cloudflare Tunnel)
- [localtunnel](https://github.com/localtunnel/localtunnel)
- [serveo](https://serveo.net/)

---

### Solution 3: Skip QStash Setup for Now 🚀

**Best for:** Early development

Just develop without QStash schedules:

```bash
# .env.local stays as:
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Start development normally
bun run dev

# Test other features (Redis, Realtime, etc.)
# Skip QStash setup until deploying to production
```

**Pros:**
- ✅ Start developing immediately
- ✅ No extra setup needed
- ✅ Test Redis, Realtime, etc. normally

**Cons:**
- ❌ Can't test scheduled cron jobs
- ❌ Need to setup QStash later in production

**What still works without QStash:**
- ✅ Redis caching
- ✅ Rate limiting
- ✅ Realtime events (SSE)
- ✅ Manual workflow triggers
- ✅ All API endpoints

**What won't work:**
- ❌ Automatic hourly global updates
- ❌ Batch onboarding emails (scheduled)
- ❌ Daily goal reminders (scheduled)

---

## 🎯 Recommended Workflow

### For Development
```bash
# 1. Start with localhost (skip QStash setup)
NEXT_PUBLIC_APP_URL=http://localhost:3000
bun run dev

# 2. Develop and test features
# 3. Test manually triggering endpoints if needed:
curl http://localhost:3000/api/qstash/global-update \
  -X POST \
  -H "Content-Type: application/json"
```

### For Production
```bash
# 1. Deploy to Vercel
vercel --prod

# 2. Add environment variables to Vercel dashboard

# 3. Set production URL locally
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# 4. Run QStash setup
bun run workflow:setup

# 5. Verify in Upstash console
# Visit: https://console.upstash.com/qstash
```

---

## 📊 Comparison Table

| Approach | Setup Time | Maintenance | Use Case |
|----------|-----------|-------------|----------|
| **Production Deploy** | 10 min | None | ⭐ Best for final setup |
| **ngrok Tunnel** | 5 min | Restart each session | Best for testing QStash |
| **Skip for Now** | 0 min | None | Best for early dev |

---

## 🔍 How to Check Current URL

```bash
# Check what URL is configured
cat .env.local | grep NEXT_PUBLIC_APP_URL

# If it shows localhost, you need one of the solutions above
```

---

## ❓ FAQ

**Q: Can I use my router's public IP?**
A: No. QStash needs a stable domain name with HTTPS. Public IPs change and usually don't have SSL certificates.

**Q: Can I use my computer's network IP (192.168.x.x)?**
A: No. Private network IPs are not accessible from the internet.

**Q: Does ngrok URL expire?**
A: Yes. Free ngrok URLs change when you restart ngrok. Paid plans offer persistent URLs.

**Q: Can I test without QStash?**
A: Yes! Most features work fine. You just won't have scheduled cron jobs running automatically.

**Q: Do I need QStash for development?**
A: No. QStash is mainly for automated scheduled tasks. You can manually test endpoints during development.

---

## 📚 Related Documentation

- [Main Setup Guide](./SETUP_NEXT_STEPS.md)
- [Upstash Integration](./UPSTASH_INTEGRATION.md)
- [Workflow Documentation](./WORKFLOWS.md)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 💡 Summary

```
┌─────────────────────────────────────────────────┐
│  Development Stage     → Recommended Solution   │
├─────────────────────────────────────────────────┤
│  Early Development     → Skip QStash Setup      │
│  Testing QStash        → Use ngrok Tunnel       │
│  Production Deploy     → Use Production URL     │
└─────────────────────────────────────────────────┘
```

**Remember:** Localhost ≠ Public URL. QStash needs to reach your app from the internet! 🌐
