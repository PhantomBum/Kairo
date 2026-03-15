import React, { useState, useEffect, useMemo, useRef } from 'react';
import { colors, shadows } from '@/components/app/design/tokens';
import { Globe, Wifi } from 'lucide-react';

const SPECIAL_MENTIONS = [
  { id: '__everyone__', displayName: 'everyone', special: true, description: 'Mention all members in this channel', icon: Globe },
  { id: '__here__', displayName: 'here', special: true, description: 'Mention all online members', icon: Wifi },
];

export default function MentionPicker({ filter, members, onSelect, profiles }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const q = (filter || '').toLowerCase();

    // Build special mentions list
    const specials = SPECIAL_MENTIONS.filter(s =>
      !q || s.displayName.includes(q)
    );

    // Build member list
    const list = (members || []).map(m => {
      const p = profiles?.(m.user_id);
      return { ...m, displayName: p?.display_name || m.user_email?.split('@')[0] || 'User', avatar: p?.avatar_url };
    });

    const memberResults = q
      ? list.filter(m => m.displayName.toLowerCase().includes(q) || m.user_email?.toLowerCase().includes(q)).slice(0, 8)
      : list.slice(0, 8);

    return [...specials, ...memberResults];
  }, [filter, members, profiles]);

  useEffect(() => { setSelectedIdx(0); }, [filter]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      else if ((e.key === 'Tab' || e.key === 'Enter') && filtered[selectedIdx]) { e.preventDefault(); onSelect(filtered[selectedIdx]); }
      else if (e.key === 'Escape') { e.preventDefault(); onSelect(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedIdx, onSelect]);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 mx-4 rounded-xl overflow-hidden k-fade-in z-30"
      style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Mentions — @{filter}</span>
      </div>
      <div ref={listRef} className="overflow-y-auto scrollbar-none max-h-[240px] pb-1">
        {filtered.map((m, i) => {
          if (m.special) {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => onSelect(m)}
                onMouseEnter={() => setSelectedIdx(i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                style={{ background: i === selectedIdx ? 'rgba(123,108,246,0.12)' : 'transparent' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${colors.accent.primary}20` }}>
                  <Icon className="w-4 h-4" style={{ color: colors.accent.primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-semibold" style={{ color: colors.accent.primary }}>@{m.displayName}</span>
                  <p className="text-[11px]" style={{ color: colors.text.muted }}>{m.description}</p>
                </div>
              </button>
            );
          }
          return (
            <button key={m.id || m.user_id} onClick={() => onSelect(m)}
              onMouseEnter={() => setSelectedIdx(i)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
              style={{ background: i === selectedIdx ? 'rgba(123,108,246,0.1)' : 'transparent' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden flex-shrink-0"
                style={{ background: colors.bg.elevated, color: colors.text.muted }}>
                {m.avatar ? <img src={m.avatar} className="w-full h-full object-cover" alt="" /> : m.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-medium" style={{ color: colors.text.primary }}>{m.displayName}</span>
              </div>
              <span className="text-[11px] flex-shrink-0 truncate max-w-[120px]" style={{ color: colors.text.disabled }}>{m.user_email}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}