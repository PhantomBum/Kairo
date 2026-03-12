import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function CreateCategoryModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    await onCreate(name.trim());
    setCreating(false);
  };

  return (
    <ModalWrapper title="Create Category" onClose={onClose} width={400}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Category Name</label>
          <input value={name} onChange={e => setName(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="NEW CATEGORY"
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
            autoFocus maxLength={50} />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: colors.text.muted }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || creating}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {creating ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}