import React, { useState } from 'react';
import { X, Check, Upload, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function CreateGroupDMModal({ onClose, friends, onCreate }) {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const toggle = (f) => setSelected(prev => {
    if (prev.find(s => s.friend_id === f.friend_id)) return prev.filter(s => s.friend_id !== f.friend_id);
    if (prev.length >= 24) return prev;
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
    <ModalWrapper title="Create Group DM" subtitle="Add friends to start a group conversation" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <button onClick={uploadIcon} className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: colors.bg.elevated, border: `1px dashed ${colors.border.light}` }}
            aria-label="Upload group icon">
            {iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" alt="Group icon" />
              : uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.text.muted }} />
              : <Upload className="w-4 h-4" style={{ color: colors.text.muted }} />}
          </button>
          <div className="flex-1">
            <label htmlFor="group-name" className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1" style={{ color: colors.text.muted }}>Group Name</label>
            <input id="group-name" value={name} onChange={e => setName(e.target.value)} placeholder="Squad chat"
              className="w-full px-3 py-2 rounded-lg text-[14px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map(s => (
              <span key={s.friend_id} onClick={() => toggle(s)}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] cursor-pointer hover:bg-[rgba(255,255,255,0.06)]"
                style={{ background: colors.accent.subtle, color: colors.text.primary, border: `1px solid ${colors.accent.muted}` }}>
                {s.friend_name} <X className="w-2.5 h-2.5" />
              </span>
            ))}
            <span className="text-[11px] px-2 py-1 tabular-nums" style={{ color: colors.text.disabled }}>{selected.length + 1}/25</span>
          </div>
        )}

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
          className="w-full px-3 py-2 rounded-lg text-[14px] outline-none"
          style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
          aria-label="Search friends" />

        <div className="max-h-52 overflow-y-auto scrollbar-none space-y-1">
          {filtered.map(f => {
            const isSelected = selected.find(s => s.friend_id === f.friend_id);
            return (
              <button key={f.id} onClick={() => toggle(f)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: isSelected ? colors.accent.subtle : colors.bg.elevated }}
                aria-pressed={!!isSelected}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
                  style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-[14px] flex-1 text-left" style={{ color: colors.text.primary }}>{f.friend_name}</span>
                {isSelected && <Check className="w-4 h-4" style={{ color: colors.success }} />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[13px]" style={{ color: colors.text.muted }}>
                {search ? 'No friends match your search' : 'Add some friends first to create a group'}
              </p>
            </div>
          )}
        </div>

        <button onClick={create} disabled={selected.length < 1}
          className="w-full py-2.5 rounded-lg text-[14px] font-semibold disabled:opacity-30"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          <span className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Create Group ({selected.length + 1} members)
          </span>
        </button>
      </div>
    </ModalWrapper>
  );
}