import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { User, Link, Shield, LogOut, Palette, Bell, Volume2, Keyboard, Accessibility, HelpCircle, Crown, ExternalLink, Lock, Mail, Award, Sparkles } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import SecuritySettings from '@/components/app/features/SecuritySettings';
import { SettingsField, SettingsToggle, SettingsSlider } from './SettingsFormParts';
import BadgeOrderSettings from '@/components/app/badges/BadgeOrderSettings';
import EffectsSettings from '@/components/app/effects/EffectsSettings';

const TABS = [
  { id: 'profile', label: 'My Account', icon: User },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'effects', label: 'Effects', icon: Sparkles },
  { id: 'social', label: 'Connections', icon: Link },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'voice', label: 'Voice & Video', icon: Volume2 },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout, currentUser }) {
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
    compact_servers: profile?.settings?.compact_servers || false,
    notification_sound: profile?.settings?.notification_sound || 'default',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = {};
    if (tab === 'profile') Object.assign(data, { display_name: form.display_name, username: form.username, bio: form.bio, pronouns: form.pronouns });
    else if (tab === 'social') data.social_links = { twitter: form.twitter, github: form.github, website: form.website, instagram: form.instagram, spotify: form.spotify, tiktok: form.tiktok, linkedin: form.linkedin, twitch: form.twitch };
    else if (tab === 'privacy') data.settings = { ...profile?.settings, dm_privacy: form.dm_privacy, friend_requests: form.friend_requests, read_receipts: form.read_receipts, typing_indicators: form.typing_indicators, ghost_mode: form.ghost_mode, focus_mode: form.focus_mode };
    else if (tab === 'appearance') { data.settings = { ...profile?.settings, theme: form.theme, message_display: form.message_display, compact_servers: form.compact_servers }; data.accent_color = form.accent_color; }
    await onUpdate(data); setSaving(false);
  };

  const handleFile = async (type) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); await onUpdate({ [type]: file_url }); };
    input.click();
  };

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={680}>
      <div className="flex gap-5 min-h-[440px]">
        {/* Sidebar */}
        <div className="w-[150px] flex-shrink-0 space-y-0.5 overflow-y-auto max-h-[540px] scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium"
              style={{ background: tab === t.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === t.id ? colors.text.primary : colors.text.disabled }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
          <div className="my-2.5 h-px" style={{ background: colors.border.default }} />
          <a href={createPageUrl('Elite')} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(255,255,255,0.03)]" style={{ color: colors.warning }}>
            <Crown className="w-3.5 h-3.5" /> Elite
          </a>
          <a href={createPageUrl('FAQ')} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(255,255,255,0.03)]" style={{ color: colors.text.disabled }}>
            <HelpCircle className="w-3.5 h-3.5" /> Help
          </a>
          <a href={createPageUrl('Support')} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(255,255,255,0.03)]" style={{ color: colors.text.disabled }}>
            <ExternalLink className="w-3.5 h-3.5" /> Support
          </a>
          <a href="mailto:ilikebagels1612@gmail.com" className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(255,255,255,0.03)]" style={{ color: colors.text.disabled }}>
            <Mail className="w-3.5 h-3.5" /> Contact Us
          </a>
          <div className="my-2.5 h-px" style={{ background: colors.border.default }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium hover:bg-[rgba(242,63,67,0.06)]" style={{ color: colors.danger }}>
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[540px] scrollbar-none">
          {tab === 'profile' && <>
            {/* Profile completion */}
            {(() => {
              const checks = [
                { done: !!profile?.avatar_url, label: 'Add an avatar' },
                { done: !!profile?.bio, label: 'Write a bio' },
                { done: !!profile?.social_links && Object.values(profile.social_links).some(v => v), label: 'Connect a social account' },
                { done: !!profile?.custom_status?.text, label: 'Set a custom status' },
              ];
              const done = checks.filter(c => c.done).length;
              const pct = Math.round((done / checks.length) * 100);
              if (pct < 100) return (
                <div className="p-3 rounded-lg mb-2" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>Profile {pct}% complete</span>
                    <span className="text-[11px]" style={{ color: colors.text.muted }}>{done}/{checks.length}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: colors.bg.overlay }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? colors.success : colors.accent.primary }} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {checks.filter(c => !c.done).map((c, i) => (
                      <p key={i} className="text-[11px]" style={{ color: colors.text.muted }}>• {c.label}</p>
                    ))}
                  </div>
                </div>
              );
              return null;
            })()}
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
            <SettingsField label="Display Name" value={form.display_name} onChange={v => set('display_name', v)} placeholder="Your Name" />
            <SettingsField label="Username" value={form.username} onChange={v => set('username', v)} placeholder="your_handle" />
            <SettingsField label="About Me" value={form.bio} onChange={v => set('bio', v)} placeholder="Tell people about yourself..." area />
            <SettingsField label="Pronouns" value={form.pronouns} onChange={v => set('pronouns', v)} placeholder="they/them" />
          </>}

          {tab === 'badges' && (
            <BadgeOrderSettings
              badges={profile?.badges || []}
              badgeOrder={profile?.badge_order || []}
              onSave={(order) => onUpdate({ badge_order: order })}
            />
          )}

          {tab === 'effects' && (
            <EffectsSettings
              currentEffect={profile?.profile_effect || 'none'}
              hasElite={profile?.badges?.includes('premium') || profile?.badges?.includes('kairo_elite')}
              bannerUrl={profile?.banner_url}
              accentColor={profile?.accent_color}
              onSave={(effect) => onUpdate({ profile_effect: effect })}
            />
          )}

          {tab === 'social' && <>
            <p className="text-[14px] mb-2" style={{ color: colors.text.muted }}>Add your social profiles and website links.</p>
            <SettingsField label="Twitter / X" value={form.twitter} onChange={v => set('twitter', v)} placeholder="https://twitter.com/you" />
            <SettingsField label="GitHub" value={form.github} onChange={v => set('github', v)} placeholder="https://github.com/you" />
            <SettingsField label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://yoursite.com" />
            <SettingsField label="Instagram" value={form.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/you" />
            <SettingsField label="Spotify" value={form.spotify} onChange={v => set('spotify', v)} placeholder="https://open.spotify.com/user/you" />
            <SettingsField label="TikTok" value={form.tiktok} onChange={v => set('tiktok', v)} placeholder="https://tiktok.com/@you" />
            <SettingsField label="LinkedIn" value={form.linkedin} onChange={v => set('linkedin', v)} placeholder="https://linkedin.com/in/you" />
            <SettingsField label="Twitch" value={form.twitch} onChange={v => set('twitch', v)} placeholder="https://twitch.tv/you" />
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
            <SettingsToggle label="Read Receipts" checked={form.read_receipts} onChange={v => set('read_receipts', v)} desc="Show when you've read messages" />
            <SettingsToggle label="Typing Indicators" checked={form.typing_indicators} onChange={v => set('typing_indicators', v)} desc="Show when you're typing" />
            <SettingsToggle label="Ghost Mode" checked={form.ghost_mode} onChange={v => set('ghost_mode', v)} desc="Appear offline to everyone" />
            <SettingsToggle label="Focus Mode" checked={form.focus_mode} onChange={v => set('focus_mode', v)} desc="Suppress all notifications" />
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
            <SettingsToggle label="Compact Server List" checked={form.compact_servers} onChange={v => set('compact_servers', v)} desc="Smaller server icons for power users" />
            <SettingsSlider label="Font Scaling" value={form.font_scaling} onChange={v => set('font_scaling', v)} min={80} max={120} unit="%" />
          </>}

          {tab === 'notifications' && <>
            <SettingsToggle label="Desktop Notifications" checked={form.desktop_notifs} onChange={v => set('desktop_notifs', v)} desc="Show system notifications" />
            <SettingsToggle label="DM Notifications" checked={form.dm_notifs} onChange={v => set('dm_notifs', v)} desc="Notify for new direct messages" />
            <SettingsToggle label="Mention Notifications" checked={form.mention_notifs} onChange={v => set('mention_notifs', v)} desc="Notify when you're mentioned" />
            <SettingsToggle label="Sound Effects" checked={form.sound_notifs} onChange={v => set('sound_notifs', v)} desc="Play notification sounds" />
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Notification Sound</label>
              <select value={form.notification_sound} onChange={e => set('notification_sound', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="default">Default</option>
                <option value="chime">Chime</option>
                <option value="ping">Ping</option>
                <option value="bell">Bell</option>
                <option value="pop">Pop</option>
                <option value="soft">Soft</option>
                <option value="none">None</option>
              </select>
            </div>
          </>}

          {tab === 'voice' && <>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Input Device</label>
              <select value={form.input_device} onChange={e => set('input_device', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="default">Default</option>
              </select>
            </div>
            <SettingsSlider label="Input Volume" value={form.input_volume} onChange={v => set('input_volume', v)} min={0} max={200} unit="%" />
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: colors.text.muted }}>Output Device</label>
              <select value={form.output_device} onChange={e => set('output_device', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <option value="default">Default</option>
              </select>
            </div>
            <SettingsSlider label="Output Volume" value={form.output_volume} onChange={v => set('output_volume', v)} min={0} max={200} unit="%" />
            <SettingsToggle label="Noise Suppression" checked={form.noise_suppression} onChange={v => set('noise_suppression', v)} desc="Reduce background noise" />
            <SettingsToggle label="Echo Cancellation" checked={form.echo_cancellation} onChange={v => set('echo_cancellation', v)} desc="Prevent audio feedback" />
            <SettingsToggle label="Auto Gain Control" checked={form.auto_gain} onChange={v => set('auto_gain', v)} desc="Normalize microphone volume" />
          </>}

          {tab === 'keybinds' && <>
            <p className="text-[14px] mb-4" style={{ color: colors.text.muted }}>Keyboard shortcuts for quick navigation.</p>
            {[
              { keys: 'Ctrl + Shift + M', action: 'Toggle mute' },
              { keys: 'Ctrl + Shift + D', action: 'Toggle deafen' },
              { keys: 'Up Arrow', action: 'Edit last message (when input is empty)' },
              { keys: 'Shift + Enter', action: 'New line in message' },
              { keys: 'Enter', action: 'Send message' },
              { keys: 'Escape', action: 'Close modal or cancel editing' },
            ].map((kb, i) => (
              <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
                <span className="text-[14px]" style={{ color: colors.text.primary }}>{kb.action}</span>
                <kbd className="text-[12px] px-2.5 py-1 rounded-md font-mono" style={{ background: colors.bg.base, color: colors.text.muted, border: `1px solid ${colors.border.default}` }}>{kb.keys}</kbd>
              </div>
            ))}
          </>}

          {tab === 'security' && <SecuritySettings profile={profile} currentUser={currentUser || { id: profile?.user_id }} onUpdate={onUpdate} />}

          {tab === 'accessibility' && <>
            <SettingsToggle label="Reduced Motion" checked={form.reduced_motion} onChange={v => set('reduced_motion', v)} desc="Minimize animations throughout the app" />
            <SettingsToggle label="High Contrast" checked={form.high_contrast} onChange={v => set('high_contrast', v)} desc="Increase contrast for visibility" />
            <SettingsSlider label="Font Scaling" value={form.font_scaling} onChange={v => set('font_scaling', v)} min={80} max={150} unit="%" />
            <SettingsSlider label="Color Saturation" value={form.saturation} onChange={v => set('saturation', v)} min={0} max={200} unit="%" />
          </>}

          <div className="pt-3 mt-2" style={{ borderTop: `1px solid ${colors.border.default}` }}>
            <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
              style={{ background: colors.accent.primary, color: '#fff' }}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}