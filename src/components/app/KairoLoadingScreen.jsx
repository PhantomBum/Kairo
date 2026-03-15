import React, { useState, useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';

const STAGES = [
  'Connecting...',
  'Getting your servers...',
  'Almost there...',
];

export default function KairoLoadingScreen({ onReady, username, isLoading }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [tagline, setTagline] = useState(STAGES[0]);
  const [showContent, setShowContent] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const reducedMotion = useRef(false);
  const simRef = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Simulated progress 0–70% over 800ms
  useEffect(() => {
    if (reducedMotion.current) {
      setShowContent(true);
      setShowText(true);
      setShowTagline(true);
      setProgress(70);
      return;
    }
    setShowContent(true);
    const t1 = setTimeout(() => setShowText(true), 150);
    const t2 = setTimeout(() => setShowTagline(true), 300);
    let start = 0;
    const duration = 800;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const p = Math.min(70, (elapsed / duration) * 70);
      setProgress(p);
      if (p < 70) simRef.current = requestAnimationFrame(animate);
    };
    simRef.current = requestAnimationFrame(animate);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (simRef.current) cancelAnimationFrame(simRef.current);
    };
  }, []);

  // Stage updates based on loading
  useEffect(() => {
    if (isLoading === false) {
      setTagline(username ? `Welcome back, ${username} 👋` : STAGES[2]);
      setStage(3);
    }
  }, [isLoading, username]);

  // When ready: fill to 100%, then fade out. Do NOT clear the timeout on effect re-run
  // or the transition would never complete (parent re-renders change deps, cleanup cancels timeout).
  useEffect(() => {
    if (!onReady || readyRef.current) return;
    if (!isLoading) {
      readyRef.current = true;
      setProgress(100);
      const delay = reducedMotion.current ? 100 : 300;
      setTimeout(() => {
        setShowContent(false);
        onReady();
      }, delay);
    }
  }, [onReady, isLoading]);

  if (!showContent) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
      style={{
        background: 'var(--bg-void)',
        transition: reducedMotion.current ? 'none' : 'opacity 0.3s ease',
      }}
    >
      <div
        className="flex flex-col items-center gap-4"
        style={{
          opacity: showContent ? 1 : 0,
          transform: reducedMotion.current ? 'none' : `scale(${showContent ? 1 : 0.8})`,
          transition: reducedMotion.current ? 'none' : 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            opacity: showContent ? 1 : 0,
            transform: reducedMotion.current ? 'none' : `scale(${showContent ? 1 : 0.8})`,
            transition: reducedMotion.current ? 'none' : 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0ms',
          }}
        >
          <div className="animate-pulse" style={{ animationDuration: '2s' }}>
            <Crown className="w-16 h-16" style={{ color: 'var(--accent-primary)' }} />
          </div>
        </div>
        <h1
          className="text-[28px] font-semibold"
          style={{
            color: 'var(--text-primary)',
            opacity: showText ? 1 : 0,
            transition: reducedMotion.current ? 'none' : 'opacity 0.15s ease',
          }}
        >
          Kairo
        </h1>
        <p
          className="text-[13px]"
          style={{
            color: 'var(--text-muted)',
            opacity: showTagline ? 1 : 0,
            transition: reducedMotion.current ? 'none' : 'opacity 0.15s ease',
          }}
        >
          {tagline}
        </p>
      </div>

      {/* Progress bar — 2px at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'var(--bg-raised)' }}
      >
        <div
          className="h-full rounded-r-full"
          style={{
            width: `${progress}%`,
            background: 'var(--accent-primary)',
            transition: reducedMotion.current ? 'none' : 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  );
}
