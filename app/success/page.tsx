import { Suspense } from 'react';
import Link from 'next/link';
import { verifyTransaction } from '@/lib/paystack';
import { createServerClient } from '@/lib/supabase';

interface Props {
  searchParams: { reference?: string };
}

async function SuccessContent({ reference }: { reference: string }) {
  let transactionData: {
    metadata: { type: string; entry_id: string };
    status: string;
  } | null = null;

  let currentPosition: number | null = null;
  let previousPosition: number | null = null;

  try {
    transactionData = await verifyTransaction(reference);
  } catch {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#6B7280] text-sm">
          Could not verify this transaction.
        </p>
        <Link href="/" className="text-sm text-[#0D9488] underline">
          Back to the list
        </Link>
      </div>
    );
  }

  if (!transactionData || transactionData.status !== 'success') {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#6B7280] text-sm">
          This payment was not completed.
        </p>
        <Link href="/" className="text-sm text-[#0D9488] underline">
          Back to the list
        </Link>
      </div>
    );
  }

  const type = transactionData.metadata?.type;
  const entryId = transactionData.metadata?.entry_id;

  if (entryId) {
    const supabase = createServerClient();
    const { data: entry } = await supabase
      .from('waitlist_entries')
      .select('position')
      .eq('id', entryId)
      .maybeSingle();

    currentPosition = entry?.position ?? null;
  }

  if (type === 'random_bump') {
    return (
      <div className="space-y-6 text-center">
        <div>
          <p className="text-sm text-[#6B7280] uppercase tracking-widest font-medium mb-3">
            You moved up.
          </p>
          {currentPosition && (
            <p className="text-[72px] font-bold text-[#0D9488] leading-none tabular-nums">
              #{currentPosition}
            </p>
          )}
        </div>

        <p className="text-sm text-[#6B7280] italic leading-relaxed">
          "A meaningful improvement. Tomorrow is another day."
        </p>

        <Link
          href="/"
          className="inline-block bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
        >
          Back to the list →
        </Link>
      </div>
    );
  }

  if (type === 'top_spot') {
    return (
      <div className="space-y-6 text-center">
        <div>
          <p className="text-[72px] font-bold text-[#0D9488] leading-none tabular-nums">
            #1
          </p>
          <p className="text-xl font-semibold text-[#0A0A0A] mt-3">
            You're #1.
          </p>
          <p className="text-[#6B7280] text-base mt-1">For now.</p>
        </div>

        <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
          Someone could pay $3 right now and take it. That's the deal. You
          knew.
        </p>

        <Link
          href="/"
          className="inline-block bg-[#0D9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
        >
          Watch the list →
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <p className="text-[#6B7280] text-sm">Payment received.</p>
      <Link href="/" className="text-sm text-[#0D9488] underline">
        Back to the list
      </Link>
    </div>
  );
}

export default function SuccessPage({ searchParams }: Props) {
  const reference = searchParams.reference;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/"
            className="text-xl font-semibold text-[#0A0A0A] tracking-tight"
          >
            Waityr
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          {reference ? (
            <Suspense
              fallback={
                <div className="text-center space-y-4">
                  <div className="skeleton h-20 w-32 rounded mx-auto" />
                  <div className="skeleton h-5 w-48 rounded mx-auto" />
                </div>
              }
            >
              <SuccessContent reference={reference} />
            </Suspense>
          ) : (
            <div className="text-center">
              <p className="text-[#6B7280] text-sm">No transaction found.</p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm text-[#0D9488] underline"
              >
                Back to the list
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
