import React, { useState } from 'react';
import { Upload, Users, Gamepad2, Code, Lock, Mic, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

const templates = [
  { id: 'blank', label: 'Blank', icon: null, desc: 'Start from scratch' },
  { id: 'community', label: 'Community', icon: Users, desc: 'For communities & groups' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'For gaming groups' },
  { id: 'development', label: 'Dev Team', icon: Code, desc: 'For dev teams & projects' },
  { id: 'private', label: 'Private', icon: Lock, desc: 'For close friends' },
  { id: 'creator', label: 'Creator', icon: Mic, desc: 'For content creators' },
];

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('blank');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleCreate = () => { if (name.trim()) onCreate({ name: name.trim(), template, icon_url: iconUrl || undefined }); };

  const handleIcon = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setIconUrl(file_url);
    setUploading(false);
  };

  return (
    <ModalWrapper title="Create a server" onClose={onClose} width={480}>
      <div className="space-y-5">
        {/* Icon */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => document.getElementById('server-icon').click()}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl overflow-hidden hover:brightness-110"
              style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '2px dashed var(--border)' }}>
              {uploading ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
              ) : iconUrl ? (
                <img src={iconUrl} className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <input id="server-icon" type="file" accept="image/*" onChange={handleIcon} className="hidden" />
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Server Icon</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Recommended: 512x512px</div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Server Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Server"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
        </div>

        {/* Templates */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Template</label>
          <div className="grid grid-cols-3 gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors text-center"
                style={{
                  background: template === t.id ? 'var(--accent-dim)' : 'var(--bg)',
                  color: template === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: `1px solid ${template === t.id ? 'var(--border-hover)' : 'var(--border)'}`,
                }}>
                {t.icon && <t.icon className="w-4 h-4" />}
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {isCreating ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}