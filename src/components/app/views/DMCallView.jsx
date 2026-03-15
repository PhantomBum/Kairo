import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Headphones, HeadphoneOff, Monitor, MonitorOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';
import useAgora from '@/components/app/hooks/useAgora';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

function CallControlBtn({ icon: Icon, active, danger, onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label}
      className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
      style={{
        background: danger ? colors.danger : active ? 'rgba(237,66,69,0.15)' : colors.bg.surface,
        border: `1px solid ${danger ? 'rgba(237,66,69,0.4)' : active ? 'rgba(237,66,69,0.2)' : colors.border.default}`,
      }}>
      <Icon className="w-5 h-5" style={{ color: danger ? '#fff' : active ? colors.danger : colors.text.secondary }} />
    </button>
  );
}

export default function DMCallView({ call, conversation, currentUser, onEndCall, profile }) {
  const { getProfile } = useProfiles();
  const agora = useAgora();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const joinedRef = useRef(false);

  const otherParticipant = conversation?.participants?.find(p => p.user_id !== currentUser.id);
  const otherProfile = getProfile(otherParticipant?.user_id);
  const otherName = otherProfile?.display_name || otherParticipant?.user_name || 'User';
  const otherAvatar = otherProfile?.avatar_url || otherParticipant?.avatar;

  // Join Agora channel when call starts
  useEffect(() => {
    if (call && !joinedRef.current) {
      joinedRef.current = true;
      const channelName = `dm_call_${call.conversation_id}_${call.id}`;
      agora.join(channelName);
    }
  }, [call?.id]);

  // Call duration timer
  useEffect(() => {
    if (!call?.started_at) return;
    const start = new Date(call.started_at);
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - start.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [call?.started_at]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (joinedRef.current) {
        agora.leave();
        joinedRef.current = false;
      }
    };
  }, []);

  const toggleMute = async () => {
    await agora.toggleMute();
    setIsMuted(!isMuted);
  };

  const toggleDeafen = () => setIsDeafened(!isDeafened);

  const handleEnd = async () => {
    await agora.leave();
    joinedRef.current = false;
    onEndCall?.();
  };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!call) return null;

  // Mini PiP mode
  if (isPip) {
    return (
      <motion.div drag dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-6 z-50 w-56 rounded-xl overflow-hidden"
        style={{ background: colors.bg.modal, border: `1px solid ${colors.border.default}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <div className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ background: colors.bg.overlay }}>
            {otherAvatar ? <img src={otherAvatar} className="w-full h-full object-cover" alt="" /> :
              <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: colors.text.muted }}>{otherName.charAt(0)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: colors.text.primary }}>{otherName}</p>
            <p className="text-[11px]" style={{ color: colors.status.online }}>{formatDuration(callDuration)}</p>
          </div>
          <button onClick={() => setIsPip(false)} className="p-1 rounded hover:bg-[rgba(255,255,255,0.06)]">
            <Maximize2 className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />
          </button>
        </div>
        <div className="flex justify-center gap-2 pb-3">
          <button onClick={toggleMute} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isMuted ? 'rgba(237,66,69,0.15)' : colors.bg.surface }}>
            {isMuted ? <MicOff className="w-3.5 h-3.5" style={{ color: colors.danger }} /> : <Mic className="w-3.5 h-3.5" style={{ color: colors.text.secondary }} />}
          </button>
          <button onClick={handleEnd} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.danger }}>
            <PhoneOff className="w-3.5 h-3.5" style={{ color: '#fff' }} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: colors.bg.base }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.status.online }} />
          <span className="text-[14px] font-medium" style={{ color: colors.text.primary }}>{formatDuration(callDuration)}</span>
          <span className="text-[12px]" style={{ color: colors.text.muted }}>
            {call.is_video_call ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
        <button onClick={() => setIsPip(true)} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.06)]" title="Picture-in-Picture">
          <Minimize2 className="w-5 h-5" style={{ color: colors.text.muted }} />
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden" style={{ background: colors.bg.overlay, border: `3px solid ${colors.status.online}` }}>
            {otherAvatar ? <img src={otherAvatar} className="w-full h-full object-cover" alt="" /> :
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold" style={{ color: colors.text.muted }}>{otherName.charAt(0)}</div>}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>{otherName}</h2>
            <p className="text-[13px] mt-1" style={{ color: colors.text.muted }}>
              {agora.joined ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="pb-10 flex justify-center">
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
          <CallControlBtn icon={isMuted ? MicOff : Mic} active={isMuted} onClick={toggleMute} label={isMuted ? 'Unmute' : 'Mute'} />
          <CallControlBtn icon={isDeafened ? HeadphoneOff : Headphones} active={isDeafened} onClick={toggleDeafen} label={isDeafened ? 'Undeafen' : 'Deafen'} />
          <CallControlBtn icon={agora.screenSharing ? MonitorOff : Monitor} active={agora.screenSharing} onClick={agora.toggleScreenShare} label="Screen Share" />
          <CallControlBtn icon={PhoneOff} danger onClick={handleEnd} label="End Call" />
        </div>
      </div>
    </div>
  );
}

// Incoming call overlay
export function IncomingCallOverlay({ call, onAccept, onDecline }) {
  const { getProfile } = useProfiles();
  const callerProfile = getProfile(call?.initiator_id);
  const callerName = callerProfile?.display_name || call?.initiator_name || 'Someone';
  const callerAvatar = callerProfile?.avatar_url;

  useEffect(() => {
    const timeout = setTimeout(() => onDecline?.(), 30000);
    return () => clearTimeout(timeout);
  }, [onDecline]);

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 p-8 rounded-2xl flex flex-col items-center"
        style={{ background: colors.bg.modal, border: `1px solid ${colors.border.default}` }}>
        {/* Pulsing rings */}
        <div className="relative mb-6">
          {[1, 2, 3].map(i => (
            <motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: `2px solid ${colors.status.online}` }}
              animate={{ scale: [1, 1.8, 1.8], opacity: [0.4, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }} />
          ))}
          <div className="w-24 h-24 rounded-full overflow-hidden relative" style={{ background: colors.bg.overlay }}>
            {callerAvatar ? <img src={callerAvatar} className="w-full h-full object-cover" alt="" /> :
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: colors.text.muted }}>{callerName.charAt(0)}</div>}
          </div>
        </div>

        <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>{callerName}</h2>
        <p className="text-[13px] mt-1" style={{ color: colors.text.muted }}>
          {call.is_video_call ? 'Video Call' : 'Voice Call'}
        </p>
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[12px] mt-1" style={{ color: colors.text.disabled }}>Incoming call...</motion.p>

        <div className="flex items-center gap-8 mt-8">
          <button onClick={onDecline} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: colors.danger }}>
            <PhoneOff className="w-6 h-6" style={{ color: '#fff' }} />
          </button>
          <button onClick={onAccept} className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: colors.status.online }}>
            {call.is_video_call ? <Video className="w-6 h-6" style={{ color: '#fff' }} /> : <Phone className="w-6 h-6" style={{ color: '#fff' }} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Outgoing call overlay
export function OutgoingCallOverlay({ recipientName, recipientAvatar, isVideoCall, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 p-8 rounded-2xl flex flex-col items-center"
        style={{ background: colors.bg.modal, border: `1px solid ${colors.border.default}` }}>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden" style={{ background: colors.bg.overlay }}>
            {recipientAvatar ? <img src={recipientAvatar} className="w-full h-full object-cover" alt="" /> :
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: colors.text.muted }}>{(recipientName || '?').charAt(0)}</div>}
          </div>
        </motion.div>
        <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>{recipientName || 'User'}</h2>
        <p className="text-[13px] mt-1" style={{ color: colors.text.muted }}>{isVideoCall ? 'Video Call' : 'Voice Call'}</p>
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[12px] mt-1" style={{ color: colors.text.disabled }}>Calling...</motion.p>
        <button onClick={onCancel} className="mt-8 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: colors.danger }}>
          <PhoneOff className="w-6 h-6" style={{ color: '#fff' }} />
        </button>
      </motion.div>
    </div>
  );
}