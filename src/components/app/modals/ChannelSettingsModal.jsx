import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Lock, Clock, Shield, Hash, MessageSquare, Bell } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { ServerLabel, ServerToggle } from './SettingsFormParts';

export default function ChannelSettingsModal({ onClose, channel, onDelete }) {
  const qc = useQueryClient();
  const [name, setName] = useState(channel?.name || '');
  const [desc, setDesc] = useState(channel?.description || '');
  const [slowMode, setSlowMode] = useState(channel?.slow_mode_seconds || 0);
  const [nsfw, setNsfw] = useState(channel?.is_nsfw || false);
  const [priv, setPriv] = useState(channel?.is_private || false);
  const [userLimit, setUserLimit] = useState(channel?.user_limit || 0);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const isVoice = channel?.type === 'voice' || channel?.type === 'stage';

  const save = async () => {
    setSaving(true);
    await base44.entities.Channel.update(channel.id, {
      name, description: desc, slow_mode_seconds: slowMode,
      is_nsfw: nsfw, is_private: priv, user_limit: userLimit || undefined,
    });
    qc.invalidateQueries({ queryKey: ['channels'] });
    setSaving(false); onClose();
  };

  const handleDelete = async () => {
    await base44.entities.Channel.delete(channel.id);
    qc.invalidateQueries({ queryKey: ['channels'] });
    onDelete?.(); onClose();
  };

  return (
    <ModalWrapper title={`#${channel?.name} Settings`} onClose={onClose} width={460}>
      <div className="space-y-4">
        <div>
          <ServerLabel>Channel Name</ServerLabel>
          <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>
        <div>
          <ServerLabel>Topic / Description</ServerLabel>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        <ServerToggle on={priv} onToggle={() => setPriv(!priv)} label="Private Channel" icon={Lock} desc="Only selected roles/members can view" />
        <ServerToggle on={nsfw} onToggle={() => setNsfw(!nsfw)} label="Age-Restricted (NSFW)" icon={Shield} desc="Users must confirm age to access" />

        {!isVoice && (
          <div>
            <ServerLabel>Slow Mode</ServerLabel>
            <select value={slowMode} onChange={e => setSlowMode(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <option value={0}>Off</option>
              <option value={5}>5s</option><option value={10}>10s</option>
              <option value={30}>30s</option><option value={60}>1 min</option>
              <option value={300}>5 min</option><option value={3600}>1 hour</option>
            </select>
          </div>
        )}

        {isVoice && (
          <div>
            <ServerLabel>User Limit (0 = unlimited)</ServerLabel>
            <input type="number" value={userLimit} onChange={e => setUserLimit(Number(e.target.value))} min={0} max={99}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono"
              style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>

        <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm hover:bg-[rgba(201,123,123,0.08)]"
              style={{ color: 'var(--accent-red)' }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete Channel
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--accent-red)', color: '#fff' }}>Confirm Delete</button>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}