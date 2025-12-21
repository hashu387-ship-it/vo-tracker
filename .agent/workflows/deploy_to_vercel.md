---
description: How to deploy the VO Tracker app to Vercel
---

# Deploying to Vercel

Follow these steps to make your application live on the web.

## 1. Push Code to GitHub

First, ensure your latest changes are pushed to your GitHub repository.

```bash
git push origin main
```

## 2. Connect to Vercel

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository (`hashu387-ship-it/vo-tracker`).

## 3. Configure Environment Variables

In the "Configure Project" screen, expand the **"Environment Variables"** section. Add the following variables (you can copy them from your local `.env.local`):

| Key | Value Description |
| :--- | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk Publishable Key |
| `CLERK_SECRET_KEY` | Your Clerk Secret Key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `DATABASE_URL` | Your Supabase Connection String (Transaction mode, port 6543) |
| `DIRECT_URL` | Your Supabase Connection String (Session mode, port 5432) |

> **Note:** For Supabase, make sure you use the connection string meant for production (not the local one if different), but usually it's the same cloud URL you are using now. Ensure `pgbouncer=true` query param is present for `DATABASE_URL` if you are using the transaction pooler.

## 4. Deploy

1.  Click **"Deploy"**.
2.  Wait for the build to complete.
3.  Once finished, you will get a live URL (e.g., `https://vo-tracker.vercel.app`).

## 5. Post-Deployment Checks

1.  Visit the live URL.
2.  Sign in/Sign up to verify authentication.
3.  Check the Dashboard to verify database connection.
