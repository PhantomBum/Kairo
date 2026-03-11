import React, { useState } from 'react';
import { Upload, Users, Gamepad2, Code, Lock, Mic } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

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

  return (
    <ModalWrapper title="Create a Server" onClose={onClose} width={460}>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <button onClick={() => document.getElementById('srv-icon').click()}
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:brightness-125"
            style={{ background: 'var(--bg-glass)', border: '2px dashed var(--border-light)' }}>
            {uploading ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
            : iconUrl ? <img src={iconUrl} className="w-full h-full object-cover" />
            : <Upload className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
          </button>
          <input id="srv-icon" type="file" accept="image/*" onChange={handleIcon} className="hidden" />
          <div><p className="text-sm font-medium" style={{ color: 'var(--text-cream)' }}>Server Icon</p><p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>512×512 recommended</p></div>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Server Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="my-server"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate({ name: name.trim(), template, icon_url: iconUrl || undefined })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors focus:border-[var(--border-light)]"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontFamily: 'monospace' }} autoFocus />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Template</label>
          <div className="grid grid-cols-3 gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                style={{ background: template === t.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${template === t.id ? 'var(--border-light)' : 'var(--border)'}`, color: template === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
                {t.icon && <t.icon className="w-4 h-4" />}
                <span className="text-[10px] font-medium" style={{ fontFamily: 'monospace' }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => name.trim() && onCreate({ name: name.trim(), template, icon_url: iconUrl || undefined })} disabled={!name.trim() || isCreating}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}