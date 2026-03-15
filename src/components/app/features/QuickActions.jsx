import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, Hash, MessageSquare, Plus, UserPlus, Phone, Settings, Palette, CheckCheck, Server, ArrowRight, Clock, Users, Crown } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIONS = [
  { id: 'create-server', label: 'Create Server', icon: Plus, category: 'action', keywords: 'new server create' },
  { id: 'create-channel', label: 'Create Channel', icon: Hash, category: 'action', keywords: 'new channel create' },
  { id: 'add-friend', label: 'Invite Friend', icon: UserPlus, category: 'action', keywords: 'add friend invite' },
  { id: 'voice-call', label: 'Start Voice Call', icon: Phone, category: 'action', keywords: 'voice call start' },
  { id: 'settings', label: 'Go to Settings', icon: Settings, category: 'action', keywords: 'settings preferences options' },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: Palette, category: 'action', keywords: 'theme dark light toggle appearance' },
  { id: 'mark-read', label: 'Mark All as Read', icon: CheckCheck, category: 'action', keywords: 'mark read clear notifications' },
  { id: 'discover', label: 'Discover Servers', icon: Server, category: 'action', keywords: 'discover explore browse servers' },
  { id: 'elite', label: 'Kairo Elite', icon: Crown, category: 'action', keywords: 'elite premium subscription' },
];

export default function QuickActions({ onClose, onAction, recentChannels = [], recentDMs = [] }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const items = useMemo(() => {
    const q = query.toLowerCase().trim();
    const results = [];

    if (!q) {
      if (recentChannels.length > 0) {
        results.push({ type: 'header', label: 'Recent Channels' });
        recentChannels.slice(0, 5).forEach(ch => {
          results.push({ type: 'channel', id: `ch-${ch.id}`, label: `#${ch.name}`, sub: ch.serverName, icon: Hash, data: ch });
        });
      }
      if (recentDMs.length > 0) {
        results.push({ type: 'header', label: 'Recent DMs' });
        recentDMs.slice(0, 3).forEach(dm => {
          results.push({ type: 'dm', id: `dm-${dm.id}`, label: dm.name, sub: 'Direct Message', icon: MessageSquare, data: dm });
        });
      }
      results.push({ type: 'header', label: 'Quick Actions' });
      ACTIONS.forEach(a => results.push({ type: 'action', ...a }));
    } else {
      const matchedChannels = recentChannels.filter(ch => ch.name?.toLowerCase().includes(q));
      if (matchedChannels.length > 0) {
        results.push({ type: 'header', label: 'Channels' });
        matchedChannels.slice(0, 5).forEach(ch => {
          results.push({ type: 'channel', id: `ch-${ch.id}`, label: `#${ch.name}`, sub: ch.serverName, icon: Hash, data: ch });
        });
      }
      const matchedDMs = recentDMs.filter(dm => dm.name?.toLowerCase().includes(q));
      if (matchedDMs.length > 0) {
        results.push({ type: 'header', label: 'Direct Messages' });
        matchedDMs.slice(0, 3).forEach(dm => {
          results.push({ type: 'dm', id: `dm-${dm.id}`, label: dm.name, sub: 'Direct Message', icon: MessageSquare, data: dm });
        });
      }
      const matchedActions = ACTIONS.filter(a => a.label.toLowerCase().includes(q) || a.keywords.includes(q));
      if (matchedActions.length > 0) {
        results.push({ type: 'header', label: 'Actions' });
        matchedActions.forEach(a => results.push({ type: 'action', ...a }));
      }
    }
    return results;
  }, [query, recentChannels, recentDMs]);

  const selectableItems = items.filter(i => i.type !== 'header');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, selectableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = selectableItems[activeIndex];
      if (item) {
        onAction(item.type === 'action' ? item.id : item.type, item.data);
        onClose();
      }
    }
  }, [activeIndex, selectableItems, onAction, onClose]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  let selectableIdx = -1;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-[560px] max-w-[90vw] rounded-2xl overflow-hidden"
        style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.disabled }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Search channels, DMs, or type a command..."
            className="flex-1 bg-transparent text-[15px] outline-none" style={{ color: colors.text.primary }} />
          <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ background: colors.bg.elevated, color: colors.text.disabled, border: `1px solid ${colors.border.default}` }}>ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-[400px] overflow-y-auto scrollbar-none py-1">
          {items.length === 0 ? (
            <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No results found</p>
          ) : items.map((item, i) => {
            if (item.type === 'header') {
              return (
                <p key={`h-${i}`} className="text-[11px] font-bold uppercase tracking-wider px-4 pt-3 pb-1" style={{ color: colors.text.disabled }}>
                  {item.label}
                </p>
              );
            }
            selectableIdx++;
            const idx = selectableIdx;
            const isActive = idx === activeIndex;
            return (
              <button key={item.id} data-index={idx}
                onClick={() => { onAction(item.type === 'action' ? item.id : item.type, item.data); onClose(); }}
                onMouseEnter={() => setActiveIndex(idx)}
                className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
                style={{ background: isActive ? colors.bg.hover : 'transparent' }}>
                <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? colors.accent.primary : colors.text.muted }} />
                <span className="flex-1 text-left text-[14px]" style={{ color: isActive ? colors.text.primary : colors.text.secondary }}>{item.label}</span>
                {item.sub && <span className="text-[11px]" style={{ color: colors.text.disabled }}>{item.sub}</span>}
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? colors.text.muted : 'transparent' }} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 px-4 py-2" style={{ borderTop: `1px solid ${colors.border.default}`, background: colors.bg.elevated }}>
          <span className="text-[11px] flex items-center gap-1" style={{ color: colors.text.disabled }}>
            <kbd className="px-1 py-px rounded text-[11px]" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>↑↓</kbd> Navigate
          </span>
          <span className="text-[11px] flex items-center gap-1" style={{ color: colors.text.disabled }}>
            <kbd className="px-1 py-px rounded text-[11px]" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>↵</kbd> Select
          </span>
          <span className="text-[11px] flex items-center gap-1" style={{ color: colors.text.disabled }}>
            <kbd className="px-1 py-px rounded text-[11px]" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>ESC</kbd> Close
          </span>
        </div>
      </motion.div>
    </div>
  );
}
