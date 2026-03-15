import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Users, Bell, BellOff, Send, Smile } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399',
};

function ts(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function fullTs(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function ThreadMessage({ message, isOwn }) {
  return (
    <div className="group flex gap-3 px-4 py-2 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[11px] font-semibold"
        style={{ background: P.elevated, color: P.muted }}>
        {message.author_avatar
          ? <img src={message.author_avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
          : (message.author_name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{message.author_name}</span>
          <span className="text-[11px]" style={{ color: P.muted }}>{ts(message.created_date)}</span>
        </div>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]" style={{ color: P.textSecondary }}>
          {message.content}
        </p>
      </div>
    </div>
  );
}

export default function ThreadView({
  isOpen,
  onClose,
  parentMessage,
  channelId,
  currentUser,
  serverName
}) {
  const [newMessage, setNewMessage] = useState('');
  const [isNotifying, setIsNotifying] = useState(true);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: threadMessages = [], isLoading } = useQuery({
    queryKey: ['threadMessages', parentMessage?.id],
    queryFn: async () => {
      if (!parentMessage?.id) return [];
      const messages = await base44.entities.Message.filter({ thread_id: parentMessage.id });
      return messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!parentMessage?.id && isOpen,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.Message.create({
        channel_id: channelId,
        thread_id: parentMessage.id,
        author_id: currentUser.user_id,
        author_name: currentUser.display_name,
        author_avatar: currentUser.avatar_url,
        content,
        type: 'default'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', parentMessage?.id] });
      setNewMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const participants = useMemo(() => {
    return new Set(threadMessages.map(m => m.author_id)).size;
  }, [threadMessages]);

  if (!isOpen || !parentMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="w-[380px] h-full flex-shrink-0 flex flex-col"
        style={{ background: P.surface, borderLeft: `1px solid ${P.border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${P.accent}15` }}>
              <MessageSquare className="w-3.5 h-3.5" style={{ color: P.accent }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>Thread</p>
              {serverName && <p className="text-[10px]" style={{ color: P.muted }}>{serverName}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsNotifying(!isNotifying)}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: isNotifying ? P.textSecondary : P.muted }}>
              {isNotifying ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.06)]">
              <X className="w-3.5 h-3.5" style={{ color: P.muted }} />
            </button>
          </div>
        </div>

        {/* Parent message context */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}`, background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[12px] font-semibold"
              style={{ background: P.elevated, color: P.muted }}>
              {parentMessage.author_avatar
                ? <img src={parentMessage.author_avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                : (parentMessage.author_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{parentMessage.author_name}</span>
                <span className="text-[11px]" style={{ color: P.muted }}>{fullTs(parentMessage.created_date)}</span>
              </div>
              <p className="text-[13px] line-clamp-3 leading-relaxed" style={{ color: P.textSecondary }}>{parentMessage.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-[11px]" style={{ color: P.muted }}>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
            </span>
            {participants > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {participants} {participants === 1 ? 'participant' : 'participants'}
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
            </div>
          ) : threadMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <MessageSquare className="w-10 h-10 mb-3" style={{ color: P.muted, opacity: 0.2 }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>No replies yet</p>
              <p className="text-[12px]" style={{ color: P.muted }}>Start the conversation!</p>
            </div>
          ) : (
            <div className="py-2">
              {threadMessages.map((message) => (
                <ThreadMessage key={message.id} message={message} isOwn={message.author_id === currentUser?.user_id} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } if (e.key === 'Escape') onClose(); }}
              placeholder="Reply to thread..."
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: P.textPrimary }}
            />
            <button onClick={handleSend} disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-20"
              style={{ background: newMessage.trim() ? P.accent : 'transparent', color: newMessage.trim() ? '#fff' : P.muted }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
