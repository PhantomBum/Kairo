import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Monitor, MonitorOff,
  Video, VideoOff, PhoneOff, Settings, Users, Volume2, 
  Grid, Maximize2, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from '@/components/ui/slider';

// Configure Agora
AgoraRTC.setLogLevel(3); // Warnings only

export default function AgoraVoiceChat({
  channelId,
  channelName,
  serverName,
  participants = [],
  currentUser,
  onLeave,
  onUpdateVoiceState
}) {
  // Agora client and tracks
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);
  const screenTrackRef = useRef(null);
  
  // State
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('grid');
  const [spotlightUser, setSpotlightUser] = useState(null);
  const [outputVolume, setOutputVolume] = useState(100);

  // Initialize Agora client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    // Event handlers
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'audio') {
        user.audioTrack?.play();
        // Set volume based on deafened state
        if (isDeafened) {
          user.audioTrack?.setVolume(0);
        }
      }
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => {
          const exists = prev.find(u => u.uid === user.uid);
          if (exists) {
            return prev.map(u => u.uid === user.uid ? { ...u, videoTrack: user.videoTrack } : u);
          }
          return [...prev, { uid: user.uid, audioTrack: user.audioTrack, videoTrack: user.videoTrack }];
        });
      }
      
      setRemoteUsers(prev => {
        const exists = prev.find(u => u.uid === user.uid);
        if (exists) return prev;
        return [...prev, { uid: user.uid, audioTrack: user.audioTrack, videoTrack: user.videoTrack }];
      });
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUsers(prev => prev.map(u => 
          u.uid === user.uid ? { ...u, videoTrack: null } : u
        ));
      }
    });

    client.on('user-left', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    // Voice activity detection
    client.enableAudioVolumeIndicator();
    client.on('volume-indicator', (volumes) => {
      const speaking = new Set();
      volumes.forEach(v => {
        if (v.level > 5) {
          speaking.add(v.uid);
        }
      });
      setSpeakingUsers(speaking);
    });

    return () => {
      client.removeAllListeners();
    };
  }, [isDeafened]);

  // Join channel
  useEffect(() => {
    const joinChannel = async () => {
      if (!channelId || !currentUser) return;
      
      setIsJoining(true);
      setError(null);
      
      try {
        // Get token from backend
        const response = await base44.functions.invoke('agoraToken', {
          channelName: channelId,
          uid: 0
        });
        
        const { token, appId, uid } = response.data;
        
        // Join the channel
        await clientRef.current.join(appId, channelId, token, uid);
        
        // Create and publish audio track
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'music_standard',
          AEC: true,
          ANS: true,
          AGC: true
        });
        
        localAudioTrackRef.current = audioTrack;
        await clientRef.current.publish([audioTrack]);
        
        setIsJoined(true);
        setIsJoining(false);
        
        // Update voice state
        onUpdateVoiceState?.({
          is_self_muted: false,
          is_self_deafened: false,
          is_video: false,
          is_streaming: false
        });
        
      } catch (err) {
        console.error('Failed to join Agora channel:', err);
        setError(err.message || 'Failed to join voice channel');
        setIsJoining(false);
      }
    };

    joinChannel();

    return () => {
      leaveChannel();
    };
  }, [channelId, currentUser]);

  // Leave channel
  const leaveChannel = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    screenTrackRef.current?.close();
    
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    
    setIsJoined(false);
    setRemoteUsers([]);
  };

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(isMuted);
      setIsMuted(!isMuted);
      onUpdateVoiceState?.({ is_self_muted: !isMuted });
    }
  }, [isMuted, onUpdateVoiceState]);

  // Toggle deafen
  const toggleDeafen = useCallback(() => {
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);
    
    // Mute/unmute all remote audio
    remoteUsers.forEach(user => {
      user.audioTrack?.setVolume(newDeafened ? 0 : outputVolume);
    });
    
    // Also mute self when deafened
    if (newDeafened && !isMuted) {
      toggleMute();
    }
    
    onUpdateVoiceState?.({ is_self_deafened: newDeafened });
  }, [isDeafened, isMuted, remoteUsers, outputVolume, onUpdateVoiceState, toggleMute]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    try {
      if (isVideoEnabled) {
        localVideoTrackRef.current?.close();
        await clientRef.current.unpublish([localVideoTrackRef.current]);
        localVideoTrackRef.current = null;
        setIsVideoEnabled(false);
      } else {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '720p_2'
        });
        localVideoTrackRef.current = videoTrack;
        await clientRef.current.publish([videoTrack]);
        setIsVideoEnabled(true);
      }
      onUpdateVoiceState?.({ is_video: !isVideoEnabled });
    } catch (err) {
      console.error('Failed to toggle video:', err);
    }
  }, [isVideoEnabled, onUpdateVoiceState]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        screenTrackRef.current?.close();
        await clientRef.current.unpublish([screenTrackRef.current]);
        screenTrackRef.current = null;
        setIsScreenSharing(false);
      } else {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_2'
        }, 'auto');
        
        const tracks = Array.isArray(screenTrack) ? screenTrack : [screenTrack];
        screenTrackRef.current = tracks[0];
        await clientRef.current.publish(tracks);
        
        // Handle screen share stop
        tracks[0].on('track-ended', () => {
          toggleScreenShare();
        });
        
        setIsScreenSharing(true);
      }
      onUpdateVoiceState?.({ is_streaming: !isScreenSharing });
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
    }
  }, [isScreenSharing, onUpdateVoiceState]);

  // Handle leave
  const handleLeave = async () => {
    await leaveChannel();
    onLeave?.();
  };

  // Adjust output volume
  const handleVolumeChange = (value) => {
    setOutputVolume(value[0]);
    remoteUsers.forEach(user => {
      if (!isDeafened) {
        user.audioTrack?.setVolume(value[0]);
      }
    });
  };

  // Get participant info by UID
  const getParticipantInfo = (uid) => {
    const participant = participants.find(p => p.agora_uid === uid || p.user_id === uid.toString());
    return participant || { user_name: `User ${uid}`, user_avatar: null };
  };

  // Grid layout
  const getGridClass = () => {
    const count = remoteUsers.length + 1;
    if (count <= 1) return 'grid-cols-1 max-w-2xl';
    if (count <= 2) return 'grid-cols-2 max-w-3xl';
    if (count <= 4) return 'grid-cols-2 max-w-4xl';
    if (count <= 6) return 'grid-cols-3 max-w-5xl';
    return 'grid-cols-4 max-w-6xl';
  };

  if (isJoining) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f11]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-zinc-400">Joining voice channel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f11]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={handleLeave}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

          {/* Volume control */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <Slider
              value={[outputVolume]}
              onValueChange={handleVolumeChange}
              max={100}
              className="w-20"
            />
          </div>

          {/* Participants count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            {remoteUsers.length + 1}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className={cn("grid gap-4 w-full mx-auto", getGridClass())}>
          {/* Local user */}
          <ParticipantTile
            participant={{
              user_name: currentUser?.display_name || currentUser?.full_name,
              user_avatar: currentUser?.avatar_url
            }}
            isSpeaking={speakingUsers.has(0) || speakingUsers.has('local')}
            isMuted={isMuted}
            isCurrentUser
            videoTrack={localVideoTrackRef.current}
            screenTrack={isScreenSharing ? screenTrackRef.current : null}
          />
          
          {/* Remote users */}
          {remoteUsers.map(user => (
            <ParticipantTile
              key={user.uid}
              participant={getParticipantInfo(user.uid)}
              isSpeaking={speakingUsers.has(user.uid)}
              isMuted={false}
              videoTrack={user.videoTrack}
              onClick={() => {
                setSpotlightUser(user);
                setLayout('spotlight');
              }}
            />
          ))}
        </div>

        {remoteUsers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-zinc-500">
              <Volume2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Waiting for others to join...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center">
        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-900/80 backdrop-blur-sm rounded-2xl">
          <ControlButton
            icon={isMuted ? MicOff : Mic}
            label={isMuted ? 'Unmute' : 'Mute'}
            onClick={toggleMute}
            active={isMuted}
          />

          <ControlButton
            icon={isDeafened ? HeadphoneOff : Headphones}
            label={isDeafened ? 'Undeafen' : 'Deafen'}
            onClick={toggleDeafen}
            active={isDeafened}
          />

          <ControlButton
            icon={isVideoEnabled ? Video : VideoOff}
            label={isVideoEnabled ? 'Stop Video' : 'Start Video'}
            onClick={toggleVideo}
            active={isVideoEnabled}
            activeColor="bg-violet-500"
          />

          <ControlButton
            icon={isScreenSharing ? MonitorOff : Monitor}
            label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            onClick={toggleScreenShare}
            active={isScreenSharing}
            activeColor="bg-purple-500"
          />

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

// Control button
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

// Participant tile
function ParticipantTile({ participant, isSpeaking, isMuted, isCurrentUser, videoTrack, screenTrack, onClick }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      videoTrack.play(videoRef.current);
    }
    return () => {
      videoTrack?.stop();
    };
  }, [videoTrack]);

  useEffect(() => {
    if (screenTrack && videoRef.current) {
      screenTrack.play(videoRef.current);
    }
    return () => {
      screenTrack?.stop();
    };
  }, [screenTrack]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "relative aspect-video rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer",
        isSpeaking && !isMuted && "ring-2 ring-emerald-500",
        isMuted && "opacity-60"
      )}
    >
      {/* Video or avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        {videoTrack || screenTrack ? (
          <div ref={videoRef} className="w-full h-full" />
        ) : (
          <div className={cn(
            "w-24 h-24 rounded-full overflow-hidden",
            isSpeaking && !isMuted && "ring-4 ring-emerald-500"
          )}>
            {participant.user_avatar ? (
              <img src={participant.user_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-medium">
                {participant.user_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        {isMuted && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        {isCurrentUser && (
          <span className="px-2 py-0.5 bg-violet-500/80 rounded text-xs text-white">You</span>
        )}
      </div>

      {/* Name */}
      <div className="absolute bottom-2 right-2">
        <span className={cn(
          "px-2 py-1 rounded-md text-sm font-medium bg-black/50 text-white",
          isSpeaking && !isMuted && "bg-emerald-500/80"
        )}>
          {participant.user_name}
        </span>
      </div>
    </motion.div>
  );
}