import React, { useState, useEffect, useMemo } from 'react';
import { Users, Hash, Volume2, Zap, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

export default function InvitePreviewModal({ onClose, code, currentUser, onJoinSuccess }) {
  const [server, setServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const { profiles } = useProfiles();

  const onlineCount = useMemo(() =>
    profiles.filter(p => p.is_online && p.status !== 'invisible').length,
    [profiles]
  );

  useEffect(() => {
    const load = async () => {
      const allServers = await base44.entities.Server.list();
      const found = allServers.find(s => (s.invite_code || '').toUpperCase() === code.toUpperCase());
      if (!found) { setError('invalid'); setLoading(false); return; }
      setServer(found);

      const members = await base44.entities.ServerMember.filter({ server_id: found.id, user_id: currentUser.id });
      if (members.length > 0) setIsMember(true);

      const chs = await base44.entities.Channel.filter({ server_id: found.id });
      setChannels(chs.filter(c => c.type === 'text' || c.type === 'voice').slice(0, 5));
      setLoading(false);
    };
    load();
  }, [code, currentUser.id]);

  const handleJoin = async () => {
    setJoining(true);
    const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: currentUser.id });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({
        server_id: server.id, user_id: currentUser.id, user_email: currentUser.email,
        joined_at: new Date().toISOString(), role_ids: [],
      });
      await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
    }
    setJoined(true);
    setJoining(false);
    setTimeout(() => onJoinSuccess(server), 800);
  };

  if (loading) {
    return (
      <ModalWrapper title="Server Invite" onClose={onClose} width={400}>
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
        </div>
      </ModalWrapper>
    );
  }

  if (error || !server) {
    return (
      <ModalWrapper title="Invalid Invite" onClose={onClose} width={400}>
        <div className="text-center py-8">
          <p className="text-[14px]" style={{ color: colors.text.muted }}>This invite link is invalid or has expired.</p>
          <button onClick={onClose} className="mt-4 px-5 py-2.5 rounded-lg text-[14px] font-semibold" style={{ background: colors.bg.elevated, color: colors.text.secondary }}>Close</button>
        </div>
      </ModalWrapper>
    );
  }

  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || colors.accent.primary}, ${server.banner_color || colors.accent.active}88)`;
  const initials = server.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ModalWrapper onClose={onClose} width={400} hideTitle>
      {/* Banner */}
      <div className="-mx-6 -mt-6 h-[100px] mb-4" style={{ background: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <div className="-mt-10 mb-2">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-lg font-bold"
          style={{ background: server.icon_url ? 'transparent' : colors.bg.overlay, color: colors.text.primary, border: `4px solid ${colors.bg.modal}` }}>
          {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" /> : initials}
        </div>
      </div>

      <h2 className="text-[18px] font-bold" style={{ color: colors.text.primary }}>{server.name}</h2>
      {server.description && <p className="text-[13px] mt-1" style={{ color: colors.text.muted }}>{server.description}</p>}

      <div className="flex gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
          <span className="text-[12px]" style={{ color: colors.text.secondary }}>{server.member_count || 1} Members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.status.online }} />
          <span className="text-[12px]" style={{ color: colors.text.secondary }}>{onlineCount} Online</span>
        </div>
      </div>

      {channels.length > 0 && (
        <div className="mt-4 space-y-1">
          {channels.map(ch => (
            <div key={ch.id} className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: colors.bg.elevated }}>
              {ch.type === 'voice' ? <Volume2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} /> : <Hash className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />}
              <span className="text-[12px]" style={{ color: colors.text.secondary }}>{ch.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {joined ? (
          <div className="flex-1 px-5 py-3 rounded-xl text-[14px] font-semibold text-center" style={{ background: colors.success, color: '#fff' }}>
            Joined! Opening...
          </div>
        ) : isMember ? (
          <button onClick={() => onJoinSuccess(server)} className="flex-1 px-5 py-3 rounded-xl text-[14px] font-semibold"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            Open Server
          </button>
        ) : (
          <>
            <button onClick={handleJoin} disabled={joining} className="flex-1 px-5 py-3 rounded-xl text-[14px] font-semibold disabled:opacity-50"
              style={{ background: colors.success, color: '#fff' }}>
              {joining ? 'Joining...' : 'Join Server'}
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-xl text-[14px] font-semibold"
              style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              Decline
            </button>
          </>
        )}
      </div>
    </ModalWrapper>
  );
}