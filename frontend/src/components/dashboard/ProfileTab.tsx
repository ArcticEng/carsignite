'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { TIERS, PAID_TIERS, TierBadge } from '@/lib/tiers';
import { useToast } from '@/lib/toast';

export function ProfileTab() {
  const { member, refresh } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [form, setForm] = useState<any>({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/notifications').then(r => setNotifications(r.notifications || [])).catch(() => {});
    api('/payments/my').then(r => setPayments(r.payments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (member) setForm({ firstName: member.first_name, lastName: member.last_name, phone: member.phone, city: member.city || '' });
  }, [member]);

  if (!member) return null;
  const t = TIERS[member.tier] || TIERS.free;
  const isFree = member.tier === 'free';

  const saveProfile = async () => {
    setLoading(true);
    try {
      await api('/auth/profile', { method: 'PUT', body: form });
      await refresh();
      toast('Profile updated', 'success');
      setEditing(false);
    } catch (e: any) { toast(e.message, 'error'); }
    setLoading(false);
  };

  const changePassword = async () => {
    if (pwForm.newPassword.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (pwForm.newPassword !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      await api('/auth/profile', { method: 'PUT', body: { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword } });
      toast('Password changed', 'success');
      setChangingPw(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e: any) { toast(e.message, 'error'); }
    setLoading(false);
  };

  const cancelSub = async () => {
    if (!confirm('Cancel your subscription? You\'ll keep access until the end of your billing period, then revert to free tier (1 draw entry).')) return;
    try {
      const sub = await api('/subscriptions/my');
      if (sub.subscription) {
        await api(`/subscriptions/${sub.subscription.id}/cancel`, { method: 'POST' });
        await refresh();
        toast('Subscription cancelled. You\'ll retain access until the end of your billing period.', 'success');
      } else {
        toast('No active subscription found', 'error');
      }
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const inp = "w-full px-3 py-2.5 bg-[rgba(255,255,255,.05)] border border-glass-border rounded-xl text-white text-sm transition-all focus:border-ci-red outline-none";

  return (
    <>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h3 className="font-bold text-[15px] mb-3">🔔 Notifications</h3>
          {notifications.slice(0, 5).map(n => {
            const isWin = n.type === 'draw';
            return (
              <div key={n.id} className={`glass-sm p-3 mb-1.5 ${isWin ? 'bg-[rgba(240,192,64,.06)] !border-[rgba(240,192,64,.2)]' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base">{isWin ? '🏆' : '🔔'}</span>
                    <div>
                      <div className={`font-semibold text-[13px] ${isWin ? 'text-ci-gold-light' : ''}`}>{n.title}</div>
                      {n.body && <div className="text-[11px] text-[#6E7275] mt-0.5">{n.body}</div>}
                    </div>
                  </div>
                  <div className="text-[9px] text-[#6E7275]">{new Date(n.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription */}
      <div className="glass-card p-5 mb-4">
        <h3 className="font-bold text-[15px] mb-3">💳 Subscription</h3>
        <div className="glass-sm p-4 mb-3">
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Current Plan</span>
            <TierBadge tier={member.tier} />
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Draw Entries</span>
            <span className="font-bold text-ci-gold-light">{t.entries}× per {t.freq.toLowerCase()}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border">
            <span className="text-[#6E7275]">Monthly Cost</span>
            <span className="font-bold">{isFree ? 'Free' : `R${t.price}/mo`}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-[13px]">
            <span className="text-[#6E7275]">Status</span>
            <span className="text-ci-green font-bold">{(member.status || '').toUpperCase()}</span>
          </div>
        </div>

        {/* Upgrade options for free/lower tiers */}
        {(isFree || member.tier === 'ignite') && (
          <div className="mb-3">
            <p className="text-[11px] text-[#6E7275] mb-2">
              {isFree ? 'Upgrade to unlock GPS tracking, crew chat, drives, and bonus entries:' : 'Upgrade for more entries and VIP access:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.values(PAID_TIERS).filter(pt => {
                if (isFree) return true;
                return pt.price > t.price;
              }).map(pt => (
                <Link key={pt.id} href={`/payment?tier=${pt.id}`}
                  className={`btn ${pt.popular ? 'btn-red' : 'btn-ghost'} px-4 py-2.5 text-[10px]`}>
                  {pt.icon} {pt.name} — R{pt.price}/mo · {pt.entries}× entries
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cancel for paid members */}
        {!isFree && member.status === 'active' && (
          <button onClick={cancelSub} className="text-[11px] text-[#6E7275] hover:text-ci-red transition-colors">
            Cancel subscription
          </button>
        )}
      </div>

      {/* Profile Details */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[15px]">👤 Profile</h3>
          {!editing && <button onClick={() => setEditing(true)} className="text-[11px] text-[#E03455] font-semibold">Edit</button>}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">First Name</label>
                <input value={form.firstName || ''} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Last Name</label>
                <input value={form.lastName || ''} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Phone</label>
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">City</label>
              <input value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className={inp} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveProfile} disabled={loading} className="btn btn-red px-5 py-2 text-[11px]">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditing(false)} className="btn btn-ghost px-4 py-2 text-[11px]">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="glass-sm p-3.5">
            {[
              ['Name', `${member.first_name} ${member.last_name}`],
              ['Email', member.email],
              ['Phone', member.phone],
              ['City', member.city || '—'],
              ['Member Since', member.created_at ? new Date(member.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-1.5 text-[13px] border-b border-glass-border last:border-0">
                <span className="text-[#6E7275]">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[15px]">🔒 Password</h3>
          {!changingPw && <button onClick={() => setChangingPw(true)} className="text-[11px] text-[#E03455] font-semibold">Change</button>}
        </div>
        {changingPw ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Current Password</label>
              <input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">New Password</label>
              <input type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} className={inp} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6E7275] mb-1 uppercase tracking-wider">Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} className={inp} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={changePassword} disabled={loading} className="btn btn-red px-5 py-2 text-[11px]">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
              <button onClick={() => { setChangingPw(false); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); }} className="btn btn-ghost px-4 py-2 text-[11px]">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#6E7275]">••••••••</p>
        )}
      </div>

      {/* Payment History */}
      <div className="glass-card p-5">
        <h3 className="font-bold text-[15px] mb-3">🧾 Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-[13px] text-[#6E7275] text-center py-6">{isFree ? 'No payments — you\'re on the free plan.' : 'No payment records yet.'}</p>
        ) : (
          <div className="space-y-1.5">
            {payments.slice(0, 10).map((p: any) => (
              <div key={p.id} className="glass-sm flex items-center justify-between p-3">
                <div>
                  <div className="font-semibold text-[12px]">R{p.amount}</div>
                  <div className="text-[10px] text-[#6E7275]">{new Date(p.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  p.status === 'completed' ? 'bg-[rgba(34,204,110,.08)] text-ci-green' :
                  p.status === 'failed' ? 'bg-[rgba(224,52,85,.08)] text-ci-red' :
                  'bg-[rgba(255,255,255,.05)] text-[#6E7275]'
                }`}>{(p.status || '').toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
