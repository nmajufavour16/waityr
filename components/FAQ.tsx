'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'What is Waityr?',
    a: "A waitlist. You're on it now.",
  },
  {
    q: 'What am I waiting for?',
    a: "Something. We're not ready to share what it is yet. This is standard practice.",
  },
  {
    q: 'When does it launch?',
    a: "We're targeting a launch window. We're not sharing the date yet. This is also standard practice.",
  },
  {
    q: 'Why should I pay to move up?',
    a: "You probably shouldn't. But Waityrs do. They always do. We're not judging.",
  },
  {
    q: 'What if I pay $3 to be #1 and someone else also pays $3?',
    a: "They become #1. You become #2. This is how it works. We told you upfront.",
  },
  {
    q: 'Is this a scam?',
    a: "No. A scam hides what it's doing. We've told you exactly what's happening. You are on a waitlist. The product is the waitlist. You are experiencing the product right now.",
  },
  {
    q: 'Are there refunds?',
    a: "No. You received exactly what was described. The waitlist is the product. You are on the waitlist. That is the product. There are no refunds.",
  },
  {
    q: 'When will I get access?',
    a: "We'll send an email when it's time. That's all we can say.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left gap-4 group"
            aria-expanded={openIndex === i}
          >
            <span className="text-sm font-medium text-[#0A0A0A] group-hover:text-[#0D9488] transition-colors">
              {faq.q}
            </span>
            <svg
              className={`shrink-0 w-4 h-4 text-[#6B7280] transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-250 ${openIndex === i ? 'max-h-48 pb-4' : 'max-h-0'}`}>
            <p className="text-sm text-[#6B7280] leading-relaxed">{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
