import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Slow mode hook
export function useSlowMode(channelId, slowModeSeconds, userId) {
  const [canSend, setCanSend] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  // Get last message time from localStorage
  const getLastMessageTime = () => {
    const key = `slowmode_${channelId}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  };

  // Set last message time
  const setLastMessageTime = () => {
    const key = `slowmode_${channelId}_${userId}`;
    localStorage.setItem(key, Date.now().toString());
    setCanSend(false);
    setRemainingTime(slowModeSeconds);
  };

  // Check if can send
  useEffect(() => {
    if (!slowModeSeconds || slowModeSeconds === 0) {
      setCanSend(true);
      return;
    }

    const checkCanSend = () => {
      const lastTime = getLastMessageTime();
      const elapsed = (Date.now() - lastTime) / 1000;
      const remaining = Math.max(0, slowModeSeconds - elapsed);
      
      setRemainingTime(Math.ceil(remaining));
      setCanSend(remaining <= 0);
    };

    checkCanSend();
    const interval = setInterval(checkCanSend, 1000);
    
    return () => clearInterval(interval);
  }, [channelId, slowModeSeconds, userId]);

  return {
    canSend,
    remainingTime,
    recordMessage: setLastMessageTime,
  };
}

// Slow mode indicator component
export function SlowModeIndicator({ seconds, remainingTime, className }) {
  if (!seconds || seconds === 0) return null;

  const formatTime = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h`;
  };

  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs',
      remainingTime > 0 ? 'text-amber-400' : 'text-zinc-500',
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      {remainingTime > 0 ? (
        <span>Wait {formatTime(remainingTime)}</span>
      ) : (
        <span>Slow mode: {formatTime(seconds)}</span>
      )}
    </div>
  );
}

// Slow mode settings in channel
export const SLOW_MODE_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' },
  { value: 15, label: '15 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 120, label: '2 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 7200, label: '2 hours' },
  { value: 21600, label: '6 hours' },
];