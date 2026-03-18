'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TIERS, TierBadge } from '@/lib/tiers';

export function EntriesTab() {
  const { member } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/draws/my/entries').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;
  if (!data) return <div className="glass-card p-7 text-center text-[#58586a]">Could not load entries</div>;

  const t = TIERS[data.tier] || TIERS.apex;
  const pr = data.currentPrize || {};

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-base mb-4">🎟️ Your Draw Entries</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Tier', value: <TierBadge tier={data.tier} />, raw: true },
          { label: 'Entries/Cycle', value: data.entriesPerCycle, color: 'text-ci-gold-light' },
          { label: 'Frequency', value: data.frequency || 'Monthly', small: true },
          { label: 'Wins', value: data.totalWins, color: data.totalWins > 0 ? 'text-ci-green' : 'text-[#58586a]' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[rgba(230,57,70,.04)] blur-[25px]" />
            <div className="text-[10px] font-semibold text-[#58586a] tracking-[2px] uppercase mb-1">{s.label}</div>
            {s.raw ? <div className="mt-1.5">{s.value}</div> : (
              <div className={`font-heading text-2xl tracking-wide ${s.color || ''}`} style={s.small ? { fontSize: '20px' } : {}}>
                {s.value}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-sm p-4 mb-4">
        <div className="text-[10px] font-bold tracking-[2px] text-ci-gold-light uppercase mb-1">🎁 CURRENT PRIZE</div>
        <div className="text-[22px] font-bold">{pr.prize_name || t.prize}</div>
        {pr.prize_desc && <div className="text-[13px] text-[#58586a] mt-1">{pr.prize_desc}</div>}
        {pr.prize_value > 0 && <div className="text-[13px] text-ci-gold-light mt-1">Value: R{Number(pr.prize_value).toLocaleString()}</div>}
      </div>

      <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.15)] rounded-xl p-4 text-center">
        <div className="text-sm font-bold text-ci-green">✓ You are entered into the next {data.frequency || 'monthly'} draw</div>
        <div className="text-xs text-[#58586a] mt-1">{data.entriesPerCycle}× weighted entries</div>
      </div>
    </div>
  );
}
