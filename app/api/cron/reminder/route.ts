import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendReminderEmail } from '@/lib/email';

// Mark as dynamic so it doesn't get statically cached
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Vercel Cron secures the route by verifying the Authorization header against CRON_SECRET
    // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
    const authHeader = request.headers.get('authorization');
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find users who joined more than 24 hours ago, are not confirmed, and haven't received a reminder
    const { rows: usersToRemind } = await db.query(`
      SELECT id, email, position, confirmation_token
      FROM waitlist_entries
      WHERE joined_at <= NOW() - INTERVAL '24 hours'
        AND confirmed = false
        AND reminder_sent = false
    `);

    console.log(`Found ${usersToRemind.length} users to send 24-hour reminders to.`);

    let emailsSent = 0;

    for (const user of usersToRemind) {
      try {
        await sendReminderEmail({
          to: user.email,
          position: user.position,
          confirmationToken: user.confirmation_token,
        });

        // Mark as sent
        await db.query(`
          UPDATE waitlist_entries
          SET reminder_sent = true
          WHERE id = $1
        `, [user.id]);

        emailsSent++;
      } catch (err) {
        console.error(`Failed to send reminder to ${user.email}:`, err);
        // Continue with the next user even if one fails
      }
    }

    return NextResponse.json({ ok: true, emailsSent });
  } catch (error: any) {
    console.error('Reminder cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
