'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Navbar() {
  const { member, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#pricing', label: 'Tiers' },
    ...(member ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 transition-all duration-400 ${
      scrolled ? 'bg-[rgba(3,3,5,.92)] backdrop-blur-3xl border-b border-ci-red/[0.06] shadow-[0_4px_30px_rgba(0,0,0,.4),0_0_30px_rgba(230,57,70,.03)]' : ''
    }`}>
      <Link href="/">
        <img
          src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_280,h_42,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/full_logo.png"
          alt="CarsIgnite"
          className="h-7 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{ filter: 'drop-shadow(0 0 8px rgba(230,57,70,.15))' }}
        />
      </Link>

      {/* Hamburger */}
      <button
        className="md:hidden flex flex-col gap-1 p-1.5 z-[101]"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
        <span className={`w-5 h-0.5 bg-white rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </button>

      {/* Links */}
      <div className={`flex items-center gap-1 md:flex-row ${
        menuOpen
          ? 'fixed top-0 right-0 w-[280px] h-dvh bg-[rgba(3,3,5,.97)] backdrop-blur-3xl flex-col items-start pt-20 px-7 gap-1 border-l border-ci-red/[0.08] shadow-[-10px_0_60px_rgba(0,0,0,.5)] z-50'
          : 'hidden md:flex'
      }`}>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              pathname === link.href
                ? 'text-white bg-ci-red/[0.08] font-semibold shadow-[0_0_12px_rgba(230,57,70,.06)]'
                : 'text-[#58586a] hover:text-[#9898a8] hover:bg-white/[0.03]'
            } ${menuOpen ? 'w-full py-3.5 text-sm rounded-xl' : ''}`}
          >
            {link.label}
          </Link>
        ))}

        {member ? (
          <div className={`flex items-center gap-2 ${menuOpen ? 'mt-4' : 'ml-2'}`}>
            {isAdmin && <span className="badge-admin">ADMIN</span>}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ci-red to-ci-red-dark flex items-center justify-center text-[11px] font-bold text-white shadow-[0_2px_12px_rgba(230,57,70,.3),0_0_20px_rgba(230,57,70,.1)]">
              {member.first_name?.[0]}{member.last_name?.[0]}
            </div>
            <button onClick={logout} className="text-[11px] text-[#58586a] hover:text-white transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        ) : (
          <div className={`flex items-center gap-1.5 ${menuOpen ? 'mt-4 flex-col w-full' : 'ml-1.5'}`}>
            <Link href="/login" className="px-4 py-2 rounded-lg text-xs text-[#58586a] hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="btn btn-red text-[11px] px-4 py-2">Join</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
