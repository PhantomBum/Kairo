import React, { useState } from 'react';
import { Clock, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

export default function ScheduleMessageModal({ onClose, channelId, serverId, currentUser, profile }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    if (!content.trim() || !date || !time) return;
    setSaving(true);
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    await base44.entities.ScheduledMessage.create({
      channel_id: channelId,
      server_id: serverId,
      author_id: currentUser.id,
      author_name: profile?.display_name || currentUser.full_name,
      author_avatar: profile?.avatar_url,
      content: content.trim(),
      scheduled_at: scheduledAt,
      status: 'pending',
    });
    setSaving(false);
    onClose();
  };

  // Min date is now
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = date === minDate ? now.toTimeString().slice(0, 5) : '00:00';

  return (
    <ModalWrapper title="Schedule Message" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Message</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Type your message..."
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-none h-24"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={minDate}
              className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}`, colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} min={minTime}
              className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}`, colorScheme: 'dark' }} />
          </div>
        </div>
        {date && time && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.base }}>
            <Clock className="w-4 h-4" style={{ color: colors.accent.primary }} />
            <span className="text-[13px]" style={{ color: colors.text.secondary }}>
              Will be sent {new Date(`${date}T${time}`).toLocaleString()}
            </span>
          </div>
        )}
        <button onClick={handleSchedule} disabled={!content.trim() || !date || !time || saving}
          className="w-full py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-30"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          <Send className="w-4 h-4" />
          {saving ? 'Scheduling...' : 'Schedule Message'}
        </button>
      </div>
    </ModalWrapper>
  );
}