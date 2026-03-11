import React, { useState } from 'react';
import { X, Check, Upload, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

export default function CreateGroupDMModal({ onClose, friends, onCreate }) {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const toggle = (f) => setSelected(prev => {
    if (prev.find(s => s.friend_id === f.friend_id)) return prev.filter(s => s.friend_id !== f.friend_id);
    if (prev.length >= 24) return prev; // Max 25 including creator
    return [...prev, f];
  });

  const uploadIcon = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setIconUrl(file_url); setUploading(false);
    };
    input.click();
  };

  const create = () => {
    if (selected.length < 1) return;
    onCreate({ name: name.trim() || undefined, icon_url: iconUrl || undefined, participants: selected.map(f => ({ user_id: f.friend_id, user_email: f.friend_email, user_name: f.friend_name, avatar: f.friend_avatar })) });
  };

  const filtered = (friends || []).filter(f => !search || f.friend_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <ModalWrapper title="Create Group DM" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <button onClick={uploadIcon} className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden group relative"
            style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
            {iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" />
              : uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
              : <Upload className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
          </button>
          <div className="flex-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Group Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Squad chat" className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map(s => (
              <span key={s.friend_id} onClick={() => toggle(s)} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] cursor-pointer transition-colors hover:bg-[var(--bg-glass-hover)]"
                style={{ background: 'var(--bg-glass-active)', color: 'var(--text-cream)', border: '1px solid var(--border-light)' }}>
                {s.friend_name} <X className="w-2.5 h-2.5" />
              </span>
            ))}
            <span className="text-[10px] px-2 py-1" style={{ color: 'var(--text-faint)' }}>{selected.length + 1}/25</span>
          </div>
        )}

        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-2"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        <div className="max-h-52 overflow-y-auto scrollbar-none space-y-1">
          {filtered.map(f => {
            const isSelected = selected.find(s => s.friend_id === f.friend_id);
            return (
              <button key={f.id} onClick={() => toggle(f)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{ background: isSelected ? 'var(--bg-glass-active)' : 'var(--bg-glass)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                  style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{f.friend_name}</span>
                {isSelected && <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-[11px] py-4" style={{ color: 'var(--text-muted)' }}>No friends found</p>}
        </div>

        <button onClick={create} disabled={selected.length < 1} className="w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
          style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          <span className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Create Group ({selected.length + 1} members)
          </span>
        </button>
      </div>
    </ModalWrapper>
  );
}