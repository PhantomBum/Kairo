import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionMonitor() {
  const [status, setStatus] = useState('connected');
  const [showBanner, setShowBanner] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setStatus('connected');
      setShowBanner(false);
      setReconnecting(false);
    };

    const handleOffline = () => {
      setStatus('disconnected');
      setShowBanner(true);
    };

    // Connection quality check
    const checkConnection = async () => {
      if (!navigator.onLine) {
        setStatus('disconnected');
        setShowBanner(true);
        return;
      }

      try {
        const start = Date.now();
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
        const latency = Date.now() - start;

        if (latency > 1000) {
          setStatus('slow');
          setShowBanner(true);
        } else if (status !== 'connected') {
          setStatus('connected');
          setShowBanner(false);
        }
      } catch {
        setStatus('disconnected');
        setShowBanner(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkConnection, 10000);
    checkConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [status]);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
      setStatus('connected');
      setShowBanner(false);
    } catch {
      // Connection still failed
    } finally {
      setTimeout(() => setReconnecting(false), 1000);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium",
            status === 'disconnected' && "bg-red-500/90 text-white",
            status === 'slow' && "bg-amber-500/90 text-white"
          )}
        >
          {status === 'disconnected' ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>No internet connection</span>
              <button
                onClick={handleReconnect}
                disabled={reconnecting}
                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", reconnecting && "animate-spin")} />
                Retry
              </button>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Slow connection detected</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}