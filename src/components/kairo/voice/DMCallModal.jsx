import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, 
  Headphones, HeadphoneOff, Monitor, X, Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Incoming Call Modal
export function IncomingCallModal({ 
  call, 
  caller, 
  onAccept, 
  onDecline 
}) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Auto decline after 30 seconds
    const timeout = setTimeout(() => {
      onDecline?.();
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDecline]);

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm mx-4 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full border-2 border-emerald-500/30"
              animate={{
                scale: [1, 2, 2],
                opacity: [0.5, 0.2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative p-8 flex flex-col items-center">
          {/* Caller avatar */}
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-zinc-700 shadow-lg">
              {caller?.avatar ? (
                <img src={caller.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                  {caller?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Caller info */}
          <h2 className="text-xl font-semibold text-white mb-1">{caller?.name || 'Unknown'}</h2>
          <p className="text-zinc-400 mb-2">
            {call.is_video_call ? 'Video Call' : 'Voice Call'}
          </p>
          <p className="text-zinc-500 text-sm">Incoming call...</p>

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              {call.is_video_call ? (
                <Video className="w-7 h-7 text-white" />
              ) : (
                <Phone className="w-7 h-7 text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Active Call Modal
export function ActiveCallModal({
  call,
  participants = [],
  currentUserId,
  onEndCall,
  onToggleMute,
  onToggleDeafen,
  onToggleVideo,
  onToggleScreenShare,
  isMuted,
  isDeafened,
  isVideo,
  isScreenSharing
}) {
  const [callDuration, setCallDuration] = useState(0);
  const [isPipMode, setIsPipMode] = useState(false);

  useEffect(() => {
    const startTime = call?.started_at ? new Date(call.started_at) : new Date();
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000);
      setCallDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [call?.started_at]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const otherParticipants = participants.filter(p => p.user_id !== currentUserId);
  const currentParticipant = participants.find(p => p.user_id === currentUserId);

  if (!call) return null;

  // Mini PiP mode
  if (isPipMode) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-6 z-50 w-64 bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-800"
      >
        <div className="aspect-video bg-zinc-800 relative">
          {otherParticipants[0]?.is_video ? (
            <video className="w-full h-full object-cover" autoPlay />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                {otherParticipants[0]?.avatar ? (
                  <img src={otherParticipants[0].avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                    {otherParticipants[0]?.user_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => setIsPipMode(false)}
              className="w-6 h-6 bg-black/50 rounded flex items-center justify-center hover:bg-black/70"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
          </div>

          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
            {formatDuration(callDuration)}
          </div>
        </div>

        <div className="flex justify-center gap-2 p-2">
          <button
            onClick={onToggleMute}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isMuted ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400"
            )}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={onEndCall}
            className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
          >
            <PhoneOff className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-medium">{formatDuration(callDuration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPipMode(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative p-4">
        {/* Other participants */}
        <div className="w-full h-full flex items-center justify-center">
          {otherParticipants.length > 0 ? (
            <div className={cn(
              "grid gap-4 w-full max-w-4xl",
              otherParticipants.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {otherParticipants.map((participant) => (
                <div
                  key={participant.user_id}
                  className="aspect-video bg-zinc-800 rounded-xl overflow-hidden relative"
                >
                  {participant.is_video ? (
                    <video className="w-full h-full object-cover" autoPlay />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                            {participant.user_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-black/50 rounded text-sm text-white">
                      {participant.user_name}
                    </span>
                    {participant.is_muted && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-zinc-500">
              <p className="text-lg">Waiting for others to join...</p>
            </div>
          )}
        </div>

        {/* Self view */}
        {isVideo && (
          <div className="absolute bottom-4 right-4 w-48 aspect-video bg-zinc-800 rounded-xl overflow-hidden border-2 border-zinc-700">
            <video className="w-full h-full object-cover" autoPlay muted />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center">
        <div className="flex items-center gap-4 px-6 py-4 bg-zinc-800/80 backdrop-blur-sm rounded-2xl">
          <button
            onClick={onToggleMute}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isMuted 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={onToggleDeafen}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isDeafened 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
          >
            {isDeafened ? <HeadphoneOff className="w-6 h-6" /> : <Headphones className="w-6 h-6" />}
          </button>

          <button
            onClick={onToggleVideo}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isVideo 
                ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30" 
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
          >
            {isVideo ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={onToggleScreenShare}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isScreenSharing 
                ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" 
                : "bg-zinc-700 text-white hover:bg-zinc-600"
            )}
          >
            <Monitor className="w-6 h-6" />
          </button>

          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Outgoing Call Modal
export function OutgoingCallModal({ 
  recipient, 
  isVideoCall,
  onCancel 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm mx-4 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="relative p-8 flex flex-col items-center">
          {/* Recipient avatar */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative mb-6"
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-zinc-700 shadow-lg">
              {recipient?.avatar ? (
                <img src={recipient.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-4xl font-bold">
                  {recipient?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </motion.div>

          <h2 className="text-xl font-semibold text-white mb-1">{recipient?.name || 'Unknown'}</h2>
          <p className="text-zinc-400 mb-2">
            {isVideoCall ? 'Video Call' : 'Voice Call'}
          </p>
          
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-zinc-500 text-sm"
          >
            Calling...
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="mt-8 w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}