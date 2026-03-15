import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Download } from 'lucide-react';
import { colors, radius, shadows } from '@/components/app/design/tokens';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ src, filename, poster, maxWidth = 400, maxHeight = 280 }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [hoveringProgress, setHoveringProgress] = useState(false);
  const hideTimer = useRef(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (document.fullscreenElement) { document.exitFullscreen(); setFullscreen(false); }
    else { c.requestFullscreen?.(); setFullscreen(true); }
  }, []);

  const seek = useCallback((e) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }, []);

  const skip = useCallback((delta) => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setMuted(true); }
    else { v.muted = false; setMuted(false); }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onEnded = () => setPlaying(false);
    const onProgress = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnded);
    v.addEventListener('progress', onProgress);
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('loadedmetadata', onMeta); v.removeEventListener('ended', onEnded); v.removeEventListener('progress', onProgress); };
  }, []);

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="relative group inline-block overflow-hidden"
      style={{ maxWidth: fullscreen ? '100%' : maxWidth, borderRadius: fullscreen ? 0 : radius.md, background: '#000', border: fullscreen ? 'none' : `1px solid ${colors.border.default}` }}
      onMouseMove={handleMouseMove} onMouseLeave={() => { if (playing) setShowControls(false); }}>

      <video ref={videoRef} src={src} poster={poster} preload="metadata"
        className="w-full cursor-pointer" style={{ maxHeight: fullscreen ? '100vh' : maxHeight, display: 'block' }}
        onClick={togglePlay} playsInline />

      {/* Big play button overlay when paused */}
      {!playing && (
        <button onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 transition-opacity duration-200"
        style={{ opacity: showControls || !playing ? 1 : 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>

        {/* Progress bar */}
        <div ref={progressRef} className="relative h-5 px-3 flex items-end cursor-pointer"
          onClick={seek} onMouseEnter={() => setHoveringProgress(true)} onMouseLeave={() => setHoveringProgress(false)}>
          <div className="w-full rounded-full overflow-hidden" style={{ height: hoveringProgress ? 6 : 3, transition: 'height 0.15s', background: 'rgba(255,255,255,0.2)' }}>
            <div className="h-full rounded-full" style={{ width: `${bufferProgress}%`, background: 'rgba(255,255,255,0.25)' }} />
            <div className="h-full rounded-full -mt-full relative" style={{ width: `${progress}%`, background: colors.accent.primary, marginTop: hoveringProgress ? -6 : -3 }} />
          </div>
          {hoveringProgress && (
            <div className="absolute rounded-full" style={{
              width: 12, height: 12, background: colors.accent.primary, top: '50%', marginTop: 2,
              left: `calc(${progress}% - 6px + 12px)`, transform: 'translateY(-50%)',
              boxShadow: '0 0 4px rgba(0,0,0,0.4)',
            }} />
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-1 px-2 pb-2 pt-0.5">
          <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10">
            {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
          </button>
          <button onClick={() => skip(-10)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10" title="Back 10s">
            <SkipBack className="w-3.5 h-3.5 text-white/70" />
          </button>
          <button onClick={() => skip(10)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10" title="Forward 10s">
            <SkipForward className="w-3.5 h-3.5 text-white/70" />
          </button>

          <span className="text-[11px] text-white/80 tabular-nums ml-1 select-none">{formatTime(currentTime)} / {formatTime(duration)}</span>

          <div className="flex-1" />

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button onClick={toggleMute} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10">
              {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-white/70" />}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={handleVolumeChange}
              className="w-0 group-hover/vol:w-16 transition-all duration-200 opacity-0 group-hover/vol:opacity-100 accent-purple-500 h-1 cursor-pointer" />
          </div>

          <a href={src} download={filename || 'video'} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10" title="Download">
            <Download className="w-3.5 h-3.5 text-white/70" />
          </a>

          <button onClick={toggleFullscreen} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10" title="Fullscreen">
            {fullscreen ? <Minimize className="w-3.5 h-3.5 text-white/70" /> : <Maximize className="w-3.5 h-3.5 text-white/70" />}
          </button>
        </div>
      </div>

      {/* Filename */}
      {filename && !fullscreen && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-[11px] font-medium text-white/70 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[70%]"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          {filename}
        </div>
      )}
    </div>
  );
}