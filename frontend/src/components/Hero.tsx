import Link from 'next/link';

export function Hero() {
  return (
    <section className="min-h-dvh flex items-center justify-center text-center px-5 pt-24 pb-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(180deg,rgba(30,30,30,.15) 0%,rgba(30,30,30,.85) 55%,#1E1E1E 100%), url('https://static.wixstatic.com/media/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg/v1/fill/w_1920,h_1080,al_c,q_90/bc5beb_508766728ef645e9a0cef7b5ba3f2857~mv2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      {/* Orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-ci-red opacity-[.07] -top-[150px] -right-[100px] blur-[100px] animate-float pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-ci-gold opacity-[.04] -bottom-20 -left-20 blur-[100px] animate-float pointer-events-none" style={{ animationDirection: 'alternate-reverse' }} />

      <div className="relative z-10 max-w-[700px]">
        <div className="animate-fade-up">
          <img src="https://static.wixstatic.com/media/bc5beb_f2c426011b1b4ab787724cf5492017d3~mv2.png/v1/fill/w_440,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/full_logo.png"
            alt="CarsIgnite" className="h-[clamp(36px,5vw,50px)] mx-auto mb-2" />
        </div>
        <h1 className="font-heading text-[clamp(52px,10vw,120px)] tracking-[8px] leading-[.88] my-6 animate-fade-up-d1">
          IGNITE YOUR<br />
          <span className="bg-gradient-to-br from-[#E8476A] to-[#E03455] bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 40px rgba(224,52,85,.4))' }}>
            PASSION
          </span>
        </h1>
        <p className="text-[clamp(14px,2vw,17px)] text-[#E7E5E6] max-w-[520px] mx-auto mb-10 leading-relaxed font-light animate-fade-up-d2">
          South Africa&apos;s premier supercar community. Live GPS tracking, crew chat, group drives, and luxury giveaways.
        </p>
        <div className="flex flex-wrap justify-center gap-3 animate-fade-up-d3">
          <Link href="/signup" className="btn btn-red px-8 py-3.5 text-sm tracking-[2px]">REGISTER FREE — 1 ENTRY</Link>
          <a href="#pricing" className="btn btn-ghost px-8 py-3.5 text-sm tracking-[2px]">VIEW SUBSCRIPTIONS</a>
        </div>
        <p className="text-[11px] text-[#6E7275] mt-3 animate-fade-up-d3">
          No purchase necessary to enter. <Link href="/terms" className="text-[#E03455] underline">Competition rules</Link>.
        </p>
      </div>
    </section>
  );
}
