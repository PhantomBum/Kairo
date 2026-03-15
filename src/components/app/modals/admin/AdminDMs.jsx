import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Users, Clock, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

export default function AdminDMs({ search, showFeedback, onRefresh, allConversations }) {
  const [conversations, setConversations] = useState([]);
  const [dmMeta, setDmMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalDMs, setTotalDMs] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const convos = allConversations || await base44.entities.Conversation.list('-last_message_at', 100);
        setConversations(convos);
        setTotalDMs(convos.length);

        const dms = await base44.entities.DirectMessage.list('-created_date', 50);
        setDmMeta(dms.map(m => ({
          id: m.id,
          conversation_id: m.conversation_id,
          sender: m.author_name || 'Unknown',
          sender_avatar: m.author_avatar,
          timestamp: m.created_date,
          has_attachment: !!(m.attachments?.length || m.file_url),
        })));
      } catch { /* fallback */ }
      setLoading(false);
    })();
  }, [allConversations]);

  const filtered = conversations.filter(c => {
    const names = c.participants?.map(p => p.user_name || p.user_email || '').join(' ') || '';
    return names.toLowerCase().includes(search.toLowerCase()) || (c.name || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleDeleteConversation = async (conv) => {
    if (!confirm('Delete this conversation and all its messages? This can\'t be undone.')) return;
    try {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conv.id });
      for (const m of msgs) await base44.entities.DirectMessage.delete(m.id);
      await base44.entities.Conversation.delete(conv.id);
    } catch { /* fallback */ }
    setConversations(p => p.filter(c => c.id !== conv.id));
    showFeedback('Deleted conversation');
    onRefresh();
  };

  if (loading) return <div className="text-center py-12"><div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="space-y-3">
      {/* DM Stats */}
      <div className="flex gap-3 mb-2">
        <div className="flex-1 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-3.5 h-3.5" style={{ color: colors.accent.primary }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Total Conversations</span>
          </div>
          <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{totalDMs}</p>
        </div>
        <div className="flex-1 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5" style={{ color: colors.warning }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Recent Activity</span>
          </div>
          <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{dmMeta.length}</p>
          <p className="text-[11px]" style={{ color: colors.text.disabled }}>messages (last 50)</p>
        </div>
      </div>

      {/* Recent DM Activity - metadata only */}
      {dmMeta.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Recent DM Activity</p>
          <div className="space-y-0.5">
            {dmMeta.slice(0, 20).map(m => {
              const conv = conversations.find(c => c.id === m.conversation_id);
              const recipient = conv?.participants?.find(p => p.user_name !== m.sender)?.user_name || 'Unknown';
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {m.sender_avatar ? <img src={m.sender_avatar} className="w-full h-full object-cover" alt="" /> : m.sender[0].toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium" style={{ color: colors.text.primary }}>{m.sender}</span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: colors.text.disabled }} />
                  <span className="text-[12px]" style={{ color: colors.text.secondary }}>{recipient}</span>
                  {m.has_attachment && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(123,108,246,0.1)', color: colors.accent.primary }}>📎</span>}
                  <span className="text-[11px] ml-auto flex-shrink-0" style={{ color: colors.text.disabled }}>{moment(m.timestamp).fromNow()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversations list */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>All Conversations</p>
        {filtered.length === 0 ? (
          <p className="text-center py-6 text-[13px]" style={{ color: colors.text.muted }}>No conversations found</p>
        ) : filtered.map(c => {
          const names = c.name || c.participants?.map(p => p.user_name || p.user_email).join(', ') || 'Unknown';
          return (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] group">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: colors.bg.overlay }}>
                {c.type === 'group' ? <Users className="w-4 h-4" style={{ color: colors.text.muted }} /> :
                  <MessageSquare className="w-4 h-4" style={{ color: colors.text.muted }} />}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold truncate block" style={{ color: colors.text.primary }}>{names}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>{c.participants?.length || 0} participants</span>
                  {c.last_message_at && <span className="text-[11px]" style={{ color: colors.text.disabled }}>· Last active {moment(c.last_message_at).fromNow()}</span>}
                </div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: c.type === 'group' ? 'rgba(123,108,246,0.12)' : 'rgba(255,255,255,0.04)', color: c.type === 'group' ? colors.accent.primary : colors.text.disabled }}>
                {c.type === 'group' ? 'Group' : 'DM'}
              </span>
              <button onClick={() => handleDeleteConversation(c)}
                className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)] opacity-0 group-hover:opacity-100 flex-shrink-0" title="Delete conversation">
                <Trash2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
