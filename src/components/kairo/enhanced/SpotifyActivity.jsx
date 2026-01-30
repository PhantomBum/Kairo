import React from 'react';
import { motion } from 'framer-motion';
import { Music, ExternalLink, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SpotifyActivity({ activity, compact = false }) {
  if (!activity) return null;

  const { 
    track_name, 
    artist_name, 
    album_name, 
    album_art_url, 
    track_url,
    progress_ms,
    duration_ms,
    is_playing
  } = activity;

  const progress = duration_ms ? (progress_ms / duration_ms) * 100 : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Music className="w-4 h-4 text-[#1DB954]" />
        <span className="text-zinc-400">Listening to</span>
        <span className="text-white font-medium truncate">{track_name}</span>
        <span className="text-zinc-500">by {artist_name}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
    >
      <div className="flex items-center gap-2 mb-3">
        <Music className="w-4 h-4 text-[#1DB954]" />
        <span className="text-xs text-zinc-400 uppercase font-semibold">Listening to Spotify</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-700 flex-shrink-0">
          {album_art_url ? (
            <img 
              src={album_art_url} 
              alt={album_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-8 h-8 text-zinc-500" />
            </div>
          )}
          {/* Playing indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
            {is_playing ? (
              <div className="flex items-center gap-0.5">
                <motion.div
                  animate={{ height: [4, 10, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-0.5 bg-white rounded-full"
                />
                <motion.div
                  animate={{ height: [8, 4, 8] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  className="w-0.5 bg-white rounded-full"
                />
                <motion.div
                  animate={{ height: [4, 10, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  className="w-0.5 bg-white rounded-full"
                />
              </div>
            ) : (
              <Pause className="w-3 h-3 text-white" />
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <a 
            href={track_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-semibold hover:underline truncate block"
          >
            {track_name}
          </a>
          <p className="text-sm text-zinc-400 truncate">by {artist_name}</p>
          <p className="text-xs text-zinc-500 truncate">on {album_name}</p>
        </div>

        {/* External Link */}
        {track_url && (
          <a
            href={track_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Progress Bar */}
      {duration_ms > 0 && (
        <div className="mt-3">
          <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-[#1DB954] rounded-full"
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
            <span>{formatTime(progress_ms)}</span>
            <span>{formatTime(duration_ms)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function formatTime(ms) {
  if (!ms) return '0:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Mini version for status bar
export function SpotifyMini({ activity }) {
  if (!activity) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-[#1DB954]/10 rounded-full">
      <Music className="w-3 h-3 text-[#1DB954]" />
      <span className="text-xs text-zinc-300 truncate max-w-[150px]">
        {activity.track_name}
      </span>
    </div>
  );
}