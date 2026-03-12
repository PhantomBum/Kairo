import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Send, Hash, MessageSquare } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import ModalWrapper from './ModalWrapper';

export default function ForwardMessageModal({ onClose, message, channels, conversations, currentUser, profile }) {
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  const targets = [
    ...(channels || []).map(c => ({ id: c.id, type: 'channel', name: `#${c.name}`, serverId: c.server_id, icon: Hash })),
    ...(conversations || []).map(c => {
      const other = c.participants?.find(p => p.user_id !== currentUser.id);
      return { id: c.id, type: 'dm', name: c.name || other?.user_name || 'DM', icon: MessageSquare };
    }),
  ].filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  const forward = async (target) => {
    setSending(true);
    const fwdContent = `**Forwarded from ${message.author_name}:**\n${message.content}`;
    if (target.type === 'channel') {
      await base44.entities.Message.create({
        channel_id: target.id, server_id: target.serverId, author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url,
        content: fwdContent, attachments: message.attachments,
      });
    } else {
      await base44.entities.DirectMessage.create({
        conversation_id: target.id, author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url,
        content: fwdContent, attachments: message.attachments,
      });
      await base44.entities.Conversation.update(target.id, { last_message_at: new Date().toISOString(), last_message_preview: fwdContent.slice(0, 50) });
    }
    setSent(target.name);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <ModalWrapper title="Forward Message" onClose={onClose} width={400}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
        <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search channels & DMs..."
          className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} autoFocus />
      </div>
      {/* Preview */}
      <div className="p-3 rounded-lg mb-3" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
        <p className="text-[11px] font-semibold mb-1" style={{ color: colors.text.muted }}>{message.author_name}</p>
        <p className="text-[13px] line-clamp-2" style={{ color: colors.text.secondary }}>{message.content?.slice(0, 150)}</p>
      </div>
      {sent ? (
        <div className="text-center py-6">
          <p className="text-[14px] font-semibold" style={{ color: colors.success }}>Forwarded to {sent}!</p>
        </div>
      ) : (
        <div className="max-h-[250px] overflow-y-auto space-y-0.5 scrollbar-none">
          {targets.slice(0, 30).map(t => (
            <button key={`${t.type}-${t.id}`} onClick={() => forward(t)} disabled={sending}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-50"
              style={{ color: colors.text.secondary }}>
              <t.icon className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.muted }} />
              <span className="text-[13px] flex-1 truncate">{t.name}</span>
              <Send className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" style={{ color: colors.text.disabled }} />
            </button>
          ))}
        </div>
      )}
    </ModalWrapper>
  );
}