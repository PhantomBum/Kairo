import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Hash, Volume2, Users, MessageCircle, 
  Server, User, Clock, Star, ArrowRight, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RECENT_KEY = 'kairo_quick_switcher_recent';

export default function QuickSwitcher({ 
  isOpen, 
  onClose, 
  servers = [], 
  channels = [], 
  conversations = [],
  friends = [],
  onSelectServer,
  onSelectChannel,
  onSelectConversation,
  onSelectFriend
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const inputRef = useRef(null);

  // Load recent items
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecentItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build search results
  const results = React.useMemo(() => {
    const items = [];
    const q = query.toLowerCase().trim();

    if (!q) {
      // Show recent items when no query
      if (recentItems.length > 0) {
        items.push({ type: 'header', label: 'Recent' });
        items.push(...recentItems.slice(0, 5));
      }
      
      // Show some servers
      if (servers.length > 0) {
        items.push({ type: 'header', label: 'Servers' });
        items.push(...servers.slice(0, 3).map(s => ({ type: 'server', ...s })));
      }
      
      return items;
    }

    // Search servers
    const matchedServers = servers.filter(s => 
      s.name?.toLowerCase().includes(q)
    ).slice(0, 3);
    
    if (matchedServers.length > 0) {
      items.push({ type: 'header', label: 'Servers' });
      items.push(...matchedServers.map(s => ({ type: 'server', ...s })));
    }

    // Search channels
    const matchedChannels = channels.filter(c => 
      c.name?.toLowerCase().includes(q)
    ).slice(0, 5);
    
    if (matchedChannels.length > 0) {
      items.push({ type: 'header', label: 'Channels' });
      items.push(...matchedChannels.map(c => ({ type: 'channel', ...c })));
    }

    // Search conversations/DMs
    const matchedConversations = conversations.filter(c => 
      c.name?.toLowerCase().includes(q) || c.participant_name?.toLowerCase().includes(q)
    ).slice(0, 3);
    
    if (matchedConversations.length > 0) {
      items.push({ type: 'header', label: 'Direct Messages' });
      items.push(...matchedConversations.map(c => ({ type: 'conversation', ...c })));
    }

    // Search friends
    const matchedFriends = friends.filter(f => 
      f.friend_name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q)
    ).slice(0, 3);
    
    if (matchedFriends.length > 0) {
      items.push({ type: 'header', label: 'Friends' });
      items.push(...matchedFriends.map(f => ({ type: 'friend', ...f })));
    }

    return items;
  }, [query, servers, channels, conversations, friends, recentItems]);

  // Get selectable items (exclude headers)
  const selectableItems = results.filter(r => r.type !== 'header');

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, selectableItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = selectableItems[selectedIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [selectableItems, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleSelect = (item) => {
    // Save to recent
    const newRecent = [item, ...recentItems.filter(r => r.id !== item.id)].slice(0, 10);
    setRecentItems(newRecent);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
    } catch {}

    // Navigate
    switch (item.type) {
      case 'server':
        onSelectServer?.(item);
        break;
      case 'channel':
        onSelectChannel?.(item);
        break;
      case 'conversation':
        onSelectConversation?.(item);
        break;
      case 'friend':
        onSelectFriend?.(item);
        break;
    }
    onClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'server': return Server;
      case 'channel': return Hash;
      case 'voice': return Volume2;
      case 'conversation': return MessageCircle;
      case 'friend': return User;
      default: return Hash;
    }
  };

  if (!isOpen) return null;

  let selectableIndex = -1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-xl bg-[#111113] border border-white/[0.06] rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <Search className="w-5 h-5 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="Where would you like to go?"
              className="flex-1 bg-transparent text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex items-center gap-1 text-xs text-zinc-600">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">K</kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No results found</p>
                <p className="text-xs mt-1">Try searching for servers, channels, or friends</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((item, index) => {
                  if (item.type === 'header') {
                    return (
                      <div key={`header-${index}`} className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                    );
                  }

                  selectableIndex++;
                  const isSelected = selectableIndex === selectedIndex;
                  const Icon = getIcon(item.type);

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(selectableIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 transition-colors",
                        isSelected ? "bg-white/5" : "hover:bg-white/[0.02]"
                      )}
                    >
                      {/* Icon or Avatar */}
                      {item.icon_url || item.avatar_url || item.friend_avatar ? (
                        <img
                          src={item.icon_url || item.avatar_url || item.friend_avatar}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 text-left min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          isSelected ? "text-white" : "text-zinc-300"
                        )}>
                          {item.name || item.friend_name || item.participant_name}
                        </p>
                        {item.server_name && (
                          <p className="text-xs text-zinc-600 truncate">{item.server_name}</p>
                        )}
                      </div>

                      {/* Type badge */}
                      <span className="text-xs text-zinc-600 capitalize">{item.type}</span>

                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}