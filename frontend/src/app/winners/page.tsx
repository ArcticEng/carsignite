'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { TierBadge } from '@/lib/tiers';

export default function WinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [showcase, setShowcase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/winners').catch(() => ({ winners: [] })),
      api('/prizes/showcase').catch(() => null),
    ]).then(([w, s]) => {
      setWinners(w.winners || []);
      setShowcase(s);
      setLoading(false);
    });
  }, []);

  return (
    <section className="min-h-dvh pt-24 pb-16 px-5">
      <div className="max-w-[900px] mx-auto animate-fade-up">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">TRANSPARENCY</span>
          <h1 className="font-heading text-[clamp(28px,5vw,42px)] tracking-[4px] mt-2">WINNERS</h1>
          <p className="text-[#6E7275] mt-2 text-sm">Every draw is cryptographically random and independently auditable.</p>
        </div>

        {/* Live Stats */}
        {showcase && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="text-[10px] font-bold tracking-[2px] text-[#6E7275] uppercase">Active Members</div>
              <div className="font-heading text-2xl mt-1">{showcase.totalMembers || 0}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-[10px] font-bold tracking-[2px] text-[#6E7275] uppercase">Total Entries</div>
              <div className="font-heading text-2xl mt-1">{showcase.totalEntries || 0}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-[10px] font-bold tracking-[2px] text-[#6E7275] uppercase">Days to Draw</div>
              <div className="font-heading text-2xl mt-1 text-ci-red">{showcase.daysLeft}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-[10px] font-bold tracking-[2px] text-[#6E7275] uppercase">Total Draws</div>
              <div className="font-heading text-2xl mt-1">{winners.length}</div>
            </div>
          </div>
        )}

        {/* No Purchase Necessary */}
        <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.12)] rounded-xl p-4 mb-8 text-center">
          <p className="text-[12px] text-[#6E7275]">
            🎉 <span className="text-ci-green font-bold">No Purchase Necessary.</span> Register for free and get 1 entry per draw.
            Paid members receive bonus entries. <Link href="/terms" className="text-[#E03455] underline">Full rules</Link>.
          </p>
        </div>

        {/* Winner History */}
        {loading ? (
          <div className="glass-card p-10 text-center">
            <div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" />
          </div>
        ) : winners.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-5xl mb-3 opacity-30">🏆</div>
            <h3 className="font-heading text-xl tracking-[2px] mb-2">NO WINNERS YET</h3>
            <p className="text-sm text-[#6E7275] max-w-[400px] mx-auto mb-5">
              The first draw is coming soon. Register now to be entered — it&apos;s free!
            </p>
            <Link href="/signup" className="btn btn-red px-6 py-3 text-sm">
              ENTER FOR FREE →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((w, i) => (
              <div key={i} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ci-gold-light to-ci-gold flex items-center justify-center text-xl font-bold text-black flex-shrink-0">
                  🏆
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-[15px]">{w.winner_name}</span>
                    {w.winner_city && <span className="text-[11px] text-[#6E7275]">📍 {w.winner_city}</span>}
                    <TierBadge tier={w.tier} small />
                  </div>
                  <div className="text-sm text-[#E7E5E6]">Won: <span className="font-semibold text-ci-gold-light">{w.prize_name}</span></div>
                  {w.prize_value > 0 && <div className="text-[11px] text-[#6E7275]">Prize value: R{w.prize_value.toLocaleString()}</div>}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-[#6E7275]">{new Date(w.draw_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="text-[10px] text-[#6E7275] mt-0.5">{w.total_entrants} entrants · {w.total_entries} entries</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[10px] text-[#6E7275] max-w-[560px] mx-auto mt-8 leading-relaxed">
          All draws comply with Section 36 of the Consumer Protection Act (No. 68 of 2008).
          Draw records are kept for 3 years. <Link href="/terms" className="text-[#E03455] underline">Full competition terms</Link>.
        </p>
      </div>
    </section>
  );
}
