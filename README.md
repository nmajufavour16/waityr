# Waityr

> A waitlist for a product that doesn't exist. The waitlist IS the product.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL + Realtime)
- **Paystack** (payments — international Visa/Mastercard)
- **Resend** (transactional email)
- **Vercel** (deployment)
- **Tailwind CSS**

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/yourname/waityr
cd waityr
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor**
3. Paste and run the contents of `supabase-schema.sql`
4. Enable **Realtime** for the `activity_feed` table:
   - Go to Database → Replication
   - Toggle on `activity_feed`

### 4. Paystack setup

1. Create account at [paystack.com](https://paystack.com)
2. Get your Secret Key and Public Key from Settings → API Keys
3. Set your **webhook URL** in Paystack Dashboard → Settings → Webhooks:
   ```
   https://your-domain.com/api/payments/webhook
   ```

### 5. Resend setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Update the `FROM` address in `lib/resend.ts`

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

## System Message Cron (Optional)

To generate system messages in the activity feed every 10 minutes, add a Vercel Cron Job:

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

Create `/app/api/cron/system-message/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createServerClient();

  const { count } = await supabase
    .from('waitlist_entries')
    .select('id', { count: 'exact', head: true });

  const { data: topEntry } = await supabase
    .from('waitlist_entries')
    .select('joined_at')
    .eq('position', 1)
    .maybeSingle();

  let text = `The list is quiet. ${count ?? 0} people are waiting. They seem fine.`;

  if (topEntry) {
    const ms = Date.now() - new Date(topEntry.joined_at).getTime();
    const hours = (ms / (1000 * 60 * 60)).toFixed(1);
    text = `The person at #1 has held their position for ${hours} hours. No comment.`;
  }

  await supabase.from('activity_feed').insert({
    event_type: 'system',
    display_text: text,
  });

  return NextResponse.json({ ok: true });
}
```

---

## Definition of Done

- [x] New user submits email → receives confirmation email
- [x] Position reveal modal animates count-up correctly (800ms)
- [x] Confirmed user pays $1 → moved to random position (not #1, not lower)
- [x] Confirmed user pays $3 → becomes #1 immediately
- [x] Paying $3 while someone else is #1 leapfrogs them correctly
- [x] Activity feed updates in real time via Supabase Realtime
- [x] Live counter on homepage polls every 30 seconds
- [x] Dashboard shows live position (Supabase Realtime subscription)
- [x] Referral link moves referrer up 1 spot on use
- [x] All emails send correctly via Resend
- [x] Paystack webhook verified with HMAC-SHA512 signature check
- [x] Idempotency table prevents double-processing of webhooks
- [x] Position mutations are atomic via Supabase RPC (no duplicate positions ever)
- [x] All FAQ copy is verbatim as specified
- [x] Fully responsive (mobile-first)
- [x] All copy matches the specified dry, deadpan tone exactly
- [x] Deployable to Vercel with all environment variables set

---

## Architecture Notes

### Atomicity

All position mutations run through a Supabase PostgreSQL RPC (`move_to_position`)
that acquires `pg_advisory_xact_lock(1)` before any reads or writes. This means
position assignments are always sequential — no gaps, no duplicates, even under
concurrent load.

### Idempotency

Paystack may fire webhooks multiple times for the same charge. Before processing
any webhook, we `INSERT` the `reference` into `paystack_events`. If the insert
fails (duplicate), we return `200 OK` immediately without processing. This is
the only safe way to handle this.

### Realtime

The activity feed and dashboard position both subscribe to Supabase Realtime.
The schema is set to `REPLICA IDENTITY FULL` on `activity_feed` so all column
values are available in the change payload.

---

*The product is the waitlist.*
