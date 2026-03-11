import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function ConnectionBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const onOnline = () => { setOnline(true); setReconnecting(false); };
    const onOffline = () => { setOnline(false); setReconnecting(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (online && !reconnecting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4"
      style={{ background: 'var(--accent-red)', color: '#fff' }}
      role="alert" aria-live="assertive">
      {reconnecting ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span className="text-[12px] font-medium">Reconnecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span className="text-[12px] font-medium">No connection — messages will be sent when you're back online</span>
        </>
      )}
    </div>
  );
}