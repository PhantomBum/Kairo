import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, Music, Video, Radio, Trophy, Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const activityIcons = {
  playing: Gamepad2,
  listening: Music,
  watching: Video,
  streaming: Radio,
  competing: Trophy
};

const activityLabels = {
  playing: 'Playing',
  listening: 'Listening to',
  watching: 'Watching',
  streaming: 'Streaming',
  competing: 'Competing in'
};

const activityColors = {
  playing: 'indigo',
  listening: 'emerald',
  watching: 'purple',
  streaming: 'red',
  competing: 'amber'
};

export default function RichPresenceCard({ presence, size = 'default' }) {
  if (!presence || !presence.name) return null;

  const Icon = activityIcons[presence.type] || Gamepad2;
  const label = activityLabels[presence.type] || 'Playing';
  const color = activityColors[presence.type] || 'indigo';

  // Calculate elapsed time
  const elapsedTime = presence.start_timestamp 
    ? formatElapsedTime(Date.now() - presence.start_timestamp)
    : null;

  if (size === 'mini') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className={cn("w-4 h-4", `text-${color}-400`)} />
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-medium">{presence.name}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", `text-${color}-400`)} />
        <span className="text-xs text-zinc-400 uppercase font-semibold">{label}</span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        {/* Large Image */}
        {presence.large_image && (
          <div className="relative flex-shrink-0">
            <img 
              src={presence.large_image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
            {/* Small Image (overlay) */}
            {presence.small_image && (
              <img 
                src={presence.small_image}
                alt=""
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-zinc-800"
              />
            )}
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold truncate">{presence.name}</h4>
          {presence.details && (
            <p className="text-sm text-zinc-400 truncate">{presence.details}</p>
          )}
          {presence.state && (
            <p className="text-sm text-zinc-500 truncate">{presence.state}</p>
          )}
          {elapsedTime && (
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {elapsedTime} elapsed
            </p>
          )}
        </div>
      </div>

      {/* Buttons (if streaming) */}
      {presence.type === 'streaming' && presence.url && (
        <a
          href={presence.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            "bg-purple-500 hover:bg-purple-600 text-white"
          )}
        >
          <Radio className="w-4 h-4" />
          Watch Stream
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </motion.div>
  );
}

function formatElapsedTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

// Compact version for member list
export function RichPresenceMini({ presence }) {
  if (!presence || !presence.name) return null;

  const Icon = activityIcons[presence.type] || Gamepad2;
  const label = activityLabels[presence.type] || 'Playing';

  return (
    <p className="text-xs text-zinc-500 flex items-center gap-1 truncate">
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{label}</span>
      <span className="font-medium text-zinc-400 truncate">{presence.name}</span>
    </p>
  );
}