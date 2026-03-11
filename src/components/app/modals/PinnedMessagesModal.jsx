import React from 'react';
import { Pin, PinOff } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function PinnedMessagesModal({ onClose, messages, onUnpin }) {
  const pinned = (messages || []).filter(m => m.is_pinned);

  return (
    <ModalWrapper title="Pinned Messages" onClose={onClose} width={460}>
      {pinned.length === 0 ? (
        <div className="text-center py-8">
          <Pin className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pinned messages yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-none">
          {pinned.map(m => (
            <div key={m.id} className="p-3 rounded-xl group" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium overflow-hidden"
                  style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {m.author_avatar ? <img src={m.author_avatar} className="w-full h-full object-cover" /> : (m.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-cream)' }}>{m.author_name}</span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>{new Date(m.created_date).toLocaleDateString()}</span>
                <button onClick={() => onUnpin(m)} className="ml-auto p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--bg-glass-hover)]">
                  <PinOff className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />
                </button>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
}