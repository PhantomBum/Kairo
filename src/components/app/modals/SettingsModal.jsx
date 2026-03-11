import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

export default function SettingsModal({ onClose, profile, onUpdate, onLogout }) {
  const [name, setName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate({ display_name: name, bio });
    setSaving(false);
  };

  const handleAvatar = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    await onUpdate({ avatar_url: file_url });
  };

  return (
    <ModalWrapper title="Settings" onClose={onClose} width={520}>
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium overflow-hidden cursor-pointer hover:brightness-110"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              onClick={() => document.getElementById('avatar-input').click()}>
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (name || 'U').charAt(0).toUpperCase()}
            </div>
            <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Click to change avatar</div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button onClick={onLogout} className="text-sm text-red-400 hover:underline">Log Out</button>
          <button onClick={save} disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}