import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

export async function GET() {
  try {
    const { rows } = await db.query('SELECT id, email, position, confirmation_token FROM waitlist_entries');
    
    let sentCount = 0;
    const failed: string[] = [];

    for (const user of rows) {
      if (!user.email || !user.confirmation_token) continue;
      
      try {
        await sendConfirmationEmail({
          to: user.email,
          position: user.position,
          confirmationToken: user.confirmation_token,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
        failed.push(user.email);
      }
    }

    return NextResponse.json({ 
      success: true, 
      sentCount, 
      failedCount: failed.length, 
      failed 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
