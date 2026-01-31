import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Maximize2, Minimize2, X, Volume2, VolumeX, 
  Users, Mic, MicOff, Video, VideoOff, Settings,
  ScreenShare, ScreenShareOff, MessageSquare, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ParticipantTile({ participant, isLocal, isSpeaking, size = 'normal' }) {
  const sizes = {
    small: 'w-24 h-24',
    normal: 'w-32 h-32',
    large: 'w-full h-full'
  };

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden bg-zinc-900 flex items-center justify-center",
      sizes[size],
      isSpeaking && "ring-2 ring-emerald-500"
    )}>
      {participant.video ? (
        <video
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isLocal}
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
            {participant.avatar ? (
              <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-white">
                {participant.name?.charAt(0) || '?'}
              </span>
            )}
          </div>
          <span className="text-sm text-zinc-300">{participant.name}</span>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        {participant.muted && (
          <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {isLocal && (
          <div className="px-2 py-0.5 rounded bg-black/50 text-xs text-zinc-300">
            You
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>
      )}
    </div>
  );
}

export default function ScreenShareView({ 
  isOpen, 
  onClose, 
  screenStream,
  participants = [],
  currentUser,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall,
  isMuted,
  isVideoOn,
  isScreenSharing
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const screenRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (screenStream && screenRef.current) {
      screenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 bg-[#0a0a0b] z-50 flex flex-col",
          isFullscreen ? "" : "rounded-xl overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Screen Share</p>
              <p className="text-xs text-zinc-500">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      showParticipants ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Toggle Participants</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      showChat ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Toggle Chat</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Screen share area */}
          <div className="flex-1 p-4 flex items-center justify-center bg-black">
            {screenStream ? (
              <video
                ref={screenRef}
                autoPlay
                playsInline
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <Monitor className="w-16 h-16" />
                <p>No screen being shared</p>
                <Button
                  onClick={onToggleScreenShare}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  <ScreenShare className="w-4 h-4 mr-2" />
                  Start Sharing
                </Button>
              </div>
            )}
          </div>

          {/* Participants sidebar */}
          {showParticipants && (
            <div className="w-64 border-l border-white/[0.06] bg-[#111113] p-3 space-y-3 overflow-y-auto">
              <p className="text-xs font-medium text-zinc-500 uppercase px-1">Participants</p>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <ParticipantTile
                    key={participant.id || index}
                    participant={participant}
                    isLocal={participant.id === currentUser?.id}
                    isSpeaking={participant.isSpeaking}
                    size="small"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat sidebar */}
          {showChat && (
            <div className="w-80 border-l border-white/[0.06] bg-[#111113] flex flex-col">
              <div className="p-3 border-b border-white/[0.06]">
                <p className="text-sm font-medium text-white">Call Chat</p>
              </div>
              <div className="flex-1 p-3 overflow-y-auto">
                <p className="text-xs text-zinc-500 text-center">Chat messages will appear here</p>
              </div>
              <div className="p-3 border-t border-white/[0.06]">
                <input
                  type="text"
                  placeholder="Send a message..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 py-4 bg-black/40 border-t border-white/[0.06]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleMute}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isMuted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isMuted ? 'Unmute' : 'Mute'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleVideo}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    !isVideoOn ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isVideoOn ? 'Turn off camera' : 'Turn on camera'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggleScreenShare}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                    isScreenSharing ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onEndCall}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Leave call</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}