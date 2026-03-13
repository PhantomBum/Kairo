import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

const ALL_BADGES = ['owner', 'admin', 'youtube', 'premium', 'verified', 'partner', 'early_supporter', 'bug_hunter', 'developer', 'moderator', 'tester', 'kairo_elite', 'early_adopter', 'active_voice', 'bot_developer', 'kairo_friend', 'friendly', 'explorer', 'night_owl'];
const STATUSES = ['online', 'idle', 'dnd', 'invisible', 'offline'];

export default function AdminEditUser({ user, profileMap, onBack, onRefresh, showFeedback }) {
  const profile = profileMap[user.email?.toLowerCase()] || profileMap[user.id];
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    status: 'offline',
    custom_status_text: '',
    custom_status_emoji: '',
    pronouns: '',
    accent_color: '',
    badges: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || user.full_name || '',
        bio: profile.bio || '',
        status: profile.status || 'offline',
        custom_status_text: profile.custom_status?.text || '',
        custom_status_emoji: profile.custom_status?.emoji || '',
        pronouns: profile.pronouns || '',
        accent_color: profile.accent_color || '#5865F2',
        badges: profile.badges || [],
      });
    }
  }, [profile, user]);

  const toggleBadge = (badge) => {
    setForm(f => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter(b => b !== badge) : [...f.badges, badge],
    }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const updates = {
      display_name: form.display_name,
      bio: form.bio,
      status: form.status,
      is_online: form.status !== 'offline' && form.status !== 'invisible',
      custom_status: form.custom_status_text || form.custom_status_emoji ? {
        text: form.custom_status_text,
        emoji: form.custom_status_emoji,
      } : null,
      pronouns: form.pronouns,
      accent_color: form.accent_color,
      badges: form.badges,
    };
    await base44.entities.UserProfile.update(profile.id, updates);
    setSaving(false);
    showFeedback(`Updated ${form.display_name || user.email}`);
    onRefresh();
    onBack();
  };

  if (!profile) return (
    <div className="text-center py-12">
      <p className="text-[13px]" style={{ color: colors.text.muted }}>No profile found for this user.</p>
      <button onClick={onBack} className="mt-4 px-4 py-2 rounded-lg text-[13px] font-medium" style={{ color: colors.accent.primary }}>← Back</button>
    </div>
  );

  return (
    <div className="space-y-4 py-1 k-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-medium hover:opacity-80" style={{ color: colors.accent.primary }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold"
          style={{ background: form.accent_color || colors.bg.overlay, color: '#fff' }}>
          {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : (form.display_name || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>{form.display_name}</p>
          <p className="text-[11px]" style={{ color: colors.text.disabled }}>{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Display Name</label>
          <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Pronouns</label>
          <input value={form.pronouns} onChange={e => setForm({ ...form, pronouns: e.target.value })} placeholder="they/them"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Accent Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.accent_color || '#5865F2'} onChange={e => setForm({ ...form, accent_color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
            <span className="text-[12px]" style={{ color: colors.text.muted }}>{form.accent_color}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Custom Status</label>
        <div className="flex gap-2">
          <input value={form.custom_status_emoji} onChange={e => setForm({ ...form, custom_status_emoji: e.target.value })} placeholder="😊"
            className="w-12 px-2 py-2 rounded-lg text-[13px] text-center outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          <input value={form.custom_status_text} onChange={e => setForm({ ...form, custom_status_text: e.target.value })} placeholder="Status text..."
            className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-1 block" style={{ color: colors.text.disabled }}>Bio</label>
        <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about this user..."
          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-16" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      </div>

      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: colors.text.disabled }}>Badges</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_BADGES.map(badge => (
            <button key={badge} onClick={() => toggleBadge(badge)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
              style={{
                background: form.badges.includes(badge) ? colors.accent.subtle : 'rgba(255,255,255,0.03)',
                color: form.badges.includes(badge) ? colors.accent.primary : colors.text.disabled,
                border: `1px solid ${form.badges.includes(badge) ? 'rgba(88,101,242,0.3)' : colors.border.default}`,
              }}>
              {badge.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
          style={{ background: colors.accent.primary }}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}