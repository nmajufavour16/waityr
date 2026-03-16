import nodemailer from 'nodemailer';

// ─── Transport ────────────────────────────────────────────────────────────────
// Credentials come from environment variables only — never hardcode these.
// Add GMAIL_USER and GMAIL_APP_PASSWORD to Vercel → Settings → Environment Variables.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `Waityr <${process.env.GMAIL_USER}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://waityr.vercel.app';

// ─── Base HTML template ───────────────────────────────────────────────────────
function base(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Waityr</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f3f4f6; -webkit-font-smoothing: antialiased; }
    .outer { padding: 40px 16px; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #0a0a0a; padding: 22px 36px; display: flex; align-items: center; justify-content: space-between; }
    .logo { color: #ffffff; font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
    .header-sub { color: #6b7280; font-size: 12px; }
    .body { padding: 40px 36px 32px; }
    .position-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 8px; }
    .position { font-size: 88px; font-weight: 800; color: #0d9488; line-height: 1; letter-spacing: -0.04em; margin-bottom: 20px; }
    .headline { font-size: 21px; font-weight: 700; color: #0a0a0a; line-height: 1.3; margin-bottom: 14px; letter-spacing: -0.01em; }
    .body-text { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 28px; }
    .body-text strong { color: #0a0a0a; font-weight: 600; }
    .btn { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
    .meta { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6; }
    .meta p { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .meta a { color: #0d9488; text-decoration: none; }
    .footer { background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 18px 36px; }
    .footer p { font-size: 11px; color: #9ca3af; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="outer">
    <div class="card">
      <div class="header">
        <span class="logo">Waityr</span>
        <span class="header-sub">The product is the waitlist.</span>
      </div>
      <div class="body">
        ${body}
      </div>
      <div class="footer">
        <p>Waityr · Something is coming. · <a href="${APP_URL}" style="color:#0d9488;">waityr.vercel.app</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Confirmation email (sent on join) ────────────────────────────────────────
export async function sendConfirmationEmail({
  to,
  position,
  confirmationToken,
}: {
  to: string;
  position: number;
  confirmationToken: string;
}) {
  const confirmUrl = `${APP_URL}/api/auth/confirm?token=${confirmationToken}`;
  const ahead = position - 1;

  const html = base(`
    <p class="position-label">Your position</p>
    <div class="position">#${position}</div>
    <h1 class="headline">You're in the queue.<br/>Confirm before someone passes you.</h1>
    <p class="body-text">
      You joined at <strong>#${position}</strong>${ahead > 0 ? ` — ahead of ${ahead.toLocaleString()} ${ahead === 1 ? 'person' : 'people'} who came after you` : ''}.<br/><br/>
      Your position is already moving. People are joining, bumping up, and competing for #1 right now.
      Confirm your spot to lock in access to your dashboard — where you can pay $1 to move up randomly,
      or $3 to go straight to #1.
    </p>
    <a class="btn" href="${confirmUrl}">Confirm my spot →</a>
    <div class="meta">
      <p>This link expires in 24 hours. If you didn't sign up for Waityr, you can safely ignore this — your email won't be used for anything else.</p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You're #${position}. Confirm before someone passes you.`,
    html,
  });
}

// ─── Magic link sign-in (for returning confirmed users) ───────────────────────
export async function sendMagicLinkEmail({
  to,
  position,
  confirmationToken,
}: {
  to: string;
  position: number;
  confirmationToken: string;
}) {
  const signInUrl = `${APP_URL}/api/auth/confirm?token=${confirmationToken}`;

  const html = base(`
    <p class="position-label">Your position</p>
    <div class="position">#${position}</div>
    <h1 class="headline">Your sign-in link.</h1>
    <p class="body-text">
      You're currently <strong>#${position}</strong> on the Waityr list.<br/><br/>
      Click below to sign in and access your dashboard. From there you can
      move up, share your referral link, and track the competition.
    </p>
    <a class="btn" href="${signInUrl}">Sign in to Waityr →</a>
    <div class="meta">
      <p>This link expires in 24 hours. If you didn't request this, ignore it — nothing has changed on your account.</p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your Waityr sign-in link. You're #${position}.`,
    html,
  });
}

// ─── Position changed (opt-in) ────────────────────────────────────────────────
export async function sendPositionChangedEmail({
  to,
  positionBefore,
  positionAfter,
  reason,
}: {
  to: string;
  positionBefore: number;
  positionAfter: number;
  reason: string;
}) {
  const moved = positionBefore - positionAfter;
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = base(`
    <p class="position-label">New position</p>
    <div class="position">#${positionAfter}</div>
    <h1 class="headline">You moved up ${moved} spot${moved !== 1 ? 's' : ''}.</h1>
    <p class="body-text">
      Previously <strong>#${positionBefore}</strong>. Now <strong>#${positionAfter}</strong>.<br/><br/>
      Reason: ${reason}
    </p>
    <a class="btn" href="${dashboardUrl}">View dashboard →</a>
    <div class="meta">
      <p>You're receiving this because you opted into position notifications. <a href="${APP_URL}/dashboard">Manage preferences</a></p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You moved up. You're now #${positionAfter}.`,
    html,
  });
}

// ─── Displaced from #1 (opt-in) ──────────────────────────────────────────────
export async function sendDisplacedFromTopEmail({
  to,
  timeHeldHours,
  newPosition,
}: {
  to: string;
  timeHeldHours: number;
  newPosition: number;
}) {
  const reclaimUrl = `${APP_URL}/dashboard`;
  const timeDisplay =
    timeHeldHours < 1
      ? `${Math.round(timeHeldHours * 60)} minutes`
      : timeHeldHours < 24
      ? `${timeHeldHours.toFixed(1)} hours`
      : `${(timeHeldHours / 24).toFixed(1)} days`;

  const html = base(`
    <p class="position-label">Current position</p>
    <div class="position">#${newPosition}</div>
    <h1 class="headline">You're no longer #1.</h1>
    <p class="body-text">
      Someone paid $3. They are now #1. You are #${newPosition}.<br/><br/>
      You held the top spot for <strong>${timeDisplay}</strong>.
      This outcome was described in the FAQ before you paid.
      We are mentioning it again here for completeness.
    </p>
    <a class="btn" href="${reclaimUrl}">Reclaim #1 — $3 →</a>
    <div class="meta">
      <p>You're receiving this because you opted into #1 displacement notifications. <a href="${APP_URL}/dashboard">Manage preferences</a></p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You're no longer #1. Someone paid $3.`,
    html,
  });
}
