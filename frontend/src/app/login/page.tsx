'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) { setError('Enter your email'); return; }
    setLoading(true); setError('');
    try {
      const m = await login(email, password);
      const dest = m.role === 'admin' ? '/admin' : '/dashboard';
      toast(`Welcome back${m.role === 'admin' ? ' (Admin)' : ''}!`, 'success');
      setTimeout(() => router.push(dest), 300);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <section className="min-h-dvh flex items-center justify-center px-5 pt-24">
      <div className="max-w-[420px] w-full animate-fade-up">
        <div className="text-center mb-7">
          <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_280,h_42,al_c,q_85/full_logo.png"
            className="h-9 mx-auto mb-4" alt="CarsIgnite" />
          <h2 className="font-heading text-3xl tracking-[3px]">LOG IN</h2>
        </div>

        {error && (
          <div className="bg-[rgba(224,52,85,.08)] border border-[rgba(224,52,85,.2)] rounded-xl p-3 mb-4 text-xs text-ci-red-light">
            ⚠ {error}
          </div>
        )}

        <div className="glass-card p-7">
          <div className="mb-3.5">
            <label className="block text-[11px] font-semibold text-[#6E7275] mb-1.5 tracking-wider uppercase">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-3 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red focus:shadow-[0_0_0_3px_rgba(224,52,85,.12)]"
              placeholder="your@email.com" />
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-[#6E7275] mb-1.5 tracking-wider uppercase">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3.5 py-3 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red focus:shadow-[0_0_0_3px_rgba(224,52,85,.12)]"
              placeholder="Password" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="btn btn-red w-full py-3.5 text-sm tracking-[2px]">
            {loading ? 'Logging in...' : 'LOG IN'}
          </button>
          <p className="text-center mt-4 text-[13px] text-[#6E7275]">
            No account? <Link href="/signup" className="text-ci-green font-semibold">Register free</Link> for 1 draw entry, or <Link href="/#pricing" className="text-ci-red font-semibold hover:text-ci-red-light">subscribe for bonus entries</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
