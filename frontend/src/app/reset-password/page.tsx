'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (!token) return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="glass-card p-8 max-w-md text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="font-heading text-2xl tracking-[3px] mb-2">INVALID LINK</h2>
        <p className="text-sm text-[#6E7275] mb-4">This reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="btn btn-red px-6 py-3 text-sm">REQUEST NEW LINK</Link>
      </div>
    </section>
  );

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="max-w-[420px] w-full animate-fade-up">
        <div className="text-center mb-7">
          <h2 className="font-heading text-3xl tracking-[3px]">NEW PASSWORD</h2>
        </div>
        {error && <div className="bg-[rgba(224,52,85,.08)] border border-[rgba(224,52,85,.2)] rounded-xl p-3 mb-4 text-xs text-ci-red-light">⚠ {error}</div>}
        <div className="glass-card p-7">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-lg mb-2">Password Reset!</h3>
              <p className="text-sm text-[#6E7275] mb-4">Your password has been updated. You can now log in.</p>
              <Link href="/login" className="btn btn-red px-8 py-3 text-sm">LOG IN</Link>
            </div>
          ) : (
            <>
              <div className="mb-3.5">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1.5 tracking-wider uppercase">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-3 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red outline-none" placeholder="Min 6 characters" />
              </div>
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[#6E7275] mb-1.5 tracking-wider uppercase">Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-3.5 py-3 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red outline-none" placeholder="Repeat password" />
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn btn-red w-full py-3.5 text-sm tracking-[2px]">
                {loading ? 'Resetting...' : 'SET NEW PASSWORD'}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() { return <Suspense><ResetForm /></Suspense>; }
