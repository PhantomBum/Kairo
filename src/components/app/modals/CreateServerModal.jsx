import React, { useState } from 'react';
import { Upload, Users, Gamepad2, Code, Lock, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const templates = [
  { id: 'blank', label: 'Blank', icon: null, desc: 'Start fresh' },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'development', label: 'Dev Team', icon: Code },
  { id: 'private', label: 'Private', icon: Lock },
  { id: 'creator', label: 'Creator', icon: Mic },
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
    <ModalWrapper title="Create a Server" subtitle="Your server is where you and your friends hang out" onClose={onClose} width={460}>
      <div className="space-y-5">
        {/* Icon upload */}
        <div className="flex items-center gap-4">
          <button onClick={() => document.getElementById('srv-icon').click()}
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden hover:brightness-125"
            style={{ background: colors.bg.elevated, border: `2px dashed ${colors.border.light}` }}
            aria-label="Upload server icon">
            {uploading ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.default, borderTopColor: colors.text.muted }} />
            : iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" alt="Server icon" />
            : <Upload className="w-5 h-5" style={{ color: colors.text.muted }} />}
          </button>
          <input id="srv-icon" type="file" accept="image/*" onChange={handleIcon} className="hidden" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-medium" style={{ color: colors.text.primary }}>Server Icon</p>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>512×512 recommended</p>
          </div>
        </div>

        {/* Server name */}
        <div>
          <label htmlFor="server-name" className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Server Name</label>
          <input id="server-name" value={name} onChange={e => setName(e.target.value)} placeholder="My awesome server"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} autoFocus />
        </div>

        {/* Template selection */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Template</label>
          <div className="grid grid-cols-3 gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg"
                style={{
                  background: template === t.id ? colors.accent.subtle : colors.bg.elevated,
                  border: `1px solid ${template === t.id ? colors.accent.muted : colors.border.default}`,
                  color: template === t.id ? colors.text.primary : colors.text.muted,
                }}
                aria-pressed={template === t.id}>
                {t.icon && <t.icon className="w-4 h-4" />}
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[14px] hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.secondary }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-5 py-2.5 rounded-lg text-[14px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {isCreating ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}