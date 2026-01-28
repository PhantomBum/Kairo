import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Monitor, Phone,
  Video, VideoOff, Users, PhoneOff, Eye, EyeOff, Settings,
  Volume2, VolumeX, ScreenShare, Grid, Maximize2, PictureInPicture,
  Radio, Hand
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Voice User Tile Component
function VoiceUserTile({ 
  user, 
  isSpeaking, 
  isListeningOnly, 
  isCurrentUser,
  layout = 'grid',
  onAdjustVolume,
  onMuteUser
}) {
  const [showControls, setShowControls] = useState(false);
  const [userVolume, setUserVolume] = useState(100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={cn(
        "relative rounded-xl overflow-hidden transition-all",
        layout === 'grid' ? "aspect-video" : "aspect-square",
        isSpeaking && !user.is_self_muted && "ring-2 ring-emerald-500",
        user.is_self_muted && "opacity-60"
      )}
    >
      {/* Video/Avatar background */}
      <div className="absolute inset-0 bg-zinc-800/50">
        {user.is_video ? (
          <video 
            className="w-full h-full object-cover"
            autoPlay
            muted={isCurrentUser}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={cn(
              "rounded-full overflow-hidden transition-all",
              layout === 'grid' ? "w-24 h-24" : "w-16 h-16",
              isSpeaking && !user.is_self_muted && "ring-4 ring-emerald-500 scale-105"
            )}>
              {user.user_avatar ? (
                <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-medium">
                  {user.user_name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Screen share overlay */}
      {user.is_streaming && (
        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
          <div className="bg-purple-500 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Sharing Screen
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
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
        {isListeningOnly && (
          <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center">
            <Eye className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="absolute bottom-2 right-2">
        <span className={cn(
          "px-2 py-1 rounded-md text-sm font-medium bg-black/50 text-white",
          isSpeaking && !user.is_self_muted && "bg-emerald-500/80"
        )}>
          {user.user_name}
        </span>
      </div>

      {/* User controls (for non-current users) */}
      {!isCurrentUser && showControls && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                <Settings className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-400">User Volume</span>
                  <span className="text-white">{userVolume}%</span>
                </div>
                <Slider
                  value={[userVolume]}
                  onValueChange={([v]) => {
                    setUserVolume(v);
                    onAdjustVolume?.(user.user_id, v);
                  }}
                  max={200}
                  step={1}
                />
              </div>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                onClick={() => onMuteUser?.(user.user_id)}
                className="text-zinc-300 focus:bg-zinc-800"
              >
                <VolumeX className="w-4 h-4 mr-2" />
                {user.is_muted ? 'Unmute User' : 'Mute User'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
}

// Voice Controls Bar
function VoiceControls({
  isMuted,
  isDeafened,
  isVideo,
  isStreaming,
  isListeningOnly,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onToggleStream,
  onToggleListenOnly,
  onLeave,
  onOpenSettings
}) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-zinc-900/80 backdrop-blur-sm rounded-xl">
      {/* Listen Only - Kairo Exclusive */}
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

      {/* Screen Share */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleStream}
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
              onClick={onOpenSettings}
              className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
            Voice Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Disconnect */}
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
            Disconnect
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Main Voice Channel Component
export default function VoiceChannel({ 
  channel,
  server,
  voiceUsers = [],
  currentUserId,
  onLeave,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onToggleStream,
  onToggleListenOnly,
  onOpenSettings,
  isMuted,
  isDeafened,
  isVideo,
  isStreaming,
  isListeningOnly
}) {
  const [layout, setLayout] = useState('grid'); // 'grid' | 'spotlight' | 'list'
  const [spotlightUser, setSpotlightUser] = useState(null);

  const speakers = voiceUsers.filter(u => !u.is_listening_only);
  const listeners = voiceUsers.filter(u => u.is_listening_only);

  // Auto-spotlight streaming user
  useEffect(() => {
    const streamingUser = voiceUsers.find(u => u.is_streaming);
    if (streamingUser) {
      setSpotlightUser(streamingUser);
      setLayout('spotlight');
    }
  }, [voiceUsers]);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2',
  };

  const getGridClass = () => {
    const count = speakers.length;
    if (count <= 1) return 'grid-cols-1 max-w-xl';
    if (count <= 2) return 'grid-cols-2 max-w-2xl';
    if (count <= 4) return 'grid-cols-2 max-w-3xl';
    if (count <= 6) return 'grid-cols-3 max-w-4xl';
    return 'grid-cols-4 max-w-5xl';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f11]">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="font-semibold text-white">{channel?.name || 'Voice Channel'}</h2>
            <p className="text-xs text-zinc-500">{server?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout switcher */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'grid' ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('spotlight')}
              className={cn(
                "p-1.5 rounded transition-colors",
                layout === 'spotlight' ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Participant count */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 rounded-lg text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            <span>{voiceUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Voice Users Grid */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {layout === 'spotlight' && spotlightUser ? (
          <div className="w-full max-w-5xl">
            <VoiceUserTile
              user={spotlightUser}
              isSpeaking={!spotlightUser.is_self_muted}
              isListeningOnly={spotlightUser.is_listening_only}
              isCurrentUser={spotlightUser.user_id === currentUserId}
              layout="spotlight"
            />
            {speakers.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {speakers.filter(u => u.user_id !== spotlightUser?.user_id).map((user) => (
                  <div 
                    key={user.user_id} 
                    className="flex-shrink-0 w-32 cursor-pointer"
                    onClick={() => setSpotlightUser(user)}
                  >
                    <VoiceUserTile
                      user={user}
                      isSpeaking={!user.is_self_muted}
                      isListeningOnly={user.is_listening_only}
                      isCurrentUser={user.user_id === currentUserId}
                      layout="list"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={cn("grid gap-4 w-full mx-auto", getGridClass())}>
            <AnimatePresence>
              {speakers.map((user) => (
                <VoiceUserTile
                  key={user.user_id}
                  user={user}
                  isSpeaking={!user.is_self_muted}
                  isListeningOnly={false}
                  isCurrentUser={user.user_id === currentUserId}
                  layout="grid"
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {speakers.length === 0 && (
          <div className="flex flex-col items-center justify-center text-zinc-500">
            <Volume2 className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-400">No one is here</h3>
            <p className="text-sm">Be the first to join!</p>
          </div>
        )}
      </div>

      {/* Listeners section */}
      {listeners.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Eye className="w-3 h-3" />
            <span>Listening — {listeners.length}</span>
          </div>
          <div className="flex gap-2">
            {listeners.map((user) => (
              <div key={user.user_id} className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/50 rounded-full">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-700">
                  {user.user_avatar ? (
                    <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white">
                      {user.user_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs text-zinc-400">{user.user_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 flex justify-center">
        <VoiceControls
          isMuted={isMuted}
          isDeafened={isDeafened}
          isVideo={isVideo}
          isStreaming={isStreaming}
          isListeningOnly={isListeningOnly}
          onToggleMute={onToggleMute}
          onToggleDeafen={onToggleDeafen}
          onToggleVideo={onToggleVideo}
          onToggleStream={onToggleStream}
          onToggleListenOnly={onToggleListenOnly}
          onLeave={onLeave}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </div>
  );
}