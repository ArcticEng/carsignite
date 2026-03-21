'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { TIERS, PAID_TIERS, TierBadge, getCountdown } from '@/lib/tiers';
import { ChatTab } from '@/components/dashboard/ChatTab';
import { MapTab } from '@/components/dashboard/MapTab';
import { DrivesTab } from '@/components/dashboard/DrivesTab';
import { EntriesTab } from '@/components/dashboard/EntriesTab';
import { PrizesTab } from '@/components/dashboard/PrizesTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';

const TABS = [
  { id: 'entries', label: 'Draw Entries', icon: '🎟️', free: true },
  { id: 'prizes', label: 'Prizes', icon: '🏆', free: true },
  { id: 'chat', label: 'Chat', icon: '💬', free: false },
  { id: 'map', label: 'Live Map', icon: '📍', free: false },
  { id: 'drives', label: 'Drives', icon: '🏁', free: false },
  { id: 'profile', label: 'Profile', icon: '⚙️', free: true },
];

function LockedFeature() {
  return (
    <div className="glass-card p-10 text-center">
      <div className="text-5xl mb-4 opacity-30">🔒</div>
      <h3 className="font-heading text-xl tracking-[2px] mb-2">SUBSCRIBER ONLY</h3>
      <p className="text-sm text-[#6E7275] max-w-[400px] mx-auto mb-6">
        This feature is available to paid members. Subscribe to unlock GPS tracking, crew chat, group drives, and bonus draw entries.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {Object.values(PAID_TIERS).map(t => (
          <Link key={t.id} href={`/payment?tier=${t.id}`}
            className={`btn ${t.popular ? 'btn-red' : 'btn-ghost'} px-5 py-3 text-[11px]`}>
            {t.icon} {t.name} — R{t.price}/mo · {t.entries}× entries
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { member, loading } = useAuth();
  const [tab, setTab] = useState('entries');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !member) router.push('/login');
  }, [loading, member, router]);

  if (loading || !member) return (
    <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin" /></div>
  );

  const t = TIERS[member.tier] || TIERS.free;
  const cd = getCountdown();
  const isFree = member.tier === 'free';
  const needsPayment = !isFree && member.status !== 'active';
  const isPaid = !isFree && member.status === 'active';

  // Free users default to entries tab; paid users default to chat
  useEffect(() => {
    if (isPaid) setTab('chat');
  }, [isPaid]);

  const currentTab = TABS.find(tb => tb.id === tab);
  const showLocked = isFree && currentTab && !currentTab.free;

  return (
    <section className="min-h-dvh pt-[84px] px-4 pb-10 animate-fade-up">
      <div className="max-w-[1120px] mx-auto">
        {/* Payment banner for pending paid users */}
        {needsPayment && (
          <div className="glass-card p-5 mb-4 border-ci-red/20 animate-glow-pulse">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚠️</span>
                  <span className="font-bold text-sm text-ci-red-light">Complete Your Subscription</span>
                </div>
                <p className="text-xs text-[#6E7275]">Complete your PayFast payment to activate all features and bonus draw entries.</p>
              </div>
              <a href={`/payment?tier=${member.tier}`} className="btn btn-gold px-6 py-3 text-sm tracking-[2px] shrink-0">
                COMPLETE PAYMENT → R{t.price}/MO
              </a>
            </div>
          </div>
        )}

        {/* Free user welcome + upgrade */}
        {isFree && (
          <div className="glass-card p-6 mb-4 border-[rgba(34,204,110,.15)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">🎟️</span>
                  <span className="font-bold text-[15px] text-ci-green">You have 1 Free Draw Entry!</span>
                </div>
                <p className="text-xs text-[#6E7275] max-w-[400px]">
                  You&apos;re entered in the next monthly draw. Subscribe to unlock GPS tracking, crew chat, group drives, and up to 25× bonus entries.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/payment?tier=apex" className="btn btn-red px-5 py-3 text-[11px] tracking-[2px]">
                  UPGRADE → 10× ENTRIES
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-heading text-[clamp(20px,3vw,26px)] tracking-[3px]">
              WELCOME, {member.first_name.toUpperCase()}
            </h2>
            <div className="mt-1"><TierBadge tier={member.tier} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[['Next Draw', `${cd.days}d`, 'text-ci-gold-light'], ['Entries', `${t.entries}×`, 'text-white'], ['Tier', t.name, '']].map(([label, val, color]) => (
              <div key={label} className="glass-sm px-3.5 py-2 text-center">
                <div className="text-[8px] text-[#6E7275] tracking-[1.5px] uppercase">{label}</div>
                <div className={`font-heading text-lg tracking-wide ${color}`} style={!color ? { color: t.color } : {}}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-[3px] bg-[rgba(255,255,255,.02)] rounded-xl p-1 border border-glass-border overflow-x-auto mb-4">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                tab === tb.id
                  ? 'bg-[rgba(224,52,85,.1)] text-white font-semibold shadow-[0_0_15px_rgba(224,52,85,.08)]'
                  : 'text-[#6E7275] hover:text-[#E7E5E6]'
              }`}>
              {tb.icon} {tb.label}
              {isFree && !tb.free && <span className="text-[8px] opacity-50">🔒</span>}
            </button>
          ))}
        </div>

        {/* Content — locked features for free users */}
        <div>
          {showLocked ? <LockedFeature /> : (
            <>
              {tab === 'entries' && <EntriesTab />}
              {tab === 'prizes' && <PrizesTab />}
              {tab === 'chat' && <ChatTab />}
              {tab === 'map' && <MapTab />}
              {tab === 'drives' && <DrivesTab />}
              {tab === 'profile' && <ProfileTab />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
