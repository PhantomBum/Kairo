import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Send, Hash } from 'lucide-react';

export default function ThreadPanel({ thread, currentUser, onClose }) {
  const qc = useQueryClient();
  const [content, setContent] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['threadMessages', thread.id],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ thread_id: thread.id }, '-created_date', 50);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!thread.id,
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!content.trim()) return;
      await base44.entities.Message.create({
        channel_id: thread.channel_id, server_id: thread.server_id,
        thread_id: thread.id,
        author_id: currentUser.id, author_name: currentUser.name, author_avatar: currentUser.avatar,
        content: content.trim(), type: 'default',
      });
      await base44.entities.Thread.update(thread.id, {
        message_count: (thread.message_count || 0) + 1,
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setContent('');
      qc.invalidateQueries({ queryKey: ['threadMessages', thread.id] });
    },
  });

  return (
    <div className="w-80 flex-shrink-0 flex flex-col" style={{ background: '#131313', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-white truncate">{thread.name}</span>
        </div>
        <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin space-y-2">
        {isLoading && <div className="text-center py-4"><div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mx-auto" /></div>}
        {messages.map(msg => (
          <div key={msg.id} className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden flex-shrink-0" style={{ background: '#1a1a1a' }}>
              {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" /> : (msg.author_name || 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-white">{msg.author_name}</span>
                <span className="text-[10px] text-zinc-600">{new Date(msg.created_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-zinc-300 break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {messages.length === 0 && !isLoading && <div className="text-center py-8 text-zinc-600 text-xs">No messages in this thread yet</div>}
      </div>

      <div className="p-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#1a1a1a' }}>
          <input value={content} onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage.mutate(); } }}
            placeholder="Reply..." className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
          {content.trim() && (
            <button onClick={() => sendMessage.mutate()} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
              <Send className="w-3 h-3 text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}