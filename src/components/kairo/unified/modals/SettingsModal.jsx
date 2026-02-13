import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Palette, Bell, Shield, LogOut, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const tabs = [
  { id: 'account', label: 'My Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [activeTab, setActiveTab] = useState('account');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({ display_name: displayName, username, bio, pronouns });
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="relative flex w-full max-w-4xl mx-auto my-8 max-h-[calc(100vh-4rem)]">
        
        {/* Sidebar */}
        <div className="w-56 rounded-l-xl p-3 flex flex-col" style={{ background: '#0e0e0e' }}>
          <div className="flex-1 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ background: activeTab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: activeTab === t.id ? '#fff' : '#888' }}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-r-xl p-6 overflow-y-auto" style={{ background: '#131313' }}>
          {activeTab === 'account' && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">My Account</h3>
              
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-zinc-500">{displayName.charAt(0)}</span>}
                  </div>
                  <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  {uploadingAvatar && <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/70"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                </div>
                <div>
                  <div className="text-white font-medium">{profile?.display_name}</div>
                  <div className="text-sm text-zinc-500">@{profile?.username}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Display Name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Pronouns</label>
                  <input value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g. they/them"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#1a1a1a' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">About Me</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none resize-none" style={{ background: '#1a1a1a' }} />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          {activeTab !== 'account' && (
            <div className="text-center py-12">
              <p className="text-zinc-500">Coming soon</p>
            </div>
          )}
        </div>

        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}