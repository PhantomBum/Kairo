// Generates notification sounds using Web Audio API
const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
let ctx = null;

function getCtx() {
  if (!ctx && AudioCtx) ctx = new AudioCtx();
  return ctx;
}

const SOUNDS = {
  default: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(880, c.currentTime); o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.15); g.gain.setValueAtTime(0.3, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.3); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.3); },
  chime: (c) => { [523, 659, 784].forEach((f, i) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.2, c.currentTime + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + i * 0.1 + 0.25); o.connect(g); g.connect(c.destination); o.start(c.currentTime + i * 0.1); o.stop(c.currentTime + i * 0.1 + 0.25); }); },
  ping: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(1200, c.currentTime); o.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.1); g.gain.setValueAtTime(0.25, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.15); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.15); },
  bell: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.value = 1047; g.gain.setValueAtTime(0.3, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.6); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.6); },
  pop: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(400, c.currentTime); o.frequency.exponentialRampToValueAtTime(150, c.currentTime + 0.08); g.gain.setValueAtTime(0.35, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.1); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.1); },
  soft: (c) => { const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine'; o.frequency.value = 440; g.gain.setValueAtTime(0.1, c.currentTime); g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.4); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.4); },
};

export function playNotificationSound(soundName = 'default') {
  if (soundName === 'none') return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const fn = SOUNDS[soundName] || SOUNDS.default;
  fn(c);
}

export function previewSound(soundName) {
  playNotificationSound(soundName);
}