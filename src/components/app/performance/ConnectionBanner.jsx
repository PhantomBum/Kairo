import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function ConnectionBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const onOnline = () => { setOnline(true); setReconnecting(false); };
    const onOffline = () => { setOnline(false); setReconnecting(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  if (online && !reconnecting) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4"
      style={{ background: colors.danger, color: '#fff' }} role="alert" aria-live="assertive">
      {reconnecting ? (
        <><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-[13px] font-medium">Reconnecting...</span></>
      ) : (
        <><WifiOff className="w-4 h-4" /><span className="text-[13px] font-medium">No connection — messages will be sent when you're back online</span>
          <button onClick={() => window.location.reload()} className="ml-2 px-3 py-1 rounded-md text-[12px] font-semibold" style={{ background: 'rgba(255,255,255,0.2)' }}>Retry</button>
        </>
      )}
    </div>
  );
}