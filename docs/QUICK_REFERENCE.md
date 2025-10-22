# 📚 SS.Study - Documentation Quick Reference

> **One-page reference for all documentation**  
> **Print this page or bookmark it!**

---

## 🎯 Start Here

| I want to... | Go to... |
|-------------|----------|
| **Set up the project (5 min)** | [QUICK_START.md](./QUICK_START.md) |
| **Set up the project (detailed)** | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| **Understand the project** | [README.md](./README.md) |
| **Find any documentation** | [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md) |
| **Check what's built** | [CURRENT_STATE.md](./CURRENT_STATE.md) |
| **See the file structure** | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |

---

## 🔐 Authentication

| Topic | Document |
|-------|----------|
| Auth overview | [AUTH.md](./AUTH.md) |
| Setup OAuth & email | [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) |
| How auth flows work | [AUTH_FLOW_FIXES.md](./AUTH_FLOW_FIXES.md) |
| Onboarding system | [ONBOARDING_FLOW.md](./ONBOARDING_FLOW.md) |
| Email configuration | [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md) |

---

## 🎨 UI & Design

| Topic | Document |
|-------|----------|
| Theme system (light/dark) | [THEME_GUIDE.md](./THEME_GUIDE.md) |
| Layout architecture | [LAYOUT_ARCHITECTURE.md](./LAYOUT_ARCHITECTURE.md) |
| Component organization | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |

---

## ⏱️ Features

| Feature | Document |
|---------|----------|
| Study timer | [TESTING_PERSISTENT_TIMER.md](./TESTING_PERSISTENT_TIMER.md) |
| Analytics & stats | [STATS_PAGE.md](./STATS_PAGE.md) |
| Timezone system | [TIMEZONE_SYSTEM.md](./TIMEZONE_SYSTEM.md) |
| File uploads | [MEDIA_QUICKSTART.md](./MEDIA_QUICKSTART.md) |
| Profile settings | [PROFILE_STUDY_SETTINGS.md](./PROFILE_STUDY_SETTINGS.md) |

---

## 💻 Development

| Topic | Document |
|-------|----------|
| Data fetching (React Query) | [REACT_QUERY_MIGRATION.md](./REACT_QUERY_MIGRATION.md) |
| Testing procedures | [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| Database migrations | [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) |
| Cron jobs | [CRON_SETUP.md](./CRON_SETUP.md) |

---

## 🚀 Common Commands

```bash
# Development
bun dev                      # Start dev server
bun build                    # Build for production

# Database
bun x drizzle-kit studio     # Open database UI
bun x drizzle-kit push       # Update database schema

# Testing
bun lint                     # Check code quality
```

---

## 🔑 Environment Variables

```bash
# Required
DATABASE_URL=               # PostgreSQL connection
BETTER_AUTH_SECRET=         # Random secret
RESEND_TOKEN=              # Email API key
CRON_SECRET=               # Cron job secret

# Optional
GOOGLE_CLIENT_ID=          # Google OAuth
GOOGLE_CLIENT_SECRET=      # Google OAuth
GITHUB_CLIENT_ID=          # GitHub OAuth
GITHUB_CLIENT_SECRET=      # GitHub OAuth
```

---

## 🆘 Troubleshooting

| Issue | Check | Solution In |
|-------|-------|-------------|
| Can't connect to database | DATABASE_URL | [GETTING_STARTED.md](./GETTING_STARTED.md) |
| Emails not sending | RESEND_TOKEN | [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md) |
| OAuth not working | Redirect URIs | [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) |
| Goals not resetting | CRON_SECRET | [CRON_SETUP.md](./CRON_SETUP.md) |
| Theme not working | ThemeProvider | [THEME_GUIDE.md](./THEME_GUIDE.md) |
| Build errors | Dependencies | [GETTING_STARTED.md](./GETTING_STARTED.md) |

---

## 📖 By Role

### New Developer
1. [README.md](./README.md)
2. [QUICK_START.md](./QUICK_START.md)
3. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
4. [REACT_QUERY_MIGRATION.md](./REACT_QUERY_MIGRATION.md)

### Frontend Developer
1. [THEME_GUIDE.md](./THEME_GUIDE.md)
2. [LAYOUT_ARCHITECTURE.md](./LAYOUT_ARCHITECTURE.md)
3. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

### Backend Developer
1. [AUTH.md](./AUTH.md)
2. [REACT_QUERY_MIGRATION.md](./REACT_QUERY_MIGRATION.md)
3. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### DevOps Engineer
1. [GETTING_STARTED.md](./GETTING_STARTED.md)
2. [CRON_SETUP.md](./CRON_SETUP.md)
3. [RESEND_EMAIL_SETUP.md](./RESEND_EMAIL_SETUP.md)

---

## 🔗 External Resources

- **Next.js:** https://nextjs.org/docs
- **Better Auth:** https://www.better-auth.com/
- **TanStack Query:** https://tanstack.com/query/latest
- **Drizzle ORM:** https://orm.drizzle.team/
- **shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 📊 Project Stats

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Runtime:** Bun
- **Database:** PostgreSQL
- **Total Files:** 100+
- **Components:** 50+
- **Documentation:** 35+ files

---

## 📞 Quick Help

1. **Can't find a doc?** → [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md)
2. **Need to set up?** → [QUICK_START.md](./QUICK_START.md) or [GETTING_STARTED.md](./GETTING_STARTED.md)
3. **Have an issue?** → Check troubleshooting table above
4. **Want examples?** → [MEDIA_EXAMPLES.md](./MEDIA_EXAMPLES.md)
5. **Testing something?** → [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

**💡 Pro Tip:** Bookmark [TABLE_OF_CONTENTS.md](./TABLE_OF_CONTENTS.md) for complete navigation!

---

**Last Updated:** October 22, 2025  
**Version:** 2.0
