import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Eye, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

export default function AdminDMs({ search, showFeedback, onRefresh }) {
  const [conversations, setConversations] = useState([]);
  const [dmMessages, setDmMessages] = useState([]);
  const [viewingConv, setViewingConv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [convos, dms] = await Promise.all([
        base44.entities.Conversation.list('-last_message_at', 100),
        base44.entities.DirectMessage.list('-created_date', 100),
      ]);
      setConversations(convos);
      setDmMessages(dms);
      setLoading(false);
    })();
  }, []);

  const filtered = conversations.filter(c => {
    const names = c.participants?.map(p => p.user_name || p.user_email || '').join(' ') || '';
    return names.toLowerCase().includes(search.toLowerCase()) || (c.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const convMessages = viewingConv ? dmMessages.filter(m => m.conversation_id === viewingConv.id) : [];

  const handleDeleteConversation = async (conv) => {
    if (!confirm('Delete this conversation and all its messages?')) return;
    const msgs = dmMessages.filter(m => m.conversation_id === conv.id);
    for (const m of msgs) await base44.entities.DirectMessage.delete(m.id);
    await base44.entities.Conversation.delete(conv.id);
    setConversations(p => p.filter(c => c.id !== conv.id));
    if (viewingConv?.id === conv.id) setViewingConv(null);
    showFeedback('Deleted conversation');
    onRefresh();
  };

  const handleDeleteMessage = async (msg) => {
    await base44.entities.DirectMessage.update(msg.id, { is_deleted: true, content: '[Deleted by admin]' });
    setDmMessages(p => p.map(m => m.id === msg.id ? { ...m, is_deleted: true, content: '[Deleted by admin]' } : m));
    showFeedback('Message deleted');
  };

  if (loading) return <div className="text-center py-12"><div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} /></div>;

  if (viewingConv) {
    return (
      <div className="space-y-2 k-fade-in">
        <button onClick={() => setViewingConv(null)} className="text-[12px] font-medium hover:opacity-80" style={{ color: colors.accent.primary }}>← Back to conversations</button>
        <p className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>
          {viewingConv.name || viewingConv.participants?.map(p => p.user_name).join(', ')}
        </p>
        <div className="space-y-1 max-h-[350px] overflow-y-auto scrollbar-none">
          {convMessages.length === 0 ? (
            <p className="text-center py-6 text-[13px]" style={{ color: colors.text.muted }}>No messages</p>
          ) : convMessages.map(m => (
            <div key={m.id} className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] group"
              style={{ opacity: m.is_deleted ? 0.4 : 1 }}>
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {m.author_avatar ? <img src={m.author_avatar} className="w-full h-full object-cover" alt="" /> : (m.author_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>{m.author_name || 'Unknown'}</span>
                  <span className="text-[10px]" style={{ color: colors.text.disabled }}>{moment(m.created_date).format('MMM D, h:mm A')}</span>
                </div>
                <p className="text-[12px] break-words" style={{ color: colors.text.secondary }}>{m.content || '[attachment]'}</p>
              </div>
              {!m.is_deleted && (
                <button onClick={() => handleDeleteMessage(m)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[rgba(237,66,69,0.12)]" title="Delete message">
                  <Trash2 className="w-3 h-3" style={{ color: colors.danger }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filtered.length === 0 ? (
        <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No conversations found</p>
      ) : filtered.map(c => {
        const msgCount = dmMessages.filter(m => m.conversation_id === c.id).length;
        const names = c.name || c.participants?.map(p => p.user_name || p.user_email).join(', ') || 'Unknown';
        return (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] group">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: colors.bg.overlay }}>
              {c.type === 'group' ? <Users className="w-4 h-4" style={{ color: colors.text.muted }} /> :
                <MessageSquare className="w-4 h-4" style={{ color: colors.text.muted }} />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-semibold truncate block" style={{ color: colors.text.primary }}>{names}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: colors.text.disabled }}>{c.participants?.length || 0} participants · {msgCount} messages</span>
                {c.last_message_at && <span className="text-[10px]" style={{ color: colors.text.disabled }}>· {moment(c.last_message_at).fromNow()}</span>}
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: c.type === 'group' ? 'rgba(88,101,242,0.12)' : 'rgba(255,255,255,0.04)', color: c.type === 'group' ? colors.accent.primary : colors.text.disabled }}>
              {c.type === 'group' ? 'Group' : 'DM'}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => setViewingConv(c)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(88,101,242,0.15)]" title="View messages">
                <Eye className="w-3.5 h-3.5" style={{ color: colors.accent.primary }} />
              </button>
              <button onClick={() => handleDeleteConversation(c)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Delete conversation">
                <Trash2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}