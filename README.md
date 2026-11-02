# Red Rocks Fan Hub

**Live demo: [red-rocks-app.vercel.app](https://red-rocks-app.vercel.app)**

A prototype for the Adobe Red Rock AI Innovation Challenge. One hub connects fans, sponsors and athletes, using AI to grow fan engagement and sponsorship revenue. Athletes, sponsors and figures are fictional.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Optional services

The app runs without keys, using email sign-in, simulated checkout and sample AI output. Fans never need an account. Set these in `.env.local` or in Vercel to switch on the real services:

| Variable | Turns on |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in for sponsors and athletes. Add `<site URL>/login` to the client's authorized redirect URIs. Google's button stays off until this is set. |
| `ADMIN_EMAILS` | Comma-separated Gmail addresses that can open Team access at `/admin`. |
| `SESSION_SECRET` | A long random string that signs sign-in cookies. Required for admins. |
| `DATABASE_URL` | Postgres (for example Neon from the Vercel Marketplace) that stores who is an athlete or sponsor. |
| `STRIPE_SECRET_KEY` | Stripe Checkout. Only `sk_test_` keys are accepted. |
| `ANTHROPIC_API_KEY` | Claude for matching, drafts, bios and message polish. |

## Prototype limits

Demo data, including accounts, lives in each visitor's browser. There is no database or server session, passwords are never checked, and payments are recorded by the browser. Do not use it with real customer data or live payments.
