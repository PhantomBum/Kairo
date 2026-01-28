import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Hash, Volume2, Users, Settings, Plus, Moon, Ghost,
  MessageCircle, Server, ChevronRight, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultCommands = [
  { id: 'focus-mode', label: 'Toggle Focus Mode', icon: Moon, shortcut: 'F', category: 'Actions' },
  { id: 'ghost-mode', label: 'Toggle Ghost Mode', icon: Ghost, shortcut: 'G', category: 'Actions' },
  { id: 'create-server', label: 'Create Server', icon: Plus, category: 'Actions' },
  { id: 'join-server', label: 'Join Server', icon: Server, category: 'Actions' },
  { id: 'add-friend', label: 'Add Friend', icon: Users, category: 'Actions' },
  { id: 'settings', label: 'User Settings', icon: Settings, shortcut: ',', category: 'Navigation' },
  { id: 'dms', label: 'Direct Messages', icon: MessageCircle, shortcut: 'D', category: 'Navigation' },
];

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onCommand,
  servers = [],
  channels = [],
  conversations = []
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          onCommand?.(command);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, onCommand, onClose]);

  // Build command list
  const allCommands = [
    ...defaultCommands,
    ...servers.map(s => ({
      id: `server-${s.id}`,
      label: s.name,
      icon: Server,
      category: 'Servers',
      data: s
    })),
    ...channels.map(c => ({
      id: `channel-${c.id}`,
      label: `#${c.name}`,
      icon: c.type === 'voice' ? Volume2 : Hash,
      category: 'Channels',
      data: c
    })),
    ...conversations.map(c => ({
      id: `dm-${c.id}`,
      label: c.name || c.participants?.[0]?.user_name,
      icon: MessageCircle,
      category: 'Messages',
      data: c
    }))
  ];

  // Filter commands
  const filteredCommands = query
    ? allCommands.filter(c => 
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    const cat = cmd.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(cmd);
    return acc;
  }, {});

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-xl mx-4 bg-[#121214] rounded-xl shadow-2xl border border-zinc-800 overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none"
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-500">
            <Command className="w-3 h-3" />
            K
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {category}
              </div>
              {commands.map((command) => {
                flatIndex++;
                const isSelected = flatIndex === selectedIndex;
                const currentIndex = flatIndex;

                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      onCommand?.(command);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 transition-colors",
                      isSelected ? "bg-indigo-500/20" : "hover:bg-zinc-800/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-indigo-500/30" : "bg-zinc-800"
                    )}>
                      <command.icon className={cn(
                        "w-4 h-4",
                        isSelected ? "text-indigo-400" : "text-zinc-400"
                      )} />
                    </div>
                    <span className={cn(
                      "flex-1 text-left text-sm",
                      isSelected ? "text-white" : "text-zinc-300"
                    )}>
                      {command.label}
                    </span>
                    {command.shortcut && (
                      <div className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-500">
                        {command.shortcut}
                      </div>
                    )}
                    {isSelected && (
                      <ChevronRight className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-8 text-center text-zinc-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded">↑↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</span>
              Select
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-zinc-800 rounded">Esc</span>
              Close
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}