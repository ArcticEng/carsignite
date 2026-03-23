'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { TIERS, TierBadge } from '@/lib/tiers';

const TABS = [
  { id: 'members', label: 'Members', icon: '👥' },
  { id: 'subs', label: 'Subs', icon: '💳' },
  { id: 'prizes', label: 'Prizes', icon: '🎁' },
  { id: 'insights', label: 'Insights', icon: '🎯' },
  { id: 'promoters', label: 'Promoters', icon: '📣' },
  { id: 'draws', label: 'Draws', icon: '🎰' },
  { id: 'audit', label: 'Audit', icon: '📋' },
];

export default function AdminPage() {
  const { member, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState('members');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!member || !isAdmin)) router.push('/login');
  }, [loading, member, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) api('/admin/analytics').then(setAnalytics).catch(() => {});
  }, [isAdmin]);

  if (loading || !member || !isAdmin) return (
    <div className="min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin" /></div>
  );

  const a = analytics;

  return (
    <section className="min-h-dvh pt-[84px] px-4 pb-10 animate-fade-up">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
          <div>
            <h2 className="font-heading text-[clamp(20px,3vw,26px)] tracking-[3px]">ADMIN DASHBOARD</h2>
            <span className="bg-[rgba(224,52,85,.1)] text-ci-red-light text-[9px] px-2 py-0.5 border border-[rgba(224,52,85,.15)] rounded font-bold">ADMIN</span>
          </div>
        </div>

        {a && (
          <>
            <p className="text-xs text-[#6E7275] mb-4">
              {a.members.total} members · {a.draws.total} draws · R{a.revenue.mrr.toLocaleString()}/mo MRR
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {[
                { l: 'Members', v: a.members.total },
                { l: 'MRR', v: `R${a.revenue.mrr.toLocaleString()}`, c: 'text-ci-gold-light' },
                { l: 'Ignite', v: a.members.byTier.ignite, c: 'text-ci-red-light' },
                { l: 'Apex', v: a.members.byTier.apex, c: 'text-ci-gold-light' },
                { l: 'Dynasty', v: a.members.byTier.dynasty, c: 'text-ci-purple' },
                { l: 'Draws', v: a.draws.total, c: 'text-ci-green' },
              ].map(s => (
                <div key={s.l} className="glass-card p-4 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[rgba(224,52,85,.04)] blur-[25px]" />
                  <div className="text-[10px] font-semibold text-[#6E7275] tracking-[2px] uppercase mb-1">{s.l}</div>
                  <div className={`font-heading text-3xl tracking-wide ${s.c || ''}`}>{s.v}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-[3px] bg-[rgba(255,255,255,.02)] rounded-xl p-1 border border-glass-border overflow-x-auto mb-4">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${tab === tb.id ? 'bg-[rgba(224,52,85,.1)] text-white font-semibold shadow-[0_0_15px_rgba(224,52,85,.08)]' : 'text-[#6E7275] hover:text-[#E7E5E6]'}`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {tab === 'members' && <MembersTab toast={toast} />}
        {tab === 'subs' && <SubsTab />}
        {tab === 'prizes' && <PrizesConfigTab toast={toast} />}
        {tab === 'insights' && <InsightsTab />}
        {tab === 'promoters' && <PromotersTab toast={toast} />}
        {tab === 'draws' && <DrawsTab toast={toast} />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </section>
  );
}

function MembersTab({ toast }: { toast: any }) {
  const [members, setMembers] = useState<any[]>([]);
  const reload = () => api('/members').then(r => setMembers(r.members || [])).catch(() => {});
  useEffect(() => { reload(); }, []);

  const activate = async (id: string) => {
    try { const r = await api(`/admin/members/${id}/activate`, { method: 'POST' }); toast(r.message, 'success'); reload(); } catch (e: any) { toast(e.message, 'error'); }
  };
  const suspend = async (id: string) => {
    if (!confirm('Suspend this member?')) return;
    try { const r = await api(`/admin/members/${id}/suspend`, { method: 'POST' }); toast(r.message, 'success'); reload(); } catch (e: any) { toast(e.message, 'error'); }
  };
  const del = async (id: string) => {
    if (!confirm('Permanently remove this member?')) return;
    try { await api(`/members/${id}`, { method: 'DELETE' }); toast('Removed', 'success'); reload(); } catch (e: any) { toast(e.message, 'error'); }
  };

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(34,204,110,.08)] text-ci-green font-bold">ACTIVE</span>;
    if (s === 'pending') return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(240,192,64,.1)] text-ci-gold-light font-bold">PENDING</span>;
    if (s === 'suspended') return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(224,52,85,.1)] text-ci-red-light font-bold">SUSPENDED</span>;
    return <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-glass text-[#6E7275] font-bold">{(status || 'UNKNOWN').toUpperCase()}</span>;
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto p-1">
        <table className="w-full text-xs">
          <thead><tr className="text-[9px] text-[#6E7275] tracking-[2px] uppercase">
            <th className="p-3 text-left border-b border-glass-border">Name</th>
            <th className="p-3 text-left border-b border-glass-border">Email</th>
            <th className="p-3 text-left border-b border-glass-border">Tier</th>
            <th className="p-3 text-left border-b border-glass-border">Role</th>
            <th className="p-3 text-left border-b border-glass-border">Status</th>
            <th className="p-3 text-left border-b border-glass-border">Actions</th>
          </tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="hover:bg-[rgba(224,52,85,.02)]">
                <td className="p-3 font-semibold border-b border-[rgba(255,255,255,.03)]">{m.first_name} {m.last_name}</td>
                <td className="p-3 text-[#6E7275] border-b border-[rgba(255,255,255,.03)]">{m.email}</td>
                <td className="p-3 border-b border-[rgba(255,255,255,.03)]"><TierBadge tier={m.tier} small /></td>
                <td className="p-3 border-b border-[rgba(255,255,255,.03)]">{m.role === 'admin' ? <span className="bg-[rgba(224,52,85,.1)] text-ci-red-light text-[9px] px-1.5 py-0.5 rounded font-bold">ADMIN</span> : 'member'}</td>
                <td className="p-3 border-b border-[rgba(255,255,255,.03)]">{statusBadge(m.status)}</td>
                <td className="p-3 border-b border-[rgba(255,255,255,.03)]">
                  <div className="flex items-center gap-1.5">
                    {m.status !== 'active' && m.role !== 'admin' && (
                      <button onClick={() => activate(m.id)} className="text-[10px] px-2 py-1 rounded bg-[rgba(34,204,110,.1)] text-ci-green font-bold hover:bg-[rgba(34,204,110,.15)] transition-all" title="Activate member">✓ Activate</button>
                    )}
                    {m.status === 'active' && m.role !== 'admin' && (
                      <button onClick={() => suspend(m.id)} className="text-[10px] px-2 py-1 rounded bg-[rgba(240,192,64,.08)] text-ci-gold-light font-bold hover:bg-[rgba(240,192,64,.12)] transition-all" title="Suspend member">⏸ Suspend</button>
                    )}
                    {m.role !== 'admin' && (
                      <button onClick={() => del(m.id)} className="text-[10px] px-2 py-1 rounded bg-[rgba(224,52,85,.08)] text-ci-red font-bold hover:bg-[rgba(224,52,85,.12)] transition-all" title="Remove member">✕</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <div className="text-center py-10 text-[#6E7275] text-sm">No members</div>}
      </div>
    </div>
  );
}

function SubsTab() {
  const [subs, setSubs] = useState<any[]>([]);
  useEffect(() => { api('/subscriptions').then(r => setSubs(r.subscriptions || [])).catch(() => {}); }, []);
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto p-1">
        <table className="w-full text-xs">
          <thead><tr className="text-[9px] text-[#6E7275] tracking-[2px] uppercase">
            <th className="p-3 text-left border-b border-glass-border">Member</th>
            <th className="p-3 text-left border-b border-glass-border">Tier</th>
            <th className="p-3 text-left border-b border-glass-border">Amount</th>
            <th className="p-3 text-left border-b border-glass-border">Status</th>
          </tr></thead>
          <tbody>{subs.map(s => (
            <tr key={s.id} className="hover:bg-[rgba(224,52,85,.02)]">
              <td className="p-3 font-semibold border-b border-[rgba(255,255,255,.03)]">{s.first_name} {s.last_name}</td>
              <td className="p-3 border-b border-[rgba(255,255,255,.03)]"><TierBadge tier={s.tier} small /></td>
              <td className="p-3 text-ci-gold-light font-bold border-b border-[rgba(255,255,255,.03)]">R{s.amount}/mo</td>
              <td className="p-3 border-b border-[rgba(255,255,255,.03)]"><span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(34,204,110,.08)] text-ci-green">{(s.status || '').toUpperCase()}</span></td>
            </tr>
          ))}</tbody>
        </table>
        {subs.length === 0 && <div className="text-center py-10 text-[#6E7275] text-sm">No subscriptions</div>}
      </div>
    </div>
  );
}

function PrizesConfigTab({ toast }: { toast: any }) {
  const [prizes, setPrizes] = useState<any[]>([]);
  useEffect(() => { api('/prizes').then(r => setPrizes(r.prizes || [])).catch(() => {}); }, []);

  const save = async (tier: string) => {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value?.trim() || '';
    const n = g(`pz-${tier}-n`);
    if (!n) { toast('Name required', 'error'); return; }
    try {
      await api('/admin/prizes', { method: 'POST', body: {
        tier, prizeName: n, prizeDesc: g(`pz-${tier}-d`), prizeValue: parseFloat(g(`pz-${tier}-v`)) || 0,
        prizeImageUrl: g(`pz-${tier}-img`) || null,
        upcomingName: g(`pz-${tier}-un`) || null, upcomingDesc: g(`pz-${tier}-ud`) || null,
        upcomingValue: parseFloat(g(`pz-${tier}-uv`)) || 0, upcomingImageUrl: g(`pz-${tier}-uimg`) || null,
        drawDateHint: g(`pz-${tier}-dd`) || null,
      }});
      toast(`${TIERS[tier].name} prizes saved!`, 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const inp = "w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red";

  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-[15px] mb-2">🎁 Prize Configuration</h3>
      <p className="text-xs text-[#6E7275] mb-5">Set current and upcoming prizes per tier. Leave image blank for auto.</p>

      {['ignite', 'apex', 'dynasty'].map(tier => {
        const t = TIERS[tier];
        const p = prizes.find(x => x.tier === tier) || {} as any;
        return (
          <div key={tier} className="glass-sm p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5"><TierBadge tier={tier} /> <span className="text-xs text-[#6E7275]">{t.freq}</span></div>
              <span className="text-[9px] font-bold tracking-[2px] text-ci-red-light uppercase">CURRENT PRIZE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Prize Name *</label><input id={`pz-${tier}-n`} defaultValue={p.prize_name || t.prize} className={inp} /></div>
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Description</label><input id={`pz-${tier}-d`} defaultValue={p.prize_desc || ''} className={inp} /></div>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2.5 mb-3">
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Value (R)</label><input type="number" id={`pz-${tier}-v`} defaultValue={p.prize_value || 0} className={`${inp} w-[120px]`} /></div>
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Image URL</label><input id={`pz-${tier}-img`} defaultValue={p.prize_image_url || ''} placeholder="https://..." className={inp} /></div>
            </div>
            <div className="h-px bg-glass-border my-3" />
            <div className="mb-2"><span className="text-[9px] font-bold tracking-[2px] text-ci-gold-light uppercase">UPCOMING PRIZE (next draw)</span></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Upcoming Name</label><input id={`pz-${tier}-un`} defaultValue={p.upcoming_name || ''} placeholder="e.g. BMW M4" className={inp} /></div>
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Upcoming Desc</label><input id={`pz-${tier}-ud`} defaultValue={p.upcoming_desc || ''} className={inp} /></div>
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 mb-3">
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Value (R)</label><input type="number" id={`pz-${tier}-uv`} defaultValue={p.upcoming_value || 0} className={`${inp} w-[120px]`} /></div>
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Image URL</label><input id={`pz-${tier}-uimg`} defaultValue={p.upcoming_image_url || ''} className={inp} /></div>
              <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Draw Date</label><input id={`pz-${tier}-dd`} defaultValue={p.draw_date_hint || ''} placeholder="April 2026" className={`${inp} w-[130px]`} /></div>
            </div>
            <button onClick={() => save(tier)} className="btn btn-gold px-5 py-2 text-[11px]">Save {t.name} Prizes</button>
          </div>
        );
      })}
    </div>
  );
}

function DrawsTab({ toast }: { toast: any }) {
  const [draws, setDraws] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [result, setResult] = useState<string>('');
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    Promise.all([api('/draws?limit=20'), api('/members')]).then(([dR, mR]) => {
      setDraws(dR.draws || []);
      setMembers(mR.members || []);
    }).catch(() => {});
  }, []);

  const tierCount = (t: string) => members.filter(m => m.tier === t).length;

  const exec = async (tier: string) => {
    setSpinning(true); setResult('');
    await new Promise(r => setTimeout(r, 2000));
    try {
      const r = await api('/draws/execute', { method: 'POST', body: { tier } });
      setResult(`🎉 ${r.draw.winner_name} won the ${r.draw.prize_name}!`);
      toast(`${r.draw.winner_name} won!`, 'success');
      const dR = await api('/draws?limit=20');
      setDraws(dR.draws || []);
    } catch (e: any) { setResult(e.message); toast(e.message, 'error'); }
    setSpinning(false);
  };

  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-[15px] mb-4">🎰 Execute Draw</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(TIERS).map(([id, t]) => (
          <button key={id} onClick={() => exec(id)} disabled={tierCount(id) === 0 || spinning}
            className="btn flex-1 min-w-[100px] px-4 py-2.5 text-[11px] bg-bg-3 border border-glass-border text-white">
            {t.icon} {t.name} ({tierCount(id)})
          </button>
        ))}
      </div>

      <div className="glass-sm p-6 text-center min-h-[80px] flex items-center justify-center mb-4">
        {spinning ? (
          <div className="font-heading text-[22px] tracking-[3px] bg-gradient-to-r from-white via-ci-gold-light to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
            DRAWING...
          </div>
        ) : result ? (
          <div className="animate-fade-up"><div className="font-heading text-2xl text-ci-gold-light tracking-wider">{result}</div></div>
        ) : (
          <span className="text-[#6E7275] text-[13px]">Select tier above</span>
        )}
      </div>

      <div className="text-[11px] font-bold tracking-[3px] text-[#6E7275] uppercase mb-3">History ({draws.length})</div>
      {draws.map(d => (
        <div key={d.id} className="glass-sm flex flex-wrap items-center justify-between p-3 mb-1.5 gap-1.5">
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <div>
              <div className="font-bold text-xs">{d.winner_name}</div>
              <div className="text-[10px] text-[#6E7275]">{d.prize_name} · {new Date(d.draw_date).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <TierBadge tier={d.tier} small />
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(34,204,110,.08)] text-ci-green">{d.audit_ref}</span>
          </div>
        </div>
      ))}
      {draws.length === 0 && <div className="text-center py-4 text-[#6E7275] text-xs">No draws</div>}
    </div>
  );
}

function InsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/admin/insights').then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;
  if (!data) return <div className="glass-card p-7 text-center text-[#6E7275]">Could not load insights</div>;

  const TopList = ({ title, icon, items }: { title: string; icon: string; items: { name: string; count: number }[] }) => (
    <div className="glass-card p-5">
      <h4 className="font-bold text-sm mb-3">{icon} {title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-[#6E7275] text-center py-4">No data yet</p>
      ) : items.map((item: any, i: number) => (
        <div key={item.name} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,.06)] last:border-0">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-[rgba(224,52,85,.15)] text-ci-red-light' : 'bg-[rgba(255,255,255,.05)] text-[#6E7275]'}`}>{i + 1}</span>
            <span className="text-[13px] font-medium">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-[rgba(255,255,255,.06)] rounded-full overflow-hidden">
              <div className="h-full bg-ci-red rounded-full" style={{ width: `${Math.min(100, (item.count / (items[0]?.count || 1)) * 100)}%` }} />
            </div>
            <span className="text-[11px] text-[#6E7275] font-mono w-6 text-right">{item.count}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="glass-card p-5 mb-4">
        <h3 className="font-bold text-[15px] mb-1">🎯 Member Dream Insights</h3>
        <p className="text-xs text-[#6E7275] mb-4">Based on {data.totals?.withPreferences || 0} members who shared preferences. Use this to decide upcoming prizes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <TopList title="Top Dream Cars" icon="🏎️" items={data.topDreamCars || []} />
        <TopList title="Top Dream Watches" icon="⌚" items={data.topDreamWatches || []} />
        <TopList title="Top Dream Houses" icon="🏠" items={data.topDreamHouses || []} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[rgba(255,255,255,.06)]">
          <h4 className="font-bold text-sm">All Member Preferences</h4>
        </div>
        <div className="overflow-x-auto p-1">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] text-[#6E7275] tracking-[2px] uppercase">
              <th className="p-3 text-left border-b border-glass-border">Member</th>
              <th className="p-3 text-left border-b border-glass-border">Tier</th>
              <th className="p-3 text-left border-b border-glass-border">🚗 Current Car</th>
              <th className="p-3 text-left border-b border-glass-border">🏎️ Dream Car</th>
              <th className="p-3 text-left border-b border-glass-border">⌚ Dream Watch</th>
              <th className="p-3 text-left border-b border-glass-border">🏠 Dream House</th>
            </tr></thead>
            <tbody>
              {(data.members || []).map((m: any, i: number) => (
                <tr key={i} className="hover:bg-[rgba(224,52,85,.02)]">
                  <td className="p-3 font-semibold border-b border-[rgba(255,255,255,.03)]">{m.first_name} {m.last_name}</td>
                  <td className="p-3 border-b border-[rgba(255,255,255,.03)]"><TierBadge tier={m.tier} small /></td>
                  <td className="p-3 text-[#E7E5E6] border-b border-[rgba(255,255,255,.03)]">{m.current_car || '—'}</td>
                  <td className="p-3 text-[#E7E5E6] border-b border-[rgba(255,255,255,.03)]">{m.dream_car || '—'}</td>
                  <td className="p-3 text-[#E7E5E6] border-b border-[rgba(255,255,255,.03)]">{m.dream_watch || '—'}</td>
                  <td className="p-3 text-[#E7E5E6] border-b border-[rgba(255,255,255,.03)]">{m.dream_house || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.members || []).length === 0 && <div className="text-center py-10 text-[#6E7275] text-sm">No member preferences yet</div>}
        </div>
      </div>
    </>
  );
}

function PromotersTab({ toast }: { toast: any }) {
  const [promoters, setPromoters] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewReferrals, setViewReferrals] = useState<{ promoter: any; referrals: any[] } | null>(null);
  const [form, setForm] = useState<any>({ discountPct: 10, commissionPct: 5 });
  const [loading, setLoading] = useState(true);

  const reload = () => api('/admin/promoters').then(r => setPromoters(r.promoters || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const save = async () => {
    if (!form.name || !form.code) { toast('Name and code required', 'error'); return; }
    try {
      if (form.id) {
        await api(`/admin/promoters/${form.id}`, { method: 'PUT', body: form });
        toast('Promoter updated', 'success');
      } else {
        await api('/admin/promoters', { method: 'POST', body: form });
        toast('Promoter created', 'success');
      }
      setShowForm(false); setForm({ discountPct: 10, commissionPct: 5 }); reload();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this promoter?')) return;
    try { await api(`/admin/promoters/${id}`, { method: 'DELETE' }); toast('Deleted', 'success'); reload(); } catch (e: any) { toast(e.message, 'error'); }
  };

  const viewRefs = async (p: any) => {
    try {
      const r = await api(`/admin/promoters/${p.id}/referrals`);
      setViewReferrals({ promoter: p, referrals: r.referrals || [] });
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const inp = "w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red outline-none";

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;

  // View referrals modal
  if (viewReferrals) return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[15px]">📣 {viewReferrals.promoter.name} — Referrals</h3>
          <p className="text-xs text-[#6E7275]">Code: <code className="text-ci-gold-light">{viewReferrals.promoter.code}</code> · {viewReferrals.referrals.length} referrals</p>
        </div>
        <button onClick={() => setViewReferrals(null)} className="btn btn-ghost px-4 py-2 text-[11px]">← Back</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-[9px] text-[#6E7275] tracking-[2px] uppercase">
            <th className="p-3 text-left border-b border-glass-border">Member</th>
            <th className="p-3 text-left border-b border-glass-border">Email</th>
            <th className="p-3 text-left border-b border-glass-border">Tier</th>
            <th className="p-3 text-left border-b border-glass-border">Discount</th>
            <th className="p-3 text-left border-b border-glass-border">Converted</th>
            <th className="p-3 text-left border-b border-glass-border">Date</th>
          </tr></thead>
          <tbody>{viewReferrals.referrals.map((r: any) => (
            <tr key={r.id}>
              <td className="p-3 font-semibold border-b border-[rgba(255,255,255,.03)]">{r.first_name} {r.last_name}</td>
              <td className="p-3 text-[#6E7275] border-b border-[rgba(255,255,255,.03)]">{r.email}</td>
              <td className="p-3 border-b border-[rgba(255,255,255,.03)]"><TierBadge tier={r.tier} small /></td>
              <td className="p-3 text-ci-green border-b border-[rgba(255,255,255,.03)]">{r.discount_pct}%</td>
              <td className="p-3 border-b border-[rgba(255,255,255,.03)]">{r.converted ? <span className="text-ci-green font-bold">✓ Paid</span> : <span className="text-[#6E7275]">Pending</span>}</td>
              <td className="p-3 text-[#6E7275] border-b border-[rgba(255,255,255,.03)]">{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
        {viewReferrals.referrals.length === 0 && <div className="text-center py-8 text-[#6E7275] text-sm">No referrals yet</div>}
      </div>
    </div>
  );

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[15px]">📣 Promoters / Affiliate Codes</h3>
          <p className="text-xs text-[#6E7275]">Create discount codes for Instagram promoters. Track referrals and commissions.</p>
        </div>
        <button onClick={() => { setForm({ discountPct: 10, commissionPct: 5 }); setShowForm(!showForm); }} className="btn btn-red px-4 py-2 text-[11px]">+ Add Promoter</button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="glass-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Name *</label><input value={form.name||''} onChange={e => setForm({...form, name: e.target.value})} className={inp} placeholder="e.g. @supercar_SA" /></div>
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Instagram Handle</label><input value={form.instagram||''} onChange={e => setForm({...form, instagram: e.target.value})} className={inp} placeholder="@handle" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Discount Code *</label><input value={form.code||''} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className={`${inp} uppercase`} placeholder="SUPERCAR20" /></div>
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">User Discount %</label><input type="number" value={form.discountPct||10} onChange={e => setForm({...form, discountPct: parseFloat(e.target.value)})} className={inp} /></div>
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Commission %</label><input type="number" value={form.commissionPct||5} onChange={e => setForm({...form, commissionPct: parseFloat(e.target.value)})} className={inp} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Email</label><input value={form.email||''} onChange={e => setForm({...form, email: e.target.value})} className={inp} /></div>
            <div><label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Phone</label><input value={form.phone||''} onChange={e => setForm({...form, phone: e.target.value})} className={inp} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn btn-gold px-5 py-2 text-[11px]">{form.id ? 'Update' : 'Create'} Promoter</button>
            <button onClick={() => setShowForm(false)} className="btn btn-ghost px-4 py-2 text-[11px]">Cancel</button>
          </div>
        </div>
      )}

      {/* Promoter list */}
      {promoters.length === 0 ? (
        <div className="text-center py-10 text-[#6E7275] text-sm">No promoters yet. Click "+ Add Promoter" to create one.</div>
      ) : (
        <div className="space-y-2">
          {promoters.map(p => (
            <div key={p.id} className="glass-sm p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{p.name}</span>
                  {p.instagram && <span className="text-[11px] text-[#6E7275]">@{p.instagram}</span>}
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${p.status === 'active' ? 'bg-[rgba(34,204,110,.08)] text-ci-green' : 'bg-[rgba(224,52,85,.08)] text-ci-red'}`}>{p.status?.toUpperCase()}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-[#6E7275]">
                  <span>Code: <code className="text-ci-gold-light font-bold">{p.code}</code></span>
                  <span>Discount: <span className="text-ci-green font-bold">{p.discount_pct}%</span></span>
                  <span>Commission: <span className="text-white font-bold">{p.commission_pct}%</span></span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center">
                <div><div className="font-heading text-xl">{p.total_referrals}</div><div className="text-[9px] text-[#6E7275] uppercase">Referrals</div></div>
                <div><div className="font-heading text-xl text-ci-gold-light">R{(p.total_revenue || 0).toLocaleString()}</div><div className="text-[9px] text-[#6E7275] uppercase">Revenue</div></div>
                <div><div className="font-heading text-xl text-ci-green">R{(p.total_commission || 0).toLocaleString()}</div><div className="text-[9px] text-[#6E7275] uppercase">Owed</div></div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => viewRefs(p)} className="text-[10px] px-2 py-1 rounded bg-[rgba(255,255,255,.05)] text-[#E7E5E6] font-bold hover:bg-[rgba(255,255,255,.08)] transition-all">View Referrals</button>
                <button onClick={() => { setForm({ ...p, discountPct: p.discount_pct, commissionPct: p.commission_pct }); setShowForm(true); }} className="text-[10px] px-2 py-1 rounded bg-[rgba(240,192,64,.08)] text-ci-gold-light font-bold hover:bg-[rgba(240,192,64,.12)] transition-all">Edit</button>
                <button onClick={() => del(p.id)} className="text-[10px] px-2 py-1 rounded bg-[rgba(224,52,85,.08)] text-ci-red font-bold hover:bg-[rgba(224,52,85,.12)] transition-all">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    api('/admin/audit').then(r => { setLogs(r.logs || []); setTotal(r.total); }).catch(() => {});
  }, []);

  return (
    <div className="glass-card p-4">
      <div className="text-[11px] font-bold tracking-[3px] text-[#6E7275] uppercase mb-3">Audit Trail ({total})</div>
      {logs.slice(0, 50).map((l, i) => (
        <div key={i} className="flex flex-wrap items-center justify-between py-1.5 border-b border-glass-border gap-1 text-[11px]">
          <div>
            <span className="font-bold text-ci-gold-light font-mono text-[10px]">{l.action}</span>
            <span className="text-[#6E7275] ml-1.5 font-mono text-[9px]">{(l.details || '').slice(0, 80)}</span>
          </div>
          <span className="text-[9px] text-[#6E7275]">{new Date(l.created_at).toLocaleString()}</span>
        </div>
      ))}
      {logs.length === 0 && <div className="text-center py-10 text-[#6E7275] text-sm">No logs</div>}
    </div>
  );
}
