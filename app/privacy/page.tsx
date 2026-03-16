import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Privacy Policy — Waityr',
  description: "Waityr's privacy policy. We collect very little. The waitlist is the product.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/"><Logo size="md" /></Link>
          <Link href="/" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">← Back to the list</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-4">Legal</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#0A0A0A] tracking-tight mb-3 font-display">Privacy Policy</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">Last updated: March 2026. This is the most straightforward privacy policy you will ever read.</p>

        <div className="legal-body space-y-2">

          <div className="callout">
            <p>We collect almost nothing about you. This is not an accident. <strong>It is consistent with a product whose entire value proposition is waiting.</strong></p>
          </div>

          <h2>What we collect</h2>
          <p>
            When you join Waityr, we collect your <strong>email address</strong>. That&apos;s it.
            We use it to send you one confirmation email and, if you opt in, position change notifications.
            We do not collect your name. We do not track your behavior. You joined a waitlist.
            There is no usage to track. You are waiting.
          </p>
          <p>
            When you make a payment, Paystack processes your card. We receive confirmation that a transaction
            occurred and the amount. We do not store your card number, CVV, or any other payment detail.
            We wouldn&apos;t know what to do with them.
          </p>

          <h2>What we store</h2>
          <ul>
            <li>Your email address</li>
            <li>Your position number</li>
            <li>The date you joined</li>
            <li>How much you have spent moving up</li>
            <li>Your referral code</li>
            <li>How many times you have held #1 (if applicable)</li>
          </ul>
          <p>
            We store this in Supabase, a reputable database infrastructure provider.
            You can read their privacy policy at supabase.com/privacy.
          </p>

          <h2>What we do not store</h2>
          <ul>
            <li>Your name</li>
            <li>Your location</li>
            <li>Your device information</li>
            <li>Your browsing behavior</li>
            <li>Your hopes, dreams, or theories about what the product is</li>
          </ul>

          <h2>Third parties</h2>
          <p>
            We use <strong>Paystack</strong> to process payments. Paystack was founded in Nigeria,
            acquired by Stripe in 2020, and handles your card data with the seriousness it deserves.
            We chose them because we didn&apos;t want to handle your card number either.
          </p>
          <p>
            We use <strong>Gmail</strong> (via nodemailer) to send transactional emails.
            We use <strong>Vercel</strong> to host the application.
            We use no analytics platform. No retargeting pixels. No CRM.
            Nothing is tracking you here. That would imply we know what you&apos;re doing.
            You are waiting. That&apos;s what you&apos;re doing.
          </p>

          <h2>Cookies</h2>
          <p>
            We store one cookie: a session identifier that keeps you signed in to your dashboard.
            It contains your email address, encrypted in transit. That is the only cookie.
            We have nothing else to remember about you.
          </p>

          <h2>Your rights</h2>
          <p>
            Under GDPR, NDPR, and similar legislation, you have rights over your personal data.
            Since we hold very little, exercising these rights will be a smooth experience.
          </p>
          <ul>
            <li><strong>Access:</strong> Your data is your email, your position, and your payment history. We can send it to you.</li>
            <li><strong>Deletion:</strong> We can delete your account. Your position will be removed from the list. The people behind you will move up. We will note this in the activity feed.</li>
            <li><strong>Portability:</strong> We can export your data in JSON format. It will be brief.</li>
          </ul>

          <h2>Data retention</h2>
          <p>
            We retain your data for as long as you are on the waitlist. If you request deletion,
            we will remove your data promptly. Paystack retains payment records as required by financial
            regulations. We cannot control that, and they told us we don&apos;t need to.
          </p>

          <h2>Children</h2>
          <p>
            Waityr is not intended for children under 13. Not because the content is inappropriate —
            a numbered list is appropriate for all ages — but because children should not be paying
            $1 or $3 to move up a waitlist for an unannounced product. They will wait for free eventually.
            Let them enjoy it while it lasts.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy. If we do, we will change the date at the top.
            We will not email you about it. You will not notice. That is fine.
          </p>

          <div className="callout mt-8">
            <p>Questions about your privacy? We will read your email. Eventually.<br />
            <strong>hello@waityr.com</strong></p>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9CA3AF]">© 2026 Waityr. Something is coming.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
