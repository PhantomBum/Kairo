import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Monitor, Phone,
  Settings, Volume2, VolumeX, Video, VideoOff, Users,
  PhoneOff, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from '@/components/ui/slider';

function VoiceUser({ user, isSpeaking, isListeningOnly }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "flex flex-col items-center gap-2 p-3",
        isSpeaking && "bg-emerald-500/10 rounded-xl"
      )}
    >
      <div className="relative">
        <div className={cn(
          "w-20 h-20 rounded-full overflow-hidden transition-all",
          isSpeaking && "ring-4 ring-emerald-500",
          user.is_self_muted && "opacity-50"
        )}>
          {user.user_avatar ? (
            <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-medium">
              {user.user_name?.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {user.is_self_muted && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {user.is_self_deafened && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <HeadphoneOff className="w-3 h-3 text-white" />
            </div>
          )}
          {user.is_streaming && (
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          )}
          {isListeningOnly && (
            <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
      
      <span className={cn(
        "text-sm font-medium text-white truncate max-w-[80px]",
        isListeningOnly && "text-zinc-500"
      )}>
        {user.user_name}
      </span>
    </motion.div>
  );
}

export default function VoicePanel({ 
  channel,
  voiceUsers = [],
  currentUserId,
  onLeave,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onStartStream,
  onToggleListenOnly,
  isMuted,
  isDeafened,
  isVideo,
  isStreaming,
  isListeningOnly
}) {
  const [volume, setVolume] = useState(100);
  const [showSettings, setShowSettings] = useState(false);

  const currentUser = voiceUsers.find(u => u.user_id === currentUserId);
  const otherUsers = voiceUsers.filter(u => u.user_id !== currentUserId);
  const listeners = voiceUsers.filter(u => u.is_listening_only);
  const speakers = voiceUsers.filter(u => !u.is_listening_only);

  return (
    <div className="flex-1 flex flex-col bg-[#121214]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-zinc-400" />
          <h2 className="font-semibold text-white">{channel?.name || 'Voice Channel'}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Users className="w-4 h-4" />
          <span>{voiceUsers.length}</span>
        </div>
      </div>

      {/* Voice users grid */}
      <div className="flex-1 overflow-auto p-4">
        {speakers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Speaking — {speakers.length}
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {speakers.map((user) => (
                  <VoiceUser
                    key={user.user_id}
                    user={user}
                    isSpeaking={!user.is_self_muted}
                    isListeningOnly={false}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {listeners.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Listening — {listeners.length}
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <AnimatePresence>
                {listeners.map((user) => (
                  <VoiceUser
                    key={user.user_id}
                    user={user}
                    isSpeaking={false}
                    isListeningOnly={true}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {voiceUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Volume2 className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No one is here</p>
            <p className="text-sm">Be the first to join!</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-zinc-800/50">
        {/* Volume slider */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-zinc-800/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-zinc-400" />
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-zinc-400 w-10 text-right">{volume}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-3">
          {/* Listen only toggle - Unique Kairo feature */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleListenOnly}
                  className={cn(
                    "w-12 h-12 rounded-full transition-colors",
                    isListeningOnly 
                      ? "bg-zinc-600 text-white hover:bg-zinc-700" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {isListeningOnly ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                {isListeningOnly ? 'Exit Listen Mode' : 'Listen Only (Invisible)'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mute */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleMute}
                  disabled={isListeningOnly}
                  className={cn(
                    "w-12 h-12 rounded-full transition-colors",
                    isMuted 
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                {isMuted ? 'Unmute' : 'Mute'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Deafen */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleDeafen}
                  className={cn(
                    "w-12 h-12 rounded-full transition-colors",
                    isDeafened 
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {isDeafened ? <HeadphoneOff className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                {isDeafened ? 'Undeafen' : 'Deafen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Video */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleVideo}
                  disabled={isListeningOnly}
                  className={cn(
                    "w-12 h-12 rounded-full transition-colors",
                    isVideo 
                      ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {isVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                {isVideo ? 'Stop Video' : 'Start Video'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Screen share */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onStartStream}
                  disabled={isListeningOnly}
                  className={cn(
                    "w-12 h-12 rounded-full transition-colors",
                    isStreaming 
                      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  <Monitor className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                {isStreaming ? 'Stop Sharing' : 'Share Screen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Settings */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Leave */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLeave}
                  className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                Leave Voice
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}