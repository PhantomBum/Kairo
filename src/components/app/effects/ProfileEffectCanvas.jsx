import React, { useRef, useEffect, useCallback } from 'react';

// Each effect is a self-contained render function using Canvas 2D
const renderers = {
  crimson_flames: (ctx, w, h, t) => {
    for (let i = 0; i < 18; i++) {
      const x = (i / 18) * w + Math.sin(t * 0.002 + i * 0.7) * 15;
      const y = h - Math.sin(t * 0.003 + i) * 30 - i * 2;
      const r = 12 + Math.sin(t * 0.004 + i * 1.3) * 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,${60 + i * 5},0,${0.3 - i * 0.012})`);
      g.addColorStop(0.5, `rgba(200,${30 + i * 3},0,${0.15 - i * 0.006})`);
      g.addColorStop(1, 'rgba(100,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y - Math.sin(t * 0.005 + i) * 20, r, 0, Math.PI * 2); ctx.fill();
    }
  },

  cherry_blossoms: (ctx, w, h, t) => {
    for (let i = 0; i < 12; i++) {
      const seed = i * 137.5;
      const x = ((seed + t * 0.02 * (0.5 + (i % 3) * 0.3)) % (w + 20)) - 10;
      const y = ((seed * 2.3 + t * 0.015 * (0.8 + (i % 2) * 0.4)) % (h + 20)) - 10;
      const rot = t * 0.001 * (i % 2 === 0 ? 1 : -1) + seed;
      const sz = 3 + (i % 4) * 1.5;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,220,230,0.5)' : 'rgba(255,182,193,0.4)';
      for (let p = 0; p < 5; p++) {
        ctx.beginPath();
        ctx.ellipse(0, -sz, sz * 0.4, sz, (p * Math.PI * 2) / 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  golden_stars: (ctx, w, h, t) => {
    for (let i = 0; i < 10; i++) {
      const seed = i * 89.3;
      const x = ((seed * 3.7 + t * 0.01) % w);
      const y = ((seed * 2.1 + t * 0.008) % h);
      const sz = 3 + (i % 3) * 2;
      const alpha = 0.3 + Math.sin(t * 0.003 + seed) * 0.2;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.0005 + seed);
      ctx.fillStyle = `rgba(255,215,0,${alpha})`;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (j * Math.PI * 2) / 5 - Math.PI / 2;
        const ox = Math.cos(angle) * sz, oy = Math.sin(angle) * sz;
        const ix = Math.cos(angle + Math.PI / 5) * sz * 0.4, iy = Math.sin(angle + Math.PI / 5) * sz * 0.4;
        j === 0 ? ctx.moveTo(ox, oy) : ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
  },

  neon_lines: (ctx, w, h, t) => {
    const cols = ['rgba(139,92,246,0.6)', 'rgba(59,130,246,0.6)', 'rgba(20,184,166,0.5)'];
    for (let i = 0; i < 5; i++) {
      const progress = ((t * 0.0008 + i * 0.2) % 1);
      const yBase = 10 + (i * h) / 5;
      ctx.strokeStyle = cols[i % cols.length];
      ctx.lineWidth = 1.5;
      ctx.shadowColor = cols[i % cols.length];
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(-10, yBase);
      for (let x = 0; x <= w + 10; x += 20) {
        const seg = Math.floor(x / 40 + i) % 3;
        const yOff = seg === 0 ? 0 : seg === 1 ? 8 : -8;
        ctx.lineTo(x, yBase + yOff);
      }
      const mask = progress * w * 2;
      ctx.lineTo(Math.min(mask, w + 10), yBase);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  },

  ink_wash: (ctx, w, h, t) => {
    for (let i = 0; i < 4; i++) {
      const phase = t * 0.0006 + i * 1.5;
      const x = w * 0.3 + Math.sin(phase) * w * 0.3;
      const y = h * 0.5 + Math.cos(phase * 0.7) * h * 0.2;
      const r = 30 + Math.sin(phase * 0.5) * 15;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const hue = i % 2 === 0 ? '60,60,120' : '80,40,120';
      g.addColorStop(0, `rgba(${hue},${0.15 + Math.sin(phase) * 0.05})`);
      g.addColorStop(1, `rgba(${hue},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  },

  aurora: (ctx, w, h, t) => {
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      const hues = [
        'rgba(34,197,94,0.12)',
        'rgba(20,184,166,0.10)',
        'rgba(139,92,246,0.10)',
      ];
      ctx.fillStyle = hues[r];
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) {
        const base = h * 0.4 + r * 12;
        const y = base + Math.sin(x * 0.015 + t * 0.0008 + r * 2) * 15
                       + Math.sin(x * 0.008 + t * 0.0005 + r) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
  },

  embers: (ctx, w, h, t) => {
    for (let i = 0; i < 16; i++) {
      const seed = i * 73.1;
      const lifeT = ((t * 0.001 + seed * 0.1) % 3) / 3;
      const x = (seed * 7.3) % w + Math.sin(t * 0.001 + seed) * 8;
      const y = h - lifeT * h * 0.9;
      const alpha = lifeT < 0.1 ? lifeT * 10 : lifeT > 0.8 ? (1 - lifeT) * 5 : 1;
      const sz = 1.5 + (i % 3);
      ctx.fillStyle = i % 3 === 0
        ? `rgba(255,180,50,${alpha * 0.5})`
        : `rgba(255,120,20,${alpha * 0.4})`;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,220,100,${alpha * 0.3})`;
      ctx.beginPath(); ctx.arc(x, y, sz * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  },

  ocean_waves: (ctx, w, h, t) => {
    const waveCols = ['rgba(14,116,144,0.15)', 'rgba(8,145,178,0.12)', 'rgba(6,182,212,0.10)'];
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) {
        const y = h * 0.65 + r * 8 + Math.sin(x * 0.02 + t * 0.001 * (1 + r * 0.3) + r * 2) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.closePath();
      ctx.fillStyle = waveCols[r]; ctx.fill();
    }
  },

  lightning_storm: (ctx, w, h, t) => {
    const flash = Math.sin(t * 0.005) > 0.92 || Math.sin(t * 0.003 + 2) > 0.95;
    if (!flash) return;
    ctx.strokeStyle = `rgba(200,180,255,${0.4 + Math.random() * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(160,140,255,0.8)';
    ctx.shadowBlur = 12;
    const startX = w * 0.2 + Math.random() * w * 0.6;
    let x = startX, y = 0;
    ctx.beginPath(); ctx.moveTo(x, y);
    while (y < h * 0.8) {
      x += (Math.random() - 0.5) * 30;
      y += 5 + Math.random() * 10;
      ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.shadowBlur = 0;
  },

  holographic_shimmer: (ctx, w, h, t) => {
    const pos = ((t * 0.0003) % 1) * w * 1.5 - w * 0.25;
    const g = ctx.createLinearGradient(pos - 40, 0, pos + 40, h);
    g.addColorStop(0, 'rgba(255,0,128,0)');
    g.addColorStop(0.2, 'rgba(255,0,128,0.08)');
    g.addColorStop(0.35, 'rgba(255,165,0,0.06)');
    g.addColorStop(0.5, 'rgba(255,255,0,0.06)');
    g.addColorStop(0.65, 'rgba(0,255,128,0.06)');
    g.addColorStop(0.8, 'rgba(0,128,255,0.08)');
    g.addColorStop(1, 'rgba(128,0,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  },

  // Elite effects
  solar_flare: (ctx, w, h, t) => {
    for (let i = 0; i < 6; i++) {
      const angle = t * 0.0008 + i * 1.05;
      const cx = w * 0.5 + Math.cos(angle) * w * 0.3;
      const cy = h + 10;
      const arcH = 30 + Math.sin(t * 0.002 + i) * 15;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy - arcH, arcH * 1.5);
      g.addColorStop(0, `rgba(255,${100 + i * 15},0,${0.2})`);
      g.addColorStop(0.5, `rgba(200,${50 + i * 10},0,${0.08})`);
      g.addColorStop(1, 'rgba(100,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy - arcH * 0.5, arcH, 0, Math.PI * 2); ctx.fill();
    }
  },

  deep_space: (ctx, w, h, t) => {
    // Nebula blobs
    for (let i = 0; i < 3; i++) {
      const x = w * 0.3 + Math.sin(t * 0.0003 + i * 2) * w * 0.3;
      const y = h * 0.4 + Math.cos(t * 0.0004 + i) * h * 0.2;
      const r = 35 + i * 10;
      const hues = ['80,0,120', '20,20,100', '120,20,80'];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${hues[i]},0.12)`);
      g.addColorStop(1, `rgba(${hues[i]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Stars
    for (let i = 0; i < 20; i++) {
      const sx = (i * 47.3) % w, sy = (i * 31.7) % h;
      const a = 0.3 + Math.sin(t * 0.002 + i) * 0.2;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill();
    }
  },

  sakura_storm: (ctx, w, h, t) => {
    for (let i = 0; i < 22; i++) {
      const seed = i * 53.7;
      const wind = Math.sin(t * 0.002 + seed) * 20;
      const x = ((seed * 5.1 + t * 0.06 + wind) % (w + 40)) - 20;
      const y = ((seed * 3.3 + t * 0.04 * (1 + (i % 3) * 0.5)) % (h + 30)) - 15;
      const rot = t * 0.003 * (i % 2 === 0 ? 1 : -1) + seed;
      const sz = 3 + (i % 3) * 2;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.fillStyle = i % 4 === 0 ? 'rgba(255,200,220,0.6)' : i % 4 === 1 ? 'rgba(255,150,180,0.5)' : 'rgba(255,180,200,0.45)';
      for (let p = 0; p < 5; p++) {
        ctx.beginPath();
        ctx.ellipse(0, -sz, sz * 0.4, sz, (p * Math.PI * 2) / 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  void_rift: (ctx, w, h, t) => {
    // Dark cracks
    for (let i = 0; i < 4; i++) {
      const sx = w * 0.2 + (i * w * 0.2);
      const progress = ((t * 0.0005 + i * 0.25) % 1);
      ctx.strokeStyle = `rgba(120,50,200,${0.3 + Math.sin(t * 0.003 + i) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(150,50,255,0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(sx, 0);
      let x = sx, y = 0;
      while (y < h * progress) {
        x += (Math.sin(y * 0.1 + i) * 8);
        y += 4;
        ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    // Glow leak
    for (let i = 0; i < 3; i++) {
      const x = w * 0.3 + i * w * 0.2;
      const y = h * 0.3 + Math.sin(t * 0.001 + i) * 15;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 15);
      g.addColorStop(0, 'rgba(150,50,255,0.15)');
      g.addColorStop(1, 'rgba(80,0,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
    }
  },

  crystalline: (ctx, w, h, t) => {
    for (let i = 0; i < 5; i++) {
      const cx = w * 0.2 + (i * w * 0.15);
      const cy = h * 0.4 + Math.sin(t * 0.001 + i * 2) * 10;
      const rot = t * 0.0005 + i * 1.2;
      const sz = 10 + i * 3;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
      // Crystal shape
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const a = (j * Math.PI * 2) / 6;
        const r = sz * (j % 2 === 0 ? 1 : 0.6);
        j === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      // Rainbow refraction
      const hue = ((t * 0.05 + i * 60) % 360);
      ctx.fillStyle = `hsla(${hue}, 70%, 70%, 0.08)`;
      ctx.strokeStyle = `hsla(${hue}, 80%, 80%, 0.2)`;
      ctx.lineWidth = 0.5;
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  },

  dragon_scale: (ctx, w, h, t) => {
    const cols = ['rgba(34,120,60,0.1)', 'rgba(180,160,50,0.08)', 'rgba(50,140,70,0.09)'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 8; col++) {
        const x = col * 25 + (row % 2) * 12.5 + Math.sin(t * 0.001 + row) * 3;
        const y = row * 18 + Math.cos(t * 0.001 + col) * 2;
        const shimmer = Math.sin(t * 0.002 + row * 0.5 + col * 0.3) * 0.5 + 0.5;
        ctx.fillStyle = cols[(row + col) % 3];
        ctx.globalAlpha = 0.5 + shimmer * 0.5;
        ctx.beginPath();
        ctx.ellipse(x, y, 11, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  },
};

export default function ProfileEffectCanvas({ effect, className = '', width = 360, height = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const visibleRef = useRef(true);

  const render = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas || !visibleRef.current) { animRef.current = requestAnimationFrame(render); return; }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fn = renderers[effect];
    if (fn) fn(ctx, canvas.width, canvas.height, timestamp);
    animRef.current = requestAnimationFrame(render);
  }, [effect]);

  useEffect(() => {
    if (!effect || effect === 'none') return;
    // Check reduced motion
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    animRef.current = requestAnimationFrame(render);

    // Pause when not visible
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    if (canvasRef.current) observer.observe(canvasRef.current);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [effect, render]);

  if (!effect || effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}