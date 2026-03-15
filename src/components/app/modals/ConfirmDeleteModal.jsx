import React from 'react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function ConfirmDeleteModal({ title, subtitle, onConfirm, onClose, confirmLabel = 'Delete', isLoading }) {
  return (
    <ModalWrapper title={title} subtitle={subtitle} onClose={onClose} danger width={400}>
      <div className="flex gap-3 justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-[14px] font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: colors.text.secondary }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-50"
          style={{ background: colors.danger, color: '#fff' }}
        >
          {isLoading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </ModalWrapper>
  );
}
