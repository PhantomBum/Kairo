import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Palette, Shield, Bell, Globe, Link } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'social', label: 'Connections', icon: Link },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [tab, setTab] = useState('profile');
  const [name, setName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');
  const [saving, setSaving] = useState(false);

  // Social links
  const [twitter, setTwitter] = useState(profile?.social_links?.twitter || '');
  const [github, setGithub] = useState(profile?.social_links?.github || '');
  const [website, setWebsite] = useState(profile?.social_links?.website || '');
  const [instagram, setInstagram] = useState(profile?.social_links?.instagram || '');
  const [spotify, setSpotify] = useState(profile?.social_links?.spotify || '');
  const [tiktok, setTiktok] = useState(profile?.social_links?.tiktok || '');

  // Privacy
  const [dmPrivacy, setDmPrivacy] = useState(profile?.settings?.dm_privacy || 'everyone');
  const [friendReqs, setFriendReqs] = useState(profile?.settings?.friend_requests || 'everyone');
  const [readReceipts, setReadReceipts] = useState(profile?.settings?.read_receipts !== false);
  const [typingInd, setTypingInd] = useState(profile?.settings?.typing_indicators !== false);

  const save = async () => {
    setSaving(true);
    const data = {};
    if (tab === 'profile') {
      Object.assign(data, { display_name: name, username, bio, pronouns });
    } else if (tab === 'social') {
      data.social_links = { twitter, github, website, instagram, spotify, tiktok };
    } else if (tab === 'privacy') {
      data.settings = { ...profile?.settings, dm_privacy: dmPrivacy, friend_requests: friendReqs, read_receipts: readReceipts, typing_indicators: typingInd };
    }
    await onUpdate(data);
    setSaving(false);
  };

  const handleAvatar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    await onUpdate({ avatar_url: file_url });
  };

  const handleBanner = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    await onUpdate({ banner_url: file_url });
  };

  const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      )}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)} className="w-10 h-5 rounded-full transition-colors relative"
        style={{ background: checked ? '#22c55e' : 'var(--bg-hover)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: checked ? 22 : 2 }} />
      </button>
    </div>
  );

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={600}>
      <div className="flex gap-4 min-h-[420px]">
        <div className="w-[130px] flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors"
              style={{ background: tab === t.id ? 'var(--accent-dim)' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-red-400 hover:bg-red-400/10">
            Log Out
          </button>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4">
          {tab === 'profile' && (
            <>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={() => document.getElementById('settings-avatar').click()}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden hover:brightness-110"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-[10px] text-white font-medium">Edit</div>
                  <input id="settings-avatar" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name || 'User'}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Click avatar to change</div>
                </div>
              </div>
              <div className="h-20 rounded-lg overflow-hidden cursor-pointer relative"
                style={{ background: profile?.banner_url ? 'transparent' : 'var(--bg)', border: '1px dashed var(--border)' }}
                onClick={() => document.getElementById('settings-banner').click()}>
                {profile?.banner_url ? <img src={profile.banner_url} className="w-full h-full object-cover" /> : (
                  <div className="flex items-center justify-center h-full text-xs" style={{ color: 'var(--text-muted)' }}>Click to upload profile banner</div>
                )}
                <input id="settings-banner" type="file" accept="image/*" onChange={handleBanner} className="hidden" />
              </div>
              <Field label="Display Name" value={name} onChange={setName} />
              <Field label="Username" value={username} onChange={setUsername} placeholder="your_username" />
              <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell others about yourself" type="textarea" />
              <Field label="Pronouns" value={pronouns} onChange={setPronouns} placeholder="they/them" />
            </>
          )}

          {tab === 'social' && (
            <>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Link your social profiles</p>
              <Field label="Twitter / X" value={twitter} onChange={setTwitter} placeholder="https://twitter.com/you" />
              <Field label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/you" />
              <Field label="Website" value={website} onChange={setWebsite} placeholder="https://yoursite.com" />
              <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="https://instagram.com/you" />
              <Field label="Spotify" value={spotify} onChange={setSpotify} placeholder="https://open.spotify.com/user/you" />
              <Field label="TikTok" value={tiktok} onChange={setTiktok} placeholder="https://tiktok.com/@you" />
            </>
          )}

          {tab === 'privacy' && (
            <>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Who can DM you</label>
                <select value={dmPrivacy} onChange={e => setDmPrivacy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option value="everyone">Everyone</option><option value="friends">Friends Only</option><option value="servers">Server Members</option><option value="none">Nobody</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Friend Requests</label>
                <select value={friendReqs} onChange={e => setFriendReqs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option value="everyone">Everyone</option><option value="friends_of_friends">Friends of Friends</option><option value="none">Nobody</option>
                </select>
              </div>
              <Toggle label="Read Receipts" desc="Let others know when you've read messages" checked={readReceipts} onChange={setReadReceipts} />
              <Toggle label="Typing Indicators" desc="Show when you're typing" checked={typingInd} onChange={setTypingInd} />
            </>
          )}

          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}