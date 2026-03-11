import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Monitor, MonitorOff, Volume2, Users } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, shadows } from '@/components/app/design/tokens';

function VoiceMember({ state, profile, isCurrentUser }) {
  const name = profile?.display_name || state.user_name || 'User';
  const avatar = profile?.avatar_url || state.user_avatar;
  const isMuted = state.is_self_muted || state.is_muted;
  const isDeafened = state.is_self_deafened;
  const isStreaming = state.is_streaming;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative group">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold overflow-hidden"
          style={{
            background: colors.bg.elevated,
            border: `2px solid ${colors.border.light}`,
            color: colors.text.muted,
          }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} /> : name.charAt(0).toUpperCase()}
        </div>
        {/* Status badges */}
        {isMuted && (
          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: colors.bg.base, border: `2px solid ${colors.bg.elevated}` }}>
            <MicOff className="w-3 h-3" style={{ color: '#f23f43' }} />
          </div>
        )}
        {isDeafened && (
          <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: colors.bg.base, border: `2px solid ${colors.bg.elevated}` }}>
            <HeadphoneOff className="w-3 h-3" style={{ color: '#f23f43' }} />
          </div>
        )}
      </div>
      <span className="text-[12px] font-medium truncate max-w-[100px]"
        style={{ color: isCurrentUser ? colors.text.primary : colors.text.secondary }}>{name}</span>
      {isStreaming && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(242,63,67,0.12)', color: '#f23f43' }}>LIVE</span>
      )}
    </motion.div>
  );
}

function ControlButton({ active, danger, onClick, icon: Icon, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex flex-col items-center gap-1.5 group disabled:opacity-30"
      title={label}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
        style={{
          background: danger ? 'rgba(242,63,67,0.12)' : active ? 'rgba(255,255,255,0.08)' : colors.bg.elevated,
          border: `1px solid ${danger ? 'rgba(242,63,67,0.25)' : active ? colors.border.strong : colors.border.default}`,
        }}>
        <Icon className="w-5 h-5" style={{ color: danger ? '#f23f43' : active ? '#f23f43' : colors.text.secondary }} />
      </div>
      <span className="text-[10px]" style={{ color: colors.text.disabled }}>{label}</span>
    </button>
  );
}

export default function VoiceChannelView({ channel, currentUser, isMuted, isDeafened, onToggleMute, onToggleDeafen, onDisconnect }) {
  const { getProfile } = useProfiles();
  const [voiceStates, setVoiceStates] = useState([]);
  const [connected, setConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (!channel?.id) return;
    base44.entities.VoiceState.filter({ channel_id: channel.id }).then(setVoiceStates);
    const unsub = base44.entities.VoiceState.subscribe(() => {
      base44.entities.VoiceState.filter({ channel_id: channel.id }).then(setVoiceStates);
    });
    return unsub;
  }, [channel?.id]);

  const handleConnect = async () => {
    await base44.entities.VoiceState.create({
      user_id: currentUser.id, user_email: currentUser.email,
      user_name: currentUser.full_name, channel_id: channel.id,
      server_id: channel.server_id, is_self_muted: isMuted, is_self_deafened: isDeafened,
    });
    setConnected(true);
  };

  const handleDisconnect = async () => {
    const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
    for (const s of states) await base44.entities.VoiceState.delete(s.id);
    setConnected(false);
    setIsScreenSharing(false);
    onDisconnect?.();
  };

  const toggleScreenShare = async () => {
    if (!connected) return;
    const newVal = !isScreenSharing;
    setIsScreenSharing(newVal);
    const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
    if (states[0]) await base44.entities.VoiceState.update(states[0].id, { is_streaming: newVal });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: colors.bg.base }}>
      <div className="text-center max-w-xl w-full">
        {/* Channel info */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Volume2 className="w-5 h-5" style={{ color: colors.text.disabled }} />
          <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>{channel?.name}</h2>
        </div>
        <div className="flex items-center justify-center gap-2 mb-10">
          <Users className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
          <p className="text-[12px]" style={{ color: colors.text.muted }}>
            {connected ? `Connected · ${voiceStates.length} in channel` : 'Not connected'}
          </p>
        </div>

        {/* Participants grid */}
        <div className="flex flex-wrap gap-6 justify-center mb-12 min-h-[100px] items-center">
          <AnimatePresence>
            {voiceStates.map(s => (
              <VoiceMember key={s.id} state={s} profile={getProfile(s.user_id)} isCurrentUser={s.user_id === currentUser.id} />
            ))}
          </AnimatePresence>
          {voiceStates.length === 0 && !connected && (
            <p className="text-[13px]" style={{ color: colors.text.disabled }}>No one is here yet. Be the first to join.</p>
          )}
        </div>

        {/* Controls */}
        {connected ? (
          <div className="flex items-start justify-center gap-4">
            <ControlButton icon={isMuted ? MicOff : Mic} active={isMuted} onClick={onToggleMute} label={isMuted ? 'Unmute' : 'Mute'} />
            <ControlButton icon={isDeafened ? HeadphoneOff : Headphones} active={isDeafened} onClick={onToggleDeafen} label={isDeafened ? 'Undeafen' : 'Deafen'} />
            <ControlButton icon={isScreenSharing ? MonitorOff : Monitor} active={isScreenSharing} onClick={toggleScreenShare} label={isScreenSharing ? 'Stop Share' : 'Share Screen'} />
            <ControlButton icon={PhoneOff} danger onClick={handleDisconnect} label="Leave" />
          </div>
        ) : (
          <button onClick={handleConnect}
            className="px-8 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-2.5 mx-auto transition-all hover:brightness-110"
            style={{ background: colors.text.primary, color: colors.bg.base }}>
            <Mic className="w-4 h-4" /> Join Voice
          </button>
        )}
      </div>
    </div>
  );
}