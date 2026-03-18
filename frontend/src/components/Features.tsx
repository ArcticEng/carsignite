const FEATURES = [
  { icon: '📍', title: 'Live GPS Tracking', desc: 'Real-time crew locations on Google Maps during group drives.' },
  { icon: '💬', title: 'Crew Chat', desc: 'In-drive messaging. Coordinate stops, share the hype, stay connected.' },
  { icon: '🏁', title: 'Rallies & Track Days', desc: 'Register for curated supercar events across South Africa.' },
  { icon: '🎁', title: 'Giveaway Draws', desc: 'Win watches, supercars, and homes as a thank-you for subscribing.' },
  { icon: '👥', title: 'Drive Groups', desc: 'Create private crews. Invite friends, share locations, plan runs.' },
  { icon: '🔒', title: 'Secure & Compliant', desc: 'PayFast payments, POPIA privacy, CPA Section 36 giveaways.' },
];

export function Features() {
  return (
    <section className="py-20 px-5 bg-bg-2 relative">
      <div className="max-w-[1120px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-red uppercase">THE PLATFORM</span>
          <h2 className="font-heading text-[clamp(30px,4.5vw,44px)] tracking-[3px] mt-2">BUILT FOR THE ROAD</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-card p-6 animate-fade-up" style={{ animationDelay: `${(i % 4) * 0.05}s` }}>
              <span className="text-[28px] block mb-2.5">{f.icon}</span>
              <h3 className="text-[15px] font-bold mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[#9898a8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
