import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Palette, Bell, Shield, LogOut, Camera, Globe, Link2, Keyboard } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const tabs = [
  { id: 'account', label: 'My Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'shortcuts', label: 'Keybinds', icon: Keyboard },
];

const themes = [
  { id: 'dark', name: 'Dark', preview: '#0e0e0e' },
  { id: 'amoled', name: 'AMOLED', preview: '#000000' },
  { id: 'midnight', name: 'Midnight', preview: '#0a0a1a' },
];

const shortcuts = [
  { keys: 'Ctrl + K', action: 'Quick Switcher' },
  { keys: 'Ctrl + F', action: 'Search' },
  { keys: 'Ctrl + /', action: 'Keyboard Shortcuts' },
  { keys: 'Ctrl + Shift + M', action: 'Toggle Members' },
  { keys: 'Escape', action: 'Close Modals / Cancel' },
  { keys: 'Enter', action: 'Send Message' },
  { keys: 'Shift + Enter', action: 'New Line' },
];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState('account');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');
  const [accentColor, setAccentColor] = useState(profile?.accent_color || '#6366f1');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Social links
  const [twitter, setTwitter] = useState(profile?.social_links?.twitter || '');
  const [github, setGithub] = useState(profile?.social_links?.github || '');
  const [instagram, setInstagram] = useState(profile?.social_links?.instagram || '');
  const [website, setWebsite] = useState(profile?.social_links?.website || '');

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      display_name: displayName, username, bio, pronouns, accent_color: accentColor,
      social_links: { twitter, github, instagram, website },
    });
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await onUpdate({ avatar_url: file_url });
    setUploadingAvatar(false);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await onUpdate({ banner_url: file_url });
    setUploadingBanner(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="relative flex w-full max-w-4xl mx-auto my-8 max-h-[calc(100vh-4rem)] rounded-xl overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-56 p-3 flex flex-col" style={{ background: '#0e0e0e' }}>
          <div className="text-[11px] font-semibold uppercase text-zinc-500 px-3 py-2">User Settings</div>
          <div className="flex-1 space-y-0.5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: activeTab === t.id ? '#fff' : '#888' }}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="pt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-3 py-1 text-[10px] text-zinc-600">Kairo v4.0</div>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin" style={{ background: '#131313' }}>
          {activeTab === 'account' && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">My Account</h3>
              
              {/* Profile Card Preview */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
                {/* Banner */}
                <div className="h-24 relative group cursor-pointer" style={{ background: profile?.banner_url ? undefined : (accentColor || '#6366f1') }}>
                  {profile?.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover" />}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                  </label>
                  {uploadingBanner && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                </div>
                
                {/* Avatar + Info */}
                <div className="px-4 -mt-10 relative z-10">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#1a1a1a', border: '4px solid #1a1a1a' }}>
                      {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-zinc-500">{displayName.charAt(0)}</span>}
                    </div>
                    <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                    {uploadingAvatar && <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/70"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  </div>
                  <div className="py-3">
                    <div className="text-white font-semibold">{displayName || 'User'}</div>
                    <div className="text-sm text-zinc-500">@{username || 'username'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Display Name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Pronouns</label>
                    <input value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g. they/them"
                      className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#1a1a1a' }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
                      <span className="text-sm text-zinc-400 font-mono">{accentColor}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">About Me</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none" style={{ background: '#1a1a1a' }} />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-black disabled:opacity-50 transition-opacity" style={{ background: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
              <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-3">Theme</div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {themes.map(t => (
                  <button key={t.id} className="p-3 rounded-xl text-center transition-all hover:scale-105"
                    style={{ background: '#1a1a1a', border: '2px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-full h-16 rounded-lg mb-2" style={{ background: t.preview }} />
                    <span className="text-sm text-white">{t.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-3">Message Display</div>
              <div className="flex gap-3">
                <button className="flex-1 p-3 rounded-xl text-sm text-white" style={{ background: '#1a1a1a', border: '2px solid rgba(99,102,241,0.5)' }}>Cozy</button>
                <button className="flex-1 p-3 rounded-xl text-sm text-zinc-500" style={{ background: '#1a1a1a', border: '2px solid transparent' }}>Compact</button>
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-semibold text-white mb-6">Connections</h3>
              <div className="space-y-4">
                {[
                  { key: 'twitter', label: 'Twitter / X', icon: '𝕏', value: twitter, set: setTwitter },
                  { key: 'github', label: 'GitHub', icon: '🐙', value: github, set: setGithub },
                  { key: 'instagram', label: 'Instagram', icon: '📷', value: instagram, set: setInstagram },
                  { key: 'website', label: 'Website', icon: '🌐', value: website, set: setWebsite },
                ].map(s => (
                  <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#1a1a1a' }}>
                    <span className="text-lg w-8 text-center">{s.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                      <input value={s.value} onChange={e => s.set(e.target.value)} placeholder={`Your ${s.label} URL`}
                        className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
                    </div>
                  </div>
                ))}
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Connections'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="max-w-lg">
              <h3 className="text-lg font-semibold text-white mb-6">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {shortcuts.map(s => (
                  <div key={s.keys} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1a1a1a' }}>
                    <span className="text-sm text-zinc-300">{s.action}</span>
                    <kbd className="px-2 py-1 rounded text-xs font-mono text-zinc-400" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'notifications' || activeTab === 'privacy') && (
            <div className="max-w-lg">
              <h3 className="text-lg font-semibold text-white mb-6">{activeTab === 'notifications' ? 'Notifications' : 'Privacy & Safety'}</h3>
              <div className="space-y-3">
                {(activeTab === 'notifications' ? [
                  { label: 'Desktop Notifications', desc: 'Show desktop push notifications' },
                  { label: 'Sound Effects', desc: 'Play sounds for messages' },
                  { label: 'Unread Badge', desc: 'Show unread count on favicon' },
                ] : [
                  { label: 'Allow DMs from server members', desc: 'Let people in shared servers message you' },
                  { label: 'Allow friend requests from everyone', desc: 'Anyone can send you a request' },
                  { label: 'Show typing indicators', desc: 'Let others see when you type' },
                  { label: 'Read receipts', desc: 'Let others know when you read messages' },
                ]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1a1a1a' }}>
                    <div>
                      <div className="text-sm text-white">{item.label}</div>
                      <div className="text-[11px] text-zinc-500">{item.desc}</div>
                    </div>
                    <div className="w-10 h-6 rounded-full cursor-pointer transition-colors" style={{ background: '#22c55e' }}>
                      <div className="w-5 h-5 rounded-full bg-white mt-0.5 ml-[18px] transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}