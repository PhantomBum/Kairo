import React from 'react';
import { X, Pin } from 'lucide-react';

export default function PinnedPanel({ messages, onClose, onUnpin, onJumpTo }) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col" style={{ background: '#131313', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-12 px-4 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Pin className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-white">Pinned Messages</span>
        <span className="text-[10px] text-zinc-500 ml-1">{messages.length}</span>
        <button onClick={onClose} className="ml-auto p-1 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">No pinned messages</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="p-3 rounded-lg group hover:bg-white/[0.04] transition-colors" style={{ background: '#0e0e0e' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] overflow-hidden" style={{ background: '#1a1a1a' }}>
                {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" /> : (msg.author_name || 'U').charAt(0)}
              </div>
              <span className="text-xs font-medium text-white">{msg.author_name}</span>
              <span className="text-[10px] text-zinc-600">{new Date(msg.created_date).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-zinc-300 break-words">{msg.content}</p>
            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onJumpTo?.(msg)} className="text-[10px] text-blue-400 hover:underline">Jump</button>
              <button onClick={() => onUnpin?.(msg)} className="text-[10px] text-red-400 hover:underline">Unpin</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}