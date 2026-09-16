import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import Logo from '@/components/Logo';
import VipClient from './VipClient';

export const metadata = {
  title: 'Waityr VIP',
  robots: 'noindex, nofollow',
};

export default async function VipPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get('waityr_email')?.value;

  if (!email) redirect('/?error=not_signed_in');

  const { rows } = await db.query(
    'SELECT id, email, top_spot_count, name, x_handle, position FROM waitlist_entries WHERE email = $1 LIMIT 1',
    [email]
  );
  const entry = rows.length > 0 ? rows[0] : null;

  if (!entry || entry.top_spot_count === 0) {
    redirect('/dashboard'); // Kick out the peasants
  }

  const defaultTweet = `I paid $2.99 for absolutely nothing to be #1 on @_waityr. The waitlist is the product.`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultTweet)}&url=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL || 'https://waityr.vercel.app')}`;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>VIP Lounge</span>
            <Link href="/dashboard" className="hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded-full">
              Exit
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
          Welcome to the VIP section.
        </h1>
        <p className="text-xl text-gray-400 font-light mb-16 leading-relaxed">
          There is still no product here. But the air smells richer. 
          Congratulations on proving your financial superiority to everyone else in the queue.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 text-left backdrop-blur-md">
          <h2 className="text-2xl font-medium mb-2">Claim your billboard</h2>
          <p className="text-sm text-gray-400 mb-8">
            As a top-spot buyer, you get a profile ad on the public homepage. Enter your details below.
          </p>
          
          <VipClient initialName={entry.name || ''} initialHandle={entry.x_handle || ''} />
        </div>

        <div className="pt-12 border-t border-white/10">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">Optional Flex</p>
          <a 
            href={tweetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.936H5.023z"></path></svg>
            Click to Tweet your status
          </a>
        </div>
      </main>
    </div>
  );
}
