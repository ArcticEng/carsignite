import Link from 'next/link';
import { PAID_TIERS } from '@/lib/tiers';

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-5">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">MEMBERSHIP</span>
          <h2 className="font-heading text-[clamp(30px,4.5vw,44px)] tracking-[3px] mt-2">SUBSCRIBE FOR MORE</h2>
          <p className="text-[#6E7275] mt-2.5 max-w-[520px] mx-auto text-sm leading-relaxed">
            All registered users get 1 free draw entry. Subscribe to unlock GPS tracking, crew chat, group drives, and bonus entries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
          {Object.values(PAID_TIERS).map(t => (
            <div key={t.id} className={`relative rounded-[18px] transition-transform duration-400 hover:-translate-y-2 ${t.popular ? 'p-[2px] shadow-glow-strong' : ''}`}
              style={t.popular ? { background: 'linear-gradient(135deg, #E03455, #f0c040, #E03455)' } : {}}>
              {t.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E03455] to-ci-gold-light px-5 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] text-white uppercase z-10 shadow-[0_4px_20px_rgba(224,52,85,.4)] whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              <div className="glass-card p-6 h-full flex flex-col" style={t.popular ? { borderRadius: '16px' } : {}}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-heading text-xl tracking-[3px]">{t.name}</span>
                </div>
                <div className="mb-4">
                  <span className="text-[13px] text-[#6E7275]">R</span>
                  <span className="font-heading text-[42px] tracking-wider leading-none">{t.price}</span>
                  <span className="text-[13px] text-[#6E7275]">/mo</span>
                </div>
                <div className="glass-sm p-3 mb-4">
                  <div className="text-[9px] font-bold tracking-[2px] uppercase mb-0.5" style={{ color: t.color }}>
                    🎟️ {t.entries}× DRAW ENTRIES
                  </div>
                  <div className="text-sm font-bold">{t.freq} Draw + Full Platform</div>
                </div>
                <div className="flex-1 mb-5">
                  {t.features.map(f => (
                    <div key={f} className="flex items-center gap-2 py-1.5 text-[12px] text-[#E7E5E6] border-b border-[rgba(255,255,255,.06)]">
                      <span className="text-ci-green text-xs">✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href={`/signup`}
                  className={`btn ${t.popular ? 'btn-gold' : 'btn-red'} w-full py-3 text-[12px] tracking-[2px]`}>
                  SUBSCRIBE — R{t.price}/MO
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[#6E7275] max-w-[560px] mx-auto mt-6 leading-relaxed">
          Promotional competition under Section 36 of the Consumer Protection Act (No. 68 of 2008). 
          No purchase necessary to enter. Free entry available to all SA residents 18+.
          All draws independently audited. <Link href="/terms" className="text-[#E03455] underline">Full terms apply</Link>.
        </p>
      </div>
    </section>
  );
}
