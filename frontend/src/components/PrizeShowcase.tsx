'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TIERS, TierBadge, prizeImg, getCountdown } from '@/lib/tiers';

interface PrizeData {
  tier: string;
  current: { name: string; desc?: string; value?: number; image?: string };
  upcoming: { name?: string; desc?: string; value?: number; image?: string };
  drawDateHint?: string;
}

export function PrizeShowcase() {
  const [prizes, setPrizes] = useState<PrizeData[]>([]);
  const [stats, setStats] = useState<{ totalMembers: number; totalEntries: number; daysLeft: number } | null>(null);
  const cd = getCountdown();

  useEffect(() => {
    fetch('/api/prizes/showcase')
      .then(r => r.json())
      .then(r => {
        setPrizes(r.prizes || []);
        setStats({ totalMembers: r.totalMembers || 0, totalEntries: r.totalEntries || 0, daysLeft: r.daysLeft || 0 });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-5 relative overflow-hidden">
      <div className="absolute top-[-100px] left-1/2 w-[600px] h-[600px] -translate-x-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(224,52,85,.06), transparent 70%)' }} />

      <div className="max-w-[1120px] mx-auto relative">
        <div className="text-center mb-5">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-red-light uppercase">🔥 GIVEAWAYS</span>
          <h2 className="font-heading text-[clamp(30px,5vw,48px)] tracking-[4px] mt-2">WIN BIG EVERY MONTH</h2>
          <p className="text-[#6E7275] mt-2.5 max-w-[500px] mx-auto text-sm leading-relaxed">
            Free and paid members are entered into every draw. Next draw in{' '}
            <span className="text-ci-gold-light font-bold">{cd.days} days {cd.hours} hours</span>.
          </p>
        </div>

        {/* Live entry stats */}
        {stats && (
          <div className="flex justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="font-heading text-2xl">{stats.totalMembers}</div>
              <div className="text-[10px] text-[#6E7275] tracking-[2px] uppercase">Members</div>
            </div>
            <div className="w-px bg-glass-border" />
            <div className="text-center">
              <div className="font-heading text-2xl">{stats.totalEntries}</div>
              <div className="text-[10px] text-[#6E7275] tracking-[2px] uppercase">Total Entries</div>
            </div>
            <div className="w-px bg-glass-border" />
            <div className="text-center">
              <div className="font-heading text-2xl text-ci-red">{stats.daysLeft}</div>
              <div className="text-[10px] text-[#6E7275] tracking-[2px] uppercase">Days Left</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {prizes.map(p => {
            const t = TIERS[p.tier];
            if (!t) return null;
            const c = p.current;
            const u = p.upcoming;
            const img = prizeImg(c.name || t.prize, c.image);

            return (
              <div key={p.tier} className="glass-card overflow-hidden">
                <div className="h-[200px] relative" style={{ background: `url('${img}') center/cover` }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #1E1E1E 0%, rgba(30,30,30,.3) 40%, transparent 100%)' }} />
                  <div className="absolute top-3 left-3"><TierBadge tier={p.tier} /></div>
                  <div className="absolute top-3 right-3 bg-[rgba(224,52,85,.9)] text-white px-3 py-1 rounded-md text-[9px] font-bold tracking-[1.5px] shadow-[0_0_15px_rgba(224,52,85,.3)]">
                    LIVE DRAW
                  </div>
                  <div className="absolute bottom-3.5 left-4 right-4">
                    <div className="font-heading text-[26px] tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>
                      {c.name || t.prize}
                    </div>
                    {c.value ? <div className="font-heading text-lg text-ci-gold-light tracking-wide mt-0.5">R{c.value.toLocaleString()}</div> : null}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[13px] text-[#6E7275] leading-relaxed mb-2.5">
                    {c.desc || `Premium prize for ${t.name} tier members`}
                  </p>
                  <div className="text-[11px] text-[#6E7275]">{t.freq} draw · {t.entries}× weighted entries</div>
                  {u?.name && (
                    <div className="mt-3 pt-2.5 border-t border-glass-border">
                      <div className="text-[9px] font-bold tracking-[2px] text-ci-gold-light uppercase mb-1">🔮 COMING NEXT</div>
                      <div className="text-sm font-bold">{u.name}</div>
                      {u.value ? <div className="text-xs text-ci-gold-light">R{u.value.toLocaleString()}</div> : null}
                      {p.drawDateHint && <div className="text-[10px] text-[#6E7275] mt-0.5">📅 {p.drawDateHint}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {prizes.length === 0 && (
          <div className="text-center py-16 text-[#6E7275] text-sm">Prize details coming soon...</div>
        )}

        {/* CPA compliance footer */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-[#6E7275] max-w-[500px] mx-auto">
            🎉 No purchase necessary. <Link href="/signup" className="text-ci-green font-bold">Register for free</Link> with 1 draw entry. 
            Paid memberships provide bonus entries. <Link href="/terms" className="text-[#E03455] underline">Full competition rules</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
