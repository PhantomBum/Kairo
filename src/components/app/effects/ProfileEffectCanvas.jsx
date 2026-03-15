import React, { useRef, useEffect, useCallback } from 'react';

// ─── Math & Noise Utilities ──────────────────────────────────────
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));

const _p = new Uint8Array(512);
const _g = new Float32Array(512);
(() => {
  for (let i = 0; i < 256; i++) _p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [_p[i], _p[j]] = [_p[j], _p[i]]; }
  for (let i = 0; i < 256; i++) _p[i + 256] = _p[i];
  for (let i = 0; i < 512; i++) _g[i] = (Math.random() - 0.5) * 2;
})();

function noise(x, y) {
  const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(_g[_p[_p[xi] + yi]], _g[_p[_p[xi + 1] + yi]], u),
    lerp(_g[_p[_p[xi] + yi + 1]], _g[_p[_p[xi + 1] + yi + 1]], u), v
  );
}

function fbm(x, y, oct = 3) {
  let val = 0, amp = 1, freq = 1, mx = 0;
  for (let i = 0; i < oct; i++) { val += noise(x * freq, y * freq) * amp; mx += amp; amp *= 0.5; freq *= 2; }
  return val / mx;
}

function starPath(ctx, cx, cy, outer, inner, spikes) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function petalGroup(ctx, x, y, rot, sz, color, centerColor) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  for (let p = 0; p < 5; p++) {
    const a = (p * TAU) / 5;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-sz * 0.35, -sz * 0.5, -sz * 0.2, -sz * 1.1, 0, -sz * 1.2);
    ctx.bezierCurveTo(sz * 0.2, -sz * 1.1, sz * 0.35, -sz * 0.5, 0, 0);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, sz * 0.18, 0, TAU);
  ctx.fillStyle = centerColor;
  ctx.fill();
  ctx.restore();
}

// ─── Effect Definitions ──────────────────────────────────────────
// Each: create(w,h) -> state, draw(ctx,w,h,t,dt,state) -> void

const effects = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Crimson Flames
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  crimson_flames: {
    create(w, h) {
      const particles = [];
      for (let i = 0; i < 55; i++) {
        particles.push({
          x: rand(0, w), y: h + rand(0, 20), vx: 0, vy: rand(-0.8, -0.25),
          size: rand(4, 15), life: rand(0, 1), maxLife: rand(1.0, 2.0),
          layer: i % 3, seed: rand(0, 100),
        });
      }
      return { particles };
    },
    draw(ctx, w, h, t, dt, s) {
      ctx.globalCompositeOperation = 'lighter';
      for (const p of s.particles) {
        p.life += dt * 0.0009;
        if (p.life > p.maxLife) {
          p.x = rand(-10, w + 10); p.y = h + rand(5, 20);
          p.life = 0; p.maxLife = rand(1.0, 2.0);
          p.size = rand(4, 15); p.seed = rand(0, 100);
        }
        const prog = p.life / p.maxLife;
        const n = fbm(p.x * 0.008 + p.seed, t * 0.0004, 2);
        p.x += n * 1.8 + Math.sin(t * 0.0015 + p.seed) * 0.4;
        p.y += p.vy * (1 + prog * 0.6);
        const alpha = prog < 0.08 ? prog / 0.08 : prog > 0.55 ? Math.max(0, (1 - prog) / 0.45) : 1;
        const distCenter = Math.abs(p.x - w * 0.5) / (w * 0.5);
        const sz = p.size * (1 - prog * 0.35) * Math.max(0.35, 1 - distCenter * 0.45);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
        if (p.layer === 0) {
          g.addColorStop(0, `rgba(170,25,5,${alpha * 0.55})`); g.addColorStop(0.5, `rgba(130,8,0,${alpha * 0.25})`); g.addColorStop(1, 'rgba(70,0,0,0)');
        } else if (p.layer === 1) {
          g.addColorStop(0, `rgba(255,110,15,${alpha * 0.5})`); g.addColorStop(0.5, `rgba(210,65,0,${alpha * 0.22})`); g.addColorStop(1, 'rgba(140,25,0,0)');
        } else {
          g.addColorStop(0, `rgba(255,195,50,${alpha * 0.45})`); g.addColorStop(0.5, `rgba(255,150,25,${alpha * 0.18})`); g.addColorStop(1, 'rgba(200,70,0,0)');
        }
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Cherry Blossoms
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cherry_blossoms: {
    create(w, h) {
      const petals = [];
      for (let i = 0; i < 16; i++) {
        petals.push({
          x: rand(-20, w + 20), y: rand(-20, h + 20),
          vx: rand(0.15, 0.5), vy: rand(0.12, 0.35),
          rot: rand(0, TAU), rotSpeed: rand(-0.008, 0.008),
          size: rand(2.5, 5.5), alpha: rand(0.25, 0.6),
          colorIdx: randInt(0, 2), seed: rand(0, 100),
        });
      }
      return { petals };
    },
    draw(ctx, w, h, t, dt, s) {
      const colors = [
        ['rgba(255,182,203,0.@)', 'rgba(255,240,245,0.7)'],
        ['rgba(255,160,190,0.@)', 'rgba(255,230,240,0.7)'],
        ['rgba(255,200,215,0.@)', 'rgba(255,245,248,0.6)'],
      ];
      for (const p of s.petals) {
        const sway = Math.sin(t * 0.001 + p.seed) * 0.3;
        p.x += (p.vx + sway) * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        p.rot += p.rotSpeed * dt * 0.06;
        if (p.x > w + 25 || p.y > h + 25) { p.x = rand(-25, -5); p.y = rand(-25, h * 0.3); }
        const c = colors[p.colorIdx];
        petalGroup(ctx, p.x, p.y, p.rot, p.size, c[0].replace('@', p.alpha.toFixed(2)), c[1]);
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Golden Stars
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  golden_stars: {
    create(w, h) {
      const stars = [];
      for (let i = 0; i < 16; i++) {
        stars.push({
          x: rand(0, w), y: rand(0, h),
          vx: rand(-0.12, 0.12), vy: rand(-0.08, 0.08),
          size: rand(2, 8), rot: rand(0, TAU), rotSpeed: rand(-0.003, 0.003),
          twinklePhase: rand(0, TAU), twinkleSpeed: rand(0.002, 0.006),
          hasTrail: Math.random() < 0.3, alpha: rand(0.3, 0.7),
        });
      }
      return { stars };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const st of s.stars) {
        st.x += st.vx * dt * 0.06; st.y += st.vy * dt * 0.06;
        st.rot += st.rotSpeed * dt * 0.06;
        if (st.x < -10) st.x = w + 5; if (st.x > w + 10) st.x = -5;
        if (st.y < -10) st.y = h + 5; if (st.y > h + 10) st.y = -5;
        const twinkle = 0.5 + Math.sin(t * st.twinkleSpeed + st.twinklePhase) * 0.5;
        const alpha = st.alpha * (0.4 + twinkle * 0.6);
        if (st.hasTrail) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.15;
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(st.x - st.vx * 40, st.y - st.vy * 40);
          ctx.lineTo(st.x, st.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.rot);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, st.size);
        g.addColorStop(0, `rgba(255,235,130,${alpha})`);
        g.addColorStop(0.5, `rgba(255,215,0,${alpha * 0.7})`);
        g.addColorStop(1, `rgba(218,165,32,${alpha * 0.3})`);
        ctx.fillStyle = g;
        starPath(ctx, 0, 0, st.size, st.size * 0.4, 5);
        ctx.fill();
        if (twinkle > 0.85) {
          ctx.shadowColor = 'rgba(255,215,0,0.8)'; ctx.shadowBlur = st.size * 2;
          ctx.fillStyle = `rgba(255,245,200,${(twinkle - 0.85) * 6})`;
          starPath(ctx, 0, 0, st.size * 0.6, st.size * 0.25, 5);
          ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Neon Lines
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  neon_lines: {
    create(w, h) {
      const paths = [];
      for (let i = 0; i < 6; i++) {
        const segments = [];
        let x = rand(-20, 0), y = rand(8, h - 8);
        let dir = 0; // 0=right, 1=down, 2=up
        segments.push({ x, y });
        for (let j = 0; j < randInt(6, 12); j++) {
          const len = rand(20, 60);
          if (dir === 0) x += len;
          else if (dir === 1) y += rand(8, 20);
          else y -= rand(8, 20);
          y = clamp(y, 5, h - 5);
          segments.push({ x, y });
          dir = dir === 0 ? (Math.random() < 0.5 ? 1 : 2) : 0;
        }
        paths.push({ segments, speed: rand(0.0003, 0.0008), offset: rand(0, 1), hueBase: i * 40 });
      }
      const nodes = [];
      for (const path of paths) {
        for (let k = 1; k < path.segments.length - 1; k++) {
          if (Math.random() < 0.5) nodes.push({ x: path.segments[k].x, y: path.segments[k].y, phase: rand(0, TAU) });
        }
      }
      return { paths, nodes };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const path of s.paths) {
        const hue = (path.hueBase + t * 0.02) % 360;
        const totalLen = path.segments.reduce((sum, seg, i) => {
          if (i === 0) return 0;
          const prev = path.segments[i - 1];
          return sum + Math.hypot(seg.x - prev.x, seg.y - prev.y);
        }, 0);
        const progress = ((t * path.speed + path.offset) % 1.4) - 0.2;
        const headPos = progress * totalLen;
        const tailLen = totalLen * 0.35;
        ctx.strokeStyle = `hsla(${hue}, 80%, 65%, 0.7)`;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = `hsla(${hue}, 90%, 55%, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        let dist = 0, started = false;
        for (let i = 0; i < path.segments.length; i++) {
          if (i > 0) {
            const prev = path.segments[i - 1], cur = path.segments[i];
            const segLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
            const segStart = dist, segEnd = dist + segLen;
            if (segEnd > headPos - tailLen && segStart < headPos) {
              const clStart = clamp((headPos - tailLen - segStart) / segLen, 0, 1);
              const clEnd = clamp((headPos - segStart) / segLen, 0, 1);
              const sx = lerp(prev.x, cur.x, clStart), sy = lerp(prev.y, cur.y, clStart);
              const ex = lerp(prev.x, cur.x, clEnd), ey = lerp(prev.y, cur.y, clEnd);
              if (!started) { ctx.moveTo(sx, sy); started = true; }
              ctx.lineTo(ex, ey);
            }
            dist += segLen;
          }
        }
        if (started) ctx.stroke();
        ctx.shadowBlur = 0;
      }
      for (const node of s.nodes) {
        const pulse = 0.5 + Math.sin(t * 0.004 + node.phase) * 0.5;
        ctx.fillStyle = `rgba(180,160,255,${0.2 + pulse * 0.4})`;
        ctx.beginPath(); ctx.arc(node.x, node.y, 2 + pulse * 1.5, 0, TAU); ctx.fill();
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Ink Wash
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ink_wash: {
    create(w, h) {
      const blobs = [];
      for (let i = 0; i < 6; i++) {
        blobs.push({
          cx: rand(w * 0.1, w * 0.9), cy: rand(h * 0.1, h * 0.9),
          phase: rand(0, TAU), speed: rand(0.0003, 0.0008),
          maxR: rand(25, 50), color: randInt(0, 3),
          driftX: rand(-0.08, 0.08), driftY: rand(-0.05, 0.05),
        });
      }
      return { blobs };
    },
    draw(ctx, w, h, t, dt, s) {
      const colors = [
        [20, 25, 60], [40, 20, 80], [55, 30, 100], [15, 50, 65],
      ];
      ctx.globalCompositeOperation = 'screen';
      for (const b of s.blobs) {
        const cycle = (Math.sin(t * b.speed + b.phase) + 1) * 0.5;
        const r = b.maxR * (0.3 + cycle * 0.7);
        const alpha = cycle > 0.7 ? (1 - cycle) / 0.3 : cycle < 0.15 ? cycle / 0.15 : 1;
        const x = b.cx + Math.sin(t * 0.0003 + b.phase) * 20 + b.driftX * t * 0.01;
        const y = b.cy + Math.cos(t * 0.0004 + b.phase * 0.7) * 12 + b.driftY * t * 0.01;
        const [cr, cg, cb] = colors[b.color];
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.2})`);
        g.addColorStop(0.4, `rgba(${cr},${cg},${cb},${alpha * 0.12})`);
        g.addColorStop(0.7, `rgba(${cr + 10},${cg + 10},${cb + 20},${alpha * 0.05})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Aurora
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  aurora: {
    create(w, h) {
      const ribbons = [];
      for (let i = 0; i < 5; i++) {
        ribbons.push({
          yBase: h * (0.15 + i * 0.12), amplitude: rand(8, 18),
          freq: rand(0.008, 0.018), speed: rand(0.0006, 0.0014),
          thickness: rand(12, 28), phase: rand(0, TAU),
          colorIdx: i % 4,
        });
      }
      return { ribbons };
    },
    draw(ctx, w, h, t, dt, s) {
      const colors = [
        [34, 197, 94], [20, 184, 166], [139, 92, 246], [200, 220, 255],
      ];
      for (const r of s.ribbons) {
        const [cr, cg, cb] = colors[r.colorIdx];
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const wave1 = Math.sin(x * r.freq + t * r.speed + r.phase) * r.amplitude;
          const wave2 = Math.sin(x * r.freq * 0.5 + t * r.speed * 0.7 + r.phase * 1.3) * r.amplitude * 0.6;
          ctx.lineTo(x, r.yBase + wave1 + wave2);
        }
        ctx.lineTo(w, h); ctx.closePath();
        const g = ctx.createLinearGradient(0, r.yBase - r.amplitude, 0, r.yBase + r.thickness + r.amplitude);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        g.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.1)`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.06)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g; ctx.fill();
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Embers
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  embers: {
    create(w, h) {
      const particles = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: rand(0, w), y: rand(h * 0.4, h + 10),
          vy: rand(-0.3, -0.08), vx: 0,
          size: rand(1, 3.5), life: rand(0, 1), maxLife: rand(1.5, 3),
          color: randInt(0, 2), seed: rand(0, 100), spawnDelay: rand(0, 2),
        });
      }
      return { particles };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const p of s.particles) {
        if (p.spawnDelay > 0) { p.spawnDelay -= dt * 0.001; continue; }
        p.life += dt * 0.0007;
        if (p.life > p.maxLife) {
          p.x = rand(0, w); p.y = h + rand(5, 15);
          p.life = 0; p.maxLife = rand(1.5, 3); p.size = rand(1, 3.5); p.seed = rand(0, 100);
        }
        const prog = p.life / p.maxLife;
        p.vx = Math.sin(t * 0.001 + p.seed) * 0.15 + noise(p.x * 0.02, t * 0.0003) * 0.4;
        p.x += p.vx * dt * 0.06;
        p.y += p.vy * dt * 0.06;
        const alpha = prog < 0.05 ? prog / 0.05 : prog > 0.6 ? Math.max(0, (1 - prog) / 0.4) : 1;
        const sz = p.size * (1 - prog * 0.2);
        const colors = [
          `rgba(255,170,40,${alpha * 0.6})`,
          `rgba(255,120,15,${alpha * 0.55})`,
          `rgba(220,160,30,${alpha * 0.5})`,
        ];
        ctx.shadowColor = colors[p.color]; ctx.shadowBlur = sz * 3;
        ctx.fillStyle = colors[p.color];
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, sz, sz * 1.4, Math.sin(t * 0.002 + p.seed) * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255,230,120,${alpha * 0.35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, sz * 0.4, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Ocean Waves
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ocean_waves: {
    create(w, h) {
      const layers = [];
      for (let i = 0; i < 5; i++) {
        layers.push({
          yBase: h * (0.55 + i * 0.09),
          freq: rand(0.012, 0.025), amplitude: rand(5, 10),
          speed: rand(0.0008, 0.0018) * (i % 2 === 0 ? 1 : -1),
          phase: rand(0, TAU), depth: i,
        });
      }
      return { layers };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const l of s.layers) {
        const depthAlpha = 0.18 - l.depth * 0.025;
        ctx.beginPath(); ctx.moveTo(0, h);
        const points = [];
        for (let x = 0; x <= w; x += 2) {
          const y = l.yBase + Math.sin(x * l.freq + t * l.speed + l.phase) * l.amplitude
                   + Math.sin(x * l.freq * 2.3 + t * l.speed * 1.5 + l.phase * 0.7) * l.amplitude * 0.3;
          points.push({ x, y }); ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath();
        const g = ctx.createLinearGradient(0, l.yBase - l.amplitude, 0, h);
        const tealShift = l.depth * 15;
        g.addColorStop(0, `rgba(${8 + tealShift},${110 + tealShift},${160 + tealShift * 0.5},${depthAlpha})`);
        g.addColorStop(1, `rgba(${5},${80 + tealShift},${130 + tealShift},${depthAlpha * 0.5})`);
        ctx.fillStyle = g; ctx.fill();
        if (l.depth < 2) {
          ctx.strokeStyle = `rgba(220,240,255,${0.06 - l.depth * 0.02})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < points.length; i++) {
            i === 0 ? ctx.moveTo(points[i].x, points[i].y) : ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Lightning Storm
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  lightning_storm: {
    create(w, h) {
      return { bolts: [], nextBolt: 0, flashAlpha: 0 };
    },
    draw(ctx, w, h, t, dt, s) {
      if (s.flashAlpha > 0) {
        ctx.fillStyle = `rgba(180,170,220,${s.flashAlpha * 0.08})`;
        ctx.fillRect(0, 0, w, h);
        s.flashAlpha = Math.max(0, s.flashAlpha - dt * 0.006);
      }
      if (t > s.nextBolt) {
        const bolt = { segments: [], branches: [], born: t, life: 120 + Math.random() * 80 };
        let x = rand(w * 0.15, w * 0.85), y = 0;
        bolt.segments.push({ x, y });
        while (y < h * 0.85) {
          x += (Math.random() - 0.5) * 25;
          y += 4 + Math.random() * 8;
          bolt.segments.push({ x, y });
          if (Math.random() < 0.15 && bolt.branches.length < 3) {
            const branch = [{ x, y }];
            let bx = x, by = y;
            for (let k = 0; k < randInt(2, 5); k++) {
              bx += (Math.random() - 0.5) * 20 + (Math.random() < 0.5 ? 8 : -8);
              by += 3 + Math.random() * 6;
              branch.push({ x: bx, y: by });
            }
            bolt.branches.push(branch);
          }
        }
        s.bolts.push(bolt);
        s.flashAlpha = 1;
        s.nextBolt = t + rand(1200, 3000);
      }
      s.bolts = s.bolts.filter(b => t - b.born < b.life);
      for (const bolt of s.bolts) {
        const age = (t - bolt.born) / bolt.life;
        const alpha = age < 0.1 ? 1 : Math.max(0, 1 - (age - 0.1) / 0.9);
        ctx.shadowColor = `rgba(140,120,255,${alpha * 0.9})`; ctx.shadowBlur = 14;
        ctx.strokeStyle = `rgba(230,220,255,${alpha * 0.8})`; ctx.lineWidth = 2;
        ctx.beginPath();
        bolt.segments.forEach((seg, i) => i === 0 ? ctx.moveTo(seg.x, seg.y) : ctx.lineTo(seg.x, seg.y));
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`; ctx.lineWidth = 0.8; ctx.shadowBlur = 0;
        ctx.beginPath();
        bolt.segments.forEach((seg, i) => i === 0 ? ctx.moveTo(seg.x, seg.y) : ctx.lineTo(seg.x, seg.y));
        ctx.stroke();
        for (const branch of bolt.branches) {
          ctx.strokeStyle = `rgba(180,170,255,${alpha * 0.5})`; ctx.lineWidth = 1;
          ctx.shadowColor = `rgba(140,120,255,${alpha * 0.5})`; ctx.shadowBlur = 8;
          ctx.beginPath();
          branch.forEach((seg, i) => i === 0 ? ctx.moveTo(seg.x, seg.y) : ctx.lineTo(seg.x, seg.y));
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FREE: Holographic Shimmer
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  holographic_shimmer: {
    create(w, h) {
      const sparkles = [];
      for (let i = 0; i < 12; i++) {
        sparkles.push({ x: rand(0, w), y: rand(0, h), life: rand(0, 1), maxLife: rand(1, 2.5), size: rand(1.5, 4) });
      }
      return { sparkles, angle: 0 };
    },
    draw(ctx, w, h, t, dt, s) {
      s.angle = t * 0.00008;
      const cos = Math.cos(s.angle), sin = Math.sin(s.angle);
      const sweep = ((t * 0.00025) % 1.6) - 0.3;
      for (let x = 0; x < w; x += 1) {
        const norm = (x * cos + (h * 0.5) * sin) / (w + h);
        const dist = Math.abs(norm - sweep);
        if (dist > 0.15) continue;
        const intensity = 1 - dist / 0.15;
        const hue = ((norm * 360 + t * 0.03) % 360);
        ctx.fillStyle = `hsla(${hue}, 50%, 65%, ${intensity * 0.1})`;
        ctx.fillRect(x, 0, 1, h);
      }
      for (const sp of s.sparkles) {
        sp.life += dt * 0.0008;
        if (sp.life > sp.maxLife) { sp.x = rand(0, w); sp.y = rand(0, h); sp.life = 0; sp.maxLife = rand(1, 2.5); }
        const prog = sp.life / sp.maxLife;
        const alpha = prog < 0.2 ? prog / 0.2 : prog > 0.7 ? (1 - prog) / 0.3 : 1;
        const hue = ((sp.x + sp.y + t * 0.05) % 360);
        ctx.fillStyle = `hsla(${hue}, 40%, 80%, ${alpha * 0.35})`;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * alpha, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * 0.3 * alpha, 0, TAU); ctx.fill();
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Solar Flare
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  solar_flare: {
    create(w, h) {
      const flares = [];
      for (let i = 0; i < 5; i++) {
        flares.push({
          x: rand(w * 0.1, w * 0.9), phase: rand(0, TAU),
          speed: rand(0.0004, 0.001), arcHeight: rand(25, 55),
          width: rand(30, 60), color: randInt(0, 2), delay: i * 0.8,
        });
      }
      const sparks = [];
      for (let i = 0; i < 25; i++) {
        sparks.push({
          x: 0, y: 0, vx: 0, vy: 0, life: rand(0, 1), maxLife: rand(0.5, 1.2),
          size: rand(0.8, 2.5), parent: randInt(0, 4), active: false,
        });
      }
      return { flares, sparks };
    },
    draw(ctx, w, h, t, dt, s) {
      ctx.globalCompositeOperation = 'lighter';
      const colors = [
        [[255, 80, 0], [255, 160, 30]], [[230, 40, 10], [255, 120, 20]], [[255, 180, 40], [255, 220, 80]],
      ];
      for (let fi = 0; fi < s.flares.length; fi++) {
        const f = s.flares[fi];
        const cycle = Math.sin(t * f.speed + f.phase + f.delay) * 0.5 + 0.5;
        if (cycle < 0.1) continue;
        const arcH = f.arcHeight * cycle;
        const [c1, c2] = colors[f.color];
        ctx.beginPath();
        ctx.moveTo(f.x - f.width * 0.5 * cycle, h);
        ctx.bezierCurveTo(
          f.x - f.width * 0.3 * cycle, h - arcH * 0.8,
          f.x + f.width * 0.3 * cycle, h - arcH * 0.8,
          f.x + f.width * 0.5 * cycle, h
        );
        const g = ctx.createLinearGradient(f.x, h, f.x, h - arcH);
        g.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},${cycle * 0.35})`);
        g.addColorStop(0.5, `rgba(${c2[0]},${c2[1]},${c2[2]},${cycle * 0.2})`);
        g.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`);
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = `rgba(${c2[0]},${c2[1]},${c2[2]},${cycle * 0.3})`;
        ctx.lineWidth = 1.5; ctx.shadowColor = `rgba(${c2[0]},${c2[1]},${c2[2]},0.6)`; ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(f.x - f.width * 0.5 * cycle, h);
        ctx.bezierCurveTo(
          f.x - f.width * 0.3 * cycle, h - arcH * 0.8,
          f.x + f.width * 0.3 * cycle, h - arcH * 0.8,
          f.x + f.width * 0.5 * cycle, h
        );
        ctx.stroke(); ctx.shadowBlur = 0;
        for (const sp of s.sparks) {
          if (sp.parent !== fi) continue;
          sp.life += dt * 0.002;
          if (sp.life > sp.maxLife || !sp.active) {
            if (cycle > 0.3 && Math.random() < 0.15) {
              const arcT = rand(0.2, 0.8);
              sp.x = f.x + (arcT - 0.5) * f.width * cycle;
              sp.y = h - arcH * Math.sin(arcT * Math.PI) * 0.8;
              sp.vx = rand(-0.5, 0.5); sp.vy = rand(-0.6, -0.1);
              sp.life = 0; sp.active = true;
            }
            continue;
          }
          sp.x += sp.vx * dt * 0.06; sp.y += sp.vy * dt * 0.06;
          const prog = sp.life / sp.maxLife;
          const alpha = Math.max(0, 1 - prog);
          ctx.fillStyle = `rgba(${c2[0]},${c2[1]},${c2[2]},${alpha * 0.6})`;
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size * (1 - prog * 0.5), 0, TAU); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Deep Space
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  deep_space: {
    create(w, h) {
      const nebulae = [];
      for (let i = 0; i < 4; i++) {
        nebulae.push({
          x: rand(0, w), y: rand(0, h), r: rand(30, 55),
          vx: rand(-0.02, 0.02), vy: rand(-0.01, 0.01),
          color: randInt(0, 2), phase: rand(0, TAU),
        });
      }
      const farStars = [], nearStars = [];
      for (let i = 0; i < 35; i++) {
        farStars.push({ x: rand(0, w), y: rand(0, h), size: rand(0.3, 0.8), twinkle: rand(0, TAU), speed: rand(0.002, 0.005) });
      }
      for (let i = 0; i < 12; i++) {
        nearStars.push({
          x: rand(0, w), y: rand(0, h), size: rand(0.8, 1.6),
          twinkle: rand(0, TAU), speed: rand(0.003, 0.007),
          bloom: Math.random() < 0.3, vx: rand(-0.015, 0.015),
        });
      }
      return { nebulae, farStars, nearStars };
    },
    draw(ctx, w, h, t, dt, s) {
      const nebColors = [[60, 0, 90], [15, 15, 80], [90, 15, 60]];
      for (const n of s.nebulae) {
        n.x += n.vx * dt * 0.06 + Math.sin(t * 0.0002 + n.phase) * 0.03;
        n.y += n.vy * dt * 0.06;
        const pulse = 0.8 + Math.sin(t * 0.0003 + n.phase) * 0.2;
        const [cr, cg, cb] = nebColors[n.color];
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * pulse);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0.12)`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.06)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * pulse, 0, TAU); ctx.fill();
      }
      for (const st of s.farStars) {
        const alpha = 0.3 + Math.sin(t * st.speed + st.twinkle) * 0.25;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.size, 0, TAU); ctx.fill();
      }
      for (const st of s.nearStars) {
        st.x += st.vx * dt * 0.06;
        if (st.x < -5) st.x = w + 3; if (st.x > w + 5) st.x = -3;
        const alpha = 0.5 + Math.sin(t * st.speed + st.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.size, 0, TAU); ctx.fill();
        if (st.bloom) {
          const bloom = Math.sin(t * st.speed * 0.5 + st.twinkle) * 0.5 + 0.5;
          ctx.shadowColor = `rgba(200,210,255,${bloom * 0.6})`; ctx.shadowBlur = st.size * 6;
          ctx.fillStyle = `rgba(220,230,255,${bloom * 0.3})`;
          ctx.beginPath(); ctx.arc(st.x, st.y, st.size * 1.5, 0, TAU); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Sakura Storm
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  sakura_storm: {
    create(w, h) {
      const petals = [];
      for (let i = 0; i < 35; i++) {
        petals.push({
          x: rand(-30, w + 30), y: rand(-20, h + 20),
          vx: rand(0.6, 2.0), vy: rand(0.2, 0.8),
          rot: rand(0, TAU), rotSpeed: rand(-0.02, 0.02),
          size: rand(2, 5.5), alpha: rand(0.3, 0.7),
          colorIdx: randInt(0, 2), seed: rand(0, 100),
        });
      }
      return { petals, windPhase: 0, gustTimer: 0, gustStrength: 0 };
    },
    draw(ctx, w, h, t, dt, s) {
      s.windPhase += dt * 0.0003;
      s.gustTimer -= dt;
      if (s.gustTimer <= 0) { s.gustStrength = rand(1.5, 4); s.gustTimer = rand(2000, 5000); }
      s.gustStrength *= 0.998;
      const windX = Math.sin(s.windPhase) * 0.5 + s.gustStrength;
      const windY = Math.cos(s.windPhase * 0.7) * 0.2;
      const colors = [
        ['rgba(255,170,195,0.@)', 'rgba(255,235,240,0.6)'],
        ['rgba(255,140,175,0.@)', 'rgba(255,220,235,0.6)'],
        ['rgba(255,190,210,0.@)', 'rgba(255,245,248,0.5)'],
      ];
      for (const p of s.petals) {
        const sway = Math.sin(t * 0.002 + p.seed * 3) * 0.8;
        p.x += (p.vx + windX + sway) * dt * 0.06;
        p.y += (p.vy + windY) * dt * 0.06;
        p.rot += (p.rotSpeed + windX * 0.005) * dt * 0.06;
        if (p.x > w + 35 || p.y > h + 25 || p.x < -35) {
          p.x = rand(-35, -5); p.y = rand(-20, h);
          p.vx = rand(0.6, 2.0);
        }
        const speed = Math.hypot(p.vx + windX, p.vy + windY);
        const blur = speed > 2.5;
        if (blur) { ctx.globalAlpha = p.alpha * 0.6; } else { ctx.globalAlpha = p.alpha; }
        const c = colors[p.colorIdx];
        petalGroup(ctx, p.x, p.y, p.rot, p.size * (blur ? 1.3 : 1), c[0].replace('@', (p.alpha * (blur ? 0.4 : 1)).toFixed(2)), c[1]);
        ctx.globalAlpha = 1;
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Void Rift
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  void_rift: {
    create(w, h) {
      function buildBranch(x, y, angle, len, depth, maxDepth) {
        if (depth > maxDepth || len < 3) return [];
        const endX = x + Math.cos(angle) * len;
        const endY = y + Math.sin(angle) * len;
        const segs = [{ x1: x, y1: y, x2: endX, y2: endY, depth }];
        const bc = depth === 0 ? randInt(2, 4) : randInt(1, 3);
        for (let b = 0; b < bc; b++) {
          const pos = rand(0.3, 0.9);
          const bx = lerp(x, endX, pos), by = lerp(y, endY, pos);
          segs.push(...buildBranch(bx, by, angle + rand(-0.8, 0.8), len * rand(0.5, 0.8), depth + 1, maxDepth));
        }
        return segs;
      }
      const cracks = [];
      for (let i = 0; i < 3; i++) {
        const ox = rand(w * 0.15, w * 0.85), oy = rand(h * 0.2, h * 0.7);
        const maxD = randInt(3, 5);
        const allSegs = [];
        const angles = [rand(-1.2, -0.3), rand(0.3, 1.2), rand(-0.5, 0.5) + Math.PI, rand(-0.3, 0.3)];
        for (const a of angles) allSegs.push(...buildBranch(ox, oy, a, rand(15, 35), 0, maxD));
        cracks.push({ origin: { x: ox, y: oy }, segments: allSegs, phase: rand(0, TAU), speed: rand(0.0003, 0.0007), maxDepth: maxD });
      }
      const particles = [];
      for (let i = 0; i < 20; i++) {
        particles.push({ x: 0, y: 0, vx: 0, vy: 0, life: rand(0, 1), maxLife: rand(0.5, 1.5), size: rand(0.8, 2), active: false, crackIdx: randInt(0, 2) });
      }
      return { cracks, particles };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const crack of s.cracks) {
        const growth = clamp((Math.sin(t * crack.speed + crack.phase) + 1) * 0.5, 0, 1);
        if (growth < 0.05) continue;
        const g = ctx.createRadialGradient(crack.origin.x, crack.origin.y, 0, crack.origin.x, crack.origin.y, 40 * growth);
        g.addColorStop(0, `rgba(0,0,0,${growth * 0.15})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(crack.origin.x, crack.origin.y, 40 * growth, 0, TAU); ctx.fill();
        for (const seg of crack.segments) {
          const segGrowth = growth * Math.max(0, 1 - seg.depth / (crack.maxDepth + 1));
          if (segGrowth < 0.05) continue;
          const ex = lerp(seg.x1, seg.x2, segGrowth), ey = lerp(seg.y1, seg.y2, segGrowth);
          const alpha = (1 - seg.depth / (crack.maxDepth + 1)) * growth;
          ctx.shadowColor = `rgba(130,40,220,${alpha * 0.8})`; ctx.shadowBlur = 10;
          ctx.strokeStyle = `rgba(100,30,180,${alpha * 0.6})`; ctx.lineWidth = Math.max(0.5, 2 - seg.depth * 0.4);
          ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(180,120,255,${alpha * 0.7})`; ctx.lineWidth = Math.max(0.3, 1 - seg.depth * 0.2);
          ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(ex, ey); ctx.stroke();
        }
        const glowG = ctx.createRadialGradient(crack.origin.x, crack.origin.y, 0, crack.origin.x, crack.origin.y, 15 * growth);
        glowG.addColorStop(0, `rgba(150,60,255,${growth * 0.25})`);
        glowG.addColorStop(1, 'rgba(80,0,150,0)');
        ctx.fillStyle = glowG; ctx.beginPath(); ctx.arc(crack.origin.x, crack.origin.y, 15 * growth, 0, TAU); ctx.fill();
      }
      for (const p of s.particles) {
        p.life += dt * 0.0015;
        if (p.life > p.maxLife || !p.active) {
          const crack = s.cracks[p.crackIdx];
          const growth = (Math.sin(t * crack.speed + crack.phase) + 1) * 0.5;
          if (growth > 0.3 && Math.random() < 0.08) {
            p.x = crack.origin.x + rand(-10, 10); p.y = crack.origin.y + rand(-10, 10);
            p.vx = rand(-0.4, 0.4); p.vy = rand(-0.5, -0.1);
            p.life = 0; p.active = true;
          }
          continue;
        }
        p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.fillStyle = `rgba(160,80,255,${alpha * 0.6})`;
        ctx.shadowColor = `rgba(130,40,220,${alpha * 0.5})`; ctx.shadowBlur = 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Crystalline
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  crystalline: {
    create(w, h) {
      const crystals = [];
      const shapes = ['hex', 'tri', 'diamond'];
      for (let i = 0; i < 8; i++) {
        crystals.push({
          x: rand(w * 0.05, w * 0.95), y: rand(h * 0.1, h * 0.9),
          size: rand(6, 16), shape: shapes[i % 3],
          rotY: rand(0, TAU), rotSpeed: rand(0.0008, 0.002) * (Math.random() < 0.5 ? 1 : -1),
          phase: rand(0, TAU), life: rand(0, 1), maxLife: rand(4, 8),
          hueOffset: rand(0, 360),
        });
      }
      return { crystals };
    },
    draw(ctx, w, h, t, dt, s) {
      for (const c of s.crystals) {
        c.life += dt * 0.001;
        c.rotY += c.rotSpeed * dt;
        if (c.life > c.maxLife) { c.x = rand(w * 0.05, w * 0.95); c.y = rand(h * 0.1, h * 0.9); c.life = 0; c.maxLife = rand(4, 8); }
        const prog = c.life / c.maxLife;
        const fadeIn = prog < 0.15 ? prog / 0.15 : 1;
        const fadeOut = prog > 0.75 ? (1 - prog) / 0.25 : 1;
        const alpha = fadeIn * fadeOut;
        const perspective = Math.cos(c.rotY);
        const scaleX = Math.abs(perspective);
        const catchLight = Math.pow(Math.max(0, perspective), 8);
        ctx.save(); ctx.translate(c.x, c.y);
        ctx.scale(scaleX * 0.8 + 0.2, 1);
        const hue = (c.hueOffset + t * 0.02 + catchLight * 120) % 360;
        const fillAlpha = alpha * (0.06 + catchLight * 0.15);
        const strokeAlpha = alpha * (0.15 + catchLight * 0.3);
        ctx.fillStyle = `hsla(${hue}, 60%, 75%, ${fillAlpha})`;
        ctx.strokeStyle = `hsla(${hue}, 70%, 85%, ${strokeAlpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        if (c.shape === 'hex') {
          for (let j = 0; j < 6; j++) { const a = (j * TAU) / 6 - Math.PI / 6; j === 0 ? ctx.moveTo(Math.cos(a) * c.size, Math.sin(a) * c.size) : ctx.lineTo(Math.cos(a) * c.size, Math.sin(a) * c.size); }
        } else if (c.shape === 'tri') {
          for (let j = 0; j < 3; j++) { const a = (j * TAU) / 3 - Math.PI / 2; j === 0 ? ctx.moveTo(Math.cos(a) * c.size, Math.sin(a) * c.size) : ctx.lineTo(Math.cos(a) * c.size, Math.sin(a) * c.size); }
        } else {
          ctx.moveTo(0, -c.size); ctx.lineTo(c.size * 0.6, 0); ctx.lineTo(0, c.size); ctx.lineTo(-c.size * 0.6, 0);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (catchLight > 0.5) {
          const rainbowHue = (hue + 60) % 360;
          ctx.shadowColor = `hsla(${rainbowHue}, 80%, 70%, ${(catchLight - 0.5) * 2 * alpha * 0.6})`;
          ctx.shadowBlur = c.size * 1.5;
          ctx.fillStyle = `hsla(${rainbowHue}, 60%, 90%, ${(catchLight - 0.5) * alpha * 0.2})`;
          ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.restore();
      }
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ELITE: Dragon Scale
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  dragon_scale: {
    create(w, h) {
      const scaleW = 18, scaleH = 13;
      const cols = Math.ceil(w / scaleW) + 2;
      const rows = Math.ceil(h / scaleH) + 2;
      const scales = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          scales.push({
            x: c * scaleW + (r % 2) * (scaleW * 0.5) - scaleW,
            y: r * scaleH - scaleH * 0.5,
            row: r, col: c, flarePhase: rand(0, TAU),
          });
        }
      }
      return { scales, scaleW, scaleH };
    },
    draw(ctx, w, h, t, dt, s) {
      const wavePos = (t * 0.0006) % 1;
      for (const sc of s.scales) {
        const norm = (sc.col / 10 + sc.row / 8);
        const waveDist = Math.abs((norm % 1) - wavePos);
        const shimmer = Math.max(0, 1 - waveDist * 4);
        const flare = Math.sin(t * 0.003 + sc.flarePhase) > 0.97 ? 1 : 0;
        const brightness = 0.4 + shimmer * 0.5 + flare * 0.4;
        const greenBase = Math.floor(80 + shimmer * 40 + flare * 30);
        const goldTrim = shimmer * 0.4 + flare * 0.5;
        ctx.beginPath();
        ctx.ellipse(sc.x, sc.y, s.scaleW * 0.48, s.scaleH * 0.45, 0, 0, TAU);
        ctx.fillStyle = `rgba(${15 + flare * 20},${greenBase},${40 + shimmer * 20},${brightness * 0.2})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${200 + flare * 55},${180 + shimmer * 40},${50},${goldTrim * 0.35 + 0.05})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse(sc.x, sc.y, s.scaleW * 0.48, s.scaleH * 0.45, 0, -Math.PI * 0.8, Math.PI * 0.1);
        ctx.stroke();
        if (shimmer > 0.4) {
          const g = ctx.createRadialGradient(sc.x, sc.y - 2, 0, sc.x, sc.y, s.scaleW * 0.4);
          g.addColorStop(0, `rgba(200,220,100,${shimmer * 0.08})`);
          g.addColorStop(1, 'rgba(200,220,100,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.ellipse(sc.x, sc.y, s.scaleW * 0.4, s.scaleH * 0.35, 0, 0, TAU); ctx.fill();
        }
      }
    },
  },
};

// ─── Component ───────────────────────────────────────────────────

export default function ProfileEffectCanvas({ effect, className = '', width = 360, height = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null);
  const visibleRef = useRef(true);
  const lastTimeRef = useRef(0);
  const effectRef = useRef(effect);

  useEffect(() => {
    if (!effect || effect === 'none') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const eff = effects[effect];
    if (!eff) return;

    if (effectRef.current !== effect || !stateRef.current) {
      stateRef.current = eff.create(width, height);
      effectRef.current = effect;
    }

    lastTimeRef.current = 0;

    const render = (timestamp) => {
      if (!visibleRef.current) { animRef.current = requestAnimationFrame(render); return; }
      const dt = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 50) : 16;
      lastTimeRef.current = timestamp;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      eff.draw(ctx, width, height, timestamp, dt, stateRef.current);
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (!entry.isIntersecting) lastTimeRef.current = 0;
    });
    observer.observe(canvas);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [effect, width, height]);

  if (!effect || effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
}
