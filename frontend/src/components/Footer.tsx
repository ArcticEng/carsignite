import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-10 px-5 bg-[#2A2A2A] border-t border-[rgba(224,52,85,.05)]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-5 mb-5">
          <div className="max-w-[240px]">
            <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" className="h-6 mb-2.5" />
            <p className="text-xs text-[#6E7275] leading-relaxed">SA&apos;s premier supercar community. No purchase necessary to enter draws.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold tracking-[2px] text-[#6E7275] uppercase mb-1">Platform</span>
              <Link href="/#pricing" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Membership</Link>
              <Link href="/winners" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Winners</Link>
              <Link href="/signup" className="text-xs text-ci-green hover:text-ci-green">Register Free</Link>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold tracking-[2px] text-[#6E7275] uppercase mb-1">Legal</span>
              <Link href="/terms" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Competition Rules</Link>
              <Link href="/privacy" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Privacy Policy</Link>
              <Link href="/faq" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">FAQ</Link>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-bold tracking-[2px] text-[#6E7275] uppercase mb-1">Social</span>
              <a href="https://www.instagram.com/carsignite" target="_blank" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Instagram</a>
              <a href="https://www.facebook.com/carsignite" target="_blank" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">Facebook</a>
              <a href="https://x.com/carsignite" target="_blank" className="text-xs text-[#6E7275] hover:text-[#E7E5E6]">X</a>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-glass-border to-transparent my-4" />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-[#6B6B6B]">© 2026 CarsIgnite (Pty) Ltd · All rights reserved</span>
          <span className="text-[10px] text-[#6B6B6B]">CPA Section 36 · Independently Audited · POPIA Compliant</span>
        </div>
      </div>
    </footer>
  );
}
