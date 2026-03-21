'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

function SignupForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({});
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
      // Everyone registers as free tier — gets 1 draw entry automatically
      await register({ ...data, tier: 'free' });
      toast('Welcome! You\'re entered in the next draw.', 'success');
      setTimeout(() => router.push('/dashboard'), 500);
    } catch (e: any) {
      setError(e.message); setLoading(false);
    }
  };

  const totalSteps = 3;
  const inputClass = "w-full px-3.5 py-3 bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.1)] rounded-xl text-white text-sm transition-all focus:border-ci-red focus:shadow-[0_0_0_3px_rgba(224,52,85,.12)] outline-none";

  return (
    <section className="min-h-dvh px-5 pt-24 pb-10">
      <div className="max-w-[520px] mx-auto animate-fade-up">
        <div className="text-center mb-7">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-gold-light uppercase">REGISTER</span>
          <h2 className="font-heading text-3xl tracking-[3px] mt-2">JOIN CARSIGNITE</h2>
          <p className="text-[12px] text-[#6E7275] mt-2">Register for free and get 1 entry into every monthly draw.</p>
          <div className="flex justify-center gap-1.5 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="h-[3px] rounded transition-all duration-300"
                style={{ width: s === step ? 32 : 8, background: s <= step ? '#E03455' : 'rgba(255,255,255,.1)' }} />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[rgba(224,52,85,.08)] border border-[rgba(224,52,85,.2)] rounded-xl p-3 mb-4 text-xs text-ci-red-light">
            ⚠ {error}
          </div>
        )}

        <div className="glass-card p-7">
          {/* STEP 1: Personal Details */}
          {step === 1 && (
            <>
              <h3 className="text-[15px] font-bold mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[['firstName','First Name *'],['lastName','Last Name *']].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">{l}</label>
                    <input value={data[k]||''} onChange={e => u(k, e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>
              {[['email','Email *','email'],['phone','Phone *','tel'],['idNumber','SA ID Number','text']].map(([k,l,type]) => (
                <div key={k} className="mt-3">
                  <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">{l}</label>
                  <input type={type} value={data[k]||''} onChange={e => u(k, e.target.value)} className={inputClass} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">City</label>
                  <input value={data.city||''} onChange={e => u('city', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">Province</label>
                  <select value={data.province||'gauteng'} onChange={e => u('province', e.target.value)}
                    className={`${inputClass} appearance-none`}>
                    {provinces.map(p => <option key={p} value={p.toLowerCase().replace(/ /g,'_')}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">Password *</label>
                <input type="password" value={data.password||''} onChange={e => u('password', e.target.value)}
                  className={inputClass} placeholder="Create a password" />
              </div>
              <button onClick={next1} className="btn btn-red w-full py-3.5 mt-5 text-sm tracking-[2px]">CONTINUE →</button>
            </>
          )}

          {/* STEP 2: Dream Preferences */}
          {step === 2 && (
            <>
              <h3 className="text-[15px] font-bold mb-1">Your Dream Garage</h3>
              <p className="text-[12px] text-[#6E7275] mb-5">Tell us about your rides and dreams — this helps us pick prizes you&apos;ll love.</p>
              
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">🚗 Current Car</label>
                <input value={data.currentCar||''} onChange={e => u('currentCar', e.target.value)}
                  className={inputClass} placeholder="e.g. BMW M4 Competition" />
              </div>
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">🏎️ Dream Car</label>
                <input value={data.dreamCar||''} onChange={e => u('dreamCar', e.target.value)}
                  className={inputClass} placeholder="e.g. Lamborghini Huracán" />
              </div>
              <div className="mb-3">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">⌚ Dream Luxury Watch</label>
                <input value={data.dreamWatch||''} onChange={e => u('dreamWatch', e.target.value)}
                  className={inputClass} placeholder="e.g. Rolex Daytona" />
              </div>
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1 tracking-wider uppercase">🏠 Dream House / Location</label>
                <input value={data.dreamHouse||''} onChange={e => u('dreamHouse', e.target.value)}
                  className={inputClass} placeholder="e.g. Clifton beach house, Cape Town" />
              </div>

              <div className="glass-sm p-3 mb-5 text-center">
                <span className="text-[10px] text-[#6E7275]">💡 We use this data to curate giveaway prizes our members actually want.</span>
              </div>

              <div className="flex gap-2.5">
                <button onClick={() => setStep(1)} className="btn btn-ghost flex-1 py-3">← BACK</button>
                <button onClick={() => setStep(3)} className="btn btn-red flex-[2] py-3 text-sm">CONTINUE →</button>
              </div>
            </>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <>
              <h3 className="text-[15px] font-bold mb-4">Confirm Registration</h3>
              <div className="glass-sm p-4 mb-4">
                {[['Name', `${data.firstName} ${data.lastName}`], ['Email', data.email], ['Phone', data.phone]].map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5 text-[13px] border-b border-[rgba(255,255,255,.06)] last:border-0">
                    <span className="text-[#6E7275]">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
                {data.dreamCar && (
                  <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-[rgba(255,255,255,.06)]">
                    <span className="text-[#6E7275]">Dream Car</span>
                    <span className="text-[12px]">🏎️ {data.dreamCar}</span>
                  </div>
                )}
              </div>

              {/* Free entry highlight */}
              <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.15)] rounded-xl p-4 mb-4 text-center">
                <div className="text-sm font-bold text-ci-green mb-1">🎟️ 1 Free Draw Entry</div>
                <p className="text-[11px] text-[#6E7275]">
                  By registering you&apos;re automatically entered into every monthly prize draw. No payment required.
                </p>
              </div>

              <div className="glass-sm p-3 mb-4 text-center">
                <p className="text-[11px] text-[#6E7275]">
                  🔒 Want GPS tracking, crew chat, drives & bonus entries?{' '}
                  <span className="text-white font-semibold">Subscribe after registration.</span>
                </p>
              </div>

              <label className="flex gap-2 cursor-pointer mb-2">
                <input type="checkbox" className="mt-0.5 accent-[#E03455]" />
                <span className="text-xs text-[#6E7275] leading-relaxed">I agree to the <Link href="/terms" className="text-[#E03455] underline">Terms and Competition Rules</Link>.</span>
              </label>
              <label className="flex gap-2 cursor-pointer mb-5">
                <input type="checkbox" className="mt-0.5 accent-[#E03455]" />
                <span className="text-xs text-[#6E7275] leading-relaxed">I acknowledge the CPA Section 36 promotional competition rules.</span>
              </label>

              <div className="flex gap-2.5">
                <button onClick={() => setStep(2)} className="btn btn-ghost flex-1 py-3">← BACK</button>
                <button onClick={submit} disabled={loading}
                  className="btn btn-red flex-[2] py-3.5 text-sm tracking-[2px]">
                  {loading ? 'Creating account...' : 'REGISTER & ENTER DRAW'}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-4 text-[13px] text-[#6E7275]">
          Already registered? <Link href="/login" className="text-[#E03455] font-semibold">Log in</Link>
        </p>
      </div>
    </section>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
