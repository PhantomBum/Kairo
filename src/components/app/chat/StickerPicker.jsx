import React, { useState, useEffect } from 'react';
import { X, Sparkles, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';

const KAIRO_STICKERS = [
  { id: 'k1', name: 'Thumbs Up', emoji: '👍', url: '' },
  { id: 'k2', name: 'Heart', emoji: '❤️', url: '' },
  { id: 'k3', name: 'Laugh', emoji: '😂', url: '' },
  { id: 'k4', name: 'Fire', emoji: '🔥', url: '' },
  { id: 'k5', name: 'Cool', emoji: '😎', url: '' },
  { id: 'k6', name: 'Thinking', emoji: '🤔', url: '' },
  { id: 'k7', name: 'Celebrate', emoji: '🎉', url: '' },
  { id: 'k8', name: 'Cry', emoji: '😢', url: '' },
  { id: 'k9', name: 'Rocket', emoji: '🚀', url: '' },
  { id: 'k10', name: 'Star', emoji: '⭐', url: '' },
  { id: 'k11', name: 'Wave', emoji: '👋', url: '' },
  { id: 'k12', name: 'Sparkles', emoji: '✨', url: '' },
];

export default function StickerPicker({ onSelect, onClose, serverId }) {
  const [tab, setTab] = useState('kairo');
  const [serverStickers, setServerStickers] = useState([]);

  useEffect(() => {
    if (serverId) base44.entities.ServerSticker.filter({ server_id: serverId }).then(setServerStickers).catch(() => {});
  }, [serverId]);

  const handleSelect = (sticker) => {
    if (sticker.url) onSelect(sticker.url);
    else onSelect(sticker.emoji); // Fallback to emoji
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 rounded-2xl overflow-hidden k-scale-in z-30"
      style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-[13px] font-bold" style={{ color: colors.text.primary }}>Stickers</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]">
          <X className="w-4 h-4" style={{ color: colors.text.muted }} />
        </button>
      </div>
      <div className="px-3 pb-2 flex gap-1">
        {[{ id: 'server', label: 'Server', count: serverStickers.length }, { id: 'kairo', label: 'Kairo' }, { id: 'favorites', label: 'Favorites' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
            style={{ background: tab === t.id ? colors.accent.muted : colors.bg.elevated, color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
            {t.label} {t.count !== undefined ? `(${t.count})` : ''}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto scrollbar-none px-3 pb-3 grid grid-cols-4 gap-2" style={{ maxHeight: 260 }}>
        {tab === 'kairo' && KAIRO_STICKERS.map(s => (
          <button key={s.id} onClick={() => handleSelect(s)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ background: colors.bg.elevated }}>
            <span className="text-3xl">{s.emoji}</span>
            <span className="text-[10px] truncate w-full text-center" style={{ color: colors.text.muted }}>{s.name}</span>
          </button>
        ))}
        {tab === 'server' && (serverStickers.length > 0 ? serverStickers.map(s => (
          <button key={s.id} onClick={() => handleSelect(s)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ background: colors.bg.elevated }}>
            {s.image_url ? <img src={s.image_url} className="w-14 h-14 object-contain" alt={s.name} /> : <span className="text-3xl">📎</span>}
            <span className="text-[10px] truncate w-full text-center" style={{ color: colors.text.muted }}>{s.name}</span>
          </button>
        )) : (
          <div className="col-span-4 text-center py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: colors.text.muted }} />
            <p className="text-[13px]" style={{ color: colors.text.muted }}>No server stickers</p>
          </div>
        ))}
        {tab === 'favorites' && (
          <div className="col-span-4 text-center py-8">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: colors.text.muted }} />
            <p className="text-[13px]" style={{ color: colors.text.muted }}>No favorites yet</p>
          </div>
        )}
      </div>
    </div>
  );
}