import React, { useState, useRef, useEffect } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';

export default function ProgressiveImage({ src, alt, className, style, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (error) {
    return (
      <div ref={ref} className={`relative overflow-hidden flex flex-col items-center justify-center gap-1 ${className || ''}`} style={{ ...style, background: 'var(--bg-glass-strong)', minHeight: 80 }}>
        <ImageOff className="w-5 h-5 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Failed to load</span>
        <button onClick={(e) => { e.stopPropagation(); setError(false); setLoaded(false); }}
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-[rgba(255,255,255,0.06)]" style={{ color: 'var(--text-muted)' }}>
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className || ''}`} style={style} onClick={onClick}>
      {/* Blurred placeholder */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'var(--bg-glass-strong)',
          opacity: loaded ? 0 : 1,
          filter: 'blur(8px)',
        }}
      />
      {inView && (
        <img
          src={src}
          alt={alt || 'Image'}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}