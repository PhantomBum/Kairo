import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, Volume2, Video, VideoOff,
  Monitor, MonitorOff, PhoneOff, Settings, Users,
  UserPlus, Crown, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function VoiceParticipant({ participant, isCurrentUser, isSpeaking }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-4 rounded-xl transition-all",
        isSpeaking && "ring-2 ring-green-500 bg-green-500/5"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={cn(
            "w-12 h-12 rounded-xl overflow-hidden",
            isSpeaking && "ring-2 ring-green-500"
          )}>
            {participant.user_avatar ? (
              <img src={participant.user_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {participant.user_name?.charAt(0)}
              </div>
            )}
          </div>
          
          {participant.is_self_muted && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{participant.user_name}</span>
            {isCurrentUser && (
              <span className="text-xs text-zinc-500">(you)</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {participant.is_self_deafened && (
              <Headphones className="w-3 h-3 text-zinc-500" />
            )}
            {participant.is_video && (
              <Video className="w-3 h-3 text-green-500" />
            )}
            {participant.is_streaming && (
              <Monitor className="w-3 h-3 text-indigo-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function VoiceChannel({ 
  channel, 
  participants = [], 
  currentUserId,
  isMuted, 
  isDeafened, 
  isVideo, 
  isScreenSharing,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onToggleScreenShare,
  onLeave
}) {
  const [speakingUsers, setSpeakingUsers] = useState(new Set());

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{channel.name}</h2>
              <p className="text-sm text-zinc-500">{participants.length} {participants.length === 1 ? 'participant' : 'participants'}</p>
            </div>
          </div>
          
          <Button
            onClick={onLeave}
            variant="outline"
            className="bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Participants */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {participants.map((participant) => (
              <VoiceParticipant
                key={participant.user_id}
                participant={participant}
                isCurrentUser={participant.user_id === currentUserId}
                isSpeaking={speakingUsers.has(participant.user_id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={onToggleMute}
            className={cn(
              "rounded-full w-14 h-14",
              isMuted 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-zinc-800 hover:bg-zinc-700"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            onClick={onToggleDeafen}
            className={cn(
              "rounded-full w-14 h-14",
              isDeafened 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-zinc-800 hover:bg-zinc-700"
            )}
          >
            <Headphones className="w-6 h-6" />
          </Button>

          <Button
            size="lg"
            onClick={onToggleVideo}
            className={cn(
              "rounded-full w-14 h-14",
              isVideo 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-zinc-800 hover:bg-zinc-700"
            )}
          >
            {isVideo ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            onClick={onToggleScreenShare}
            className={cn(
              "rounded-full w-14 h-14",
              isScreenSharing 
                ? "bg-indigo-500 hover:bg-indigo-600" 
                : "bg-zinc-800 hover:bg-zinc-700"
            )}
          >
            {isScreenSharing ? <Monitor className="w-6 h-6" /> : <MonitorOff className="w-6 h-6" />}
          </Button>

          <div className="w-px h-10 bg-zinc-700 mx-2" />

          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-14 h-14 border-zinc-700"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}