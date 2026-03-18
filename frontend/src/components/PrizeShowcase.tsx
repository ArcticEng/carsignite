'use client';
import { useEffect, useState } from 'react';
import { TIERS, TierBadge, prizeImg, getCountdown } from '@/lib/tiers';

interface PrizeData {
  tier: string;
  current: { name: string; desc?: string; value?: number; image?: string };
  upcoming: { name?: string; desc?: string; value?: number; image?: string };
  drawDateHint?: string;
}

export function PrizeShowcase() {
  const [prizes, setPrizes] = useState<PrizeData[]>([]);
  const cd = getCountdown();

  useEffect(() => {
    fetch('/api/prizes/showcase')
      .then(r => r.json())
      .then(r => setPrizes(r.prizes || []))
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-5 relative overflow-hidden">
      {/* Red glow orb */}
      <div className="absolute top-[-100px] left-1/2 w-[600px] h-[600px] -translate-x-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(230,57,70,.06), transparent 70%)' }} />

      <div className="max-w-[1120px] mx-auto relative">
        <div className="text-center mb-5">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-red-light uppercase">🔥 GIVEAWAYS</span>
          <h2 className="font-heading text-[clamp(30px,5vw,48px)] tracking-[4px] mt-2">WIN BIG EVERY MONTH</h2>
          <p className="text-[#58586a] mt-2.5 max-w-[500px] mx-auto text-sm leading-relaxed">
            Active subscribers are automatically entered. Next draw in{' '}
            <span className="text-ci-gold-light font-bold">{cd.days} days {cd.hours} hours</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {prizes.map(p => {
            const t = TIERS[p.tier];
            const c = p.current;
            const u = p.upcoming;
            const img = prizeImg(c.name || t?.prize || 'luxury', c.image);

            return (
              <div key={p.tier} className="glass-card overflow-hidden">
                {/* Prize image */}
                <div className="h-[200px] relative" style={{ background: `url('${img}') center/cover` }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(3,3,5,.95) 0%, rgba(3,3,5,.3) 40%, transparent 100%)' }} />
                  <div className="absolute top-3 left-3"><TierBadge tier={p.tier} /></div>
                  <div className="absolute top-3 right-3 bg-[rgba(230,57,70,.9)] text-white px-3 py-1 rounded-md text-[9px] font-bold tracking-[1.5px] shadow-[0_0_15px_rgba(230,57,70,.3)]">
                    LIVE DRAW
                  </div>
                  <div className="absolute bottom-3.5 left-4 right-4">
                    <div className="font-heading text-[26px] tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>
                      {c.name || t?.prize || 'TBA'}
                    </div>
                    {c.value ? (
                      <div className="font-heading text-lg text-ci-gold-light tracking-wide mt-0.5">
                        R{c.value.toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-[13px] text-[#9898a8] leading-relaxed mb-2.5">
                    {c.desc || `Premium prize for ${t?.name} tier members`}
                  </p>
                  <div className="text-[11px] text-[#58586a]">{t?.freq} draw · {t?.entries}× weighted entries</div>

                  {/* Upcoming */}
                  {u?.name && (
                    <div className="mt-3 pt-2.5 border-t border-glass-border">
                      <div className="text-[9px] font-bold tracking-[2px] text-ci-gold-light uppercase mb-1">🔮 COMING NEXT</div>
                      <div className="text-sm font-bold">{u.name}</div>
                      {u.value ? <div className="text-xs text-ci-gold-light">R{u.value.toLocaleString()}</div> : null}
                      {p.drawDateHint && <div className="text-[10px] text-[#58586a] mt-0.5">📅 {p.drawDateHint}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {prizes.length === 0 && (
          <div className="text-center py-16 text-[#58586a] text-sm">Prize details coming soon...</div>
        )}
      </div>
    </section>
  );
}
