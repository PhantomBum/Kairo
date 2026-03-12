import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Monitor, MonitorOff, Volume2, Users, AlertCircle, Settings, ChevronUp } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';
import useAgora from '@/components/app/hooks/useAgora';

function VoiceMember({ state, profile, isCurrentUser, isSpeaking }) {
  const name = profile?.display_name || state.user_name || 'User';
  const avatar = profile?.avatar_url || state.user_avatar;
  const isMuted = state.is_self_muted || state.is_muted;
  const isDeafened = state.is_self_deafened;
  const isStreaming = state.is_streaming;

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold overflow-hidden transition-shadow ${isSpeaking ? 'k-speaking-ring' : ''}`}
          style={{
            background: colors.bg.elevated,
            border: `2px solid ${isSpeaking ? colors.status.online : colors.border.light}`,
            color: colors.text.muted,
          }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} /> : name.charAt(0).toUpperCase()}
        </div>
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
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1.5 group disabled:opacity-30" title={label}>
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
  const [connecting, setConnecting] = useState(false);
  const screenVideoRef = useRef(null);

  const agora = useAgora();

  const [showDevices, setShowDevices] = useState(false);
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState('');
  const [selectedOutput, setSelectedOutput] = useState('');

  // Enumerate audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioInputs(devices.filter(d => d.kind === 'audioinput'));
        setAudioOutputs(devices.filter(d => d.kind === 'audiooutput'));
      } catch {}
    };
    getDevices();
  }, [agora.joined]);

  // Fetch voice states — deduplicate by user_id
  useEffect(() => {
    if (!channel?.id) return;
    const fetchAndDedup = async () => {
      const states = await base44.entities.VoiceState.filter({ channel_id: channel.id });
      // Deduplicate: keep only the latest state per user_id
      const seen = new Map();
      const toDelete = [];
      for (const s of states) {
        if (seen.has(s.user_id)) {
          toDelete.push(s.id);
        } else {
          seen.set(s.user_id, s);
        }
      }
      // Clean up duplicates in background
      if (toDelete.length > 0) {
        toDelete.forEach(id => base44.entities.VoiceState.delete(id));
      }
      setVoiceStates(Array.from(seen.values()));
    };
    fetchAndDedup();
    const unsub = base44.entities.VoiceState.subscribe(() => fetchAndDedup());
    return unsub;
  }, [channel?.id]);

  // Sync mute state to Agora when the app-level mute changes
  useEffect(() => {
    if (agora.joined && agora.localAudioMuted !== isMuted) {
      agora.toggleMute();
    }
  }, [isMuted, agora.joined]);

  // Connect: clean up any stale states first, then join
  const handleConnect = async () => {
    setConnecting(true);
    // Remove any stale voice states for this user in this channel
    const stale = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
    for (const s of stale) await base44.entities.VoiceState.delete(s.id);
    const channelName = `server_${channel.server_id}_channel_${channel.id}`;
    await agora.join(channelName);
    await base44.entities.VoiceState.create({
      user_id: currentUser.id, user_email: currentUser.email,
      user_name: currentUser.full_name, channel_id: channel.id,
      server_id: channel.server_id, is_self_muted: isMuted, is_self_deafened: isDeafened,
    });
    setConnecting(false);
  };

  // Disconnect: leave Agora + delete VoiceState record
  const handleDisconnect = async () => {
    await agora.leave();
    const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
    for (const s of states) await base44.entities.VoiceState.delete(s.id);
    onDisconnect?.();
  };

  // Screen sharing: toggle Agora screen share + update VoiceState
  const toggleScreenShare = async () => {
    if (!agora.joined) return;
    await agora.toggleScreenShare();
    const newVal = !agora.screenSharing;
    const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
    if (states[0]) await base44.entities.VoiceState.update(states[0].id, { is_streaming: newVal });
  };

  // Sync mute/deafen state to DB
  useEffect(() => {
    if (!agora.joined) return;
    const sync = async () => {
      const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
      if (states[0]) await base44.entities.VoiceState.update(states[0].id, { is_self_muted: isMuted, is_self_deafened: isDeafened });
    };
    sync();
  }, [isMuted, isDeafened, agora.joined]);

  // Clean up on unmount (leave Agora + remove VoiceState)
  const channelIdRef = React.useRef(channel?.id);
  const userIdRef = React.useRef(currentUser?.id);
  channelIdRef.current = channel?.id;
  userIdRef.current = currentUser?.id;
  useEffect(() => {
    return () => {
      agora.leave();
      const cId = channelIdRef.current;
      const uId = userIdRef.current;
      if (cId && uId) {
        base44.entities.VoiceState.filter({ channel_id: cId, user_id: uId }).then(states => {
          states.forEach(s => base44.entities.VoiceState.delete(s.id));
        });
      }
    };
  }, []);

  // Render screen share video from remote users
  useEffect(() => {
    const screenUser = agora.remoteUsers.find(u => u.uid > 100000 && u.videoTrack);
    if (screenUser && screenVideoRef.current) {
      screenUser.videoTrack.play(screenVideoRef.current);
    }
  }, [agora.remoteUsers]);

  const hasRemoteScreen = agora.remoteUsers.some(u => u.uid > 100000 && u.videoTrack);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: colors.bg.base }}>
      <div className="text-center max-w-xl w-full">
        {/* Channel info */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Volume2 className="w-5 h-5" style={{ color: colors.text.disabled }} />
          <h2 className="text-lg font-semibold" style={{ color: colors.text.primary }}>{channel?.name}</h2>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Users className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
          <p className="text-[12px]" style={{ color: colors.text.muted }}>
            {agora.joined ? `Connected · ${voiceStates.length} in channel` : 'Not connected'}
          </p>
        </div>

        {agora.error && (
          <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-lg mx-auto w-fit" style={{ background: 'rgba(242,63,67,0.1)', border: '1px solid rgba(242,63,67,0.2)' }}>
            <AlertCircle className="w-4 h-4" style={{ color: colors.danger }} />
            <span className="text-[13px]" style={{ color: colors.danger }}>{agora.error}</span>
          </div>
        )}

        {/* Screen share viewer */}
        {hasRemoteScreen && (
          <div className="mb-6 rounded-lg overflow-hidden mx-auto max-w-2xl" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
            <div ref={screenVideoRef} className="w-full aspect-video" />
          </div>
        )}

        {/* Participants grid */}
        <div className="flex flex-wrap gap-6 justify-center mb-12 min-h-[100px] items-center">
          <AnimatePresence>
            {voiceStates.map(s => (
              <VoiceMember key={s.id} state={s} profile={getProfile(s.user_id)} isCurrentUser={s.user_id === currentUser.id} />
            ))}
          </AnimatePresence>
          {voiceStates.length === 0 && !agora.joined && (
            <p className="text-[13px]" style={{ color: colors.text.disabled }}>No one is here yet. Be the first to join.</p>
          )}
        </div>

        {/* Controls */}
        {agora.joined ? (
          <div className="relative">
            {/* Device selector dropup */}
            <AnimatePresence>
              {showDevices && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 rounded-xl z-10"
                  style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>Audio Devices</span>
                    <button onClick={() => setShowDevices(false)} className="p-1 rounded hover:bg-[rgba(255,255,255,0.06)]">
                      <ChevronUp className="w-4 h-4" style={{ color: colors.text.muted }} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.disabled }}>Input Device</label>
                      <select value={selectedInput} onChange={e => setSelectedInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                        <option value="">Default</option>
                        {audioInputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,6)}`}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.disabled }}>Output Device</label>
                      <select value={selectedOutput} onChange={e => setSelectedOutput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-[12px] outline-none"
                        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                        <option value="">Default</option>
                        {audioOutputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0,6)}`}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-start justify-center gap-4">
              <ControlButton icon={isMuted ? MicOff : Mic} active={isMuted} onClick={onToggleMute} label={isMuted ? 'Unmute' : 'Mute'} />
              <ControlButton icon={isDeafened ? HeadphoneOff : Headphones} active={isDeafened} onClick={onToggleDeafen} label={isDeafened ? 'Undeafen' : 'Deafen'} />
              <ControlButton icon={Settings} active={showDevices} onClick={() => setShowDevices(!showDevices)} label="Devices" />
              <ControlButton icon={agora.screenSharing ? MonitorOff : Monitor} active={agora.screenSharing} onClick={toggleScreenShare} label={agora.screenSharing ? 'Stop Share' : 'Share Screen'} />
              <ControlButton icon={PhoneOff} danger onClick={handleDisconnect} label="Leave" />
            </div>
          </div>
        ) : (
          <button onClick={handleConnect} disabled={connecting}
            className="px-8 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-2.5 mx-auto transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: colors.text.primary, color: colors.bg.base }}>
            <Mic className="w-4 h-4" /> {connecting ? 'Connecting...' : 'Join Voice'}
          </button>
        )}
      </div>
    </div>
  );
}