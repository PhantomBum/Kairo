import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Hand, Users, Settings, X, Crown,
  Volume2, VolumeX, MoreHorizontal, ChevronUp, ChevronDown,
  Radio, MessageSquare, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SpeakerTile({ user, isSpeaking, isModerator, isCurrentUser, onMute }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl transition-all",
        isSpeaking && "ring-2 ring-emerald-500/50 bg-emerald-500/5"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "relative w-20 h-20 rounded-full overflow-hidden mb-3",
        isSpeaking && "ring-2 ring-emerald-500"
      )}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {user.display_name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        
        {/* Muted indicator */}
        {user.isMuted && (
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-[#111113]">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Moderator badge */}
        {isModerator && (
          <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[#111113]">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-sm font-medium text-white text-center truncate max-w-full">
        {user.display_name}
        {isCurrentUser && <span className="text-zinc-500 ml-1">(you)</span>}
      </p>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Speaking</span>
        </div>
      )}
    </motion.div>
  );
}

function AudienceMember({ user, onInviteToSpeak }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
              <span className="text-white text-xs">
                {user.display_name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-zinc-300">{user.display_name}</p>
          {user.handRaised && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <Hand className="w-3 h-3" /> Hand raised
            </span>
          )}
        </div>
      </div>
      
      {user.handRaised && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onInviteToSpeak(user)}
          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
        >
          Invite to speak
        </Button>
      )}
    </div>
  );
}

export default function StageChannel({
  isOpen,
  onClose,
  stageName,
  topic,
  speakers = [],
  audience = [],
  currentUser,
  isModerator,
  isSpeaker,
  isMuted,
  onToggleMute,
  onRaiseHand,
  onLeaveStage,
  onInviteToSpeak,
  onMoveTOAudience
}) {
  const [showAudience, setShowAudience] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  const handleRaiseHand = () => {
    setHandRaised(!handRaised);
    onRaiseHand?.(!handRaised);
  };

  if (!isOpen) return null;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{stageName}</h2>
            {topic && <p className="text-sm text-zinc-500">{topic}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-9 h-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Share Stage</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="w-9 h-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Stage Chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speakers */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Speakers — {speakers.length}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {speakers.map((speaker) => (
              <SpeakerTile
                key={speaker.user_id}
                user={speaker}
                isSpeaking={speaker.isSpeaking}
                isModerator={speaker.isModerator}
                isCurrentUser={speaker.user_id === currentUser?.user_id}
              />
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <button
            onClick={() => setShowAudience(!showAudience)}
            className="flex items-center gap-2 mb-4 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Audience — {audience.length}
            </span>
            {showAudience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showAudience && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] divide-y divide-white/[0.06]">
                  {audience.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No one in the audience yet</p>
                    </div>
                  ) : (
                    audience.map((member) => (
                      <AudienceMember
                        key={member.user_id}
                        user={member}
                        onInviteToSpeak={onInviteToSpeak}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-[#111113]">
        <div className="flex items-center gap-3">
          {isSpeaker ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onToggleMute}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      isMuted 
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleRaiseHand}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      handRaised 
                        ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    <Hand className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{handRaised ? 'Lower Hand' : 'Raise Hand'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onLeaveStage}
            variant="destructive"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0"
          >
            Leave Stage
          </Button>
        </div>
      </div>
    </div>
  );
}