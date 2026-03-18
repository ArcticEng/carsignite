import Link from 'next/link';
import { TIERS } from '@/lib/tiers';

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-5">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">MEMBERSHIP</span>
          <h2 className="font-heading text-[clamp(30px,4.5vw,44px)] tracking-[3px] mt-2">CHOOSE YOUR LEVEL</h2>
          <p className="text-[#58586a] mt-2.5 max-w-[460px] mx-auto text-sm leading-relaxed">
            Every tier unlocks GPS tracking, crew chat, and events. Members get complimentary giveaway entries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {Object.values(TIERS).map(t => (
            <div key={t.id} className={`relative rounded-[18px] transition-transform duration-400 hover:-translate-y-2 ${t.popular ? 'p-[2px] shadow-glow-strong' : ''}`}
              style={t.popular ? { background: 'linear-gradient(135deg, #e63946, #f0c040, #e63946)' } : {}}>
              {t.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-ci-red to-ci-gold-light px-5 py-1.5 rounded-full text-[10px] font-bold tracking-[2px] text-white uppercase z-10 shadow-[0_4px_20px_rgba(230,57,70,.4),0_0_30px_rgba(230,57,70,.2)] whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}
              <div className="glass-card p-7 h-full flex flex-col" style={t.popular ? { borderRadius: '16px' } : {}}>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-heading text-2xl tracking-[3px]">{t.name}</span>
                </div>
                <div className="mb-4">
                  <span className="text-[13px] text-[#58586a]">R</span>
                  <span className="font-heading text-[54px] tracking-wider leading-none">{t.price}</span>
                  <span className="text-[13px] text-[#58586a]">/mo</span>
                </div>
                <div className="glass-sm p-3 mb-4">
                  <div className="text-[9px] font-bold tracking-[2px] uppercase mb-0.5" style={{ color: t.color }}>
                    🎁 {t.freq} GIVEAWAY
                  </div>
                  <div className="text-base font-bold">{t.prize}</div>
                </div>
                <div className="flex-1 mb-5">
                  {t.features.map(f => (
                    <div key={f} className="flex items-center gap-2 py-1.5 text-[13px] text-[#9898a8] border-b border-glass-border">
                      <span className="text-ci-green text-xs">✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href={`/signup?tier=${t.id}`}
                  className={`btn ${t.popular ? 'btn-gold' : 'btn-red'} w-full py-3.5 text-sm tracking-[2px]`}>
                  JOIN {t.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[#58586a] max-w-[560px] mx-auto mt-6 leading-relaxed">
          Giveaways are promotional competitions under Section 36 of the CPA (No. 68 of 2008). All draws independently audited.
        </p>
      </div>
    </section>
  );
}
