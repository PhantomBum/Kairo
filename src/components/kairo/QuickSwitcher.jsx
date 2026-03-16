/**
 * Quick Switcher — Ctrl/Cmd+K to jump to server, channel, or DM.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Hash, MessageCircle, Search } from 'lucide-react';

const WRAPPER_STYLE = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.8)',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: '15vh',
  zIndex: 2000,
};

const BOX_STYLE = {
  width: '100%',
  maxWidth: 440,
  background: '#111114',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
  overflow: 'hidden',
};

const INPUT_WRAPPER = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const INPUT_STYLE = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#ffffff',
  fontSize: 15,
  fontFamily: 'inherit',
};

const LIST_STYLE = {
  maxHeight: 320,
  overflowY: 'auto',
  padding: '6px 0',
};

const ROW_STYLE = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  color: '#ffffff',
  fontSize: 14,
});

const SECTION_LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#555566',
  padding: '8px 14px 4px',
};

export default function QuickSwitcher({ open, onClose, servers = [], channels = [], conversations = [], currentServerId, currentChannelId, currentConvId, onSelectServer, onSelectChannel, onSelectConv }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const q = (query || '').trim().toLowerCase();

  const serverChannels = channels.filter((c) => c.server_id === currentServerId && (c.type === 'text' || c.type === 'announcement' || c.type === 'voice'));
  const filteredServers = q ? servers.filter((s) => (s.name || '').toLowerCase().includes(q)) : servers;
  const filteredChannels = q && currentServerId
    ? serverChannels.filter((c) => (c.name || '').toLowerCase().includes(q))
    : currentServerId ? serverChannels : [];
  const filteredConvs = q
    ? conversations.filter((c) => {
        const name = c.name || c.participants?.find((p) => p.user_id !== c.participants?.[0]?.user_id)?.user_name || '';
        return name.toLowerCase().includes(q);
      })
    : conversations;

  const flatItems = [
    ...(filteredServers.length ? [{ type: 'header', label: 'Servers' }] : []),
    ...filteredServers.map((s) => ({ type: 'server', ...s })),
    ...(filteredChannels.length ? [{ type: 'header', label: 'Channels' }] : []),
    ...filteredChannels.map((c) => ({ type: 'channel', ...c })),
    ...(filteredConvs.length ? [{ type: 'header', label: 'Direct Messages' }] : []),
    ...filteredConvs.map((c) => ({ type: 'conv', ...c })),
  ].filter((x) => x.type !== 'header');
  const selectableItems = flatItems.filter((i) => i.type !== 'header');
  const selectedItem = selectableItems[selectedIndex];

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!selectedItem || !listRef.current) return;
    const el = listRef.current.children[selectedIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, selectedItem]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % selectableItems.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + selectableItems.length) % selectableItems.length);
      }
      if (e.key === 'Enter' && selectedItem) {
        e.preventDefault();
        if (selectedItem.type === 'server') onSelectServer(selectedItem);
        if (selectedItem.type === 'channel') onSelectChannel(selectedItem);
        if (selectedItem.type === 'conv') onSelectConv(selectedItem);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selectedItem, selectableItems.length, onClose, onSelectServer, onSelectChannel, onSelectConv]);

  const handleSelect = (item) => {
    if (item.type === 'server') onSelectServer(item);
    if (item.type === 'channel') onSelectChannel(item);
    if (item.type === 'conv') onSelectConv(item);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={WRAPPER_STYLE}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-label="Quick switcher"
    >
      <div style={BOX_STYLE} onClick={(e) => e.stopPropagation()}>
        <div style={INPUT_WRAPPER}>
          <Search size={18} style={{ color: '#555566', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to server, channel, or DM..."
            style={INPUT_STYLE}
            autoComplete="off"
          />
        </div>
        <div ref={listRef} style={LIST_STYLE}>
          {filteredServers.length > 0 && (
            <>
              <div style={SECTION_LABEL_STYLE}>Servers</div>
              {filteredServers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  style={ROW_STYLE(selectedItem?.id === s.id && selectedItem?.type === 'server')}
                  onMouseEnter={() => setSelectedIndex(selectableItems.findIndex((i) => i.type === 'server' && i.id === s.id))}
                  onClick={() => handleSelect({ type: 'server', ...s })}
                >
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                    {(s.name || 'S').charAt(0)}
                  </span>
                  {s.name || 'Server'}
                </button>
              ))}
            </>
          )}
          {filteredChannels.length > 0 && (
            <>
              <div style={SECTION_LABEL_STYLE}>Channels</div>
              {filteredChannels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  style={ROW_STYLE(selectedItem?.id === c.id && selectedItem?.type === 'channel')}
                  onMouseEnter={() => setSelectedIndex(selectableItems.findIndex((i) => i.type === 'channel' && i.id === c.id))}
                  onClick={() => handleSelect({ type: 'channel', ...c })}
                >
                  {c.type === 'voice' ? '🔊' : <Hash size={16} style={{ color: '#888899' }} />}
                  {c.name}
                </button>
              ))}
            </>
          )}
          {filteredConvs.length > 0 && (
            <>
              <div style={SECTION_LABEL_STYLE}>Direct Messages</div>
              {filteredConvs.map((c) => {
                const name = c.name || c.participants?.find((p) => p.user_id !== c.participants?.[0]?.user_id)?.user_name || 'DM';
                return (
                  <button
                    key={c.id}
                    type="button"
                    style={ROW_STYLE(selectedItem?.id === c.id && selectedItem?.type === 'conv')}
                    onMouseEnter={() => setSelectedIndex(selectableItems.findIndex((i) => i.type === 'conv' && i.id === c.id))}
                    onClick={() => handleSelect({ type: 'conv', ...c })}
                  >
                    <MessageCircle size={16} style={{ color: '#888899' }} />
                    {name}
                  </button>
                );
              })}
            </>
          )}
          {selectableItems.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#555566', fontSize: 14 }}>
              No results for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
