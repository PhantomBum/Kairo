import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { uploadAvatar, uploadBanner } from '@/lib/uploadUtils';
import { User, Link, Shield, LogOut, Palette, Bell, Volume2, Keyboard, Accessibility, HelpCircle, Crown, ExternalLink, Lock, Mail, Award, Sparkles, Play, Check, AlertTriangle, X, Camera, Eye, EyeOff, Download, Trash2, Globe, Gamepad2 } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { previewSound } from '@/components/app/features/NotificationSounds';
import BadgeOrderSettings from '@/components/app/badges/BadgeOrderSettings';
import EffectsSettings from '@/components/app/effects/EffectsSettings';
import ProfileEffectCanvas from '@/components/app/effects/ProfileEffectCanvas';
import ProfileBadge from '@/components/app/badges/ProfileBadge';
import { getOrderedBadges, BADGE_CONFIG, RARITY } from '@/components/app/badges/badgeConfig';
import SecuritySettings from '@/components/app/features/SecuritySettings';
import ReactMarkdown from 'react-markdown';

import { colors } from '@/components/app/design/tokens';
const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle, inputBorder: colors.border.medium,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary, danger: colors.danger, success: colors.success, warning: colors.warning,
};

const TABS = [
  { id: 'account', label: 'My Account', icon: User, section: 'MY ACCOUNT' },
  { id: 'profile', label: 'Profile', icon: User, section: 'MY ACCOUNT' },
  { id: 'privacy', label: 'Privacy and Safety', icon: Shield, section: 'MY ACCOUNT' },
  { id: 'security', label: 'Security', icon: Lock, section: 'MY ACCOUNT' },

  { id: 'appearance', label: 'Appearance', icon: Palette, section: 'CUSTOMIZATION' },
  { id: 'effects', label: 'Effects', icon: Sparkles, section: 'CUSTOMIZATION' },
  { id: 'badges', label: 'Badges', icon: Award, section: 'CUSTOMIZATION' },
  { id: 'connections', label: 'Connections', icon: Link, section: 'CUSTOMIZATION' },

  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'COMMUNICATION' },
  { id: 'voice', label: 'Voice and Video', icon: Volume2, section: 'COMMUNICATION' },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard, section: 'COMMUNICATION' },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility, section: 'COMMUNICATION' },

  { id: 'subscription', label: 'Subscription', icon: Crown, section: 'BILLING' },
  { id: 'elite', label: 'Elite', icon: Crown, section: 'BILLING' },
  { id: 'lite', label: 'Lite', icon: Award, section: 'BILLING' },

  { id: 'help', label: 'Help', icon: HelpCircle, section: 'SUPPORT' },
  { id: 'support', label: 'Support', icon: Mail, section: 'SUPPORT' },
  { id: 'contact', label: 'Contact Us', icon: Mail, section: 'SUPPORT' },
  { id: 'about', label: 'About Kairo', icon: Globe, section: 'SUPPORT' },
];

const ACCENT_PRESETS = ['#22c9b3', '#4dd4c0', '#2ecc71', '#e6b84c', '#e74c3c', '#eb459e', '#5b8def', '#ff9800', '#e91e63', '#9c27b0', '#00e676', '#ff5722'];
const THEMES = [
  { id: 'dark', label: 'Dark', bg: '#0a0a0f', desc: 'Kloak-style default' },
  { id: 'midnight', label: 'Midnight', bg: '#060608', desc: 'Deepest black' },
  { id: 'slate', label: 'Slate', bg: '#111118', desc: 'Cool gray' },
  { id: 'light', label: 'Light', bg: '#ffffff', desc: 'Light mode', textColor: '#333' },
];

function Field({ label, value, onChange, placeholder, area, maxLen, type = 'text', disabled, suffix }) {
  const len = value?.length || 0;
  return (
    <div>
      <label className="block mb-1.5 text-[12px] font-medium uppercase" style={{ color: P.muted, letterSpacing: '0.05em' }}>{label}</label>
      <div className="relative">
        {area ? (
          <textarea value={value} onChange={e => { if (!maxLen || e.target.value.length <= maxLen) onChange(e.target.value); }} rows={3} placeholder={placeholder} disabled={disabled}
            className="w-full px-3 py-2.5 rounded-md text-[13px] outline-none resize-none transition-all duration-[120ms]"
            style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        ) : (
          <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
            className="w-full px-3 py-2.5 rounded-md text-[13px] outline-none transition-all duration-[120ms]"
            style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        )}
        {maxLen && <span className="absolute right-3 bottom-2.5 text-[11px]" style={{ color: len > maxLen * 0.9 ? P.danger : P.muted }}>{len}/{maxLen}</span>}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange, desc }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${P.border}` }}>
      <div className="flex-1 min-w-0 mr-3">
        <span className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{label}</span>
        {desc && <p className="text-[11px] mt-0.5" style={{ color: P.muted }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)} className="w-9 h-5 rounded-full transition-colors relative flex-shrink-0" style={{ background: checked ? P.accent : `${P.muted}40` }}>
        <div className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform" style={{ left: checked ? 18 : 2 }} />
      </button>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, unit }) {
  return (
    <div className="py-2.5" style={{ borderBottom: `1px solid ${P.border}` }}>
      <div className="flex justify-between mb-1.5">
        <span className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{label}</span>
        <span className="text-[12px] font-medium" style={{ color: P.accent }}>{value}{unit}</span>
      </div>
      <input type="range" value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: P.elevated, accentColor: P.accent }} />
    </div>
  );
}

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout, currentUser, onAdminPanel, onElite }) {
  const [tab, setTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    display_name: profile?.display_name || '', username: profile?.username || '', bio: profile?.bio || '',
    pronouns: profile?.pronouns || '', website: profile?.social_links?.website || '', birthday: profile?.birthday || '',
    twitter: profile?.social_links?.twitter || '', github: profile?.social_links?.github || '',
    instagram: profile?.social_links?.instagram || '', spotify: profile?.social_links?.spotify || '',
    tiktok: profile?.social_links?.tiktok || '', linkedin: profile?.social_links?.linkedin || '',
    twitch: profile?.social_links?.twitch || '', steam: profile?.social_links?.steam || '',
    dm_privacy: profile?.settings?.dm_privacy || 'everyone', friend_requests: profile?.settings?.friend_requests || 'everyone',
    read_receipts: profile?.settings?.read_receipts !== false, typing_indicators: profile?.settings?.typing_indicators !== false,
    ghost_mode: profile?.settings?.ghost_mode || false, focus_mode: profile?.settings?.focus_mode || false,
    anonymous_reactions: profile?.settings?.anonymous_reactions || false,
    disappearing_messages: profile?.settings?.disappearing_messages || 'never',
    online_status: profile?.settings?.online_status !== false,
    desktop_notifs: profile?.settings?.desktop_notifs !== false, dm_notifs: profile?.settings?.dm_notifs !== false,
    mention_notifs: profile?.settings?.mention_notifs !== false, sound_notifs: profile?.settings?.sound_notifs !== false,
    dnd_enabled: profile?.settings?.dnd_enabled || false,
    dnd_start: profile?.settings?.dnd_start || '22:00', dnd_end: profile?.settings?.dnd_end || '08:00',
    notification_sound: profile?.settings?.notification_sound || 'default',
    reduced_motion: profile?.settings?.reduced_motion || false, high_contrast: profile?.settings?.high_contrast || false,
    font_scaling: profile?.settings?.font_scaling || 100, saturation: profile?.settings?.saturation || 100,
    theme: profile?.settings?.theme || 'dark', message_display: profile?.settings?.message_display || 'cozy',
    accent_color: profile?.accent_color || P.accent, compact_servers: profile?.settings?.compact_servers || false,
    chat_bg: profile?.settings?.chat_bg || '',
    input_device: 'default', output_device: 'default', input_volume: 80, output_volume: 100,
    noise_suppression: true, echo_cancellation: true, auto_gain: true,
  });

  const [dirty, setDirty] = useState(false);
  const set = (k, v) => { setDirty(true); setForm(p => ({ ...p, [k]: v })); };

  useEffect(() => {
    if (!profile) return;
    setForm({
      display_name: profile?.display_name || '', username: profile?.username || '', bio: profile?.bio || '',
      pronouns: profile?.pronouns || '', website: profile?.social_links?.website || '', birthday: profile?.birthday || '',
      twitter: profile?.social_links?.twitter || '', github: profile?.social_links?.github || '',
      instagram: profile?.social_links?.instagram || '', spotify: profile?.social_links?.spotify || '',
      tiktok: profile?.social_links?.tiktok || '', linkedin: profile?.social_links?.linkedin || '',
      twitch: profile?.social_links?.twitch || '', steam: profile?.social_links?.steam || '',
      dm_privacy: profile?.settings?.dm_privacy || 'everyone', friend_requests: profile?.settings?.friend_requests || 'everyone',
      read_receipts: profile?.settings?.read_receipts !== false, typing_indicators: profile?.settings?.typing_indicators !== false,
      ghost_mode: profile?.settings?.ghost_mode || false, focus_mode: profile?.settings?.focus_mode || false,
      anonymous_reactions: profile?.settings?.anonymous_reactions || false,
      disappearing_messages: profile?.settings?.disappearing_messages || 'never',
      online_status: profile?.settings?.online_status !== false,
      desktop_notifs: profile?.settings?.desktop_notifs !== false, dm_notifs: profile?.settings?.dm_notifs !== false,
      mention_notifs: profile?.settings?.mention_notifs !== false, sound_notifs: profile?.settings?.sound_notifs !== false,
      dnd_enabled: profile?.settings?.dnd_enabled || false,
      dnd_start: profile?.settings?.dnd_start || '22:00', dnd_end: profile?.settings?.dnd_end || '08:00',
      notification_sound: profile?.settings?.notification_sound || 'default',
      reduced_motion: profile?.settings?.reduced_motion || false, high_contrast: profile?.settings?.high_contrast || false,
      font_scaling: profile?.settings?.font_scaling || 100, saturation: profile?.settings?.saturation || 100,
      theme: profile?.settings?.theme || 'dark', message_display: profile?.settings?.message_display || 'cozy',
      accent_color: profile?.accent_color || P.accent, compact_servers: profile?.settings?.compact_servers || false,
      chat_bg: profile?.settings?.chat_bg || '',
      input_device: 'default', output_device: 'default', input_volume: 80, output_volume: 100,
      noise_suppression: true, echo_cancellation: true, auto_gain: true,
    });
  }, [profile]);

  useEffect(() => { setDirty(false); }, [profile]);

  const [audioDevices, setAudioDevices] = useState({ inputs: [], outputs: [] });
  const saveRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (tab !== 'voice') return;
    navigator.mediaDevices?.enumerateDevices().then(devices => {
      setAudioDevices({ inputs: devices.filter(d => d.kind === 'audioinput'), outputs: devices.filter(d => d.kind === 'audiooutput') });
    }).catch(() => {});
  }, [tab]);

  // Debounced auto-save (600ms) — only when user has changed something
  useEffect(() => {
    if (!profile?.id || !dirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      saveRef.current?.();
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form, profile?.id, dirty]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const data = {
        display_name: form.display_name,
        username: form.username,
        bio: form.bio,
        pronouns: form.pronouns,
        birthday: form.birthday,
        social_links: {
          ...profile?.social_links,
          website: form.website,
          twitter: form.twitter,
          github: form.github,
          instagram: form.instagram,
          spotify: form.spotify,
          tiktok: form.tiktok,
          linkedin: form.linkedin,
          twitch: form.twitch,
          steam: form.steam,
        },
        settings: {
          ...profile?.settings,
          dm_privacy: form.dm_privacy,
          friend_requests: form.friend_requests,
          read_receipts: form.read_receipts,
          typing_indicators: form.typing_indicators,
          ghost_mode: form.ghost_mode,
          focus_mode: form.focus_mode,
          anonymous_reactions: form.anonymous_reactions,
          disappearing_messages: form.disappearing_messages,
          online_status: form.online_status,
          theme: form.theme,
          message_display: form.message_display,
          compact_servers: form.compact_servers,
          chat_bg: form.chat_bg,
          notification_sound: form.notification_sound,
          desktop_notifs: form.desktop_notifs,
          dm_notifs: form.dm_notifs,
          mention_notifs: form.mention_notifs,
          sound_notifs: form.sound_notifs,
          dnd_enabled: form.dnd_enabled,
          dnd_start: form.dnd_start,
          dnd_end: form.dnd_end,
          reduced_motion: form.reduced_motion,
          high_contrast: form.high_contrast,
          font_scaling: form.font_scaling,
          saturation: form.saturation,
        },
        accent_color: form.accent_color,
      };
      await onUpdate(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Settings save failed:', err);
      toast({ title: 'Save failed', description: err?.message || 'Please try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }, [form, profile?.social_links, profile?.settings, onUpdate]);

  useEffect(() => { saveRef.current = save; }, [save]);

  const handleFile = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
    input.onchange = async () => {
      const f = input.files?.[0]; if (!f) return;
      const isElite = profile?.badges?.includes('premium') || false;
      try {
        let url;
        if (type === 'avatar_url') {
          url = await uploadAvatar(f, currentUser.id, { isElite });
        } else {
          url = await uploadBanner(f, { userId: currentUser.id }, { isElite });
        }
        await onUpdate({ [type]: url });
        toast({ title: 'Saved', description: type === 'avatar_url' ? 'Avatar updated' : 'Banner updated', variant: 'success' });
      } catch (err) {
        console.error('Avatar/banner upload failed:', err);
        toast({ title: 'Upload failed', description: err?.message || 'Please try again.', variant: 'error' });
      }
    };
    input.click();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      if (profile?.id) await base44.entities.UserProfile.delete(profile.id);
      onLogout();
    } catch {}
  };

  const handleDataExport = async () => {
    try {
      const [messages, memberships, friendships, conversations] = await Promise.all([
        base44.entities.Message.list().catch(() => []),
        base44.entities.ServerMember.filter({ user_id: currentUser.id }).catch(() => []),
        base44.entities.Friendship.filter({ user_id: currentUser.id }).catch(() => []),
        base44.entities.Conversation.list().catch(() => []),
      ]);
      const myMessages = messages.filter(m => m.author_id === currentUser.id);
      const data = {
        account: { id: currentUser.id, email: currentUser.email, created: currentUser.created_date },
        profile: { ...profile },
        statistics: { total_messages: myMessages.length, servers_joined: memberships.length, friends: friendships.length, conversations: conversations.length },
        servers: memberships.map(m => ({ server_id: m.server_id, joined_at: m.joined_at })),
        friends: friendships.map(f => ({ name: f.friend_name, status: f.status })),
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'kairo-data-export.json'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      const data = { profile: { ...profile }, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'kairo-data-export.json'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const hasElite = profile?.badges?.includes('premium') || profile?.badges?.includes('kairo_elite');
  const bioMaxLen = hasElite ? 500 : 300;
  const orderedBadges = getOrderedBadges(profile?.badges || [], profile?.badge_order || []);
  const sections = [...new Set(TABS.map(t => t.section))];

  return (
    <ModalWrapper title="" onClose={onClose} width="large" hideTitle>
      <div className="flex gap-0 -mx-6 -my-6" style={{ minHeight: 520 }}>
        {/* Sidebar nav */}
        <div className="w-[190px] flex-shrink-0 py-4 px-3 overflow-y-auto scrollbar-none" style={{ background: P.surface, borderRight: `1px solid ${P.border}` }}>
          {sections.map(section => (
            <div key={section} className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider px-2 mb-1" style={{ color: P.muted }}>{section}</p>
              {TABS.filter(t => t.section === section).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors"
                  style={{ background: tab === t.id ? `${P.accent}12` : 'transparent', color: tab === t.id ? P.textPrimary : P.muted }}>
                  <t.icon className="w-3.5 h-3.5" style={{ opacity: tab === t.id ? 1 : 0.6 }} /> {t.label}
                </button>
              ))}
            </div>
          ))}
          <div className="my-2 h-px mx-2" style={{ background: P.border }} />
          <button onClick={() => { onClose(); onElite?.(); }} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(250,166,26,0.08)]" style={{ color: P.warning }}>
            <Crown className="w-3.5 h-3.5" /> Kairo Elite
          </button>
          {ADMIN_EMAILS.includes(currentUser?.email?.toLowerCase()) && (
            <>
              <div className="my-2 h-px mx-2" style={{ background: P.border }} />
              <p className="text-[11px] font-bold uppercase tracking-wider px-2 mb-1" style={{ color: P.muted }}>ADMIN</p>
              <button onClick={onAdminPanel} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[var(--accent-dim)]" style={{ color: 'var(--accent-primary)' }}>
                <Shield className="w-3.5 h-3.5" /> Admin Panel
              </button>
            </>
          )}
          <div className="my-2 h-px mx-2" style={{ background: P.border }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(237,66,69,0.06)]" style={{ color: P.danger }}>
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-4">
            {/* ===== MY ACCOUNT ===== */}
            {tab === 'account' && <>
              <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>My Account</h3>
              <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleFile('avatar_url')} className="relative w-16 h-16 rounded-full overflow-hidden group flex-shrink-0"
                    style={{ background: P.floating }}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> :
                      <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: P.muted }}>{(form.display_name || 'U').charAt(0).toUpperCase()}</div>}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold truncate" style={{ color: P.textPrimary }}>{form.display_name || 'User'}</p>
                    <p className="text-[12px] truncate" style={{ color: P.muted }}>@{form.username || 'username'}</p>
                    <p className="text-[11px] truncate" style={{ color: P.muted }}>{currentUser?.email}</p>
                  </div>
                </div>
              </div>

              <Field label="Username" value={form.username} onChange={v => set('username', v.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="your_handle" />
              <Field label="Email" value={currentUser?.email || ''} onChange={() => {}} disabled placeholder="email@example.com"
                suffix={<Check className="w-3.5 h-3.5" style={{ color: P.success }} />} />

              <div className="p-4 rounded-xl space-y-3" style={{ background: `${P.danger}08`, border: `1px solid ${P.danger}20` }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: P.danger }} />
                  <h4 className="text-[13px] font-semibold" style={{ color: P.danger }}>Delete Account</h4>
                </div>
                <p className="text-[12px]" style={{ color: P.muted }}>This permanently deletes your account, messages, and all data. Type DELETE to confirm.</p>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE"
                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none font-mono"
                  style={{ background: P.elevated, color: P.danger, border: `1px solid ${P.danger}30` }} />
                <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE'}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-20"
                  style={{ background: P.danger, color: '#fff' }}>Delete Account Forever</button>
              </div>
            </>}

            {/* ===== PROFILE ===== */}
            {tab === 'profile' && <>
              <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Profile</h3>
              <div className="flex gap-4 items-start">
                <button onClick={() => handleFile('avatar_url')} className="relative w-20 h-20 rounded-full overflow-hidden group flex-shrink-0"
                  style={{ background: P.floating }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> :
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: P.muted }}>{(form.display_name || 'U').charAt(0).toUpperCase()}</div>}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </button>
                <div className="flex-1 space-y-3">
                  <Field label="Display Name" value={form.display_name} onChange={v => set('display_name', v)} placeholder="Your Name" />
                  <Field label="Pronouns" value={form.pronouns} onChange={v => set('pronouns', v)} placeholder="they/them, she/her, he/him" />
                </div>
              </div>
              <button onClick={() => handleFile('banner_url')} className="w-full h-24 rounded-xl overflow-hidden relative group"
                style={{ background: profile?.banner_url ? 'transparent' : P.elevated, border: profile?.banner_url ? 'none' : `1px dashed ${P.border}` }}>
                {profile?.banner_url ? <img src={profile.banner_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> :
                  <div className="flex flex-col items-center justify-center h-full gap-1"><Camera className="w-5 h-5" style={{ color: P.muted }} /><span className="text-[11px]" style={{ color: P.muted }}>Upload Banner</span></div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                  <span className="text-[12px] text-white font-medium">Change Banner</span>
                </div>
              </button>
              <Field label={`About Me (${hasElite ? '500' : '300'} max)`} value={form.bio} onChange={v => set('bio', v)} placeholder="Tell people about yourself..." area maxLen={bioMaxLen} />
              <Field label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://yoursite.com" />
              <Field label="Birthday" value={form.birthday} onChange={v => set('birthday', v)} type="date" />
            </>}

            {/* ===== BADGES ===== */}
            {tab === 'badges' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Badges</h3>
              <p className="text-[12px] mb-4" style={{ color: P.muted }}>Drag to reorder. First 6 show on hover cards.</p>
              <BadgeOrderSettings badges={profile?.badges || []} badgeOrder={profile?.badge_order || []} onSave={(order) => onUpdate({ badge_order: order })} />
              {/* Locked badges */}
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Locked Badges</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BADGE_CONFIG).filter(([id]) => !(profile?.badges || []).includes(id) && !['owner','admin','premium','verified','early_supporter','developer','moderator','partner','youtube','tester'].includes(id))
                    .slice(0, 12).map(([id, cfg]) => {
                      const rarity = RARITY[cfg.rarity];
                      return (
                        <div key={id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg opacity-40"
                          style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${P.muted}20` }}>
                            <cfg.icon className="w-3.5 h-3.5" style={{ color: P.muted }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium truncate" style={{ color: P.textSecondary }}>{cfg.label}</p>
                            <p className="text-[11px] truncate" style={{ color: P.muted }}>{cfg.desc}</p>
                          </div>
                          <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: `${rarity.color}15`, color: rarity.color }}>{rarity.label}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>}

            {/* ===== EFFECTS ===== */}
            {tab === 'effects' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Profile Effects</h3>
              <EffectsSettings currentEffect={profile?.profile_effect || 'none'} hasElite={hasElite}
                bannerUrl={profile?.banner_url} accentColor={profile?.accent_color}
                onSave={(effect) => onUpdate({ profile_effect: effect })} />
            </>}

            {/* ===== CONNECTIONS ===== */}
            {tab === 'connections' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Connected Accounts</h3>
              <p className="text-[12px] mb-3" style={{ color: P.muted }}>Add your social profiles. These show on your profile card.</p>
              <Field label="Spotify" value={form.spotify} onChange={v => set('spotify', v)} placeholder="https://open.spotify.com/user/you" />
              <Field label="Steam" value={form.steam} onChange={v => set('steam', v)} placeholder="https://steamcommunity.com/id/you" />
              <Field label="GitHub" value={form.github} onChange={v => set('github', v)} placeholder="https://github.com/you" />
              <Field label="Twitch" value={form.twitch} onChange={v => set('twitch', v)} placeholder="https://twitch.tv/you" />
              <Field label="Twitter / X" value={form.twitter} onChange={v => set('twitter', v)} placeholder="https://twitter.com/you" />
              <Field label="Instagram" value={form.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/you" />
              <Field label="LinkedIn" value={form.linkedin} onChange={v => set('linkedin', v)} placeholder="https://linkedin.com/in/you" />
              <Field label="TikTok" value={form.tiktok} onChange={v => set('tiktok', v)} placeholder="https://tiktok.com/@you" />
            </>}

            {/* ===== PRIVACY ===== */}
            {tab === 'privacy' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Privacy & Safety</h3>
              <Toggle label="Read Receipts" checked={form.read_receipts} onChange={v => set('read_receipts', v)} desc="Show when you've read messages" />
              <Toggle label="Online Status" checked={form.online_status} onChange={v => set('online_status', v)} desc="Show your online/offline status to others" />
              <Toggle label="Typing Indicators" checked={form.typing_indicators} onChange={v => set('typing_indicators', v)} desc="Show when you're typing" />
              <Toggle label="Anonymous Reactions" checked={form.anonymous_reactions} onChange={v => set('anonymous_reactions', v)} desc="Your name won't show when you react to messages" />
              <Toggle label="Ghost Mode" checked={form.ghost_mode} onChange={v => set('ghost_mode', v)}
                desc="Appear completely offline to everyone. You can still use Kairo normally — nobody will know you're here." />
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>DM Privacy</label>
                <select value={form.dm_privacy} onChange={e => set('dm_privacy', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                  <option value="everyone">Everyone</option><option value="friends">Friends Only</option><option value="servers">Server Members Only</option><option value="none">Nobody</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Friend Requests</label>
                <select value={form.friend_requests} onChange={e => set('friend_requests', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                  <option value="everyone">Everyone</option><option value="friends_of_friends">Mutual Friends</option><option value="none">Nobody</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Disappearing Messages</label>
                <select value={form.disappearing_messages} onChange={e => set('disappearing_messages', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                  <option value="never">Never</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="30d">30 days</option>
                </select>
              </div>
              <div className="mt-4 p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                <h4 className="text-[13px] font-semibold mb-2" style={{ color: P.textPrimary }}>Privacy Dashboard</h4>
                <p className="text-[11px] mb-3" style={{ color: P.muted }}>Here's exactly what Kairo stores about you, in plain language:</p>
                <div className="space-y-1.5 text-[11px]" style={{ color: P.textSecondary }}>
                  <p>• <strong>Account info</strong> — email, display name, username, avatar</p>
                  <p>• <strong>Messages</strong> — content of messages you send in servers and DMs</p>
                  <p>• <strong>Connections</strong> — social links you choose to add</p>
                  <p>• <strong>Server memberships</strong> — which servers you're in and your roles</p>
                  <p>• <strong>Friend list</strong> — who you've added as friends</p>
                  <p>• <strong>Settings</strong> — your preferences (theme, notifications, privacy)</p>
                  <p>• <strong>Nothing else</strong> — no tracking, no analytics, no selling data</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={handleDataExport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium"
                  style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
                  <Download className="w-3.5 h-3.5" /> Export My Data
                </button>
              </div>
            </>}

            {/* ===== APPEARANCE ===== */}
            {tab === 'appearance' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Appearance</h3>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: P.muted }}>Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => set('theme', t.id)} className="p-2.5 rounded-lg text-center transition-all"
                      style={{ background: P.elevated, border: `2px solid ${form.theme === t.id ? P.accent : 'transparent'}` }}>
                      <div className="w-full h-8 rounded-md mb-1" style={{ background: t.bg, border: t.id === 'light' ? `1px solid ${P.border}` : 'none' }} />
                      <span className="text-[11px] font-medium" style={{ color: P.textPrimary }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: P.muted }}>Accent Color</label>
                <div className="flex gap-2 flex-wrap items-center">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => set('accent_color', c)} className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, border: form.accent_color === c ? '2px solid white' : '2px solid transparent' }} />
                  ))}
                  <input type="color" value={form.accent_color} onChange={e => set('accent_color', e.target.value)}
                    className="w-8 h-8 rounded-full cursor-pointer border-0" style={{ background: P.elevated }} title="Custom color" />
                </div>
              </div>
              <Slider label="Font Size" value={form.font_scaling} onChange={v => set('font_scaling', v)} min={80} max={150} unit="%" />
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: P.muted }}>Message Display</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'cozy', label: 'Cozy' }, { id: 'compact', label: 'Compact' }, { id: 'bubble', label: 'Bubble' }].map(t => (
                    <button key={t.id} onClick={() => set('message_display', t.id)}
                      className="px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
                      style={{ background: P.elevated, border: `2px solid ${form.message_display === t.id ? P.accent : 'transparent'}`, color: P.textPrimary }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="Compact Server List" checked={form.compact_servers} onChange={v => set('compact_servers', v)} desc="Smaller server icons" />
              <Toggle label="Reduced Motion" checked={form.reduced_motion} onChange={v => set('reduced_motion', v)} desc="Disables all animations immediately" />
              <Toggle label="High Contrast" checked={form.high_contrast} onChange={v => set('high_contrast', v)} desc="Increase contrast for visibility" />
            </>}

            {/* ===== NOTIFICATIONS ===== */}
            {tab === 'notifications' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Notifications</h3>
              <Toggle label="Desktop Notifications" checked={form.desktop_notifs} onChange={v => { set('desktop_notifs', v); if (v && Notification.permission === 'default') Notification.requestPermission(); }} desc="Show system notifications" />
              <Toggle label="DM Notifications" checked={form.dm_notifs} onChange={v => set('dm_notifs', v)} desc="Notify for new direct messages" />
              <Toggle label="Mention Notifications" checked={form.mention_notifs} onChange={v => set('mention_notifs', v)} desc="Notify when you're mentioned" />
              <Toggle label="Sound Effects" checked={form.sound_notifs} onChange={v => set('sound_notifs', v)} desc="Play notification sounds" />
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Notification Sound</label>
                <div className="flex gap-2">
                  <select value={form.notification_sound} onChange={e => set('notification_sound', e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none"
                    style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                    <option value="default">Default</option><option value="chime">Chime</option><option value="ping">Ping</option>
                    <option value="bell">Bell</option><option value="pop">Pop</option><option value="soft">Soft</option><option value="none">None</option>
                  </select>
                  <button onClick={() => previewSound(form.notification_sound)}
                    className="px-3 py-2.5 rounded-lg flex items-center gap-1.5 text-[12px] font-medium"
                    style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
                    <Play className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>
              </div>
              <Toggle label="Do Not Disturb Schedule" checked={form.dnd_enabled} onChange={v => set('dnd_enabled', v)} desc="Automatically mute notifications during set hours" />
              {form.dnd_enabled && (
                <div className="flex gap-3 pl-4">
                  <div>
                    <label className="text-[11px] font-semibold block mb-1" style={{ color: P.muted }}>Start</label>
                    <input type="time" value={form.dnd_start} onChange={e => set('dnd_start', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold block mb-1" style={{ color: P.muted }}>End</label>
                    <input type="time" value={form.dnd_end} onChange={e => set('dnd_end', e.target.value)}
                      className="px-2 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }} />
                  </div>
                </div>
              )}
            </>}

            {/* ===== VOICE ===== */}
            {tab === 'voice' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Voice & Video</h3>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Input Device</label>
                <select value={form.input_device} onChange={e => set('input_device', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none"
                  style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                  <option value="default">Default</option>
                  {audioDevices.inputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
              <Slider label="Input Volume" value={form.input_volume} onChange={v => set('input_volume', v)} min={0} max={200} unit="%" />
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: P.muted }}>Output Device</label>
                <select value={form.output_device} onChange={e => set('output_device', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none appearance-none"
                  style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                  <option value="default">Default</option>
                  {audioDevices.outputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
              <Slider label="Output Volume" value={form.output_volume} onChange={v => set('output_volume', v)} min={0} max={200} unit="%" />
              <Toggle label="Noise Suppression" checked={form.noise_suppression} onChange={v => set('noise_suppression', v)} desc="Reduce background noise" />
              <Toggle label="Echo Cancellation" checked={form.echo_cancellation} onChange={v => set('echo_cancellation', v)} desc="Prevent audio feedback" />
              <Toggle label="Auto Gain Control" checked={form.auto_gain} onChange={v => set('auto_gain', v)} desc="Normalize microphone volume" />
            </>}

            {/* ===== KEYBINDS ===== */}
            {tab === 'keybinds' && <>
              <h3 className="text-[16px] font-bold mb-3" style={{ color: P.textPrimary }}>Keyboard Shortcuts</h3>
              {[
                { keys: 'Ctrl + Shift + M', action: 'Toggle mute' },
                { keys: 'Ctrl + Shift + D', action: 'Toggle deafen' },
                { keys: 'Up Arrow', action: 'Edit last message' },
                { keys: 'Shift + Enter', action: 'New line in message' },
                { keys: 'Enter', action: 'Send message' },
                { keys: 'Escape', action: 'Close modal / cancel' },
                { keys: 'Ctrl + K', action: 'Quick switcher' },
              ].map((kb, i) => (
                <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${P.border}` }}>
                  <span className="text-[13px]" style={{ color: P.textPrimary }}>{kb.action}</span>
                  <kbd className="text-[11px] px-2.5 py-1 rounded-md font-mono" style={{ background: P.elevated, color: P.muted, border: `1px solid ${P.border}` }}>{kb.keys}</kbd>
                </div>
              ))}
            </>}

            {/* ===== ACCESSIBILITY ===== */}
            {tab === 'accessibility' && <>
              <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Accessibility</h3>
              <Toggle label="Reduced Motion" checked={form.reduced_motion} onChange={v => set('reduced_motion', v)} desc="Minimize animations throughout the app" />
              <Toggle label="High Contrast" checked={form.high_contrast} onChange={v => set('high_contrast', v)} desc="Increase contrast for visibility" />
              <Slider label="Font Scaling" value={form.font_scaling} onChange={v => set('font_scaling', v)} min={80} max={150} unit="%" />
              <Slider label="Color Saturation" value={form.saturation} onChange={v => set('saturation', v)} min={0} max={200} unit="%" />
            </>}

            {tab === 'security' && <SecuritySettings profile={profile} currentUser={currentUser || { id: profile?.user_id }} onUpdate={onUpdate} />}
            {tab === 'subscription' && (
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Subscription</h3>
                <p className="text-[13px]" style={{ color: P.muted }}>Manage your billing cycle and active plan here.</p>
              </div>
            )}
            {tab === 'elite' && (
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Elite</h3>
                <p className="text-[13px]" style={{ color: P.muted }}>Open Elite membership details and upgrade options.</p>
                <button onClick={() => { onClose(); onElite?.(); }} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ background: P.warning }}>
                  Open Elite
                </button>
              </div>
            )}
            {tab === 'lite' && (
              <div className="space-y-3">
                <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Lite</h3>
                <p className="text-[13px]" style={{ color: P.muted }}>Lite gives you higher message limits and personalization extras.</p>
              </div>
            )}
            {tab === 'help' && <p className="text-[13px]" style={{ color: P.muted }}>Need help? Visit the Help Center for guides and troubleshooting.</p>}
            {tab === 'support' && <p className="text-[13px]" style={{ color: P.muted }}>Support the project and reach the team from the Support page.</p>}
            {tab === 'contact' && <p className="text-[13px]" style={{ color: P.muted }}>Contact us at support@kairo.app for account and technical issues.</p>}
            {tab === 'about' && <p className="text-[13px]" style={{ color: P.muted }}>Kairo is a modern realtime chat platform focused on community and speed.</p>}

            {/* Save bar */}
            {!['badges', 'effects', 'keybinds', 'security', 'subscription', 'elite', 'lite', 'help', 'support', 'contact', 'about'].includes(tab) && (
              <div className="pt-3 mt-2 flex items-center gap-3" style={{ borderTop: `1px solid ${P.border}` }}>
                <button onClick={save} disabled={saving}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30 transition-all hover:brightness-110"
                  style={{ background: saved ? P.success : P.accent, color: '#fff' }}>
                  {saving ? 'Saving...' : saved ? <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Saved</span> : 'Save Changes'}
                </button>
                {saved && <span className="text-[11px]" style={{ color: P.success }}>Changes saved</span>}
              </div>
            )}
          </div>

          {/* ===== LIVE PREVIEW PANEL (Profile tab) ===== */}
          {tab === 'profile' && (
            <div className="w-[240px] flex-shrink-0 p-4 overflow-y-auto scrollbar-none" style={{ background: P.base, borderLeft: `1px solid ${P.border}` }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Preview</p>
              <div className="rounded-xl overflow-hidden" style={{ background: P.surface, border: `1px solid ${P.border}` }}>
                {/* Banner */}
                <div className="h-16 relative overflow-hidden">
                  {profile?.banner_url ? <img src={profile.banner_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> :
                    <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${form.accent_color}, ${form.accent_color}60)` }} />}
                  {profile?.profile_effect && profile.profile_effect !== 'none' && (
                    <ProfileEffectCanvas effect={profile.profile_effect} width={240} height={64} />
                  )}
                </div>
                {/* Avatar */}
                <div className="px-3 -mt-6 relative z-10">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold"
                    style={{ background: P.elevated, color: P.muted, border: `3px solid ${P.surface}` }}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : (form.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                </div>
                {/* Info */}
                <div className="px-3 pt-1 pb-3">
                  <p className="text-[13px] font-bold" style={{ color: P.textPrimary }}>{form.display_name || 'Display Name'}</p>
                  <p className="text-[11px]" style={{ color: P.muted }}>@{form.username || 'username'}</p>
                  {form.pronouns && <p className="text-[11px] mt-0.5" style={{ color: P.textSecondary }}>{form.pronouns}</p>}
                  {orderedBadges.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {orderedBadges.slice(0, 6).map(b => <ProfileBadge key={b} badge={b} size="sm" />)}
                    </div>
                  )}
                  {form.bio && (
                    <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
                      <p className="text-[11px] font-bold uppercase mb-0.5" style={{ color: P.muted }}>About</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: P.textSecondary }}>{form.bio.slice(0, 120)}{form.bio.length > 120 ? '...' : ''}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
