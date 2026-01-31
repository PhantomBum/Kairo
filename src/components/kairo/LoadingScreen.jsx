import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    // Ultra fast loading - 1.2 seconds total
    const steps = [
      { progress: 40, status: 'Establishing connection...', delay: 200 },
      { progress: 70, status: 'Loading data...', delay: 400 },
      { progress: 90, status: 'Syncing...', delay: 600 },
      { progress: 100, status: 'Ready', delay: 800 }
    ];

    steps.forEach(({ progress, status, delay }) => {
      setTimeout(() => {
        setProgress(progress);
        setStatus(status);
      }, delay);
    });

    // Complete after 1.2s
    const timer = setTimeout(() => onComplete?.(), 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]"
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-3xl font-bold text-white">K</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-semibold text-white mb-1 tracking-tight"
        >
          Kairo
        </motion.h1>

        <motion.p
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-500 text-sm mb-6"
        >
          {status}
        </motion.p>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
        </div>

        {/* Latency indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center gap-2 text-xs text-zinc-600"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>1ms</span>
        </motion.div>
      </div>
    </motion.div>
  );
}