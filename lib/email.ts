import nodemailer from 'nodemailer';

// ─── Transport ────────────────────────────────────────────────────────────────
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
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,600;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: #f3f4f6; -webkit-font-smoothing: antialiased; }
    .outer { padding: 40px 16px; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #0a0a0a; padding: 24px 36px; text-align: left; }
    .logo { font-family: 'Poppins', sans-serif; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.04em; text-decoration: none; }
    .logo-y { font-style: italic; }
    .body { padding: 40px 36px 32px; text-align: left; }
    .position-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 12px; }
    .position { font-family: 'Poppins', sans-serif; font-size: 88px; font-weight: 600; color: #0d9488; line-height: 1; letter-spacing: -0.04em; margin-bottom: 24px; }
    .headline { font-family: 'Poppins', sans-serif; font-size: 22px; font-weight: 600; color: #0a0a0a; line-height: 1.3; margin-bottom: 16px; letter-spacing: -0.02em; }
    .body-text { font-size: 15px; color: #6b7280; line-height: 1.7; margin-bottom: 32px; }
    .body-text strong { color: #0a0a0a; font-weight: 600; }
    .btn { display: inline-block; background: #0d9488; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .meta { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6; }
    .meta p { font-size: 13px; color: #9ca3af; line-height: 1.6; }
    .meta a { color: #0d9488; text-decoration: underline; text-underline-offset: 2px; }
    .footer { background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 24px 36px; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; line-height: 1.6; }
    .footer a { color: #6b7280; text-decoration: none; }
  </style>
</head>
<body>
  <div class="outer">
    <div class="card">
      <div class="header">
        <a href="${APP_URL}" class="logo" style="color: #ffffff; text-decoration: none;">Wait<span class="logo-y">y</span>r</a>
      </div>
      <div class="body">
        ${body}
      </div>
      <div class="footer">
        <p>© 2026 Waityr. Something is coming.<br/><a href="${APP_URL}" style="color:#6b7280;">waityr.vercel.app</a></p>
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
      You joined at <strong>#${position}</strong>${ahead > 0 ? `, ahead of ${ahead.toLocaleString()} ${ahead === 1 ? 'person' : 'people'} who came after you` : ''}.<br/><br/>
      Your position is already moving. People are joining, bumping up, and competing for #1 right now.
      Confirm your spot to lock in access to your dashboard. There, you can pay $1 to move up randomly, or $2.99 to go straight to #1.
    </p>
    <a class="btn" href="${confirmUrl}">Confirm my spot →</a>
    <div class="meta">
      <p>This link expires in 24 hours. If you didn't sign up for Waityr, you can safely ignore this. Your email won't be used for anything else.</p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You're #${position}. Confirm before someone passes you.`,
    html,
  });
}

// ─── Reminder email (sent via cron) ───────────────────────────────────────────
export async function sendReminderEmail({
  to,
  position,
  confirmationToken,
}: {
  to: string;
  position: number;
  confirmationToken: string;
}) {
  const confirmUrl = `${APP_URL}/api/auth/confirm?token=${confirmationToken}`;

  const html = base(`
    <p class="position-label">Your position</p>
    <div class="position">#${position}</div>
    <h1 class="headline">You haven't confirmed your spot!</h1>
    <p class="body-text">
      You joined the Waityr queue 24 hours ago at <strong>#${position}</strong>, but you still haven't confirmed your email address.<br/><br/>
      If you don't confirm, you won't be able to log in, access your dashboard, or move up the list. Other people are passing you while you wait.
    </p>
    <a class="btn" href="${confirmUrl}">Confirm my spot →</a>
    <div class="meta">
      <p>If you didn't sign up for Waityr, you can safely ignore this. Your email won't be used for anything else.</p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Reminder: You're #${position}. Confirm your spot.`,
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
      <p>This link expires in 24 hours. If you didn't request this, ignore it. Nothing has changed on your account.</p>
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
      Someone paid $2.99. They are now #1. You are #${newPosition}.<br/><br/>
      You held the top spot for <strong>${timeDisplay}</strong>.
      This outcome was described in the FAQ before you paid.
      We are mentioning it again here for completeness.
    </p>
    <a class="btn" href="${reclaimUrl}">Reclaim #1 →</a>
    <div class="meta">
      <p>You're receiving this because you opted into #1 displacement notifications. <a href="${APP_URL}/dashboard">Manage preferences</a></p>
    </div>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You're no longer #1. Someone paid $2.99.`,
    html,
  });
}

// ─── Admin Drafted Tweet (sent to owner) ──────────────────────────────────────
export async function sendAdminTweetDraftEmail({
  name,
  x_handle,
}: {
  name: string;
  x_handle: string;
}) {
  // Replace missing details with placeholders
  const safeName = name || 'Someone';
  const safeHandle = x_handle ? (x_handle.startsWith('@') ? x_handle : `@${x_handle}`) : '';

  const html = base(`
    <p class="position-label">Action Required</p>
    <h1 class="headline">New #1 VIP!</h1>
    <p class="body-text">
      A user has just paid $2.99 and claimed the top spot. They have filled out their VIP profile.
      <br/><br/>
      <strong>Name:</strong> ${safeName}<br/>
      <strong>X Handle:</strong> ${safeHandle || 'None provided'}<br/>
      <br/>
      Here is your drafted tweet to post in the Waityr brand voice:
    </p>
    <div style="background:#f3f4f6; padding:16px; border-radius:8px; margin-bottom:24px; font-family:monospace; font-size:14px; color:#0a0a0a;">
      We have a new #1 on the waitlist.<br/><br/>
      Congratulations to ${safeName} ${safeHandle}. You paid $2.99 for absolutely nothing, proving your financial superiority to everyone else.<br/><br/>
      The waitlist is the product. Link in bio.
    </div>
    <p class="body-text">Copy the text above and post it to X.</p>
  `);

  await transporter.sendMail({
    from: FROM,
    to: 'nmajufavour16@gmail.com',
    subject: `[Waityr] New VIP - Tweet Draft Ready`,
    html,
  });
}
