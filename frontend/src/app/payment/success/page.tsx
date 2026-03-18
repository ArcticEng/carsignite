'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function PaymentSuccessPage() {
  const { member, refresh } = useAuth();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    // Refresh member data to get updated subscription status
    refresh().then(() => setRefreshed(true)).catch(() => setRefreshed(true));
  }, [refresh]);

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-heading text-3xl tracking-[4px] text-ci-gold-light mb-2">WELCOME ABOARD!</h2>
        <p className="text-sm text-[#9898a8] mb-6">
          Your payment was successful. Your CarsIgnite membership is now active.
        </p>

        <div className="glass-sm p-4 mb-6 text-left">
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#58586a]">Status</span>
            <span className="text-ci-green font-bold">✓ ACTIVE</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#58586a]">Member</span>
            <span className="font-medium">{member?.first_name} {member?.last_name}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px]">
            <span className="text-[#58586a]">Billing</span>
            <span className="font-medium">Monthly recurring via PayFast</span>
          </div>
        </div>

        <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.15)] rounded-xl p-4 mb-6">
          <div className="text-sm font-bold text-ci-green mb-1">You&apos;re entered in the next draw!</div>
          <p className="text-[11px] text-[#58586a]">Your draw entries are active immediately. Good luck!</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="btn btn-red flex-1 py-3.5 text-sm tracking-[2px]">
            GO TO DASHBOARD
          </Link>
        </div>

        <p className="text-[10px] text-[#58586a] mt-4">
          A confirmation email will be sent to {member?.email}. You can manage your subscription from your profile.
        </p>
      </div>
    </section>
  );
}
