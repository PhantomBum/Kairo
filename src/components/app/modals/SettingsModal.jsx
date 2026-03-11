import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { User, Link, Shield, LogOut, Palette, Bell, Volume2, Keyboard, Accessibility, HelpCircle, Crown, ExternalLink } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'social', label: 'Links', icon: Link },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'appearance', label: 'Theme', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
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
    accent_color: profile?.accent_color || '#e8e4d9',
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
      <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{label}</label>
      {area ? <textarea value={form[k]} onChange={e => set(k, e.target.value)} rows={3} placeholder={ph}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      : <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />}
    </div>
  );

  const Toggle = ({ label, k, desc }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 min-w-0">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {desc && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      <button onClick={() => set(k, !form[k])} className="w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ml-2" style={{ background: form[k] ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: form[k] ? 22 : 2 }} />
      </button>
    </div>
  );

  const Slider = ({ label, k, min, max, unit }) => (
    <div className="py-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{form[k]}{unit}</span>
      </div>
      <input type="range" value={form[k]} onChange={e => set(k, Number(e.target.value))} min={min} max={max}
        className="w-full h-1 rounded-full appearance-none cursor-pointer" style={{ background: 'var(--bg-overlay)', accentColor: 'var(--accent-green)' }} />
    </div>
  );

  const Lbl = ({ children }) => <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{children}</label>;

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={640}>
      <div className="flex gap-4 min-h-[420px]">
        <div className="w-[130px] flex-shrink-0 space-y-0.5 overflow-y-auto max-h-[520px] scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors"
              style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <a href={createPageUrl('Elite')} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors hover:bg-[rgba(201,180,123,0.08)]" style={{ color: 'var(--accent-amber)' }}>
            <Crown className="w-3.5 h-3.5" /> Elite
          </a>
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <a href={createPageUrl('FAQ')} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-muted)' }}>
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </a>
          <a href={createPageUrl('Support')} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-muted)' }}>
            <ExternalLink className="w-3.5 h-3.5" /> Support
          </a>
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors hover:bg-[rgba(201,123,123,0.08)]" style={{ color: 'var(--accent-red)' }}>
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[520px] scrollbar-none">
          {tab === 'profile' && <>
            <div className="flex items-center gap-4">
              <button onClick={() => handleFile('avatar_url')} className="relative w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden group"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (form.display_name || 'U').charAt(0).toUpperCase()}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[9px] text-white">Edit</span></div>
              </button>
              <div><p className="text-sm font-medium" style={{ color: 'var(--text-cream)' }}>{form.display_name || 'User'}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click to change avatar</p></div>
            </div>
            <button onClick={() => handleFile('banner_url')} className="w-full h-16 rounded-xl overflow-hidden cursor-pointer"
              style={{ background: profile?.banner_url ? 'transparent' : 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
              {profile?.banner_url ? <img src={profile.banner_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[11px]" style={{ color: 'var(--text-muted)' }}>Upload banner</div>}
            </button>
            <Field label="Display Name" k="display_name" ph="Your Name" />
            <Field label="Username" k="username" ph="your_handle" />
            <Field label="Bio" k="bio" ph="About you..." area />
            <Field label="Pronouns" k="pronouns" ph="they/them" />
          </>}

          {tab === 'social' && <>
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
              <Lbl>DM Privacy</Lbl>
              <select value={form.dm_privacy} onChange={e => set('dm_privacy', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="everyone">Everyone</option><option value="friends">Friends Only</option><option value="servers">Server Members Only</option><option value="none">Nobody</option>
              </select>
            </div>
            <div>
              <Lbl>Friend Requests</Lbl>
              <select value={form.friend_requests} onChange={e => set('friend_requests', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
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
              <Lbl>Theme</Lbl>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'dark', label: 'Dark', bg: '#050505' }, { id: 'amoled', label: 'AMOLED', bg: '#000000' }, { id: 'midnight', label: 'Midnight', bg: '#0a0a1a' }].map(t => (
                  <button key={t.id} onClick={() => set('theme', t.id)} className="p-3 rounded-xl text-center transition-all"
                    style={{ background: form.theme === t.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${form.theme === t.id ? 'var(--border-light)' : 'var(--border)'}` }}>
                    <div className="w-full h-8 rounded-lg mb-1.5" style={{ background: t.bg }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Lbl>Message Layout</Lbl>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'cozy', label: 'Cozy', desc: 'Avatars + spacing' }, { id: 'compact', label: 'Compact', desc: 'Dense, no avatars' }].map(t => (
                  <button key={t.id} onClick={() => set('message_display', t.id)} className="px-4 py-3 rounded-xl text-left"
                    style={{ background: form.message_display === t.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${form.message_display === t.id ? 'var(--border-light)' : 'var(--border)'}` }}>
                    <span className="text-[12px] block" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Lbl>Accent Color</Lbl>
              <div className="flex gap-2 flex-wrap">
                {['#e8e4d9', '#7bc9a4', '#7ba4c9', '#c97b7b', '#a47bc9', '#c9b47b', '#c98a7b', '#7bc9c9'].map(c => (
                  <button key={c} onClick={() => set('accent_color', c)} className="w-8 h-8 rounded-full transition-transform"
                    style={{ background: c, border: form.accent_color === c ? '3px solid var(--text-cream)' : '2px solid var(--border)', transform: form.accent_color === c ? 'scale(1.15)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
            <Slider label="Font Scaling" k="font_scaling" min={80} max={120} unit="%" />
            <Slider label="Saturation" k="saturation" min={0} max={200} unit="%" />
          </>}

          {tab === 'notifications' && <>
            <Toggle label="Desktop Notifications" k="desktop_notifs" desc="Show system notifications" />
            <Toggle label="DM Notifications" k="dm_notifs" desc="Notify for new direct messages" />
            <Toggle label="Mention Notifications" k="mention_notifs" desc="Notify when you're mentioned" />
            <Toggle label="Sound Effects" k="sound_notifs" desc="Play notification sounds" />
          </>}

          {tab === 'voice' && <>
            <div>
              <Lbl>Input Device</Lbl>
              <select value={form.input_device} onChange={e => set('input_device', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="default">Default</option>
              </select>
            </div>
            <Slider label="Input Volume" k="input_volume" min={0} max={200} unit="%" />
            <div>
              <Lbl>Output Device</Lbl>
              <select value={form.output_device} onChange={e => set('output_device', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="default">Default</option>
              </select>
            </div>
            <Slider label="Output Volume" k="output_volume" min={0} max={200} unit="%" />
            <Toggle label="Noise Suppression" k="noise_suppression" desc="Reduce background noise" />
            <Toggle label="Echo Cancellation" k="echo_cancellation" desc="Prevent audio feedback" />
            <Toggle label="Automatic Gain Control" k="auto_gain" desc="Normalize microphone volume" />
          </>}

          {tab === 'keybinds' && <>
            <p className="text-[12px] mb-3" style={{ color: 'var(--text-secondary)' }}>Keyboard shortcuts for quick navigation.</p>
            {[
              { keys: 'Ctrl + K', action: 'Quick switcher' },
              { keys: 'Ctrl + /', action: 'Show all keybinds' },
              { keys: 'Ctrl + Shift + M', action: 'Toggle mute' },
              { keys: 'Ctrl + Shift + D', action: 'Toggle deafen' },
              { keys: 'Ctrl + E', action: 'Open emoji picker' },
              { keys: 'Ctrl + Shift + I', action: 'Open inbox' },
              { keys: 'Alt + Up/Down', action: 'Switch channels' },
              { keys: 'Escape', action: 'Close modal / Cancel' },
            ].map((kb, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-1" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{kb.action}</span>
                <kbd className="text-[10px] px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{kb.keys}</kbd>
              </div>
            ))}
          </>}

          {tab === 'accessibility' && <>
            <Toggle label="Reduced Motion" k="reduced_motion" desc="Minimize animations throughout the app" />
            <Toggle label="High Contrast" k="high_contrast" desc="Increase contrast for better visibility" />
            <Slider label="Font Scaling" k="font_scaling" min={80} max={150} unit="%" />
            <Slider label="Color Saturation" k="saturation" min={0} max={200} unit="%" />
          </>}

          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </ModalWrapper>
  );
}