import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Volume2 } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function MicTestPanel({ onClose, wasDeafened, onRestoreDeafen }) {
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      src.connect(analyser);
      analyserRef.current = analyser;
      setActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(avg / 80, 1));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setError("Couldn't access microphone. Check browser permissions.");
    }
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setActive(false);
    setLevel(0);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleClose = () => {
    stop();
    if (wasDeafened) onRestoreDeafen?.();
    onClose();
  };

  // Volume bar count
  const bars = 20;
  const filledBars = Math.round(level * bars);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 rounded-xl z-10 overflow-hidden"
      style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4" style={{ color: colors.accent.primary }} />
          <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>Mic Test</span>
        </div>
        <button onClick={handleClose} className="p-1 rounded hover:bg-[rgba(255,255,255,0.06)]">
          <X className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />
        </button>
      </div>

      <div className="px-4 pb-4">
        {error ? (
          <p className="text-[12px] py-2" style={{ color: colors.danger }}>{error}</p>
        ) : !active ? (
          <>
            <p className="text-[11px] mb-3 leading-relaxed" style={{ color: colors.text.muted }}>
              Test your mic privately. You'll be auto-deafened so nobody else hears you.
            </p>
            <button onClick={start}
              className="w-full py-2 rounded-lg text-[13px] font-medium text-white flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{ background: colors.accent.primary }}>
              <Mic className="w-3.5 h-3.5" />
              Start Test
            </button>
          </>
        ) : (
          <>
            {/* Live meter */}
            <div className="flex items-center gap-1 h-8 mb-3">
              {Array.from({ length: bars }).map((_, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all duration-75"
                  style={{
                    height: `${40 + (i / bars) * 60}%`,
                    background: i < filledBars
                      ? (i / bars > 0.8 ? colors.danger : i / bars > 0.5 ? colors.warning : colors.status.online)
                      : 'rgba(255,255,255,0.06)',
                  }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-3.5 h-3.5" style={{ color: level > 0.05 ? colors.status.online : colors.text.disabled }} />
              <span className="text-[11px]" style={{ color: level > 0.05 ? colors.status.online : colors.text.disabled }}>
                {level > 0.05 ? 'Mic is working!' : 'Speak into your mic...'}
              </span>
            </div>
            <button onClick={stop}
              className="w-full py-2 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              Stop Test
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}