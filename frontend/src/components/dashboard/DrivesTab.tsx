'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/toast';

export function DrivesTab() {
  const { toast } = useToast();
  const [drives, setDrives] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏎️');
  const [joinCode, setJoinCode] = useState('');

  const load = async () => {
    try {
      const [dR, gR] = await Promise.all([api('/drives'), api('/groups/my')]);
      setDrives(dR.drives || []);
      setGroups(gR.groups || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const createGroup = async () => {
    if (!newName.trim()) { toast('Name required', 'error'); return; }
    try {
      const r = await api('/groups', { method: 'POST', body: { name: newName, description: newDesc || null, emoji: newEmoji || null } });
      toast(`Created! Code: ${r.group.invite_code}`, 'success');
      setShowCreate(false); setNewName(''); setNewDesc('');
      load();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) { toast('Enter code', 'error'); return; }
    try {
      await api('/groups/join', { method: 'POST', body: { inviteCode: joinCode.toUpperCase() } });
      toast('Joined!', 'success'); setShowJoin(false); setJoinCode('');
      load();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const regDrive = async (id: string) => {
    try {
      await api(`/drives/${id}/register`, { method: 'POST' });
      toast('Registered!', 'success'); load();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const emojis = ['🏎️', '☕', '🏁', '🌊', '⛰️', '🌇', '🔥', '👑'];

  return (
    <>
      {/* Groups */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap mb-3.5">
          <span className="font-bold text-[15px]">👥 My Drive Groups</span>
          <div className="flex gap-1.5">
            <button onClick={() => { setShowCreate(true); setShowJoin(false); }} className="btn btn-red px-4 py-2 text-[11px]">+ Create</button>
            <button onClick={() => { setShowJoin(true); setShowCreate(false); }} className="btn btn-ghost px-4 py-2 text-[11px]">Join</button>
          </div>
        </div>

        {showCreate && (
          <div className="glass-sm p-4 mb-3">
            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-[#58586a] mb-1 uppercase tracking-wider">Group Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Cape Town Breakfast Crew"
                className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" />
            </div>
            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-[#58586a] mb-1 uppercase tracking-wider">Description</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Saturday morning runs"
                className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm" />
            </div>
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#58586a] mb-1 uppercase tracking-wider">Emoji</label>
              <div className="flex gap-1.5">
                {emojis.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${newEmoji === e ? 'bg-[rgba(230,57,70,.15)] border border-ci-red' : 'bg-glass border border-glass-border'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createGroup} className="btn btn-red px-5 py-2 text-[11px]">Create Group</button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost px-5 py-2 text-[11px]">Cancel</button>
            </div>
          </div>
        )}

        {showJoin && (
          <div className="glass-sm p-4 mb-3">
            <label className="block text-[11px] font-semibold text-[#58586a] mb-1 uppercase tracking-wider">Invite Code</label>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="AB3XY9" className="w-full px-3 py-2.5 bg-glass border border-glass-border rounded-xl text-white text-sm uppercase mb-3" />
            <div className="flex gap-2">
              <button onClick={joinGroup} className="btn btn-red px-5 py-2 text-[11px]">Join</button>
              <button onClick={() => setShowJoin(false)} className="btn btn-ghost px-5 py-2 text-[11px]">Cancel</button>
            </div>
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-4 text-[#58586a] text-[13px]">No groups yet</div>
        ) : groups.map(g => (
          <div key={g.id} className="glass-sm flex items-center justify-between p-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">{g.emoji || '🏎️'}</span>
              <div>
                <div className="font-bold text-sm">{g.name}</div>
                {g.description && <div className="text-[11px] text-[#9898a8] mt-0.5">{g.description}</div>}
                <div className="text-[10px] text-[#58586a] mt-0.5">{g.member_count} members · Code: <code className="text-ci-gold-light">{g.invite_code}</code></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Drives */}
      <h3 className="font-bold text-[15px] mb-3">🏁 Upcoming Drives</h3>
      <div className="grid gap-3">
        {drives.map(d => (
          <div key={d.id} className="glass-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <div className="font-bold text-[15px]">{d.name}</div>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  <span className="text-xs text-[#58586a]">📅 {d.date}</span>
                  <span className="text-xs text-[#58586a]">🏎️ {d.registration_count || 0}/{d.max_cars}</span>
                  <span className="text-xs text-[#58586a]">📏 {d.distance || '—'}</span>
                </div>
                {d.description && <p className="text-xs text-[#58586a] mt-1.5 leading-relaxed">{d.description}</p>}
              </div>
              {d.is_registered ? (
                <span className="text-[9px] font-mono px-3 py-2 rounded bg-[rgba(34,204,110,.08)] text-ci-green font-bold">✓ Registered</span>
              ) : (
                <button onClick={() => regDrive(d.id)} className="btn btn-red px-5 py-2.5 text-[11px]">Register →</button>
              )}
            </div>
          </div>
        ))}
        {drives.length === 0 && <div className="text-center py-6 text-[#58586a] text-sm">No upcoming drives</div>}
      </div>
    </>
  );
}
