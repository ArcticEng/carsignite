'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('ci_cookies_accepted')) setShow(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem('ci_cookies_accepted', '1'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-fade-up">
      <div className="max-w-[600px] mx-auto bg-[#2A2A2A] border border-glass-border rounded-2xl p-4 shadow-[0_-4px_30px_rgba(0,0,0,.4)] flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-[#6E7275] flex-1 min-w-[200px]">
          We use essential cookies for login sessions. No tracking cookies. <Link href="/privacy" className="text-[#E03455] underline">Privacy policy</Link>.
        </p>
        <button onClick={accept} className="btn btn-red px-5 py-2 text-[10px] shrink-0">
          GOT IT
        </button>
      </div>
    </div>
  );
}
