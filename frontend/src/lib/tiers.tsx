export interface Tier {
  id: string; name: string; price: number; icon: string;
  color: string; badge: string; prize: string; freq: string;
  entries: number; popular?: boolean;
  features: string[];
}

// All tiers including free (for badge display + backend reference)
export const TIERS: Record<string, Tier> = {
  free: {
    id: 'free', name: 'FREE', price: 0, icon: '✨',
    color: 'var(--text2)', badge: 'badge-free', prize: 'Monthly Draw',
    freq: 'Monthly', entries: 1,
    features: ['1× Monthly Draw Entry'],
  },
  ignite: {
    id: 'ignite', name: 'IGNITE', price: 49, icon: '🔥',
    color: 'var(--red)', badge: 'badge-ignite', prize: 'Luxury Watch',
    freq: 'Monthly', entries: 3,
    features: ['Live GPS Tracking', 'Group Chat', 'Event Calendar', '3× Monthly Draw Entries', 'Digital Badge'],
  },
  apex: {
    id: 'apex', name: 'APEX', price: 99, icon: '🏎️',
    color: 'var(--gold)', badge: 'badge-apex', prize: 'Supercar',
    freq: 'Monthly', entries: 10, popular: true,
    features: ['Everything in IGNITE', 'Priority Rally Signup', 'Track Day Access', '10× Monthly Draw Entries', 'VIP Events', 'Partner Discounts'],
  },
  dynasty: {
    id: 'dynasty', name: 'DYNASTY', price: 899, icon: '👑',
    color: 'var(--purple)', badge: 'badge-dynasty', prize: 'Luxury Home',
    freq: 'Quarterly', entries: 25,
    features: ['Everything in APEX', 'VIP Rallies', 'Private Track Sessions', '25× Quarterly Entries', 'Concierge', 'Black Card', 'Annual Gala'],
  },
};

// Paid tiers only (for pricing page + upgrade flow)
export const PAID_TIERS = Object.fromEntries(
  Object.entries(TIERS).filter(([k]) => k !== 'free')
);

export function TierBadge({ tier, small }: { tier: string; small?: boolean }) {
  const t = TIERS[tier] || TIERS.free;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${t.badge}`}
      style={small ? { fontSize: '9px', padding: '2px 6px' } : {}}>
      {t.icon} {t.name}
    </span>
  );
}

export function prizeImg(name: string, url?: string | null): string {
  if (url?.trim()) return url.trim();
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(name.replace(/ /g, ','))},luxury,premium`;
}

export function getCountdown() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diff = end.getTime() - now.getTime();
  return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) };
}
