import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <section className="min-h-dvh pt-24 pb-16 px-5">
      <div className="max-w-[720px] mx-auto animate-fade-up">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-red uppercase">LEGAL</span>
          <h1 className="font-heading text-[clamp(28px,5vw,42px)] tracking-[4px] mt-2">PRIVACY POLICY</h1>
          <p className="text-[#6E7275] mt-2 text-sm">How CarsIgnite collects, uses, and protects your data</p>
        </div>
        <div className="glass-card p-6 md:p-8 space-y-5 text-[14px] text-[#E7E5E6] leading-relaxed">
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">1. WHO WE ARE</h2>
            <p>CarsIgnite (Pty) Ltd (&quot;we&quot;, &quot;us&quot;) is a South African company that operates carsignite.co.za. We are the responsible party as defined in the Protection of Personal Information Act (POPIA), Act 4 of 2013.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">2. INFORMATION WE COLLECT</h2>
            <p>When you register or use our platform, we collect: name, email address, phone number, SA ID number (optional), city and province, vehicle information, dream preferences (car, watch, house), GPS location (when shared in drives), and payment information (processed by PayFast — we do not store card details).</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">3. HOW WE USE YOUR DATA</h2>
            <p>We use your information to: administer your account and subscription, enter you into prize draws, provide community features (chat, drives, GPS tracking), communicate service updates and draw results, improve our prizes based on member preferences, process payments via PayFast, and comply with legal obligations including CPA Section 36 record-keeping.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">4. LEGAL BASIS (POPIA)</h2>
            <p>We process your data on the following bases: consent (provided at registration), contract (subscription agreement), legitimate interest (platform improvement), and legal obligation (competition records, tax compliance).</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">5. DATA SHARING</h2>
            <p>We share data only with: PayFast (payment processing), our independent auditor (draw verification — anonymised where possible), and law enforcement (if legally required). We never sell your personal information to third parties.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">6. DATA RETENTION</h2>
            <p>Account data is kept while your account is active. Competition records (draw results, entries, winners) are kept for 3 years as required by the CPA. Payment records are kept for 5 years for tax compliance. You may request deletion of your account at any time.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">7. YOUR RIGHTS (POPIA)</h2>
            <p>You have the right to: access your personal information, correct inaccurate data, request deletion of your data, object to processing, withdraw consent, and lodge a complaint with the Information Regulator. Contact us at privacy@carsignite.co.za to exercise these rights.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">8. SECURITY</h2>
            <p>We protect your data using: encrypted connections (TLS/SSL), hashed passwords (bcrypt), secure payment processing via PayFast (PCI DSS Level 1), access controls and audit logging, and regular security reviews.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">9. COOKIES</h2>
            <p>We use essential cookies for authentication (login sessions) and functional cookies for preferences. We do not use tracking or advertising cookies. You may disable cookies in your browser settings.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">10. CHANGES</h2>
            <p>We may update this policy from time to time. Material changes will be communicated via email or in-app notification. Continued use of the platform after changes constitutes acceptance.</p>
          </div>
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">11. CONTACT</h2>
            <p>Information Officer: CarsIgnite (Pty) Ltd<br />Email: privacy@carsignite.co.za<br />Information Regulator: <a href="https://inforegulator.org.za" target="_blank" className="text-[#E03455] underline">inforegulator.org.za</a></p>
          </div>
          <div className="h-px bg-[rgba(255,255,255,.08)] my-4" />
          <p className="text-[11px] text-[#6E7275]">Last updated: March 2026. This privacy policy complies with POPIA (Act 4 of 2013).</p>
        </div>
      </div>
    </section>
  );
}
