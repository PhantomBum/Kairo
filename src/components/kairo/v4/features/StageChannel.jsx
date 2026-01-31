import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Hand, Users, Crown, 
  ArrowUp, ArrowDown, Volume2, VolumeX 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import Button from '../primitives/Button';

// Stage participant roles
const STAGE_ROLES = {
  SPEAKER: 'speaker',
  AUDIENCE: 'audience',
  MODERATOR: 'moderator',
};

// Stage channel component
export function StageChannel({ 
  channel, 
  voiceStates = [], 
  currentUserId, 
  isOwner,
  onLeave 
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const queryClient = useQueryClient();

  // Separate speakers and audience
  const speakers = voiceStates.filter(v => 
    v.stage_role === STAGE_ROLES.SPEAKER || 
    v.stage_role === STAGE_ROLES.MODERATOR
  );
  const audience = voiceStates.filter(v => v.stage_role === STAGE_ROLES.AUDIENCE);
  const raisedHands = audience.filter(v => v.hand_raised);
  
  // Get current user's voice state
  const myState = voiceStates.find(v => v.user_id === currentUserId);
  const isSpeaker = myState?.stage_role === STAGE_ROLES.SPEAKER || 
                    myState?.stage_role === STAGE_ROLES.MODERATOR;

  // Request to speak
  const raiseHandMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.VoiceState.update(myState.id, {
        hand_raised: !handRaised,
      });
    },
    onSuccess: () => {
      setHandRaised(!handRaised);
      queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
    },
  });

  // Move to speakers
  const moveToSpeakersMutation = useMutation({
    mutationFn: async (userId) => {
      const state = voiceStates.find(v => v.user_id === userId);
      if (state) {
        await base44.entities.VoiceState.update(state.id, {
          stage_role: STAGE_ROLES.SPEAKER,
          hand_raised: false,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['voiceStates'] }),
  });

  // Move to audience
  const moveToAudienceMutation = useMutation({
    mutationFn: async (userId) => {
      const state = voiceStates.find(v => v.user_id === userId);
      if (state) {
        await base44.entities.VoiceState.update(state.id, {
          stage_role: STAGE_ROLES.AUDIENCE,
          is_muted: true,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['voiceStates'] }),
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Stage header */}
      <div className="p-4 border-b border-white/[0.06]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-400" />
          {channel.name}
        </h2>
        {channel.topic && (
          <p className="text-sm text-zinc-500 mt-1">{channel.topic}</p>
        )}
      </div>

      {/* Speakers section */}
      <div className="p-6 border-b border-white/[0.06]">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-4 flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Speakers — {speakers.length}
        </h3>
        <div className="flex flex-wrap gap-4">
          {speakers.map((speaker) => (
            <SpeakerCard
              key={speaker.user_id}
              speaker={speaker}
              isCurrentUser={speaker.user_id === currentUserId}
              canModerate={isOwner}
              onMoveToAudience={() => moveToAudienceMutation.mutate(speaker.user_id)}
            />
          ))}
          {speakers.length === 0 && (
            <div className="text-center py-8 text-zinc-600 w-full">
              No one is speaking yet
            </div>
          )}
        </div>
      </div>

      {/* Raised hands (for moderators) */}
      {isOwner && raisedHands.length > 0 && (
        <div className="p-4 bg-amber-500/5 border-b border-white/[0.06]">
          <h3 className="text-xs font-semibold text-amber-400 uppercase mb-3 flex items-center gap-2">
            <Hand className="w-4 h-4" />
            Raised Hands — {raisedHands.length}
          </h3>
          <div className="flex flex-wrap gap-2">
            {raisedHands.map((user) => (
              <button
                key={user.user_id}
                onClick={() => moveToSpeakersMutation.mutate(user.user_id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-full transition-colors"
              >
                <Avatar src={user.user_avatar} name={user.user_name} size="xs" />
                <span className="text-sm text-white">{user.user_name}</span>
                <ArrowUp className="w-3 h-3 text-emerald-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audience section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Audience — {audience.length}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {audience.map((user) => (
            <AudienceCard
              key={user.user_id}
              user={user}
              isCurrentUser={user.user_id === currentUserId}
              canModerate={isOwner}
              onMoveToSpeakers={() => moveToSpeakersMutation.mutate(user.user_id)}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-[#111113] border-t border-white/[0.06]">
        <div className="flex items-center justify-center gap-3">
          {isSpeaker ? (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                isMuted ? 'bg-white/[0.1]' : 'bg-emerald-500'
              )}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          ) : (
            <button
              onClick={() => raiseHandMutation.mutate()}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                handRaised ? 'bg-amber-500' : 'bg-white/[0.1] hover:bg-white/[0.15]'
              )}
            >
              <Hand className={cn('w-5 h-5', handRaised ? 'text-white' : 'text-zinc-400')} />
            </button>
          )}
          
          <Button variant="danger" onClick={onLeave}>
            Leave Stage
          </Button>
        </div>
      </div>
    </div>
  );
}

// Speaker card
function SpeakerCard({ speaker, isCurrentUser, canModerate, onMoveToAudience }) {
  const isSpeaking = !speaker.is_muted; // Would use actual audio detection
  
  return (
    <div className={cn(
      'flex flex-col items-center p-4 rounded-xl transition-all',
      isSpeaking && 'ring-2 ring-emerald-500/50 bg-emerald-500/5'
    )}>
      <div className="relative">
        <Avatar
          src={speaker.user_avatar}
          name={speaker.user_name}
          size="lg"
          className={cn(isSpeaking && 'ring-2 ring-emerald-500')}
        />
        {speaker.stage_role === STAGE_ROLES.MODERATOR && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
        {speaker.is_muted && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <span className="text-sm text-white mt-2">{speaker.user_name}</span>
      {canModerate && !isCurrentUser && (
        <button
          onClick={onMoveToAudience}
          className="mt-2 text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1"
        >
          <ArrowDown className="w-3 h-3" />
          Move to audience
        </button>
      )}
    </div>
  );
}

// Audience card
function AudienceCard({ user, isCurrentUser, canModerate, onMoveToSpeakers }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar src={user.user_avatar} name={user.user_name} size="md" />
        {user.hand_raised && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
            <Hand className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <span className="text-xs text-zinc-400 mt-1 truncate max-w-[60px]">
        {user.user_name}
      </span>
      {canModerate && !isCurrentUser && (
        <button
          onClick={onMoveToSpeakers}
          className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300"
        >
          Invite to speak
        </button>
      )}
    </div>
  );
}