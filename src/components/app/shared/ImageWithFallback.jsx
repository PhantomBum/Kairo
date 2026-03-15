import React, { useState, useEffect, useRef, memo } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const ImageWithFallback = memo(function ImageWithFallback({
  src, alt, className, style, onClick, maxRetries = 2,
  width, height,
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [retries, setRetries] = useState(0);
  const timeoutRef = useRef(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = imgRef.current?.parentElement;
    if (!el) { setInView(true); return; }
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observerRef.current?.disconnect(); } },
      { rootMargin: '200px' }
    );
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (loaded || error || !inView) return;
    timeoutRef.current = setTimeout(() => { if (!loaded) setError(true); }, 15000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [src, loaded, error, retries, inView]);

  useEffect(() => { setError(false); setLoaded(false); }, [src]);

  const placeholderStyle = {
    ...style,
    width: width || style?.width,
    height: height || style?.height || (width ? undefined : undefined),
    minHeight: height || style?.minHeight || 80,
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}
        style={{ ...placeholderStyle, background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <ImageOff className="w-6 h-6" style={{ color: colors.text.disabled }} />
        <span className="text-[11px]" style={{ color: colors.text.muted }}>Failed to load</span>
        {retries < maxRetries && (
          <button onClick={() => { setError(false); setLoaded(false); setRetries(r => r + 1); }}
            className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: colors.text.link }}>
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: width || 'auto', height: !loaded ? (height || 80) : 'auto' }}>
      {!loaded && (
        <div className={`absolute inset-0 k-shimmer rounded-xl ${className || ''}`}
          style={placeholderStyle} />
      )}
      {inView && (
        <img ref={imgRef} src={src} alt={alt || 'Image'} className={className}
          width={width} height={height}
          style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.2s ease-in' }}
          onClick={onClick}
          onLoad={() => { setLoaded(true); if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
          onError={() => setError(true)}
          loading="lazy"
          decoding="async" />
      )}
    </div>
  );
});

export default ImageWithFallback;
