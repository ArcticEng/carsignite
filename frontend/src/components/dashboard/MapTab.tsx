'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { TierBadge } from '@/lib/tiers';

export function MapTab() {
  const { member } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/groups/my').then(r => setGroups(r.groups || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeGroup) return;
    const refresh = () => api(`/groups/${activeGroup}/locations`).then(r => {
      setPositions(r.positions || []);
      setGroupInfo(r.group);
    }).catch(() => {});
    refresh();
    const iv = setInterval(refresh, 10000);
    return () => clearInterval(iv);
  }, [activeGroup]);

  const shareLoc = () => {
    if (!navigator.geolocation) { toast('Geolocation not supported', 'error'); return; }
    toast('Sharing...', 'info');
    navigator.geolocation.getCurrentPosition(async (p) => {
      try {
        await api(`/groups/${activeGroup}/location`, { method: 'POST', body: { lat: p.coords.latitude, lng: p.coords.longitude, speed: p.coords.speed || 0, heading: p.coords.heading || 0 } });
        toast('Location shared!', 'success');
      } catch (e: any) { toast(e.message, 'error'); }
    }, () => toast('Location denied', 'error'), { enableHighAccuracy: true });
  };

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;

  if (groups.length === 0) return (
    <div className="glass-card p-7 text-center py-14">
      <div className="text-4xl opacity-30 mb-3">📍</div>
      <div className="font-semibold text-[#E7E5E6]">No Groups Yet</div>
      <p className="text-[13px] text-[#6E7275] mt-1">Join or create a group (Drives tab). Location sharing is group-only.</p>
    </div>
  );

  if (!activeGroup) return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-[15px] mb-1.5">📍 Live Location</h3>
      <p className="text-[13px] text-[#6E7275] mb-4">Select a group to track members. Only your group members can see you.</p>
      {groups.map(g => (
        <button key={g.id} onClick={() => setActiveGroup(g.id)}
          className="w-full glass-sm flex items-center justify-between p-3.5 mb-2 text-left hover:border-[rgba(224,52,85,.2)] transition-all">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">{g.emoji || '🏎️'}</span>
            <div><div className="font-bold text-sm">{g.name}</div><div className="text-[11px] text-[#6E7275]">{g.member_count} members</div></div>
          </div>
          <span className="text-ci-red text-[13px]">Track →</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveGroup(null)} className="text-base">←</button>
          <span className="font-bold text-sm">{groupInfo?.emoji} {groupInfo?.name || 'Group'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={shareLoc} className="btn btn-red px-4 py-2 text-[11px]">📍 Share Location</button>
          <span className="text-[9px] font-mono px-2 py-1 rounded bg-[rgba(34,204,110,.08)] text-ci-green">● {positions.length} live</span>
        </div>
      </div>

      <div className="w-full rounded-xl border border-[rgba(224,52,85,.08)] bg-bg-2 flex items-center justify-center" style={{ height: 'min(420px, 55vh)' }}>
        <div className="text-center">
          <span className="text-4xl block mb-2">🗺️</span>
          <span className="text-[#6E7275] text-sm">Set GOOGLE_MAPS_API_KEY in .env</span>
        </div>
      </div>

      <div className="mt-3">
        {positions.length === 0 ? (
          <div className="text-center py-3 text-xs text-[#6E7275]">No members sharing. Click &quot;Share Location&quot; to start!</div>
        ) : positions.map(p => {
          const ago = Math.round((Date.now() - new Date(p.recorded_at).getTime()) / 60000);
          return (
            <div key={p.id} className="glass-sm flex items-center justify-between px-3 py-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-ci-red">●</span>
                <span className="font-semibold text-xs">{p.first_name} {p.last_name}</span>
                <TierBadge tier={p.tier} small />
              </div>
              <div className="text-[10px] text-[#6E7275]">{ago}m ago{p.speed > 0 ? ` · ${Math.round(p.speed)}km/h` : ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
