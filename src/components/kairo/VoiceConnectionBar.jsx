import React from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Signal, Volume2, Video, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function VoiceConnectionBar({ 
  channel, 
  server,
  connectionQuality = 'good', // 'poor' | 'fair' | 'good' | 'excellent'
  onDisconnect,
  onOpenVoicePanel
}) {
  if (!channel) return null;

  const qualityColors = {
    poor: 'text-red-500',
    fair: 'text-amber-500',
    good: 'text-emerald-500',
    excellent: 'text-emerald-400'
  };

  const qualityBars = {
    poor: 1,
    fair: 2,
    good: 3,
    excellent: 4
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-[#0f0f11] border-b border-zinc-800/50"
    >
      <div className="px-3 py-2">
        {/* Connection status */}
        <div 
          onClick={onOpenVoicePanel}
          className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800/30 -mx-2 px-2 py-1 rounded transition-colors"
        >
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Voice Connected</span>
          </div>

          {/* Connection quality indicator */}
          <div className="flex items-center gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 rounded-full transition-all",
                  i < qualityBars[connectionQuality] 
                    ? qualityColors[connectionQuality]
                    : "bg-zinc-700",
                  i === 0 && "h-1.5",
                  i === 1 && "h-2",
                  i === 2 && "h-2.5",
                  i === 3 && "h-3"
                )}
                style={{
                  backgroundColor: i < qualityBars[connectionQuality] ? undefined : undefined
                }}
              />
            ))}
          </div>
        </div>

        {/* Channel info */}
        <button
          onClick={onOpenVoicePanel}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors -mx-2 px-2 py-1 rounded hover:bg-zinc-800/30 w-full text-left"
        >
          <span className="truncate">{channel.name} / {server?.name}</span>
        </button>
      </div>

      {/* Disconnect button */}
      <div className="px-3 pb-2 flex gap-2">
        <Button
          onClick={onDisconnect}
          size="sm"
          variant="ghost"
          className="flex-1 h-7 bg-zinc-800/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
        >
          <PhoneOff className="w-4 h-4 mr-1" />
          Disconnect
        </Button>
      </div>
    </motion.div>
  );
}