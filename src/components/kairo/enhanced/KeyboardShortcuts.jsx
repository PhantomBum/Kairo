import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Command } from 'lucide-react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Quick Search' },
  { keys: ['Ctrl', 'Shift', 'A'], description: 'Toggle Sidebar' },
  { keys: ['Ctrl', 'Shift', 'M'], description: 'Toggle Members List' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'Mark All as Read' },
  { keys: ['Ctrl', '/'], description: 'Show Shortcuts' },
  { keys: ['Esc'], description: 'Close Modal/Clear Selection' },
  { keys: ['Alt', '↑'], description: 'Previous Channel' },
  { keys: ['Alt', '↓'], description: 'Next Channel' },
  { keys: ['Ctrl', 'Enter'], description: 'Send Message' },
  { keys: ['Shift', 'Enter'], description: 'New Line' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-sm text-zinc-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <React.Fragment key={j}>
                    <kbd className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono text-white">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && <span className="text-zinc-600">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      Object.entries(handlers).forEach(([shortcut, handler]) => {
        const parts = shortcut.toLowerCase().split('+');
        const needsCtrl = parts.includes('ctrl');
        const needsShift = parts.includes('shift');
        const needsAlt = parts.includes('alt');
        const keyPart = parts[parts.length - 1];

        if (
          ctrl === needsCtrl &&
          shift === needsShift &&
          alt === needsAlt &&
          key === keyPart
        ) {
          e.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}