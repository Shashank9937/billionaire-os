# Vercel Deployment Guide

## 1) Create Production PostgreSQL
Use a managed PostgreSQL provider (Neon, Supabase, Render, RDS, etc.) and copy the production connection string.

## 2) Vercel Project Setup
1. Push this folder to GitHub.
2. In Vercel, create a new project from the repo.
3. Framework preset: `Next.js`.

## 3) Environment Variables (Vercel)
Set the following in Vercel Project Settings -> Environment Variables:
- `DATABASE_URL`
- `JWT_SECRET` (long random string)
- `JWT_EXPIRES_IN` (e.g. `7d`)
- `APP_URL` (your production URL)

## 4) Build & Install Commands
Vercel defaults are sufficient:
- Install: `npm install`
- Build: `npm run build`

`postinstall` already runs `prisma generate`.

## 5) Run Database Migrations
Run migrations against production DB before promoting traffic:
```bash
npm run prisma:deploy
```

Recommended options:
- Run in CI/CD after build but before deploy promotion.
- Or run manually from a secure pipeline runner.

## 6) Verify Production
After deploy:
1. Open `/login` and sign in.
2. Verify dashboard metrics render.
3. Create one record in each module.
4. Download all exports.
5. Check runtime logs for auth/db errors.

## 7) Operational Hardening
- Rotate `JWT_SECRET` periodically.
- Add structured logging and error monitoring (Sentry/Datadog).
- Add backups + point-in-time recovery on DB.
- Enforce HTTPS-only cookies (`secure` is automatic in production).
- Add rate limiting in front of mutation-heavy routes.
