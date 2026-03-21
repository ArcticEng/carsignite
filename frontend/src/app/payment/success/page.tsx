'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TIERS, TierBadge } from '@/lib/tiers';

function SuccessContent() {
  const { member, refresh } = useAuth();
  const params = useSearchParams();
  const upgradedTier = params.get('tier') || 'apex';
  const t = TIERS[upgradedTier] || TIERS.apex;
  const [verified, setVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Poll for tier update (ITN may arrive after redirect)
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        await refresh();
        setAttempts(prev => prev + 1);
      } catch {}
    }, 3000);

    // Stop after 30 seconds
    const timeout = setTimeout(() => clearInterval(poll), 30000);
    return () => { clearInterval(poll); clearTimeout(timeout); };
  }, [refresh]);

  // Check if tier has been updated
  useEffect(() => {
    if (member && member.tier === upgradedTier && member.status === 'active') {
      setVerified(true);
    }
  }, [member, upgradedTier]);

  const wasUpgrade = member?.tier === 'free' ? false : true;

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-heading text-3xl tracking-[4px] text-ci-gold-light mb-2">
          {verified ? "YOU'RE UPGRADED!" : "PAYMENT RECEIVED!"}
        </h2>
        <p className="text-sm text-[#6E7275] mb-6">
          {verified
            ? `Welcome to ${t.name}! Your subscription is now active with ${t.entries}× draw entries.`
            : `Your payment was successful. Your ${t.name} membership is being activated...`
          }
        </p>

        <div className="glass-sm p-4 mb-6 text-left">
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Status</span>
            {verified
              ? <span className="text-ci-green font-bold">✓ ACTIVE</span>
              : <span className="text-ci-gold-light font-bold flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-ci-gold-light border-t-transparent rounded-full animate-spin inline-block" />
                  Activating...
                </span>
            }
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Member</span>
            <span className="font-medium">{member?.first_name} {member?.last_name}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Plan</span>
            <TierBadge tier={upgradedTier} />
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Draw Entries</span>
            <span className="font-bold text-ci-gold-light">{t.entries}× per {t.freq.toLowerCase()}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px]">
            <span className="text-[#6E7275]">Billing</span>
            <span className="font-medium">R{t.price}/mo via PayFast</span>
          </div>
        </div>

        <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.15)] rounded-xl p-4 mb-6">
          <div className="text-sm font-bold text-ci-green mb-1">
            {t.entries}× Draw Entries Active!
          </div>
          <p className="text-[11px] text-[#6E7275]">
            Your bonus entries are active immediately. You now have full access to GPS tracking, crew chat, group drives, and VIP events.
          </p>
        </div>

        {!verified && attempts > 3 && (
          <div className="glass-sm p-3 mb-4 text-center">
            <p className="text-[11px] text-[#6E7275]">
              ⏳ Activation usually takes a few seconds. If not updated, your admin can activate you manually.
            </p>
          </div>
        )}

        <Link href="/dashboard" className="btn btn-red w-full py-3.5 text-sm tracking-[2px]">
          GO TO DASHBOARD →
        </Link>

        <p className="text-[10px] text-[#6E7275] mt-4">
          Confirmation sent to {member?.email}. Manage your subscription in Profile.
        </p>
      </div>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
