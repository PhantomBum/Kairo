import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { User, Link, Shield, LogOut, Palette, Bell, Volume2, Keyboard, Accessibility, HelpCircle, Crown, ExternalLink } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const TABS = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'social', label: 'Connections', icon: Link },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'voice', label: 'Voice & Video', icon: Volume2 },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    display_name: profile?.display_name || '', username: profile?.username || '', bio: profile?.bio || '', pronouns: profile?.pronouns || '',
    twitter: profile?.social_links?.twitter || '', github: profile?.social_links?.github || '', website: profile?.social_links?.website || '',
    instagram: profile?.social_links?.instagram || '', spotify: profile?.social_links?.spotify || '', tiktok: profile?.social_links?.tiktok || '',
    linkedin: profile?.social_links?.linkedin || '', twitch: profile?.social_links?.twitch || '',
    dm_privacy: profile?.settings?.dm_privacy || 'everyone', friend_requests: profile?.settings?.friend_requests || 'everyone',
    read_receipts: profile?.settings?.read_receipts !== false, typing_indicators: profile?.settings?.typing_indicators !== false,
    ghost_mode: profile?.settings?.ghost_mode || false, focus_mode: profile?.settings?.focus_mode || false,
    desktop_notifs: true, dm_notifs: true, mention_notifs: true, sound_notifs: true,
    input_device: 'default', output_device: 'default', input_volume: 80, output_volume: 100,
    noise_suppression: true, echo_cancellation: true, auto_gain: true,
    reduced_motion: false, high_contrast: false, font_scaling: 100, saturation: 100,
    theme: profile?.settings?.theme || 'dark', message_display: profile?.settings?.message_display || 'cozy',
    accent_color: profile?.accent_color || colors.accent.primary,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = {};
    if (tab === 'profile') Object.assign(data, { display_name: form.display_name, username: form.username, bio: form.bio, pronouns: form.pronouns });
    else if (tab === 'social') data.social_links = { twitter: form.twitter, github: form.github, website: form.website, instagram: form.instagram, spotify: form.spotify, tiktok: form.tiktok, linkedin: form.linkedin, twitch: form.twitch };
    else if (tab === 'privacy') data.settings = { ...profile?.settings, dm_privacy: form.dm_privacy, friend_requests: form.friend_requests, read_receipts: form.read_receipts, typing_indicators: form.typing_indicators, ghost_mode: form.ghost_mode, focus_mode: form.focus_mode };
    else if (tab === 'appearance') { data.settings = { ...profile?.settings, theme: form.theme, message_display: form.message_display }; data.accent_color = form.accent_color; }
    await onUpdate(data); setSaving(false);
  };

  const handleFile = async (type) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); await onUpdate({ [type]: file_url }); };
    input.click();
  };

  const Field = ({ label, k, ph, area }) => (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>{label}</label>
      {area ? <textarea value={form[k]} onChange={e => set(k, e.target.value)} rows={3} placeholder={ph}
        className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      : <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
        className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />}
    </div>
  );

  const Toggle = ({ label, k, desc }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
      <div className="flex-1 min-w-0">
        <span className="text-[14px]" style={{ color: colors.text.primary }}>{label}</span>
        {desc && <p className="text-[12px] mt-0.5" style={{ color: colors.text.muted }}>{desc}</p>}
      </div>
      <button onClick={() => set(k, !form[k])} className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-3" style={{ background: form[k] ? colors.success : colors.bg.overlay }}>
        <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: form[k] ? 24 : 4 }} />
      </button>
    </div>
  );

  const Slider = ({ label, k, min, max, unit }) => (
    <div className="py-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
      <div className="flex justify-between mb-2">
        <span className="text-[14px]" style={{ color: colors.text.primary }}>{label}</span>
        <span className="text-[12px] font-medium" style={{ color: colors.text.muted }}>{form[k]}{unit}</span>
      </div>
      <input type="range" value={form[k]} onChange={e => set(k, Number(e.target.value))} min={min} max={max}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: colors.bg.overlay, accentColor: colors.accent.primary }} />
    </div>
  );

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={680}>
      <div className="flex gap-5 min-h-[440px]">
        {/* Sidebar */}
        <div className="w-[150px] flex-shrink-0 space-y-px overflow-y-auto max-h-[540px] scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors"
              style={{ background: tab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === t.id ? colors.text.primary : colors.text.muted }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
          <div className="my-3 h-px" style={{ background: colors.border.default }} />
          <a href={createPageUrl('Elite')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.warning }}>
            <Crown className="w-4 h-4" /> Kairo Elite
          </a>
          <a href={createPageUrl('FAQ')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.muted }}>
            <HelpCircle className="w-4 h-4" /> FAQ
          </a>
          <a href={createPageUrl('Support')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.muted }}>
            <ExternalLink className="w-4 h-4" /> Support
          </a>
          <div className="my-3 h-px" style={{ background: colors.border.default }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-[rgba(242,63,67,0.08)]" style={{ color: colors.danger }}>
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[540px] scrollbar-none">
          {tab === 'profile' && <>
            <div className="flex items-center gap-4">
              <button onClick={() => handleFile('avatar_url')} className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center text-xl font-bold overflow-hidden group"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : (form.display_name || 'U').charAt(0).toUpperCase()}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[11px] text-white font-semibold">Edit</span></div>
              </button>
              <div><p className="text-[16px] font-semibold" style={{ color: colors.text.primary }}>{form.display_name || 'User'}</p><p className="text-[13px]" style={{ color: colors.text.muted }}>Click avatar to change</p></div>
            </div>
            <button onClick={() => handleFile('banner_url')} className="w-full h-20 rounded-lg overflow-hidden"
              style={{ background: profile?.banner_url ? 'transparent' : colors.bg.elevated, border: `1px dashed ${colors.border.light}` }}>
              {profile?.banner_url ? <img src={profile.banner_url} className="w-full h-full object-cover" alt="" /> : <div className="flex items-center justify-center h-full text-[13px]" style={{ color: colors.text.muted }}>Upload Banner</div>}
            </button>
            <Field label="Display Name" k="display_name" ph="Your Name" />
            <Field label="Username" k="username" ph="your_handle" />
            <Field label="About Me" k="bio" ph="Tell people about yourself..." area />
            <Field label="Pronouns" k="pronouns" ph="they/them" />
          </>}

          {tab === 'social' && <>
            <p className="text-[14px] mb-2" style={{ color: colors.text.muted }}>Add your social profiles and website links.</p>
            <Field label="Twitter / X" k="twitter" ph="https://twitter.com/you" />
            <Field label="GitHub" k="github" ph="https://github.com/you" />
            <Field label="Website" k="website" ph="https://yoursite.com" />
            <Field label="Instagram" k="instagram" ph="https://instagram.com/you" />
            <Field label="Spotify" k="spotify" ph="https://open.spotify.com/user/you" />
            <Field label="TikTok" k="tiktok" ph="https://tiktok.com/@you" />
            <Field label="LinkedIn" k="linkedin" ph="https://linkedin.com/in/you" />
            <Field label="Twitch" k="twitch" ph="https://twitch.tv/you" />
          </>}

          {tab === 'privacy' && <>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>DM Privacy</label>
              <select value={form.dm_privacy} onChange={e => set('dm_privacy', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="everyone">Everyone</option><option value="friends">Friends Only</option><option value="servers">Server Members Only</option><option value="none">Nobody</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Friend Requests</label>
              <select value={form.friend_requests} onChange={e => set('friend_requests', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="everyone">Everyone</option><option value="friends_of_friends">Mutual Friends</option><option value="none">Nobody</option>
              </select>
            </div>
            <Toggle label="Read Receipts" k="read_receipts" desc="Show when you've read messages" />
            <Toggle label="Typing Indicators" k="typing_indicators" desc="Show when you're typing" />
            <Toggle label="Ghost Mode" k="ghost_mode" desc="Appear offline to everyone" />
            <Toggle label="Focus Mode" k="focus_mode" desc="Suppress all notifications" />
          </>}

          {tab === 'appearance' && <>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'dark', label: 'Dark', bg: '#0f0f13' }, { id: 'amoled', label: 'AMOLED', bg: '#000000' }, { id: 'midnight', label: 'Midnight', bg: '#0d0d1a' }].map(t => (
                  <button key={t.id} onClick={() => set('theme', t.id)} className="p-3 rounded-lg text-center transition-all"
                    style={{ background: form.theme === t.id ? 'rgba(255,255,255,0.06)' : colors.bg.elevated, border: `2px solid ${form.theme === t.id ? colors.accent.primary : 'transparent'}` }}>
                    <div className="w-full h-8 rounded-md mb-1.5" style={{ background: t.bg }} />
                    <span className="text-[12px] font-medium" style={{ color: colors.text.primary }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Message Layout</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'cozy', label: 'Cozy', desc: 'Avatars and spacing' }, { id: 'compact', label: 'Compact', desc: 'Dense, no avatars' }].map(t => (
                  <button key={t.id} onClick={() => set('message_display', t.id)} className="px-4 py-3 rounded-lg text-left"
                    style={{ background: colors.bg.elevated, border: `2px solid ${form.message_display === t.id ? colors.accent.primary : 'transparent'}` }}>
                    <span className="text-[13px] block font-medium" style={{ color: colors.text.primary }}>{t.label}</span>
                    <span className="text-[11px]" style={{ color: colors.text.muted }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Accent Color</label>
              <div className="flex gap-2 flex-wrap">
                {['#7c5cbf', '#5865f2', '#23a55a', '#f23f43', '#f0b232', '#eb459e', '#00a8fc', '#80848e'].map(c => (
                  <button key={c} onClick={() => set('accent_color', c)} className="w-9 h-9 rounded-full transition-all"
                    style={{ background: c, border: form.accent_color === c ? '3px solid #fff' : '3px solid transparent', transform: form.accent_color === c ? 'scale(1.15)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
            <Slider label="Font Scaling" k="font_scaling" min={80} max={120} unit="%" />
          </>}

          {tab === 'notifications' && <>
            <Toggle label="Desktop Notifications" k="desktop_notifs" desc="Show system notifications" />
            <Toggle label="DM Notifications" k="dm_notifs" desc="Notify for new direct messages" />
            <Toggle label="Mention Notifications" k="mention_notifs" desc="Notify when you're mentioned" />
            <Toggle label="Sound Effects" k="sound_notifs" desc="Play notification sounds" />
          </>}

          {tab === 'voice' && <>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Input Device</label>
              <select value={form.input_device} onChange={e => set('input_device', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="default">Default</option>
              </select>
            </div>
            <Slider label="Input Volume" k="input_volume" min={0} max={200} unit="%" />
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Output Device</label>
              <select value={form.output_device} onChange={e => set('output_device', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="default">Default</option>
              </select>
            </div>
            <Slider label="Output Volume" k="output_volume" min={0} max={200} unit="%" />
            <Toggle label="Noise Suppression" k="noise_suppression" desc="Reduce background noise" />
            <Toggle label="Echo Cancellation" k="echo_cancellation" desc="Prevent audio feedback" />
            <Toggle label="Auto Gain Control" k="auto_gain" desc="Normalize microphone volume" />
          </>}

          {tab === 'keybinds' && <>
            <p className="text-[14px] mb-4" style={{ color: colors.text.muted }}>Keyboard shortcuts for quick navigation.</p>
            {[
              { keys: 'Ctrl + K', action: 'Quick switcher' },
              { keys: 'Ctrl + /', action: 'Show all keybinds' },
              { keys: 'Ctrl + Shift + M', action: 'Toggle mute' },
              { keys: 'Ctrl + Shift + D', action: 'Toggle deafen' },
              { keys: 'Ctrl + E', action: 'Open emoji picker' },
              { keys: 'Alt + Up/Down', action: 'Switch channels' },
              { keys: 'Escape', action: 'Close modal / Cancel' },
            ].map((kb, i) => (
              <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
                <span className="text-[14px]" style={{ color: colors.text.primary }}>{kb.action}</span>
                <kbd className="text-[12px] px-2.5 py-1 rounded-md font-mono" style={{ background: colors.bg.base, color: colors.text.muted, border: `1px solid ${colors.border.default}` }}>{kb.keys}</kbd>
              </div>
            ))}
          </>}

          {tab === 'accessibility' && <>
            <Toggle label="Reduced Motion" k="reduced_motion" desc="Minimize animations throughout the app" />
            <Toggle label="High Contrast" k="high_contrast" desc="Increase contrast for visibility" />
            <Slider label="Font Scaling" k="font_scaling" min={80} max={150} unit="%" />
            <Slider label="Color Saturation" k="saturation" min={0} max={200} unit="%" />
          </>}

          <div className="pt-2">
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg text-[14px] font-semibold disabled:opacity-30 transition-all"
              style={{ background: colors.accent.primary, color: '#fff' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}