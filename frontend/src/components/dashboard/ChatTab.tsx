'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { TierBadge } from '@/lib/tiers';

export function ChatTab() {
  const { member } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api('/groups/my').then(r => setGroups(r.groups || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMessages = async (gid: string) => {
    setActiveGroup(gid);
    try {
      const r = await api(`/groups/${gid}/messages?limit=100`);
      setMessages(r.messages || []);
      setGroupName(r.group?.name || 'Group');
      setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }), 50);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const send = async () => {
    if (!input.trim() || !activeGroup) return;
    const msg = input.trim(); setInput('');
    try {
      await api(`/groups/${activeGroup}/messages`, { method: 'POST', body: { content: msg } });
      loadMessages(activeGroup);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const delMsg = async (mid: string) => {
    if (!confirm('Delete?')) return;
    try {
      await api(`/groups/${activeGroup}/messages/${mid}`, { method: 'DELETE' });
      loadMessages(activeGroup!);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  if (loading) return <div className="glass-card p-10 text-center"><div className="w-8 h-8 border-2 border-glass-border border-t-ci-red rounded-full animate-spin mx-auto" /></div>;

  if (groups.length === 0) return (
    <div className="glass-card p-7">
      <div className="text-center py-10">
        <div className="text-4xl opacity-30 mb-3">💬</div>
        <div className="font-semibold text-[#9898a8]">No Group Chats Yet</div>
        <p className="text-[13px] text-[#58586a] mt-1">Create or join a Drive Group first (Drives tab).</p>
      </div>
    </div>
  );

  if (!activeGroup) return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-[15px] mb-4">💬 Group Chats</h3>
      <p className="text-[13px] text-[#58586a] mb-4">Select a group to open its private chat.</p>
      {groups.map(g => (
        <button key={g.id} onClick={() => loadMessages(g.id)}
          className="w-full glass-sm flex items-center justify-between p-4 mb-2 text-left hover:border-[rgba(230,57,70,.2)] transition-all">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{g.emoji || '💬'}</span>
            <div>
              <div className="font-bold text-sm">{g.name}</div>
              <div className="text-[11px] text-[#58586a]">{g.member_count} members · Code: <code className="text-ci-gold-light">{g.invite_code}</code></div>
            </div>
          </div>
          <span className="text-ci-red text-[13px]">Open →</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="glass-card flex flex-col" style={{ height: 'min(480px, 65vh)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveGroup(null)} className="text-base">←</button>
          <span className="font-bold text-sm">{groupName}</span>
        </div>
        <span className="text-[9px] font-mono px-2 py-1 rounded bg-[rgba(34,204,110,.08)] text-ci-green">PRIVATE</span>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-auto p-3.5 flex flex-col gap-2.5">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-[#58586a] text-sm">No messages yet. Say something!</div>
        ) : messages.map(m => {
          const isMe = m.member_id === member?.id;
          return (
            <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${isMe ? 'bg-gradient-to-br from-ci-red to-ci-red-dark shadow-[0_0_12px_rgba(230,57,70,.15)]' : 'bg-bg-3 border border-glass-border'}`}>
                {m.first_name?.[0]}{m.last_name?.[0]}
              </div>
              <div className="max-w-[78%]">
                <div className={`flex gap-1.5 mb-0.5 text-[11px] ${isMe ? 'justify-end' : ''}`}>
                  <span className="font-semibold">{isMe ? 'You' : `${m.first_name} ${m.last_name?.[0]}.`}</span>
                  <TierBadge tier={m.tier} small />
                  <span className="text-[9px] text-[#58586a]">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <button onClick={() => delMsg(m.id)} className="text-[9px] text-ci-red ml-1">🗑</button>}
                </div>
                <div className={`px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${isMe ? 'bg-[rgba(230,57,70,.08)] border border-[rgba(230,57,70,.1)] rounded-tr-sm' : 'bg-glass-light border border-glass-border rounded-tl-sm'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-glass-border bg-[rgba(255,255,255,.015)]">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message your group..."
          className="flex-1 px-3.5 py-2.5 bg-glass border border-glass-border rounded-lg text-white text-[13px]" />
        <button onClick={send} className="btn btn-red px-5 py-2.5 text-[11px]">Send</button>
      </div>
    </div>
  );
}
