import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';

export default function ConnectionBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const retryCount = useRef(0);
  const retryTimer = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      retryCount.current = 0;
      if (wasOffline) {
        setShowReconnected(true);
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => setShowReconnected(false), 3000);
      }
      setWasOffline(false);
      setRetrying(false);
    };
    const onOffline = () => { setOnline(false); setWasOffline(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearTimeout(retryTimer.current);
      clearTimeout(reconnectTimer.current);
    };
  }, [wasOffline]);

  const handleRetry = () => {
    if (retrying) return;
    setRetrying(true);
    retryCount.current++;
    const delay = Math.min(1000 * Math.pow(2, retryCount.current - 1), 8000);
    retryTimer.current = setTimeout(() => {
      if (navigator.onLine) {
        setOnline(true);
        setWasOffline(false);
        setShowReconnected(true);
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => setShowReconnected(false), 3000);
      }
      setRetrying(false);
    }, delay);
  };

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 py-2 px-4"
          style={{ background: colors.danger }}
          role="alert" aria-live="assertive">
          <WifiOff className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-[13px] font-medium text-white">You're offline. Messages will send when you reconnect.</span>
          <button onClick={handleRetry} disabled={retrying}
            className="ml-2 px-3 py-1 rounded-md text-[12px] font-semibold text-white hover:bg-[rgba(255,255,255,0.25)] disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            {retrying ? `Retrying${retryCount.current > 1 ? ` (${retryCount.current})` : ''}...` : 'Retry'}
          </button>
        </motion.div>
      )}
      {showReconnected && online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 py-2 px-4"
          style={{ background: colors.success }}
          role="status">
          <Wifi className="w-4 h-4 text-white flex-shrink-0" />
          <span className="text-[13px] font-medium text-white">You're back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
