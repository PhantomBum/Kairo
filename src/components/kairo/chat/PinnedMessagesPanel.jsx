import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function PinnedMessagesPanel({ messages = [], isOpen, onClose, onUnpin, onJumpTo }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute top-0 right-0 h-full w-80 bg-[#0f0f11] border-l border-zinc-800 flex flex-col z-40">
        <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white">Pinned Messages</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Pin className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No pinned messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors group cursor-pointer" onClick={() => onJumpTo?.(msg)}>
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {msg.author_avatar ? <img src={msg.author_avatar} alt="" className="w-full h-full rounded-full" /> : <span className="text-white text-xs font-medium">{msg.author_name?.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{msg.author_name}</span>
                      <span className="text-xs text-zinc-500">{format(new Date(msg.created_date), 'MMM d')}</span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-3 mt-1">{msg.content}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onUnpin?.(msg); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}