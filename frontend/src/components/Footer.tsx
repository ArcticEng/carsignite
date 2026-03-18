export function Footer() {
  return (
    <footer className="py-10 px-5 bg-bg-2 border-t border-[rgba(230,57,70,.05)]">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-5 mb-5">
          <div className="max-w-[240px]">
            <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_200,h_30,al_c,q_85/full_logo.png" alt="CarsIgnite" className="h-6 mb-2.5" />
            <p className="text-xs text-[#58586a] leading-relaxed">SA&apos;s premier supercar community.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="https://www.instagram.com/carsignite" target="_blank" className="text-xs text-[#58586a] hover:text-[#9898a8]">Instagram</a>
            <a href="https://www.facebook.com/carsignite" target="_blank" className="text-xs text-[#58586a] hover:text-[#9898a8]">Facebook</a>
            <a href="https://x.com/carsignite" target="_blank" className="text-xs text-[#58586a] hover:text-[#9898a8]">X</a>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-glass-border to-transparent my-4" />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[10px] text-[#38384a]">© 2026 CarsIgnite (Pty) Ltd</span>
          <span className="text-[10px] text-[#38384a]">CPA Section 36 · Audited · POPIA</span>
        </div>
      </div>
    </footer>
  );
}
