'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { TIERS, TierBadge } from '@/lib/tiers';

function SignupForm() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({ tier: params.get('tier') || 'apex' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const u = (field: string, val: any) => setData((p: any) => ({ ...p, [field]: val }));
  const provinces = ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Free State','Limpopo','Mpumalanga','North West','Northern Cape'];

  const next1 = () => {
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.password) {
      setError('Fill all required fields'); return;
    }
    setError(''); setStep(2);
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await register(data);
      toast('Account created! Redirecting to payment...', 'success');
      setTimeout(() => router.push(`/payment?tier=${data.tier}`), 500);
    } catch (e: any) {
      setError(e.message); setLoading(false);
    }
  };

  const t = TIERS[data.tier] || TIERS.apex;

  return (
    <section className="min-h-dvh px-5 pt-24 pb-10">
      <div className="max-w-[520px] mx-auto animate-fade-up">
        <div className="text-center mb-7">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">REGISTRATION</span>
          <h2 className="font-heading text-3xl tracking-[3px] mt-2">JOIN CARSIGNITE</h2>
          <div className="flex justify-center gap-1.5 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-[3px] rounded transition-all duration-300"
                style={{ width: s === step ? 32 : 8, background: s <= step ? '#e63946' : 'rgba(255,255,255,.06)' }} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[rgba(230,57,70,.08)] border border-[rgba(230,57,70,.2)] rounded-xl p-3 mb-4 text-xs text-ci-red-light">
            ⚠ {error}
          </div>
        )}

        <div className="glass-card p-7">
          {step === 1 && (
            <>
              <h3 className="text-[15px] font-bold mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[['firstName','First Name *'],['lastName','Last Name *']].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-[11px] font-semibold text-[#58586a] mb-1 tracking-wider uppercase">{l}</label>
                    <input value={data[k]||''} onChange={e => u(k, e.target.value)}
                      className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" />
                  </div>
                ))}
              </div>
              {[['email','Email *','email'],['phone','Phone *','tel'],['idNumber','SA ID Number','text']].map(([k,l,type]) => (
                <div key={k} className="mt-3">
                  <label className="block text-[11px] font-semibold text-[#58586a] mb-1 tracking-wider uppercase">{l}</label>
                  <input type={type} value={data[k]||''} onChange={e => u(k, e.target.value)}
                    className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#58586a] mb-1 tracking-wider uppercase">City</label>
                  <input value={data.city||''} onChange={e => u('city', e.target.value)}
                    className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#58586a] mb-1 tracking-wider uppercase">Province</label>
                  <select value={data.province||'gauteng'} onChange={e => u('province', e.target.value)}
                    className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm appearance-none">
                    {provinces.map(p => <option key={p} value={p.toLowerCase().replace(/ /g,'_')}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#58586a] mb-1 tracking-wider uppercase">Password *</label>
                <input type="password" value={data.password||''} onChange={e => u('password', e.target.value)}
                  className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" placeholder="Create a password" />
              </div>
              <button onClick={next1} className="btn btn-red w-full py-3.5 mt-5 text-sm tracking-[2px]">CONTINUE →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-[15px] font-bold mb-4">Choose Membership</h3>
              {Object.entries(TIERS).map(([id, tier]) => (
                <div key={id} onClick={() => u('tier', id)}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer mb-2 transition-all border-2"
                  style={{ background: data.tier === id ? 'rgba(230,57,70,.06)' : 'rgba(255,255,255,.03)', borderColor: data.tier === id ? tier.color : 'transparent' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[22px]">{tier.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{tier.name}</div>
                      <div className="text-[11px] text-[#58586a]">{tier.freq} {tier.prize} · {tier.entries}× entries</div>
                    </div>
                  </div>
                  <div className="font-heading text-[22px] tracking-wide">
                    R{tier.price}<span className="text-[11px] font-body text-[#58586a]">/mo</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2.5 mt-4">
                <button onClick={() => setStep(1)} className="btn btn-ghost flex-1 py-3">← BACK</button>
                <button onClick={() => setStep(3)} className="btn btn-red flex-[2] py-3 text-sm">CONTINUE →</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-[15px] font-bold mb-4">Confirm & Pay</h3>
              <div className="glass-sm p-4 mb-4">
                {[['Name', `${data.firstName} ${data.lastName}`], ['Email', data.email]].map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between py-1 text-[13px]">
                    <span className="text-[#58586a]">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1 text-[13px]">
                  <span className="text-[#58586a]">Tier</span>
                  <TierBadge tier={data.tier} />
                </div>
                <div className="h-px bg-glass-border my-3" />
                <div className="flex items-center justify-between">
                  <span className="font-bold">Monthly</span>
                  <span className="font-heading text-[28px] text-ci-gold-light tracking-wide">R{t.price}</span>
                </div>
              </div>

              <label className="flex gap-2 cursor-pointer mb-2">
                <input type="checkbox" id="terms" className="mt-0.5 accent-ci-red" />
                <span className="text-xs text-[#58586a] leading-relaxed">I agree to the Terms and Privacy Policy.</span>
              </label>
              <label className="flex gap-2 cursor-pointer mb-4">
                <input type="checkbox" id="rules" className="mt-0.5 accent-ci-red" />
                <span className="text-xs text-[#58586a] leading-relaxed">I acknowledge the CPA Section 36 competition rules.</span>
              </label>

              <div className="bg-gradient-to-br from-[#003087] to-[#009cde] rounded-xl p-3.5 mb-4 text-center text-white">
                <div className="text-[9px] tracking-[2px] opacity-70">SECURE PAYMENT VIA</div>
                <div className="text-xl font-bold my-0.5">Pay<span className="font-light">fast</span></div>
                <div className="text-[10px] opacity-50">PCI DSS Level 1 · Tokenized · ZAR</div>
              </div>

              <div className="flex gap-2.5">
                <button onClick={() => setStep(2)} className="btn btn-ghost flex-1 py-3">← BACK</button>
                <button onClick={submit} disabled={loading}
                  className="btn btn-gold flex-[2] py-3 text-sm tracking-[2px]">
                  {loading ? 'Processing...' : `SUBSCRIBE R${t.price}/MO`}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-4 text-[13px] text-[#58586a]">
          Already a member? <Link href="/login" className="text-ci-red font-semibold">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
