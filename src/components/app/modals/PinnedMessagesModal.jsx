import React from 'react';
import { Pin } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function PinnedMessagesModal({ onClose, messages, onUnpin }) {
  const pinned = messages.filter(m => m.is_pinned);

  return (
    <ModalWrapper title="Pinned Messages" onClose={onClose}>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {pinned.length === 0 && (
          <div className="text-center py-8">
            <Pin className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pinned messages yet</p>
          </div>
        )}
        {pinned.map(msg => (
          <div key={msg.id} className="p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] overflow-hidden"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" /> : (msg.author_name || 'U').charAt(0)}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{msg.author_name}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{new Date(msg.created_date).toLocaleString()}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
            {msg.attachments?.length > 0 && (
              <div className="flex gap-1 mt-1">
                {msg.attachments.map((a, i) => a.content_type?.startsWith('image/') ? (
                  <img key={i} src={a.url} className="w-16 h-16 rounded object-cover" />
                ) : <span key={i} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>📎 {a.filename}</span>)}
              </div>
            )}
            {onUnpin && (
              <button onClick={() => onUnpin(msg)} className="text-[10px] mt-1 text-red-400 hover:underline">Unpin</button>
            )}
          </div>
        ))}
      </div>
    </ModalWrapper>
  );
}