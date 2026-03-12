import React, { useState, useEffect } from 'react';
import { Star, X, ExternalLink, Hash, MessageSquare, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

export default function StarredMessagesPanel({ onClose, currentUserId, onJumpToMessage }) {
  const [starred, setStarred] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = `kairo-starred-${currentUserId}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      setStarred(saved.filter(m => !m.is_deleted));
    } catch {}
    setLoading(false);
  }, [currentUserId]);

  const removeStar = (msgId) => {
    const key = `kairo-starred-${currentUserId}`;
    const updated = starred.filter(m => m.id !== msgId);
    setStarred(updated);
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-2xl overflow-hidden" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxHeight: '70vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: '#f0b232' }} />
            <h2 className="text-[16px] font-semibold" style={{ color: colors.text.primary }}>Starred Messages</h2>
            <span className="text-[12px] px-1.5 py-0.5 rounded-full" style={{ background: colors.bg.overlay, color: colors.text.muted }}>{starred.length}</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-none" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.06)', borderTopColor: colors.accent.primary }} />
            </div>
          ) : starred.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Star className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No starred messages yet</p>
              <p className="text-[12px]" style={{ color: colors.text.muted }}>Star any message from the hover actions or right-click menu to save it here.</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {starred.map(msg => (
                <div key={msg.id} className="group rounded-xl p-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]" style={{ background: colors.bg.overlay }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden" style={{ background: colors.bg.elevated, color: colors.text.muted }}>
                      {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" /> : (msg.author_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{msg.author_name}</span>
                    <span className="text-[11px]" style={{ color: colors.text.disabled }}>{new Date(msg.created_date).toLocaleDateString()}</span>
                    {msg.channel_name && (
                      <span className="text-[11px] flex items-center gap-0.5 ml-auto" style={{ color: colors.text.disabled }}>
                        <Hash className="w-3 h-3" />{msg.channel_name}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] break-words" style={{ color: colors.text.secondary }}>{msg.content?.slice(0, 200)}{msg.content?.length > 200 ? '...' : ''}</p>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { onJumpToMessage?.(msg); onClose(); }} className="text-[11px] px-2 py-1 rounded-md flex items-center gap-1 hover:bg-[rgba(255,255,255,0.06)]" style={{ color: colors.text.link }}>
                      <ExternalLink className="w-3 h-3" /> Jump
                    </button>
                    <button onClick={() => removeStar(msg.id)} className="text-[11px] px-2 py-1 rounded-md flex items-center gap-1 hover:bg-[rgba(242,63,67,0.1)]" style={{ color: colors.danger }}>
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}