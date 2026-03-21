import { TIERS } from '@/lib/tiers';

export function TierBadge({ tier, small }: { tier: string; small?: boolean }) {
  const t = TIERS[tier] || TIERS.free;
  const cls = tier === 'free' ? 'badge-free' : tier === 'ignite' ? 'badge-ignite' : tier === 'apex' ? 'badge-apex' : 'badge-dynasty';
  return (
    <span className={`badge-tier ${cls} ${small ? 'text-[9px] px-1.5 py-0' : ''}`}>
      {t.icon} {t.name}
    </span>
  );
}

export function Spinner() {
  return <div className="w-7 h-7 border-3 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto shadow-[0_0_15px_rgba(224,52,85,.1)]" style={{ borderWidth: 3 }} />;
}

export function Empty({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="text-[44px] mb-3 opacity-30">{icon}</div>
      <div className="text-base font-semibold text-[#E7E5E6] mb-1">{title}</div>
      {desc && <div className="text-[13px] text-[#6E7275]">{desc}</div>}
    </div>
  );
}
