'use client';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) { setError('Enter your email'); return; }
    setLoading(true); setError('');
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email } });
      setSent(true);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="max-w-[420px] w-full animate-fade-up">
        <div className="text-center mb-7">
          <h2 className="font-heading text-3xl tracking-[3px]">RESET PASSWORD</h2>
          <p className="text-sm text-[#6E7275] mt-2">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {error && (
          <div className="bg-[rgba(224,52,85,.08)] border border-[rgba(224,52,85,.2)] rounded-xl p-3 mb-4 text-xs text-ci-red-light">⚠ {error}</div>
        )}

        <div className="glass-card p-7">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-lg mb-2">Check Your Email</h3>
              <p className="text-sm text-[#6E7275] mb-4">If <span className="text-white font-medium">{email}</span> is registered, you&apos;ll receive a password reset link shortly.</p>
              <p className="text-xs text-[#6E7275]">Didn&apos;t receive it? Check spam or <button onClick={() => { setSent(false); setEmail(''); }} className="text-[#E03455] underline">try again</button>.</p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1.5 tracking-wider uppercase">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-3.5 py-3 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red focus:shadow-[0_0_0_3px_rgba(224,52,85,.12)] outline-none"
                  placeholder="your@email.com" />
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn btn-red w-full py-3.5 text-sm tracking-[2px]">
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
            </>
          )}
        </div>
        <p className="text-center mt-4 text-[13px] text-[#6E7275]">
          Remember your password? <Link href="/login" className="text-[#E03455] font-semibold">Log in</Link>
        </p>
      </div>
    </section>
  );
}
