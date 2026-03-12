import React, { useState } from 'react';
import { Upload, Users, Gamepad2, Code, Lock, Mic, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const templates = [
  { id: 'blank', label: 'Blank', icon: null },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'development', label: 'Dev', icon: Code },
  { id: 'private', label: 'Private', icon: Lock },
  { id: 'creator', label: 'Creator', icon: Mic },
  { id: 'event', label: 'Event', icon: Calendar },
];

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('blank');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleIcon = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setIconUrl(file_url); setUploading(false);
  };

  const handleCreate = () => {
    if (name.trim()) onCreate({ name: name.trim(), template, icon_url: iconUrl || undefined });
  };

  return (
    <ModalWrapper title="New server" onClose={onClose} width={420}>
      <div className="space-y-5">
        {/* Icon + Name on same row */}
        <div className="flex items-center gap-3">
          <button onClick={() => document.getElementById('srv-icon').click()}
            className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: iconUrl ? 'transparent' : colors.bg.elevated, border: `1px dashed ${colors.border.light}` }}>
            {uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.text.muted }} />
            : iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" alt="" />
            : <Upload className="w-4 h-4" style={{ color: colors.text.disabled }} />}
          </button>
          <input id="srv-icon" type="file" accept="image/*" onChange={handleIcon} className="hidden" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Server name"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="flex-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} autoFocus />
        </div>

        {/* Templates as a compact horizontal scroll */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Template</p>
          <div className="flex gap-1.5 flex-wrap">
            {templates.map(t => {
              const active = template === t.id;
              return (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{
                    background: active ? colors.accent.subtle : 'transparent',
                    color: active ? colors.accent.hover : colors.text.muted,
                    border: `1px solid ${active ? colors.accent.muted : colors.border.default}`,
                  }}>
                  {t.icon && <t.icon className="w-3 h-3" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <button onClick={onClose} className="text-[13px] font-medium hover:underline" style={{ color: colors.text.disabled }}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}