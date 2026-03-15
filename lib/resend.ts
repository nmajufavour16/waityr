import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Waityr <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://waityr.com';

function baseEmailHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Waityr</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #0a0a0a;
      font-size: 16px;
      line-height: 1.6;
    }
    .wrapper {
      max-width: 520px;
      margin: 48px auto;
      padding: 0 24px;
    }
    .logo {
      font-size: 20px;
      font-weight: 600;
      color: #0a0a0a;
      margin-bottom: 40px;
    }
    .position {
      font-size: 72px;
      font-weight: 700;
      color: #0d9488;
      line-height: 1;
      margin-bottom: 8px;
    }
    p { margin-bottom: 16px; color: #0a0a0a; }
    .muted { color: #6b7280; font-size: 14px; }
    .btn {
      display: inline-block;
      background: #0d9488;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px 0 24px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 32px 0;
    }
    .footer { color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">Waityr</div>
    ${body}
    <hr class="divider" />
    <p class="footer">
      You're receiving this because you joined the Waityr waitlist.<br />
      Waityr &middot; The product is the waitlist.
    </p>
  </div>
</body>
</html>`;
}

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

  const html = baseEmailHtml(`
    <div class="position">#${position}</div>
    <p>You're on the list.</p>
    <p>Confirm your spot to lock in your position and access your dashboard.</p>
    <a class="btn" href="${confirmUrl}">Confirm your spot</a>
    <p class="muted">This link expires in 24 hours. If you didn't sign up for Waityr, ignore this.</p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're on the list. Confirm your spot.`,
    html,
  });
}

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
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = baseEmailHtml(`
    <p>Your position changed.</p>
    <div class="position">#${positionAfter}</div>
    <p class="muted">Previously: #${positionBefore}</p>
    <p>Reason: ${reason}</p>
    <a class="btn" href="${dashboardUrl}">View your dashboard</a>
    <p class="muted">
      You're receiving this because you opted into position change notifications.
      <a href="${APP_URL}/dashboard" style="color: #6b7280;">Update preferences</a>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your position changed.',
    html,
  });
}

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

  const html = baseEmailHtml(`
    <p>You're no longer #1.</p>
    <p>Someone paid $3. They are now #1. You are #${newPosition}.</p>
    <p class="muted">You held #1 for ${timeDisplay}. This was disclosed in the FAQ.</p>
    <a class="btn" href="${reclaimUrl}">Reclaim #1 — $3</a>
    <p class="muted">
      You're receiving this because you opted into #1 displacement notifications.
      <a href="${APP_URL}/dashboard" style="color: #6b7280;">Update preferences</a>
    </p>
  `);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're no longer #1.`,
    html,
  });
}
