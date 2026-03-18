'use client';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-up">
        <div className="text-5xl mb-4 opacity-50">😔</div>
        <h2 className="font-heading text-2xl tracking-[3px] mb-2">PAYMENT CANCELLED</h2>
        <p className="text-sm text-[#58586a] mb-6">
          No worries — your account has been created but your subscription is not yet active.
          You can complete payment at any time.
        </p>

        <div className="glass-sm p-4 mb-6">
          <div className="text-xs text-[#58586a] leading-relaxed">
            Without an active subscription, you won&apos;t have access to group chat, live tracking, or draw entries.
            Complete your payment to unlock all features.
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link href="/payment" className="btn btn-red w-full py-3.5 text-sm tracking-[2px]">
            TRY AGAIN
          </Link>
          <Link href="/dashboard" className="btn btn-ghost w-full py-3 text-sm">
            Go to Dashboard
          </Link>
          <Link href="/" className="text-xs text-[#58586a] hover:text-[#9898a8] mt-2">
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
