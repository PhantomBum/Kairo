import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Link, Shield, LogOut } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [{ id: 'profile', label: 'Profile', icon: User }, { id: 'social', label: 'Links', icon: Link }, { id: 'privacy', label: 'Privacy', icon: Shield }];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    display_name: profile?.display_name || '', username: profile?.username || '', bio: profile?.bio || '', pronouns: profile?.pronouns || '',
    twitter: profile?.social_links?.twitter || '', github: profile?.social_links?.github || '', website: profile?.social_links?.website || '',
    instagram: profile?.social_links?.instagram || '', spotify: profile?.social_links?.spotify || '', tiktok: profile?.social_links?.tiktok || '',
    dm_privacy: profile?.settings?.dm_privacy || 'everyone', friend_requests: profile?.settings?.friend_requests || 'everyone',
    read_receipts: profile?.settings?.read_receipts !== false, typing_indicators: profile?.settings?.typing_indicators !== false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = {};
    if (tab === 'profile') Object.assign(data, { display_name: form.display_name, username: form.username, bio: form.bio, pronouns: form.pronouns });
    else if (tab === 'social') data.social_links = { twitter: form.twitter, github: form.github, website: form.website, instagram: form.instagram, spotify: form.spotify, tiktok: form.tiktok };
    else if (tab === 'privacy') data.settings = { ...profile?.settings, dm_privacy: form.dm_privacy, friend_requests: form.friend_requests, read_receipts: form.read_receipts, typing_indicators: form.typing_indicators };
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

  const Toggle = ({ label, k }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <button onClick={() => set(k, !form[k])} className="w-10 h-5 rounded-full transition-colors relative" style={{ background: form[k] ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: form[k] ? 22 : 2 }} />
      </button>
    </div>
  );

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={580}>
      <div className="flex gap-4 min-h-[380px]">
        <div className="w-[120px] flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] transition-colors"
              style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] transition-colors hover:bg-[rgba(201,123,123,0.08)]" style={{ color: 'var(--accent-red)' }}>
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[460px]">
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
            <Field label="Twitter" k="twitter" ph="https://twitter.com/you" />
            <Field label="GitHub" k="github" ph="https://github.com/you" />
            <Field label="Website" k="website" ph="https://yoursite.com" />
            <Field label="Instagram" k="instagram" ph="https://instagram.com/you" />
            <Field label="Spotify" k="spotify" ph="https://open.spotify.com/user/you" />
            <Field label="TikTok" k="tiktok" ph="https://tiktok.com/@you" />
          </>}
          {tab === 'privacy' && <>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>DM Privacy</label>
              <select value={form.dm_privacy} onChange={e => set('dm_privacy', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="everyone">Everyone</option><option value="friends">Friends Only</option><option value="none">Nobody</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Friend Requests</label>
              <select value={form.friend_requests} onChange={e => set('friend_requests', e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="everyone">Everyone</option><option value="friends_of_friends">Mutual Friends</option><option value="none">Nobody</option>
              </select>
            </div>
            <Toggle label="Read Receipts" k="read_receipts" />
            <Toggle label="Typing Indicators" k="typing_indicators" />
          </>}
          <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </ModalWrapper>
  );
}