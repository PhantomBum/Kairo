import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Calendar, Hash, Heart, ChevronDown, Plus, Trophy, Users, Crown, Zap, Clock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

const MILESTONE_ICONS = {
  first_message: MessageSquare,
  members_10: Users,
  members_100: Users,
  members_500: Crown,
  anniversary: Calendar,
  boost_level: Zap,
};

function MomentCard({ item, onReact }) {
  const [showReactions, setShowReactions] = useState(false);
  const quickEmojis = ['❤️', '🔥', '👏', '🎉', '💯', '✨'];
  const reactions = item.reactions || {};

  return (
    <div className="rounded-xl overflow-hidden k-fade-in" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {item.type === 'milestone' && (
        <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'rgba(240,178,50,0.08)', borderBottom: `1px solid rgba(240,178,50,0.15)` }}>
          <Trophy className="w-3.5 h-3.5" style={{ color: '#f0b232' }} />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#f0b232' }}>Milestone</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: item.type === 'milestone' ? 'rgba(240,178,50,0.12)' : 'rgba(123,108,246,0.12)' }}>
            <Sparkles className="w-4 h-4" style={{ color: item.type === 'milestone' ? '#f0b232' : colors.accent.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            {item.title && <h3 className="text-[14px] font-semibold mb-1" style={{ color: colors.text.primary }}>{item.title}</h3>}
            {item.content && (
              <div className="p-3 rounded-lg mb-2" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.light}` }}>
                <p className="text-[13px]" style={{ color: colors.text.secondary }}>{item.content}</p>
                {item.author_name && (
                  <p className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>— {item.author_name}</p>
                )}
              </div>
            )}
            {item.note && <p className="text-[12px] mb-2" style={{ color: colors.text.muted }}>{item.note}</p>}
            <div className="flex items-center gap-3 text-[11px]" style={{ color: colors.text.disabled }}>
              {item.source_channel && (
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{item.source_channel}</span>
              )}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{moment(item.created_date).format('MMM D, YYYY')}</span>
            </div>
          </div>
        </div>

        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${colors.border.default}` }}>
            {Object.entries(reactions).map(([emoji, users]) => (
              <button key={emoji} onClick={() => onReact?.(item.id, emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] transition-colors hover:bg-[rgba(123,108,246,0.1)]"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border.default}` }}>
                {emoji} <span style={{ color: colors.text.muted }}>{Array.isArray(users) ? users.length : users}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mt-2">
          {quickEmojis.map(emoji => (
            <button key={emoji} onClick={() => onReact?.(item.id, emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[14px] transition-colors hover:bg-[rgba(255,255,255,0.06)]">
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServerMoments({ serverId, serverName, onClose }) {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMoments = useCallback(async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Moment.filter({ server_id: serverId });
      setMoments(all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch {
      try {
        const highlights = await base44.entities.Highlight.filter({ server_id: serverId });
        setMoments(highlights.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch { setMoments([]); }
    }
    setLoading(false);
  }, [serverId]);

  useEffect(() => { loadMoments(); }, [loadMoments]);

  const handleReact = async (momentId, emoji) => {
    try {
      const item = moments.find(m => m.id === momentId);
      if (!item) return;
      const reactions = { ...(item.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      await (base44.entities.Moment?.update || base44.entities.Highlight?.update)(momentId, { reactions });
      setMoments(prev => prev.map(m => m.id === momentId ? { ...m, reactions } : m));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[520px] max-w-[90vw] max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,108,246,0.15)' }}>
              <Sparkles className="w-4 h-4" style={{ color: colors.accent.primary }} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: colors.text.primary }}>Moments</h2>
              <p className="text-[11px]" style={{ color: colors.text.disabled }}>{serverName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-4 h-4" style={{ color: colors.text.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
            </div>
          ) : moments.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled }} />
              <p className="text-[14px] font-semibold mb-1" style={{ color: colors.text.primary }}>No Moments Yet</p>
              <p className="text-[12px]" style={{ color: colors.text.muted }}>Server admins can mark messages as Moments from the message menu.</p>
            </div>
          ) : moments.map(m => (
            <MomentCard key={m.id} item={m} onReact={handleReact} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarkAsMomentModal({ message, serverId, channelName, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entity = base44.entities.Moment || base44.entities.Highlight;
      await entity.create({
        server_id: serverId,
        message_id: message.id,
        title: title.trim() || message.content?.slice(0, 50),
        content: message.content,
        author_name: message.author_name,
        author_avatar: message.author_avatar,
        note: note.trim(),
        source_channel: channelName,
        type: 'moment',
        reactions: {},
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create moment:', err);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[420px] max-w-[90vw] rounded-2xl p-6" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: colors.accent.primary }} />
          <h3 className="text-[15px] font-bold" style={{ color: colors.text.primary }}>Mark as Moment</h3>
        </div>

        <div className="p-3 rounded-lg mb-4" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <p className="text-[12px] mb-1" style={{ color: colors.text.muted }}>{message.author_name}</p>
          <p className="text-[13px]" style={{ color: colors.text.secondary }}>{message.content?.slice(0, 200)}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.disabled }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this moment a title..."
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.disabled }}>Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add context..."
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-16"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: colors.text.muted }}>Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: colors.accent.primary }}>
            {saving ? 'Saving...' : 'Create Moment'}
          </button>
        </div>
      </div>
    </div>
  );
}
