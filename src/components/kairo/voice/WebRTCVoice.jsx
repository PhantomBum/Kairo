import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Monitor, MonitorOff,
  Video, VideoOff, PhoneOff, Settings, Users, Radio, Hand,
  Volume2, VolumeX, Grid, Maximize2, Eye, PictureInPicture
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

// WebRTC-based voice/video chat component
// Note: Full WebRTC requires signaling server - this implements the UI and local media controls
// For production, integrate with WebRTC signaling (e.g., Socket.IO, Firebase, or dedicated service)

export default function WebRTCVoice({
  channelId,
  serverId,
  channelName,
  serverName,
  participants = [],
  currentUserId,
  onLeave,
  onUpdateState,
  isListenOnly = false
}) {
  // Local media state
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isListening, setIsListening] = useState(isListenOnly);
  
  // Audio processing
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  
  // Volume controls
  const [inputVolume, setInputVolume] = useState(100);
  const [outputVolume, setOutputVolume] = useState(100);
  const [userVolumes, setUserVolumes] = useState({}); // userId -> volume
  
  // Speaking detection
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  // Media refs
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  
  // Layout
  const [layout, setLayout] = useState('grid'); // grid, spotlight, list
  const [spotlightUser, setSpotlightUser] = useState(null);
  const [isPiP, setIsPiP] = useState(false);

  // Initialize audio context for voice activity detection
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Get user media
  const startLocalMedia = useCallback(async (video = false) => {
    try {
      const constraints = {
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
        },
        video: video ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Set up voice activity detection
      if (audioContextRef.current && stream.getAudioTracks().length > 0) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        // Voice activity detection loop
        const checkVoiceActivity = () => {
          if (!analyserRef.current) return;
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          const isSpeaking = average > 20; // Threshold
          
          setSpeakingUsers(prev => {
            const next = new Set(prev);
            if (isSpeaking && !isMuted) {
              next.add(currentUserId);
            } else {
              next.delete(currentUserId);
            }
            return next;
          });
          
          requestAnimationFrame(checkVoiceActivity);
        };
        checkVoiceActivity();
      }

      setIsVideoEnabled(video);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }, [echoCancellation, noiseSuppression, autoGainControl, isMuted, currentUserId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: true // System audio
      });

      screenStreamRef.current = stream;
      setIsScreenSharing(true);

      // Handle stream end (user clicks "Stop sharing")
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      return null;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
  }, []);

  // Toggle functions
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    onUpdateState?.({ is_self_muted: !isMuted });
  }, [isMuted, onUpdateState]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(!isDeafened);
    onUpdateState?.({ is_self_deafened: !isDeafened });
    // When deafened, also mute
    if (!isDeafened) {
      setIsMuted(true);
      onUpdateState?.({ is_self_muted: true });
    }
  }, [isDeafened, onUpdateState]);

  const toggleVideo = useCallback(async () => {
    if (isVideoEnabled) {
      localStreamRef.current?.getVideoTracks().forEach(track => track.stop());
      setIsVideoEnabled(false);
    } else {
      await startLocalMedia(true);
    }
    onUpdateState?.({ is_video: !isVideoEnabled });
  }, [isVideoEnabled, startLocalMedia, onUpdateState]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
    onUpdateState?.({ is_streaming: !isScreenSharing });
  }, [isScreenSharing, startScreenShare, stopScreenShare, onUpdateState]);

  const toggleListenOnly = useCallback(() => {
    setIsListening(!isListening);
    onUpdateState?.({ is_listening_only: !isListening });
    // In listen mode, always muted
    if (!isListening) {
      setIsMuted(true);
      onUpdateState?.({ is_self_muted: true });
    }
  }, [isListening, onUpdateState]);

  // Adjust individual user volume
  const setUserVolume = useCallback((userId, volume) => {
    setUserVolumes(prev => ({ ...prev, [userId]: volume }));
    // Apply volume to that user's audio element
  }, []);

  // Leave channel
  const handleLeave = useCallback(() => {
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    onLeave?.();
  }, [onLeave]);

  // Initialize on mount
  useEffect(() => {
    if (!isListenOnly) {
      startLocalMedia(false);
    }
    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isListenOnly, startLocalMedia]);

  // Separate speakers and listeners
  const speakers = participants.filter(p => !p.is_listening_only);
  const listeners = participants.filter(p => p.is_listening_only);

  // Grid layout calculation
  const getGridClass = () => {
    const count = speakers.length;
    if (count <= 1) return 'grid-cols-1 max-w-2xl';
    if (count <= 2) return 'grid-cols-2 max-w-3xl';
    if (count <= 4) return 'grid-cols-2 max-w-4xl';
    if (count <= 6) return 'grid-cols-3 max-w-5xl';
    return 'grid-cols-4 max-w-6xl';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f11]">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="font-semibold text-white">{channelName}</h2>
            <p className="text-xs text-zinc-500">{serverName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setLayout('grid')}
              className={cn("p-1.5 rounded", layout === 'grid' ? "bg-zinc-700 text-white" : "text-zinc-400")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('spotlight')}
              className={cn("p-1.5 rounded", layout === 'spotlight' ? "bg-zinc-700 text-white" : "text-zinc-400")}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Participants count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            {participants.length}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {layout === 'spotlight' && spotlightUser ? (
          <div className="w-full max-w-5xl space-y-4">
            <ParticipantTile
              participant={spotlightUser}
              isSpeaking={speakingUsers.has(spotlightUser.user_id)}
              isCurrentUser={spotlightUser.user_id === currentUserId}
              large
              onAdjustVolume={(vol) => setUserVolume(spotlightUser.user_id, vol)}
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {speakers.filter(p => p.user_id !== spotlightUser.user_id).map(participant => (
                <div 
                  key={participant.user_id}
                  className="w-32 flex-shrink-0 cursor-pointer"
                  onClick={() => setSpotlightUser(participant)}
                >
                  <ParticipantTile
                    participant={participant}
                    isSpeaking={speakingUsers.has(participant.user_id)}
                    isCurrentUser={participant.user_id === currentUserId}
                    compact
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-4 w-full mx-auto", getGridClass())}>
            {speakers.map(participant => (
              <ParticipantTile
                key={participant.user_id}
                participant={participant}
                isSpeaking={speakingUsers.has(participant.user_id)}
                isCurrentUser={participant.user_id === currentUserId}
                onClick={() => {
                  setSpotlightUser(participant);
                  setLayout('spotlight');
                }}
                onAdjustVolume={(vol) => setUserVolume(participant.user_id, vol)}
              />
            ))}
          </div>
        )}

        {speakers.length === 0 && (
          <div className="text-center text-zinc-500">
            <Volume2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No one is speaking</p>
          </div>
        )}
      </div>

      {/* Listeners */}
      {listeners.length > 0 && (
        <div className="px-6 py-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Eye className="w-3 h-3" />
            Listening — {listeners.length}
          </div>
          <div className="flex gap-2 flex-wrap">
            {listeners.map(user => (
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
        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/80 backdrop-blur-sm rounded-2xl">
          {/* Listen Only */}
          <ControlButton
            icon={isListening ? Eye : Eye}
            label={isListening ? 'Exit Listen Mode' : 'Listen Only'}
            onClick={toggleListenOnly}
            active={isListening}
            activeColor="bg-zinc-600"
          />

          {/* Mute */}
          <ControlButton
            icon={isMuted ? MicOff : Mic}
            label={isMuted ? 'Unmute' : 'Mute'}
            onClick={toggleMute}
            active={isMuted}
            disabled={isListening}
          />

          {/* Deafen */}
          <ControlButton
            icon={isDeafened ? HeadphoneOff : Headphones}
            label={isDeafened ? 'Undeafen' : 'Deafen'}
            onClick={toggleDeafen}
            active={isDeafened}
          />

          {/* Video */}
          <ControlButton
            icon={isVideoEnabled ? Video : VideoOff}
            label={isVideoEnabled ? 'Stop Video' : 'Start Video'}
            onClick={toggleVideo}
            active={isVideoEnabled}
            activeColor="bg-indigo-500"
            disabled={isListening}
          />

          {/* Screen Share */}
          <ControlButton
            icon={isScreenSharing ? MonitorOff : Monitor}
            label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            onClick={toggleScreenShare}
            active={isScreenSharing}
            activeColor="bg-purple-500"
            disabled={isListening}
          />

          {/* Settings */}
          <ControlButton
            icon={Settings}
            label="Voice Settings"
            onClick={() => {}}
          />

          {/* Disconnect */}
          <ControlButton
            icon={PhoneOff}
            label="Disconnect"
            onClick={handleLeave}
            danger
          />
        </div>
      </div>
    </div>
  );
}

// Control button component
function ControlButton({ icon: Icon, label, onClick, active, activeColor, disabled, danger }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              disabled && "opacity-50 cursor-not-allowed",
              danger && "bg-red-500 hover:bg-red-600 text-white",
              !danger && active && (activeColor || "bg-red-500/20 text-red-400"),
              !danger && !active && "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Participant tile component
function ParticipantTile({ 
  participant, 
  isSpeaking, 
  isCurrentUser, 
  large, 
  compact,
  onClick,
  onAdjustVolume 
}) {
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(100);

  return (
    <motion.div
      whileHover={{ scale: compact ? 1 : 1.02 }}
      onClick={onClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={cn(
        "relative rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer",
        large ? "aspect-video" : compact ? "aspect-square" : "aspect-video",
        isSpeaking && !participant.is_self_muted && "ring-2 ring-emerald-500",
        participant.is_self_muted && "opacity-60"
      )}
    >
      {/* Video or avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        {participant.is_video ? (
          <video className="w-full h-full object-cover" autoPlay muted={isCurrentUser} />
        ) : (
          <div className={cn(
            "rounded-full overflow-hidden",
            large ? "w-32 h-32" : compact ? "w-12 h-12" : "w-24 h-24",
            isSpeaking && !participant.is_self_muted && "ring-4 ring-emerald-500"
          )}>
            {participant.user_avatar ? (
              <img src={participant.user_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-medium">
                {participant.user_name?.charAt(0)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Screen share indicator */}
      {participant.is_streaming && (
        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
          <div className="px-3 py-1 bg-purple-500 rounded-full text-white text-sm font-medium flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Sharing Screen
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        {participant.is_self_muted && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {participant.is_self_deafened && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <HeadphoneOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Name */}
      {!compact && (
        <div className="absolute bottom-2 right-2">
          <span className={cn(
            "px-2 py-1 rounded-md text-sm font-medium bg-black/50 text-white",
            isSpeaking && !participant.is_self_muted && "bg-emerald-500/80"
          )}>
            {participant.user_name}
          </span>
        </div>
      )}

      {/* Volume control (for non-current users) */}
      {!isCurrentUser && showControls && !compact && (
        <div className="absolute top-2 right-2 p-2 bg-black/70 rounded-lg">
          <div className="flex items-center gap-2">
            <VolumeX className="w-3 h-3 text-zinc-400" />
            <Slider
              value={[volume]}
              onValueChange={([v]) => {
                setVolume(v);
                onAdjustVolume?.(v);
              }}
              max={200}
              className="w-20"
            />
            <span className="text-xs text-zinc-400 w-8">{volume}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}