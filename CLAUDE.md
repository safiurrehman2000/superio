# De Flexijobber (superio)

Belgian job platform for flexible work in Flanders. Connects employers with candidates (flex workers, students, side-income seekers). Production site: `https://www.de-flexi-jobber.be`.

## Tech stack

- **Framework:** Next.js 14 (App Router), React 18
- **Language:** JavaScript/JSX (some TypeScript in newer pages). Path alias `@/*` maps to repo root (`jsconfig.json`).
- **Styling:** SCSS (`public/scss/`, `styles/index.scss`), Bootstrap 5
- **State:** Redux Toolkit (`store/store.js`, `slices/`, `features/`)
- **Auth & data:** Firebase Auth + Firestore (client: `utils/firebase.js`, server: `utils/firebase-admin.js`)
- **Payments:** Stripe (subscriptions, one-time checkout, customer portal, webhooks)
- **Email:** Brevo (`utils/brevo-email-service.js`)
- **PDF:** pdfkit (receipts/invoices — server-only, externalized in `next.config.js`)

## User types

Three roles stored on `users` documents as `userType`:

| Type | Dashboard | Notes |
|------|-----------|-------|
| `Candidate` | `/candidates-dashboard/*` | Profiles, CV, applications, job alerts |
| `Employer` | `/employers-dashboard/*` | Company profile, job posts, applicants, subscriptions |
| `Admin` | `/admin-dashboard/*` | Users, jobs, pricing, coupons, FAQs, contact queries |

Auth flow: Firebase email/password with OTP verification (`/api/auth/send-verification-code`, `/api/auth/verify-and-register`). `app/RouteGuard.jsx` enforces route access, onboarding redirects, and profile repair via `/api/ensure-user-profile`.

Admin API routes use `utils/admin-auth-middleware.js` (Firebase ID token + `admin` custom claim).

## Project layout

```
app/                    # Next.js App Router — pages and API routes
  api/                  # Server routes (Stripe, admin, jobs, auth, emails)
  candidates-dashboard/
  employers-dashboard/
  admin-dashboard/
  job-list/             # Public job listings (v6 components in components/job-listing-pages/)
components/             # UI by feature area (dashboard-pages, job-listing-pages, common, etc.)
utils/                  # Shared helpers (auth, Stripe, subscriptions, PDFs, rate limiting)
APIs/                   # Client-side data-fetch hooks (auth, pricing, etc.)
slices/ + features/     # Redux state
scripts/                # One-off maintenance (job alerts, backfills)
public/                 # Static assets, SCSS partials
```

## Key Firestore collections

- `users` — profiles, subscription fields, employer company data, onboarding state
- `jobs` — job postings
- `applications` — candidate applications to jobs
- `pricingPackages` — employer subscription tiers (synced with Stripe)
- `categories` — job categories
- `receipts` — payment receipts (Stripe checkout/invoice sync)
- `emailVerifications` — OTP codes during registration
- `adminAuditLogs` — admin action audit trail

## Stripe & subscriptions

Employers need an active plan to post jobs. Limits are enforced via `utils/employerAccess.js`, `utils/computeJobPostingLimits.js`, and `/api/job-posting-limits`.

- Checkout: `/api/create-checkout-session`
- Webhook: `/api/stripe-webhook` (handles subscription lifecycle, receipt sync)
- Portal: `/api/create-portal-session`
- Local webhook testing: `npm run stripe:listen`

Receipt PDFs are generated server-side (`utils/generateBrandedReceiptPdf.js`, `utils/stripeReceiptSync.js`).

## Environment variables

Secrets live in `.env.local` (not committed). Common keys:

- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_*` / service account — Firebase Admin (see `utils/firebase-admin.js`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_VAT_TAX_RATE_ID`
- `NEXT_PUBLIC_BASE_URL` — canonical site URL
- Brevo API key (see `utils/brevo-config.js`)
- `EMAIL_VERIFICATION_SECRET` — OTP hashing

Never commit secrets or edit `.env` files without explicit approval.

## Commands

```bash
npm run dev          # Local dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run job-alerts   # Send scheduled job alert emails
```

## Conventions

- **UI copy is Dutch (nl-BE).** User-facing strings, toasts, and error messages are in Dutch. Keep new copy consistent.
- **Prefer existing patterns.** Match surrounding component style, Redux usage, and API route structure before introducing new abstractions.
- **Client vs server.** Firebase client SDK in components; `firebase-admin` only in `app/api/` and server utils. Never expose admin credentials to the client.
- **Scoped changes.** Do not refactor unrelated code. Fix only what the task requires.
- **No `--no-verify` on commits** unless explicitly requested.
- **Tests:** No test suite is configured. Verify changes manually or via `npm run build` / `npm run lint`.

## Common task areas

- **Job listings & filters:** `components/job-listing-pages/`, `features/filter/`, `app/job-list/`
- **Employer onboarding:** `app/onboard-*`, `components/onboarding/`, `utils/isEmployerCompanyProfileComplete.js`
- **Admin tools:** `components/admin-dashboard-pages/`, `app/api/admin/*`
- **SEO:** `app/sitemap.ts`, `app/robots.ts`, `utils/seo-utils.js`

## What to avoid

- Creating `Admin` users through public registration endpoints (admin-only via `/api/admin/create-admin`)
- Bypassing subscription/job-posting limits for employers
- Modifying Firestore security rules without understanding production impact
- Adding heavy dependencies when Bootstrap/Lucide/React Icons already cover the need
