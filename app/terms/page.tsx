import Link from 'next/link';
import Logo from '@/components/Logo';

export const metadata = {
  title: 'Terms of Service — Waityr',
  description: "Waityr's terms of service. The waitlist is the product. No refunds.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#0A0A0A] tracking-tight mb-3 font-display">Terms of Service</h1>
        <p className="text-sm text-[#9CA3AF] mb-12">
          Effective: March 2026. These terms govern your use of the Waityr waitlist.
          We have tried to write them honestly. This was easy. The product is a list.
        </p>

        <div className="legal-body space-y-2">

          <div className="callout">
            <p>By joining Waityr, you acknowledge that you understand what Waityr is.
            <strong> The waitlist is the product. The product is the waitlist.</strong>
            You are not confused. You have read the landing page.</p>
          </div>

          <h2>Section 1 — The Service</h2>
          <p>
            Waityr (&ldquo;the Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates a live, competitive waitlist (&ldquo;the Service&rdquo;)
            for an unannounced product. The waitlist assigns each user (&ldquo;Waityr&rdquo;) a numerical
            position. That position can be changed through payment or referral activity.
          </p>
          <p>
            The Service does not deliver any product other than the waitlist itself.
            Joining the Service means joining the waitlist. The waitlist is the product.
            We have said this several times now. We will say it again if necessary.
          </p>
          <div className="callout">
            <p>&ldquo;The waitlist is the product.<br />This is the product.&rdquo;<br />
            Article 1, Clause 1. Our lawyers agreed this was specific enough.</p>
          </div>

          <h2>Section 2 — Payments</h2>
          <p>
            The Service offers two paid actions:
          </p>
          <ul>
            <li><strong>Random Bump ($1.00 USD)</strong> — Moves your position to a random spot between your current position and #2, exclusive of #1.</li>
            <li><strong>Top of the List ($3.00 USD)</strong> — Moves your position to #1 immediately, displacing the current holder.</li>
          </ul>
          <p>
            Payments are processed by Paystack. By making a payment, you also agree to Paystack&apos;s
            terms of service. We mention this because we must, not because we expect you to read them.
          </p>
          <p>
            Prices are displayed in USD. Paystack handles currency conversion where applicable.
          </p>

          <h2>Section 3 — No Refunds</h2>
          <p>
            <strong>There are no refunds.</strong> This is not a standard policy with exceptions.
            This is a complete and unconditional statement. There are zero refunds.
          </p>
          <p>
            You received exactly what was described. The description was explicit, displayed
            in large type, repeated in the FAQ, and shown again immediately before payment.
            You moved up the list. You were on the list. You moved up. That is what you paid for.
            That is what happened.
          </p>
          <p>
            If you file a chargeback claiming you received nothing, you are incorrect.
            You received a position change on the Waityr waitlist. We will confirm this to
            your payment provider with transaction records. We are not sure how this will resolve,
            but we are confident in our documentation.
          </p>

          <h2>Section 4 — Position Mechanics</h2>
          <p>
            Position #1 is not permanent. Any Waityr may pay $3 to claim #1 at any time.
            This is not a bug. This is the entire mechanic. If you hold #1 and someone
            pays $3, you move to #2. This was disclosed on the landing page, in the FAQ,
            in your confirmation email, and in these terms. You have been informed.
          </p>
          <p>
            Position changes are atomic and processed via database transaction. Two Waityrs
            cannot hold the same position simultaneously. The system is honest, even when
            the situation is not advantageous to you.
          </p>

          <h2>Section 5 — Referrals</h2>
          <p>
            Each Waityr receives a unique referral link. When another user joins via that link,
            the referring Waityr moves up one position at no charge. Referral codes may be
            customised from the dashboard, subject to availability. Fraudulent referral activity
            (automated signups, disposable emails) may result in position forfeit.
          </p>

          <h2>Section 6 — Acceptable Use</h2>
          <p>
            You may use Waityr for any lawful purpose. Since the product is a numbered list,
            the surface area for misuse is limited. We have nonetheless identified the following
            prohibited activities:
          </p>
          <ul>
            <li>Automated or scripted account creation</li>
            <li>Attempting to manipulate position data through means other than the intended payment or referral mechanics</li>
            <li>Referring to Waityr as &ldquo;broken&rdquo; when it is working exactly as intended</li>
          </ul>
          <p>
            You may tell other people about Waityr. You may post about it. You may express
            confusion, admiration, or existential discomfort. All of this is expected
            and frankly part of the product experience.
          </p>

          <h2>Section 7 — Intellectual Property</h2>
          <p>
            The Waityr name, logo, and the general concept of a competitive paid waitlist for
            an unannounced product are the intellectual property of the Company. The activity
            feed, position numbering system, and deadpan copy are proprietary.
            We are aware of the broader irony here.
          </p>

          <h2>Section 8 — Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is.&rdquo; We make no warranties that the Service will
            meet your requirements. The Service will not tell you what the product is.
            The Service will not guarantee your position remains unchanged.
            We warrant only that: (a) a payment transaction will occur when initiated,
            and (b) your position will be updated accordingly. We are confident in both of these.
          </p>

          <h2>Section 9 — Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Waityr&apos;s total liability to you for any
            claim arising from the Service is limited to the total amount you have paid
            in connection with the specific transaction giving rise to the claim.
            That is $1 or $3. We want to be transparent about this.
          </p>

          <h2>Section 10 — Termination</h2>
          <p>
            You may request account deletion at any time by emailing us.
            Upon deletion, your position will be removed and surrounding positions adjusted.
            You will receive no compensation for your former position.
            You were on a waitlist. You left the waitlist. This is an acceptable outcome.
          </p>
          <p>
            We reserve the right to remove any Waityr for violation of these terms.
            In practice, we cannot imagine a scenario where this becomes necessary.
            You are waiting for something. We have not told you what it is.
            There is very little you can do wrong here.
          </p>

          <h2>Section 11 — Governing Law</h2>
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria.
            Any disputes shall be resolved in the courts of competent jurisdiction in Lagos, Nigeria.
            We encourage you to resolve any concerns by emailing us first.
            Most things can be settled without a court date, especially when the
            disputed value is $3 and the product is a list.
          </p>

          <h2>Section 12 — Changes to These Terms</h2>
          <p>
            We may update these terms. We will update the effective date at the top of this page.
            We will not email you, because email notifications for terms changes are annoying.
            Continued use of the Service constitutes acceptance of the updated terms.
            Since using the Service means waiting, this is a low bar to clear.
          </p>

          <div className="callout mt-8">
            <p>Questions about these terms? We are available. Occasionally.<br />
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
