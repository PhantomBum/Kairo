import React, { useState, useRef, useEffect } from 'react';

export default function ProgressiveImage({ src, alt, className, style, onClick }) {
  const [loaded, setLoaded] = useState(false);
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
          alt={alt || ''}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}