'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TIERS, TierBadge, getCountdown } from '@/lib/tiers';
import { ChatTab } from '@/components/dashboard/ChatTab';
import { MapTab } from '@/components/dashboard/MapTab';
import { DrivesTab } from '@/components/dashboard/DrivesTab';
import { EntriesTab } from '@/components/dashboard/EntriesTab';
import { PrizesTab } from '@/components/dashboard/PrizesTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';

const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'map', label: 'Live Map', icon: '📍' },
  { id: 'drives', label: 'Drives', icon: '🏁' },
  { id: 'entries', label: 'Draw Entries', icon: '🎟️' },
  { id: 'prizes', label: 'Prizes', icon: '🏆' },
  { id: 'profile', label: 'Profile', icon: '⚙️' },
];

export default function DashboardPage() {
  const { member, loading } = useAuth();
  const [tab, setTab] = useState('chat');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !member) router.push('/login');
  }, [loading, member, router]);

  if (loading || !member) return (
    <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin" /></div>
  );

  const t = TIERS[member.tier] || TIERS.apex;
  const cd = getCountdown();
  const needsPayment = member.status !== 'active';

  return (
    <section className="min-h-dvh pt-[84px] px-4 pb-10 animate-fade-up">
      <div className="max-w-[1120px] mx-auto">
        {/* Payment banner for unpaid users */}
        {needsPayment && (
          <div className="glass-card p-5 mb-4 border-ci-red/20 animate-glow-pulse">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚠️</span>
                  <span className="font-bold text-sm text-ci-red-light">Subscription Payment Required</span>
                </div>
                <p className="text-xs text-[#58586a]">Complete your PayFast payment to activate GPS tracking, chat, draws, and all features.</p>
              </div>
              <a href={`/payment?tier=${member.tier}`} className="btn btn-gold px-6 py-3 text-sm tracking-[2px] shrink-0">
                COMPLETE PAYMENT → R{t.price}/MO
              </a>
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
            {[['Next Draw', `${cd.days}d`, 'text-ci-gold-light'], ['Entries', `${t.entries}`, 'text-white'], ['Tier', t.name, '']].map(([label, val, color]) => (
              <div key={label} className="glass-sm px-3.5 py-2 text-center">
                <div className="text-[8px] text-[#58586a] tracking-[1.5px] uppercase">{label}</div>
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
                  ? 'bg-[rgba(230,57,70,.1)] text-white font-semibold shadow-[0_0_15px_rgba(230,57,70,.08)]'
                  : 'text-[#58586a] hover:text-[#9898a8]'
              }`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'chat' && <ChatTab />}
          {tab === 'map' && <MapTab />}
          {tab === 'drives' && <DrivesTab />}
          {tab === 'entries' && <EntriesTab />}
          {tab === 'prizes' && <PrizesTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>
      </div>
    </section>
  );
}
