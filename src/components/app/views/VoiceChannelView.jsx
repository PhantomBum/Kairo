import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Monitor, MonitorOff, Volume2, Users, AlertCircle, Settings, ChevronUp, Signal, Video, VideoOff } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { motion, AnimatePresence } from 'framer-motion';
import useAgora from '@/components/app/hooks/useAgora';
import ScreenSharePopup from '@/components/app/views/ScreenSharePopup';
import MicTestPanel from '@/components/app/views/MicTestPanel';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399',
};

function VoiceMember({ state, profile, isCurrentUser, isSpeaking }) {
  const name = profile?.display_name || state.user_name || 'User';
  const avatar = profile?.avatar_url || state.user_avatar;
  const isMuted = state.is_self_muted || state.is_muted;
  const isDeafened = state.is_self_deafened;
  const isStreaming = state.is_streaming;
  const [showVolume, setShowVolume] = useState(false);
  const [userVolume, setUserVolume] = useState(() => {
    try { return parseInt(localStorage.getItem(`kairo-vol-${state.user_id}`) || '100', 10); } catch { return 100; }
  });
  const volRef = useRef(null);

  useEffect(() => {
    if (!showVolume) return;
    const close = (e) => { if (volRef.current && !volRef.current.contains(e.target)) setShowVolume(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showVolume]);

  const handleVolumeChange = (v) => {
    setUserVolume(v);
    try { localStorage.setItem(`kairo-vol-${state.user_id}`, String(v)); } catch {}
  };

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="relative flex flex-col items-center rounded-2xl overflow-hidden cursor-pointer"
      onContextMenu={(e) => { if (!isCurrentUser) { e.preventDefault(); setShowVolume(true); } }}
      style={{
        background: P.surface,
        border: `2px solid ${isSpeaking ? P.success : P.border}`,
        boxShadow: isSpeaking ? `0 0 20px ${P.success}30, 0 0 40px ${P.success}10` : 'none',
        transition: 'border-color 100ms ease, box-shadow 200ms ease',
        minWidth: 160, minHeight: 180,
      }}>
      {/* Avatar with speaking ring */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative">
          {isSpeaking && (
            <div className="absolute inset-[-6px] rounded-full animate-pulse" style={{ background: `${P.success}15`, border: `2px solid ${P.success}40` }} />
          )}
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden relative"
            style={{
              background: P.elevated, color: P.muted,
              boxShadow: isSpeaking ? `0 0 0 3px ${P.success}, 0 0 16px ${P.success}40` : 'none',
              transition: 'box-shadow 100ms ease',
            }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt={name} onError={e => { e.target.style.display = 'none'; }} /> : name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="w-full px-3 pb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium truncate" style={{ color: isCurrentUser ? P.textPrimary : P.textSecondary }}>{name}</span>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${P.danger}20`, color: P.danger }}>LIVE</span>
          )}
          {isMuted && <MicOff className="w-3.5 h-3.5" style={{ color: P.danger }} />}
          {isDeafened && <HeadphoneOff className="w-3.5 h-3.5" style={{ color: P.danger }} />}
          {!isMuted && !isDeafened && <Mic className="w-3.5 h-3.5" style={{ color: P.muted }} />}
        </div>
      </div>

      {/* Per-user volume slider (right-click context menu) */}
      {showVolume && !isCurrentUser && (
        <div ref={volRef} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl z-50 k-dropdown-in"
          style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', minWidth: 180 }}>
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-3.5 h-3.5" style={{ color: P.muted }} />
            <span className="text-[12px] font-semibold" style={{ color: P.textPrimary }}>User Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="range" min="0" max="200" value={userVolume} onChange={e => handleVolumeChange(parseInt(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer" style={{ accentColor: P.accent }} />
            <span className="text-[11px] tabular-nums w-8 text-right font-medium" style={{ color: P.textSecondary }}>{userVolume}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ControlBtn({ active, danger, onClick, icon: Icon, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1.5 group disabled:opacity-30" title={label}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
        style={{
          background: danger ? `${P.danger}15` : active ? `${P.danger}10` : P.surface,
          border: `1px solid ${danger ? `${P.danger}40` : active ? `${P.danger}30` : P.border}`,
        }}>
        <Icon className="w-5 h-5" style={{ color: danger ? P.danger : active ? P.danger : P.textSecondary }} />
      </div>
      <span className="text-[11px]" style={{ color: P.muted }}>{label}</span>
    </button>
  );
}

export default function VoiceChannelView({ channel, currentUser, isMuted, isDeafened, onToggleMute, onToggleDeafen, onDisconnect, onRegisterLeave }) {
  const { getProfile } = useProfiles();
  const [voiceStates, setVoiceStates] = useState([]);
  const [connecting, setConnecting] = useState(true);
  const screenVideoRef = useRef(null);
  const joinedOnceRef = useRef(false);
  const agora = useAgora();

  const [showDevices, setShowDevices] = useState(false);
  const [showScreenShareConfirm, setShowScreenShareConfirm] = useState(false);
  const [showMicTest, setShowMicTest] = useState(false);
  const [wasDeafenedBeforeTest, setWasDeafenedBeforeTest] = useState(false);
  const [audioInputs, setAudioInputs] = useState([]);
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedInput, setSelectedInput] = useState(() => { try { return localStorage.getItem('kairo-audio-input') || ''; } catch { return ''; } });
  const [selectedOutput, setSelectedOutput] = useState(() => { try { return localStorage.getItem('kairo-audio-output') || ''; } catch { return ''; } });

  useEffect(() => { try { localStorage.setItem('kairo-audio-input', selectedInput); } catch {} }, [selectedInput]);
  useEffect(() => { try { localStorage.setItem('kairo-audio-output', selectedOutput); } catch {} }, [selectedOutput]);

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

  useEffect(() => {
    if (!channel?.id) return;
    const fetchStates = async () => {
      try {
        const states = await base44.entities.VoiceState.filter({ channel_id: channel.id });
        const seen = new Map();
        const toDelete = [];
        for (const s of states) {
          if (seen.has(s.user_id)) toDelete.push(s.id);
          else seen.set(s.user_id, s);
        }
        if (toDelete.length > 0) toDelete.forEach(id => base44.entities.VoiceState.delete(id));
        setVoiceStates(Array.from(seen.values()));
      } catch {}
    };
    fetchStates();
    let unsub;
    try { unsub = base44.entities.VoiceState.subscribe(() => fetchStates()); } catch {}
    return () => unsub?.();
  }, [channel?.id]);

  useEffect(() => {
    if (agora.joined && agora.localAudioMuted !== isMuted) agora.toggleMute();
  }, [isMuted, agora.joined]);

  useEffect(() => {
    if (!channel?.id || !currentUser?.id || joinedOnceRef.current) return;
    joinedOnceRef.current = true;
    const autoJoin = async () => {
      setConnecting(true);
      try {
        const allStale = await base44.entities.VoiceState.filter({ user_id: currentUser.id, server_id: channel.server_id });
        await Promise.all(allStale.map(s => base44.entities.VoiceState.delete(s.id)));
        const channelName = `server_${channel.server_id}_channel_${channel.id}`;
        await agora.join(channelName);
        await base44.entities.VoiceState.create({
          user_id: currentUser.id, user_email: currentUser.email,
          user_name: currentUser.full_name, channel_id: channel.id,
          server_id: channel.server_id, is_self_muted: isMuted, is_self_deafened: isDeafened,
        });
      } catch (err) { console.error('Voice join error:', err); }
      setConnecting(false);
    };
    autoJoin();
  }, [channel?.id, currentUser?.id]);

  const handleDisconnect = useCallback(async () => {
    await agora.leave();
    try {
      const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
      for (const s of states) await base44.entities.VoiceState.delete(s.id);
    } catch {}
    onDisconnect?.();
  }, [channel?.id, currentUser?.id, onDisconnect]);

  useEffect(() => {
    if (channel?.id && agora.joined) onRegisterLeave?.(handleDisconnect);
    return () => onRegisterLeave?.(null);
  }, [channel?.id, agora.joined, handleDisconnect, onRegisterLeave]);

  const handleScreenShareClick = () => {
    if (agora.screenSharing) doToggleScreenShare();
    else setShowScreenShareConfirm(true);
  };

  const doToggleScreenShare = async () => {
    if (!agora.joined) return;
    setShowScreenShareConfirm(false);
    await agora.toggleScreenShare();
    try {
      const newVal = !agora.screenSharing;
      const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
      if (states[0]) await base44.entities.VoiceState.update(states[0].id, { is_streaming: newVal });
    } catch {}
  };

  useEffect(() => {
    if (!agora.joined) return;
    const sync = async () => {
      try {
        const states = await base44.entities.VoiceState.filter({ channel_id: channel.id, user_id: currentUser.id });
        if (states[0]) await base44.entities.VoiceState.update(states[0].id, { is_self_muted: isMuted, is_self_deafened: isDeafened });
      } catch {}
    };
    sync();
  }, [isMuted, isDeafened, agora.joined]);

  const speakingUserIds = React.useMemo(() => {
    if (!agora.speakingUids?.length) return [];
    const ids = [];
    if (agora.speakingUids.includes(0) || agora.speakingUids.includes(agora.localUid)) ids.push(currentUser.id);
    if (agora.speakingUids.some(uid => uid !== 0 && uid !== agora.localUid && uid < 100000)) {
      voiceStates.forEach(s => { if (s.user_id !== currentUser.id) ids.push(s.user_id); });
    }
    return ids;
  }, [agora.speakingUids, agora.localUid, currentUser.id, voiceStates]);

  const channelIdRef = useRef(channel?.id);
  const userIdRef = useRef(currentUser?.id);
  const serverIdRef = useRef(channel?.server_id);
  channelIdRef.current = channel?.id;
  userIdRef.current = currentUser?.id;
  serverIdRef.current = channel?.server_id;
  useEffect(() => {
    return () => {
      agora.leave();
      const uId = userIdRef.current;
      const sId = serverIdRef.current;
      if (uId && sId) {
        base44.entities.VoiceState.filter({ user_id: uId, server_id: sId }).then(states => {
          states.forEach(s => base44.entities.VoiceState.delete(s.id));
        }).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const screenUser = agora.remoteUsers?.find(u => u.uid > 100000 && u.videoTrack);
    if (screenUser && screenVideoRef.current) screenUser.videoTrack.play(screenVideoRef.current);
  }, [agora.remoteUsers]);

  const hasRemoteScreen = agora.remoteUsers?.some(u => u.uid > 100000 && u.videoTrack);

  // Responsive grid columns
  const count = voiceStates.length;
  const gridCols = count <= 2 ? 'grid-cols-1 sm:grid-cols-2' : count <= 4 ? 'grid-cols-2' : count <= 9 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="flex-1 flex flex-col" style={{ background: P.elevated }}>
      {/* Channel info */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
        <Volume2 className="w-5 h-5" style={{ color: P.muted }} />
        <h2 className="text-[16px] font-semibold" style={{ color: P.textPrimary }}>{channel?.name}</h2>
      </div>
      <div className="flex items-center justify-center gap-3 pb-4">
        {connecting ? (
          <span className="text-[12px]" style={{ color: P.muted }}>Connecting...</span>
        ) : agora.joined ? (
          <>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" style={{ color: P.success }} />
              <span className="text-[12px] font-medium" style={{ color: P.success }}>Connected</span>
            </div>
            <span className="text-[12px]" style={{ color: P.muted }}>·</span>
            <span className="text-[12px]" style={{ color: P.muted }}>{count} in channel</span>
          </>
        ) : (
          <span className="text-[12px]" style={{ color: P.muted }}>Disconnected</span>
        )}
      </div>

      {agora.error && (
        <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 rounded-lg mx-auto w-fit" style={{ background: `${P.danger}10`, border: `1px solid ${P.danger}20` }}>
          <AlertCircle className="w-4 h-4" style={{ color: P.danger }} />
          <span className="text-[13px]" style={{ color: P.danger }}>{agora.error}</span>
        </div>
      )}

      {/* Screen share viewer */}
      {hasRemoteScreen && (
        <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ background: P.base, border: `1px solid ${P.border}` }}>
          <div ref={screenVideoRef} className="w-full aspect-video" />
        </div>
      )}

      {/* Participant tiles */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-8 pb-4">
        <div className={`grid ${gridCols} gap-4 max-w-2xl mx-auto`}>
          <AnimatePresence>
            {voiceStates.map(s => (
              <VoiceMember key={s.id} state={s} profile={getProfile(s.user_id)}
                isCurrentUser={s.user_id === currentUser.id}
                isSpeaking={speakingUserIds.includes(s.user_id)} />
            ))}
          </AnimatePresence>
        </div>
        {voiceStates.length === 0 && !connecting && agora.joined && (
          <p className="text-center text-[13px] py-8" style={{ color: P.muted }}>You're the only one here.</p>
        )}
      </div>

      {/* Controls bar */}
      <div className="relative px-4 py-4 flex items-center justify-center" style={{ background: P.base, borderTop: `1px solid ${P.border}` }}>
        {/* Device selector */}
        <AnimatePresence>
          {showDevices && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 rounded-xl z-10"
              style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>Audio Devices</span>
                <button onClick={() => setShowDevices(false)} className="p-1 rounded hover:bg-[rgba(255,255,255,0.06)]">
                  <ChevronUp className="w-4 h-4" style={{ color: P.muted }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Input Device</label>
                  <select value={selectedInput} onChange={e => setSelectedInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[12px] outline-none appearance-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                    <option value="">Default</option>
                    {audioInputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 6)}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Output Device</label>
                  <select value={selectedOutput} onChange={e => setSelectedOutput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[12px] outline-none appearance-none" style={{ background: P.elevated, color: P.textPrimary, border: `1px solid ${P.border}` }}>
                    <option value="">Default</option>
                    {audioOutputs.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 6)}`}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMicTest && <MicTestPanel onClose={() => setShowMicTest(false)} wasDeafened={wasDeafenedBeforeTest} onRestoreDeafen={() => { if (!wasDeafenedBeforeTest && isDeafened) onToggleDeafen(); }} />}
        </AnimatePresence>

        <AnimatePresence>
          {showScreenShareConfirm && <ScreenSharePopup onConfirm={doToggleScreenShare} onCancel={() => setShowScreenShareConfirm(false)} />}
        </AnimatePresence>

        <div className="flex items-center gap-5">
          <div className="flex items-start gap-4">
            <ControlBtn icon={isMuted ? MicOff : Mic} active={isMuted} onClick={onToggleMute} label={isMuted ? 'Unmute' : 'Mute'} />
            <ControlBtn icon={isDeafened ? HeadphoneOff : Headphones} active={isDeafened} onClick={onToggleDeafen} label={isDeafened ? 'Undeafen' : 'Deafen'} />
            <ControlBtn icon={Video} onClick={() => {}} label="Video" />
            <ControlBtn icon={agora.screenSharing ? MonitorOff : Monitor} active={agora.screenSharing} onClick={handleScreenShareClick} label={agora.screenSharing ? 'Stop Share' : 'Share'} />
            <ControlBtn icon={Settings} active={showDevices} onClick={() => setShowDevices(!showDevices)} label="Devices" />
          </div>
          <div className="w-px h-8 rounded-full" style={{ background: P.border }} />
          <ControlBtn icon={PhoneOff} danger onClick={handleDisconnect} label="Leave" />
        </div>
      </div>
    </div>
  );
}
