import React, { useState } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function ImageWithFallback({ src, alt, className, style, onClick, maxRetries = 2 }) {
  const [error, setError] = useState(false);
  const [retries, setRetries] = useState(0);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}
        style={{ ...style, background: colors.bg.elevated, border: `1px solid ${colors.border.default}`, minHeight: 80 }}>
        <ImageOff className="w-6 h-6" style={{ color: colors.text.disabled }} />
        <span className="text-[11px]" style={{ color: colors.text.muted }}>Failed to load</span>
        {retries < maxRetries && (
          <button onClick={() => { setError(false); setRetries(r => r + 1); }}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: colors.text.link }}>
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <img src={src} alt={alt || 'Image'} className={className} style={style} onClick={onClick}
      onError={() => setError(true)} loading="lazy" />
  );
}