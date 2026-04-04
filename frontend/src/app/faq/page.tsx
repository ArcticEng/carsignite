'use client';
import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  { q: 'Is CarsIgnite legal?', a: 'Yes. CarsIgnite operates as a promotional competition under Section 36 of the Consumer Protection Act (No. 68 of 2008). We offer free entry to all draws — no purchase is required to participate. Paid memberships provide bonus entries and platform features.' },
  { q: 'Do I really get a free entry without paying?', a: 'Yes. When you register (free), you automatically receive 1 entry into every monthly prize draw. This is not a gimmick — it\'s a legal requirement under the CPA, and we take it seriously.' },
  { q: 'How are winners chosen?', a: 'Winners are selected by computerised random draw using cryptographically secure randomisation. Each draw is independently auditable, and all records are kept for 3 years. Paid members receive weighted bonus entries (e.g. Apex = 10× entries), but every registered user has a chance.' },
  { q: 'Do I have to pay tax on my prize?', a: 'Generally no. In South Africa, competition prizes are considered capital/windfall in nature and are not subject to income tax. However, you should declare the prize as "non-taxable income" on your SARS tax return. If you later sell the prize for a profit, capital gains tax may apply. We recommend consulting a tax advisor for high-value prizes.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes. You can cancel directly from your dashboard Profile tab. Your subscription will remain active until the end of the current billing period. After cancellation, your account reverts to free tier (1 draw entry).' },
  { q: 'What do I get as a paid member?', a: 'Paid members get: bonus draw entries (3× to 25× depending on tier), live GPS tracking during drives, crew group chat, event calendar and rally registration, VIP events, and partner discounts. Free members only get 1 draw entry.' },
  { q: 'How do promo codes work?', a: 'If an Instagram promoter or affiliate shares a code with you, enter it during registration. Valid codes give you a discount on your monthly subscription. The discount applies to every billing cycle, not just the first month.' },
  { q: 'When are prizes drawn?', a: 'Monthly draws take place on the 1st of each month. The closing date for entries is 23:59 SAST on the last day of the preceding month. Dynasty tier quarterly draws occur on 1 January, 1 April, 1 July, and 1 October.' },
  { q: 'How do I claim my prize?', a: 'Winners are notified via email and in-app notification within 48 hours of the draw. You must respond within 14 days to claim your prize. We\'ll arrange collection or delivery based on the prize type.' },
  { q: 'Is my data safe?', a: 'Yes. We comply with POPIA (Protection of Personal Information Act). Passwords are hashed, connections encrypted, and payments processed securely by PayFast (PCI DSS Level 1). We never sell your data. See our Privacy Policy for details.' },
  { q: 'What cars can I bring to drives?', a: 'CarsIgnite is open to all car enthusiasts — not just supercar owners. Whether you drive a VW Golf GTI or a Lamborghini Huracán, you\'re welcome. It\'s about the community, not the badge.' },
  { q: 'Can I upgrade or downgrade my tier?', a: 'Yes. You can change your tier from your dashboard. Upgrades take effect immediately with a new PayFast subscription. Downgrades take effect at the next billing cycle.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="min-h-dvh pt-24 pb-16 px-5">
      <div className="max-w-[720px] mx-auto animate-fade-up">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">SUPPORT</span>
          <h1 className="font-heading text-[clamp(28px,5vw,42px)] tracking-[4px] mt-2">FAQ</h1>
          <p className="text-[#6E7275] mt-2 text-sm">Everything you need to know about CarsIgnite</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="glass-card overflow-hidden" style={{ transform: 'none' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-bold text-[14px] pr-4">{f.q}</span>
                <span className="text-[#6E7275] text-lg shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-[13px] text-[#6E7275] leading-relaxed animate-fade-up">{f.a}</div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-sm text-[#6E7275] mb-3">Still have questions?</p>
          <a href="mailto:support@carsignite.co.za" className="btn btn-ghost px-6 py-3 text-sm">EMAIL SUPPORT</a>
        </div>
      </div>
    </section>
  );
}
