'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TIERS } from '@/lib/tiers';

export function ProfileTab() {
  const { member } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api('/notifications').then(r => setNotifications(r.notifications || [])).catch(() => {});
  }, []);

  if (!member) return null;
  const t = TIERS[member.tier] || TIERS.apex;

  const fields = [
    ['Name', `${member.first_name} ${member.last_name}`],
    ['Email', member.email],
    ['Phone', member.phone],
    ['City', member.city || '—'],
    ['Tier', t.name],
    ['Status', (member.status || '').toUpperCase()],
    ['Since', member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'],
  ];

  return (
    <>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h3 className="font-bold text-[15px] mb-3.5">🔔 Notifications</h3>
          {notifications.slice(0, 10).map(n => {
            const isWin = n.type === 'draw';
            return (
              <div key={n.id} className={`glass-sm p-3 mb-1.5 ${isWin ? 'bg-[rgba(240,192,64,.06)] !border-[rgba(240,192,64,.2)]' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{isWin ? '🏆' : '🔔'}</span>
                    <div>
                      <div className={`font-semibold text-[13px] ${isWin ? 'text-ci-gold-light' : ''}`}>{n.title}</div>
                      {n.body && <div className="text-[11px] text-[#6E7275] mt-0.5">{n.body}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-[#6E7275]">{new Date(n.created_at).toLocaleDateString()}</div>
                    {!n.read && <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[rgba(34,204,110,.08)] text-ci-green mt-0.5 inline-block">NEW</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account */}
      <div className="glass-card p-5">
        <h3 className="font-bold text-[15px] mb-4">Account</h3>
        <div className="glass-sm p-3.5">
          {fields.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border last:border-0">
              <span className="text-[#6E7275]">{label}</span>
              <span className={`font-medium ${label === 'Status' ? 'text-ci-green' : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
