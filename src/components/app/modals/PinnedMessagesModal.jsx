import React from 'react';
import { Pin, PinOff } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function PinnedMessagesModal({ onClose, messages, onUnpin }) {
  const pinned = (messages || []).filter(m => m.is_pinned);

  return (
    <ModalWrapper title="Pinned Messages" subtitle={pinned.length > 0 ? `${pinned.length} pinned` : undefined} onClose={onClose} width={460}>
      {pinned.length === 0 ? (
        <div className="text-center py-12 k-fade-in">
          <Pin className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No pinned messages</p>
          <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>Pin important messages so they're easy to find later</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-none">
          {pinned.map(m => (
            <div key={m.id} className="p-3 rounded-xl group" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium overflow-hidden"
                  style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {m.author_avatar ? <img src={m.author_avatar} className="w-full h-full object-cover" alt="" /> : (m.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>{m.author_name}</span>
                <span className="text-[10px] tabular-nums" style={{ color: colors.text.disabled }}>{new Date(m.created_date).toLocaleDateString()}</span>
                <button onClick={() => onUnpin(m)}
                  className="ml-auto p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[rgba(255,255,255,0.06)]"
                  title="Unpin" aria-label="Unpin message">
                  <PinOff className="w-3 h-3" style={{ color: colors.warning }} />
                </button>
              </div>
              <p className="text-[13px] leading-relaxed break-words" style={{ color: colors.text.secondary }}>{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
}