import Link from 'next/link';

export default function TermsPage() {
  return (
    <section className="min-h-dvh pt-24 pb-16 px-5">
      <div className="max-w-[720px] mx-auto animate-fade-up">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-[3px] text-ci-red uppercase">LEGAL</span>
          <h1 className="font-heading text-[clamp(28px,5vw,42px)] tracking-[4px] mt-2">COMPETITION RULES</h1>
          <p className="text-[#6E7275] mt-2 text-sm">CarsIgnite Promotional Competition Terms & Conditions</p>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-6 text-[14px] text-[#E7E5E6] leading-relaxed">
          
          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">1. PROMOTER</h2>
            <p>This promotional competition is run by CarsIgnite (Pty) Ltd, a company registered in South Africa.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">2. WHO CAN ENTER</h2>
            <p>The competition is open to all South African residents aged 18 years and older. Directors, employees, and immediate family members of CarsIgnite (Pty) Ltd are excluded from participation.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">3. NO PURCHASE NECESSARY</h2>
            <div className="bg-[rgba(34,204,110,.06)] border border-[rgba(34,204,110,.12)] rounded-xl p-4 my-3">
              <p className="font-bold text-ci-green text-sm mb-1">Free Entry Available</p>
              <p className="text-[13px] text-[#6E7275]">
                No purchase or payment is required to enter this competition. Any person may register for free 
                at <span className="text-white">carsignite.vercel.app</span> and receive one (1) entry into each monthly draw. 
                This competition complies with Section 36 of the Consumer Protection Act (No. 68 of 2008).
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">4. ENTRY METHODS</h2>
            <div className="glass-sm p-4 space-y-3 text-[13px]">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">✨</span>
                <div><span className="font-bold text-white">Free Entry</span> — Register on the website with name, email, and phone. Receive 1 entry per monthly draw. No payment required.</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🔥</span>
                <div><span className="font-bold text-white">Ignite Membership (R49/mo)</span> — 3 entries per monthly draw, plus GPS tracking, group chat, and events.</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🏎️</span>
                <div><span className="font-bold text-white">Apex Membership (R99/mo)</span> — 10 entries per monthly draw, plus priority events and partner discounts.</div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">👑</span>
                <div><span className="font-bold text-white">Dynasty Membership (R899/mo)</span> — 25 entries per quarterly draw, plus VIP experiences and concierge.</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">5. DRAW DATES</h2>
            <p>Monthly draws take place on the 1st of each calendar month. Quarterly draws for Dynasty members take place on the 1st of January, April, July, and October. The closing date for entries is 23:59 SAST on the last day of the preceding month.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">6. PRIZES</h2>
            <p>Prizes are determined by CarsIgnite and announced on the website prior to each draw. Prize values are estimated retail values at the time of the draw. Prizes are not transferable or exchangeable for cash unless stated otherwise. Current prizes are displayed on the <Link href="/#pricing" className="text-[#E03455] underline">website</Link>.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">7. WINNER SELECTION</h2>
            <p>Winners are selected by computerised random draw using cryptographically secure randomisation. Each draw is overseen and the results are independently auditable. All draw records including winner details, entry counts, and the randomisation audit reference are maintained for a minimum of three (3) years.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">8. ODDS OF WINNING</h2>
            <p>The odds of winning depend on the total number of entries received. Each free entry counts as 1 entry; paid membership entries are weighted as described in Section 4. The total number of entries and entrants for each draw is published on the website after the draw takes place. Current entry counts are available on the <Link href="/winners" className="text-[#E03455] underline">winners page</Link>.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">9. WINNER NOTIFICATION</h2>
            <p>Winners will be notified via email and in-app notification within 48 hours of the draw. Winners must respond within 14 days to claim their prize. Unclaimed prizes may be re-drawn at the discretion of CarsIgnite.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">10. WINNER ANNOUNCEMENT</h2>
            <p>Winner names and cities will be published on the CarsIgnite website and social media channels. Winners consent to their name and likeness being used for promotional purposes. Full winner history is publicly available on our <Link href="/winners" className="text-[#E03455] underline">winners page</Link>.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">11. TAX</h2>
            <p>Prize winnings are generally tax-free for the winner in South Africa. CarsIgnite records prize values as a marketing/promotional expense. Winners are advised to consult their own tax advisor.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">12. DATA PROTECTION</h2>
            <p>Personal information is collected and processed in accordance with the Protection of Personal Information Act (POPIA). Data is used solely for competition administration, member services, and marketing communications (with consent). Members may request deletion of their data at any time.</p>
          </div>

          <div>
            <h2 className="font-heading text-xl tracking-[2px] text-white mb-2">13. GENERAL</h2>
            <p>CarsIgnite reserves the right to amend these rules at any time. In the event of a dispute, the decision of CarsIgnite is final. This competition is governed by the laws of the Republic of South Africa. By entering, participants agree to these terms and conditions.</p>
          </div>

          <div className="h-px bg-[rgba(255,255,255,.08)] my-4" />
          
          <p className="text-[11px] text-[#6E7275]">
            Last updated: March 2026. These terms are published in compliance with Section 36 of the Consumer Protection Act, 2008 (Act No. 68 of 2008) and the Consumer Protection Act Regulations.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/signup" className="btn btn-red px-8 py-3.5 text-sm tracking-[2px]">
            REGISTER FREE →
          </Link>
        </div>
      </div>
    </section>
  );
}
