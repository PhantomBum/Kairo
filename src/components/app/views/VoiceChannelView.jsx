import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, MicOff, Headphones, PhoneOff, Monitor, Video, Hand, Volume2 } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { motion, AnimatePresence } from 'framer-motion';

function VoiceMember({ state, profile, isCurrentUser }) {
  const name = profile?.display_name || state.user_name || 'User';
  const avatar = profile?.avatar_url || state.user_avatar;
  const isMuted = state.is_self_muted || state.is_muted;
  const isSpeaking = !isMuted && Math.random() > 0.5; // Visual only

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
      style={{ background: isCurrentUser ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `2px solid ${isSpeaking ? 'var(--accent-green)' : 'var(--border)'}`, minWidth: 100 }}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium overflow-hidden"
          style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: `2px solid ${isSpeaking ? 'var(--accent-green)' : 'transparent'}`, transition: 'border-color 0.2s' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        {isMuted && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
            <MicOff className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {state.is_self_deafened && (
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-red)' }}>
            <Headphones className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium truncate max-w-[90px]" style={{ color: isCurrentUser ? 'var(--text-cream)' : 'var(--text-primary)' }}>{name}</span>
      {state.is_streaming && <span className="text-[8px] px-1.5 rounded-full" style={{ background: 'rgba(201,123,123,0.15)', color: 'var(--accent-red)' }}>LIVE</span>}
      {state.is_video && <span className="text-[8px] px-1.5 rounded-full" style={{ background: 'rgba(123,164,201,0.15)', color: 'var(--accent-blue)' }}>VIDEO</span>}
    </motion.div>
  );
}

export default function VoiceChannelView({ channel, currentUser, isMuted, isDeafened, onToggleMute, onToggleDeafen, onDisconnect }) {
  const { getProfile } = useProfiles();
  const [voiceStates, setVoiceStates] = useState([]);
  const [connected, setConnected] = useState(false);

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
    onDisconnect?.();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 mx-auto" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <Volume2 className="w-7 h-7" style={{ color: 'var(--accent-green)' }} />
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{channel?.name}</h2>
        <p className="text-[12px] mb-8" style={{ color: 'var(--text-muted)' }}>
          {connected ? `Connected · ${voiceStates.length} participant${voiceStates.length !== 1 ? 's' : ''}` : 'Voice Channel'}
        </p>

        {/* Participants */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <AnimatePresence>
            {voiceStates.map(s => (
              <VoiceMember key={s.id} state={s} profile={getProfile(s.user_id)} isCurrentUser={s.user_id === currentUser.id} />
            ))}
          </AnimatePresence>
          {voiceStates.length === 0 && !connected && (
            <p className="text-sm py-8" style={{ color: 'var(--text-faint)' }}>No one is in this channel yet</p>
          )}
        </div>

        {/* Controls */}
        {connected ? (
          <div className="flex items-center justify-center gap-2">
            <button onClick={onToggleMute} className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: isMuted ? 'rgba(201,123,123,0.15)' : 'var(--bg-glass)', border: `1px solid ${isMuted ? 'rgba(201,123,123,0.3)' : 'var(--border)'}` }}>
              {isMuted ? <MicOff className="w-5 h-5" style={{ color: 'var(--accent-red)' }} /> : <Mic className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
            </button>
            <button onClick={onToggleDeafen} className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: isDeafened ? 'rgba(201,123,123,0.15)' : 'var(--bg-glass)', border: `1px solid ${isDeafened ? 'rgba(201,123,123,0.3)' : 'var(--border)'}` }}>
              <Headphones className="w-5 h-5" style={{ color: isDeafened ? 'var(--accent-red)' : 'var(--text-primary)' }} />
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center glass" style={{ border: '1px solid var(--border)' }}>
              <Video className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button className="w-12 h-12 rounded-2xl flex items-center justify-center glass" style={{ border: '1px solid var(--border)' }}>
              <Monitor className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
            <button onClick={handleDisconnect} className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(201,123,123,0.15)', border: '1px solid rgba(201,123,123,0.3)' }}>
              <PhoneOff className="w-5 h-5" style={{ color: 'var(--accent-red)' }} />
            </button>
          </div>
        ) : (
          <button onClick={handleConnect} className="px-8 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 mx-auto transition-all hover:brightness-110"
            style={{ background: 'var(--accent-green)', color: '#000' }}>
            <Mic className="w-4 h-4" /> Join Voice
          </button>
        )}
      </div>
    </div>
  );
}