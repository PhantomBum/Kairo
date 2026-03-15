import React, { useState, useMemo } from 'react';
import { X, Check, Upload, Users, Search, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

export default function CreateGroupDMModal({ onClose, friends, onCreate, hasElite }) {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const maxMembers = hasElite ? 25 : 15;

  const toggle = (f) => setSelected(prev => {
    if (prev.find(s => s.friend_id === f.friend_id)) return prev.filter(s => s.friend_id !== f.friend_id);
    if (prev.length >= maxMembers - 1) return prev;
    return [...prev, f];
  });

  const uploadIcon = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      setUploading(true);
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setIconUrl(file_url);
      } catch {}
      setUploading(false);
    };
    input.click();
  };

  const create = () => {
    if (selected.length < 1) return;
    onCreate({
      name: name.trim() || undefined,
      icon_url: iconUrl || undefined,
      participants: selected.map(f => ({
        user_id: f.friend_id, user_email: f.friend_email,
        user_name: f.friend_name, avatar: f.friend_avatar,
      })),
    });
  };

  const filtered = useMemo(() =>
    (friends || []).filter(f => !search || f.friend_name?.toLowerCase().includes(search.toLowerCase())),
    [friends, search]
  );

  const atLimit = selected.length >= maxMembers - 1;

  return (
    <ModalWrapper title="Create Group DM" subtitle={`Add up to ${maxMembers - 1} friends`} onClose={onClose} width={440}>
      <div className="space-y-4">
        {/* Group icon + name */}
        <div className="flex gap-3">
          <button onClick={uploadIcon}
            className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden transition-all hover:brightness-110"
            style={{ background: P.elevated, border: `1px dashed ${P.border}` }}>
            {iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" alt="Group icon" />
              : uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.muted }} />
              : <Upload className="w-4 h-4" style={{ color: P.muted }} />}
          </button>
          <div className="flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Group Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Squad chat"
              className="w-full px-3 py-2 rounded-lg text-[14px] outline-none"
              style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
          </div>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map(s => (
              <span key={s.friend_id} onClick={() => toggle(s)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors hover:brightness-110"
                style={{ background: `${P.accent}18`, color: P.textPrimary, border: `1px solid ${P.accent}30` }}>
                {s.friend_name} <X className="w-2.5 h-2.5" />
              </span>
            ))}
            <span className="text-[11px] px-2 py-1 tabular-nums flex items-center gap-1" style={{ color: atLimit ? P.warning : P.muted }}>
              {selected.length + 1}/{maxMembers}
              {!hasElite && <Crown className="w-3 h-3" style={{ color: '#f0b232' }} title="Elite: up to 25 members" />}
            </span>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: P.base, border: `1px solid ${P.border}` }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: P.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#68677a]"
            style={{ color: P.textPrimary }} />
        </div>

        {/* Friends list */}
        <div className="max-h-52 overflow-y-auto scrollbar-none space-y-1">
          {filtered.map(f => {
            const isSelected = selected.find(s => s.friend_id === f.friend_id);
            return (
              <button key={f.id} onClick={() => toggle(f)}
                disabled={atLimit && !isSelected}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all disabled:opacity-40"
                style={{ background: isSelected ? `${P.accent}14` : P.elevated }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
                  style={{ background: P.base, color: P.muted }}>
                  {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-[14px] flex-1 text-left truncate" style={{ color: P.textPrimary }}>{f.friend_name}</span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: P.accent }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-6">
              <p className="text-[13px]" style={{ color: P.muted }}>
                {search ? 'No friends match your search' : 'Add some friends first to create a group'}
              </p>
            </div>
          )}
        </div>

        {/* Create button */}
        <button onClick={create} disabled={selected.length < 1}
          className="w-full py-2.5 rounded-xl text-[14px] font-semibold disabled:opacity-30 transition-all hover:brightness-110"
          style={{ background: P.accent, color: '#0d1117' }}>
          <span className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Create Group ({selected.length + 1} members)
          </span>
        </button>
      </div>
    </ModalWrapper>
  );
}
