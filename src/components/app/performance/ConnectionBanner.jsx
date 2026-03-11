import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';

export default function ConnectionBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
      setWasOffline(false);
    };
    const onOffline = () => { setOnline(false); setWasOffline(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, [wasOffline]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 py-2.5 px-4"
          style={{ background: colors.danger }}
          role="alert" aria-live="assertive">
          <WifiOff className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-[13px] font-medium text-white">No connection — your messages will be sent when you're back online</span>
          <button onClick={() => window.location.reload()}
            className="ml-2 px-3 py-1 rounded-md text-[12px] font-semibold text-white hover:bg-[rgba(255,255,255,0.25)]"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            Retry
          </button>
        </motion.div>
      )}
      {showReconnected && online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 py-2.5 px-4"
          style={{ background: colors.success }}
          role="status">
          <Wifi className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-[13px] font-medium text-white">You're back online</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}