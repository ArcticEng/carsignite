'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TIERS } from '@/lib/tiers';

function CheckoutForm() {
  const { member } = useAuth();
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const tier = params.get('tier') || member?.tier || 'apex';
  const t = TIERS[tier];

  const [discount, setDiscount] = useState<{ pct: number; originalPrice: number; finalPrice: number } | null>(null);

  useEffect(() => {
    if (!member) return;

    api('/payfast/generate', { method: 'POST', body: { tier } })
      .then((r: any) => {
        setPaymentData(r.data);
        setPaymentUrl(r.url);
        if (r.discount) setDiscount(r.discount);
        setLoading(false);
      })
      .catch((e: any) => {
        setError(e.message);
        setLoading(false);
      });
  }, [member, tier]);

  // Auto-submit after a short delay to show the user what's happening
  useEffect(() => {
    if (paymentData && formRef.current) {
      const timer = setTimeout(() => {
        formRef.current?.submit();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentData]);

  if (error) return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-heading text-2xl tracking-[3px] mb-2">PAYMENT ERROR</h2>
        <p className="text-sm text-[#58586a] mb-4">{error}</p>
        <a href="/dashboard" className="btn btn-ghost px-6 py-3 text-sm">← Back to Dashboard</a>
      </div>
    </section>
  );

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {/* PayFast branding */}
        <div className="bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl p-5 mb-6">
          <div className="text-[10px] tracking-[2px] text-white/70 uppercase">Secure Payment via</div>
          <div className="text-3xl font-bold text-white my-1">Pay<span className="font-light">fast</span></div>
          <div className="text-[10px] text-white/50">PCI DSS Level 1 · Tokenized · ZAR</div>
        </div>

        {loading ? (
          <div className="py-8">
            <div className="w-10 h-10 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#9898a8]">Preparing your subscription...</p>
          </div>
        ) : (
          <>
            {/* Order summary */}
            <div className="glass-sm p-4 mb-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#58586a]">Plan</span>
                <span className="font-bold text-sm">{t?.icon} {t?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#58586a]">Billing</span>
                <span className="text-sm">Monthly (recurring)</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] text-[#58586a]">Prize Draws</span>
                <span className="text-sm">{t?.entries}× entries per {t?.freq?.toLowerCase()}</span>
              </div>
              {discount && (
                <>
                  <div className="h-px bg-glass-border my-3" />
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-[#6E7275]">Original Price</span>
                    <span className="text-sm line-through text-[#6E7275]">R{discount.originalPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-ci-green font-bold">Promo Discount</span>
                    <span className="text-sm font-bold text-ci-green">-{discount.pct}%</span>
                  </div>
                </>
              )}
              <div className="h-px bg-glass-border my-3" />
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-heading text-3xl text-ci-gold-light tracking-wide">R{discount ? discount.finalPrice : t?.price}</span>
              </div>
              <div className="text-right text-[10px] text-[#6E7275]">per month, charged via debit order</div>
            </div>

            <div className="py-4">
              <div className="w-10 h-10 border-2 border-glass-border border-t-[#009cde] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#9898a8]">Redirecting to PayFast...</p>
              <p className="text-[11px] text-[#58586a] mt-1">You&apos;ll be taken to PayFast&apos;s secure checkout to complete your subscription.</p>
            </div>

            {/* Hidden form that auto-submits to PayFast */}
            {paymentData && (
              <form ref={formRef} action={paymentUrl} method="POST" className="hidden">
                {Object.entries(paymentData).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value as string} />
                ))}
              </form>
            )}

            <button
              onClick={() => formRef.current?.submit()}
              className="btn btn-gold w-full py-3.5 text-sm tracking-[2px] mt-2"
            >
              PAY NOW — R{discount ? discount.finalPrice : t?.price}/MO
            </button>

            <p className="text-[10px] text-[#6E7275] mt-4 leading-relaxed">
              By proceeding, you authorise CarsIgnite to charge R{discount ? discount.finalPrice : t?.price} monthly via PayFast recurring billing.
              You can cancel anytime from your dashboard. Payments are processed securely by PayFast (PCI DSS Level 1).
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default function PaymentCheckoutPage() {
  return <Suspense><CheckoutForm /></Suspense>;
}
