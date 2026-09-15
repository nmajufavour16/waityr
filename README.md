# Waityr

> A waitlist for a product that doesn't exist. The waitlist IS the product.

## Stack

- **Next.js** (App Router)
- **PostgreSQL** (Raw SQL queries via `pg` driver)
- **Paystack** (payments — international Visa/Mastercard)
- **Nodemailer** (transactional email via Gmail SMTP)
- **Vercel** (deployment)
- **Tailwind CSS v4**

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/yourname/waityr
cd waityr
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/waityr_db

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Gmail)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 3. Database setup (PostgreSQL)

1. Create a local PostgreSQL database (or use a provider like Neon/Render).
2. Open your SQL client and connect to the database.
3. Paste and run the contents of `schema.sql`.

### 4. Paystack setup

1. Create account at [paystack.com](https://paystack.com)
2. Get your Secret Key and Public Key from Settings → API Keys
3. Set your **webhook URL** in Paystack Dashboard → Settings → Webhooks:
   ```
   https://your-domain.com/api/payments/webhook
   ```

### 5. Email setup

1. Go to your Google Account Settings.
2. Enable 2-Step Verification if it's not already on.
3. Search for "App Passwords" and create a new one named "Waityr".
4. Add the generated password to `GMAIL_APP_PASSWORD` in your `.env`.

### 6. Run locally

```bash
npm run dev
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

Set all environment variables in Vercel's project settings. Then:

```bash
vercel --prod
```

After deploying, update `NEXT_PUBLIC_APP_URL` to your production URL and redeploy.

---

## Definition of Done

- [x] New user submits email → receives confirmation email (via Nodemailer)
- [x] Dedicated `/joined` success page animates count-up correctly
- [x] Confirmed user pays $1 → moved to random position (not #1, not lower)
- [x] Confirmed user pays $3 → becomes #1 immediately
- [x] Paying $3 while someone else is #1 leapfrogs them correctly
- [x] Activity feed updates and polls latest activity
- [x] Live counter on homepage polls every 30 seconds
- [x] Dashboard shows live position
- [x] Referral link moves referrer up 1 spot on use
- [x] All emails send correctly via Gmail SMTP
- [x] Paystack webhook verified with HMAC-SHA512 signature check
- [x] Idempotency table prevents double-processing of webhooks
- [x] Position mutations are atomic via PostgreSQL RPC (no duplicate positions ever)
- [x] All FAQ copy is verbatim as specified
- [x] Fully responsive (mobile-first)
- [x] All copy matches the specified dry, deadpan tone exactly
- [x] Deployable to Vercel with all environment variables set

---

## Architecture Notes

### Atomicity

All position mutations run through a PostgreSQL RPC (`join_waitlist`, `move_to_position`)
that acquires transaction-level locks (`pg_advisory_xact_lock(1)`) before any reads or writes. This means
position assignments are always sequential — no gaps, no duplicates, even under concurrent load.

### Idempotency

Paystack may fire webhooks multiple times for the same charge. Before processing
any webhook, we `INSERT` the `reference` into `paystack_events`. If the insert
fails (duplicate), we return `200 OK` immediately without processing. This is
the only safe way to handle this.

---

## System Message Cron (Optional)

To generate satirical system messages in the activity feed every 10 minutes, you can add a Vercel Cron Job:

```json
// vercel.json — add to existing config
{
  "crons": [
    {
      "path": "/api/cron/system-message",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

The route at `/app/api/cron/system-message/route.ts` will query the database and automatically insert dry status updates into the feed (e.g. "The list is quiet. 142 people are waiting. They seem fine.")

---

*The product is the waitlist.*
