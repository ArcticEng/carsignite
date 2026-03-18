'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';

export function Nav() {
  const { member, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navClass = scrolled
    ? 'bg-[rgba(3,3,5,.92)] backdrop-blur-xl border-b border-[rgba(230,57,70,.06)] shadow-[0_4px_30px_rgba(0,0,0,.4),0_0_30px_rgba(230,57,70,.03)]'
    : '';

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg cursor-pointer text-xs font-medium tracking-wide transition-all duration-250 ${
      pathname === path ? 'text-white bg-[rgba(230,57,70,.08)] font-semibold shadow-[0_0_12px_rgba(230,57,70,.06)]' : 'text-[#58586a] hover:text-[#9898a8] hover:bg-[rgba(255,255,255,.03)]'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-3.5 flex items-center justify-between transition-all duration-400 ${navClass}`}>
      <Link href="/">
        <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_280,h_42,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/full_logo.png"
          alt="CarsIgnite" className="h-7 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{ filter: 'drop-shadow(0 0 8px rgba(230,57,70,.15))' }} />
      </Link>

      {/* Hamburger */}
      <button className="flex flex-col gap-1 p-1.5 sm:hidden z-[101]" onClick={() => setMenuOpen(!menuOpen)}>
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
      </button>

      {/* Links */}
      <div className={`flex items-center gap-1 max-sm:fixed max-sm:top-0 max-sm:w-[280px] max-sm:h-dvh max-sm:bg-[rgba(3,3,5,.97)] max-sm:backdrop-blur-xl max-sm:flex-col max-sm:items-start max-sm:pt-20 max-sm:px-7 max-sm:gap-1 max-sm:transition-all max-sm:duration-350 max-sm:border-l max-sm:border-[rgba(230,57,70,.08)] max-sm:shadow-[-10px_0_60px_rgba(0,0,0,.5)] ${menuOpen ? 'max-sm:right-0' : 'max-sm:right-[-100%]'}`}>
        <Link href="/" className={`${linkClass('/')} max-sm:w-full max-sm:py-3.5 max-sm:text-sm`}>Home</Link>
        <Link href="/#pricing" className={`${linkClass('/pricing')} max-sm:w-full max-sm:py-3.5 max-sm:text-sm`}>Tiers</Link>

        {member ? (
          <>
            <Link href="/dashboard" className={`${linkClass('/dashboard')} max-sm:w-full max-sm:py-3.5 max-sm:text-sm`}>Dashboard</Link>
            {isAdmin && <Link href="/admin" className={`${linkClass('/admin')} max-sm:w-full max-sm:py-3.5 max-sm:text-sm`}>Admin</Link>}
            <div className="flex items-center gap-2 max-sm:mt-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white ${isAdmin ? 'bg-gradient-to-br from-ci-red to-ci-red-dark ring-2 ring-ci-red/30' : 'bg-gradient-to-br from-ci-red to-ci-red-dark'} shadow-[0_2px_12px_rgba(230,57,70,.3)]`}>
                {member.first_name?.[0]}{member.last_name?.[0]}
              </div>
              <button onClick={logout} className="text-[11px] text-[#58586a] hover:text-[#9898a8]">Log out</button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5 max-sm:mt-4">
            <Link href="/login" className={`${linkClass('/login')} max-sm:w-full`}>Log in</Link>
            <Link href="/signup" className="btn btn-red px-5 py-2.5 text-[11px]">Join</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
