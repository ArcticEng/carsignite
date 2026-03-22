'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TIERS, TierBadge, prizeImg, getCountdown } from '@/lib/tiers';

export function PrizesTab() {
  const { member } = useAuth();
  const [prizes, setPrizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cd = getCountdown();

  useEffect(() => {
    api('/prizes/showcase').then(r => setPrizes(r.prizes || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;

  const myTier = member?.tier || 'apex';

  return (
    <>
      {/* Countdown */}
      <div className="glass-card p-6 text-center mb-6 animate-border-glow" style={{ borderColor: 'rgba(224,52,85,.15)' }}>
        <div className="text-[10px] font-bold tracking-[3px] text-ci-red-light uppercase mb-2">🔥 NEXT DRAW IN</div>
        <div className="font-heading text-[clamp(40px,8vw,64px)] text-ci-gold-light tracking-[4px]" style={{ textShadow: '0 0 30px rgba(240,192,64,.2)' }}>
          {cd.days} DAYS {cd.hours} HRS
        </div>
        <p className="text-[13px] text-[#6E7275] mt-1.5">Don&apos;t miss your chance to win big. Entries are automatic with your subscription.</p>
      </div>

      {/* Current prizes */}
      <h3 className="font-heading text-[22px] tracking-[3px] mb-4">🏆 CURRENT PRIZES</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {prizes.map(p => {
          const t = TIERS[p.tier] || {};
          const c = p.current || {};
          const isMy = p.tier === myTier;
          const img = prizeImg(c.name || t.prize || 'luxury', c.image);

          return (
            <div key={p.tier} className="glass-card overflow-hidden" style={isMy ? { borderColor: 'rgba(224,52,85,.2)', boxShadow: '0 0 30px rgba(224,52,85,.08)' } : {}}>
              <div className="h-[180px] relative" style={{ background: `url('${img}') center/cover` }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(30,30,30,.9) 0%, transparent 60%)' }} />
                <div className="absolute top-3 left-3"><TierBadge tier={p.tier} /></div>
                {isMy && <div className="absolute top-3 right-3 bg-ci-red text-white px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide">YOUR TIER</div>}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <div className="font-heading text-2xl tracking-wider">{c.name || t.prize || 'TBA'}</div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-[#E7E5E6] leading-relaxed mb-2">{c.desc || `Premium giveaway for ${t.name} members`}</p>
                {c.value > 0 && <div className="font-heading text-xl text-ci-gold-light tracking-wide">R{Number(c.value).toLocaleString()}</div>}
                <div className="text-[11px] text-[#6E7275] mt-1.5">{t.freq} draw · {t.entries}× entries</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming */}
      {prizes.some(p => p.upcoming?.name) ? (
        <>
          <h3 className="font-heading text-[22px] tracking-[3px] mb-4">🔮 UPCOMING PRIZES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prizes.filter(p => p.upcoming?.name).map(p => {
              const t = TIERS[p.tier] || {};
              const u = p.upcoming;
              const img = prizeImg(u.name || 'luxury', u.image);

              return (
                <div key={p.tier} className="glass-card overflow-hidden opacity-85">
                  <div className="h-[160px] relative" style={{ background: `url('${img}') center/cover` }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(30,30,30,.9) 0%, transparent 60%)' }} />
                    <div className="absolute top-3 left-3"><TierBadge tier={p.tier} /></div>
                    <div className="absolute top-3 right-3 glass-sm text-[#6E7275] px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wide">UPCOMING</div>
                    <div className="absolute bottom-3 left-3.5"><div className="font-heading text-xl tracking-wider">{u.name}</div></div>
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs text-[#6E7275] leading-relaxed">{u.desc || 'Coming soon'}</p>
                    {u.value > 0 && <div className="text-sm text-ci-gold-light font-bold mt-1">R{Number(u.value).toLocaleString()}</div>}
                    {p.drawDateHint && <div className="text-[11px] text-[#6E7275] mt-1">📅 {p.drawDateHint}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="glass-sm p-5 text-center text-[11px] text-[#6E7275]">Upcoming prizes will be announced soon. Stay tuned!</div>
      )}
    </>
  );
}
