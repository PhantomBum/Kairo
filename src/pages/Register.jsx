import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Crown, Mail, Key, Copy, Download, Check, X, ChevronLeft, ChevronRight, Eye, EyeOff, Upload, Camera, Sparkles, Users, Globe, Search, Gamepad2, Music, Palette, Cpu, Dumbbell, BookOpen, UtensilsCrossed, Plane, Film, Landmark, TrendingUp, Shirt } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { validateEmail, validatePassword } from '@/lib/security/sanitizer';

import { colors, typography, shadows } from '@/components/app/design/tokens';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function generateSecretKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

function PasswordStrength({ password }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  if (!password) return null;
  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthColors = [colors.danger, colors.danger, colors.warning, colors.success, colors.success];
  const idx = Math.min(score, 4);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= idx ? strengthColors[idx] : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: strengthColors[idx] }}>{labels[idx]}</p>
    </div>
  );
}

function FormInput({ label, error: fieldError, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-2" style={{ fontSize: typography.label.size, fontWeight: typography.weight.semibold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>{label}</label>}
      <Input {...props} className="h-11 rounded-xl px-4" style={{ background: colors.bg.base.base, borderColor: fieldError ? colors.danger : undefined }} />
      {fieldError && <p className="mt-1" style={{ fontSize: typography.sm.size, color: colors.danger }}>{fieldError}</p>}
    </div>
  );
}

// ─── Signup Method: Email ────────────────────────────────────────────────────

function EmailSignup({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const debounce = useRef(null);

  const checkUsername = useCallback((val) => {
    clearTimeout(debounce.current);
    if (!val || val.length < 3) { setUsernameStatus(null); return; }
    setUsernameStatus('checking');
    debounce.current = setTimeout(async () => {
      try {
        const existing = await base44.entities.UserProfile.filter({ username: val.toLowerCase() });
        setUsernameStatus(existing.length === 0 ? 'available' : 'taken');
      } catch { setUsernameStatus('available'); }
    }, 500);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) { setError(pwCheck.message); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (usernameStatus === 'taken') { setError('That username is taken. Try another.'); return; }

    setLoading(true);
    try {
      await base44.auth.register({ email, password, full_name: username });
      await base44.auth.loginViaEmailPassword(email, password);
      onSuccess({ method: 'email', username, email });
    } catch (err) {
      setError(err.message || 'Something went wrong creating your account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 px-4 py-3 rounded-xl text-[13px] font-medium" style={{ background: `${colors.danger}15`, color: colors.danger }}>{error}</div>}
      <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
      <div className="mb-4">
        <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Username</label>
        <div className="relative">
          <input type="text" value={username} onChange={e => { const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20); setUsername(v); checkUsername(v); }}
            placeholder="coolname123" required minLength={3}
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none pr-10" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.subtle}` }} />
          {usernameStatus === 'available' && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.success }} />}
          {usernameStatus === 'taken' && <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.danger }} />}
          {usernameStatus === 'checking' && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.subtle, borderTopColor: colors.accent.primary }} />}
        </div>
        {usernameStatus === 'taken' && <p className="text-[11px] mt-1" style={{ color: colors.danger }}>That username is taken</p>}
      </div>
      <div className="mb-4">
        <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Password</label>
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none pr-10" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.subtle}` }} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[rgba(255,255,255,0.06)]" tabIndex={-1}>
            {showPw ? <EyeOff className="w-4 h-4" style={{ color: colors.text.muted }} /> : <Eye className="w-4 h-4" style={{ color: colors.text.muted }} />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </div>
      <FormInput label="Confirm Password" type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
        placeholder="Type your password again" required autoComplete="new-password"
        error={confirm && confirm !== password ? 'Passwords do not match' : ''} />
      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50 hover:brightness-110" style={{ background: colors.accent.primary }}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}

// ─── Signup Method: Secret Key ───────────────────────────────────────────────

function SecretKeySignup({ onSuccess }) {
  const [key] = useState(() => generateSecretKey());
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copyKey = () => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadKey = () => {
    const blob = new Blob([`KAIRO SECRET KEY\n${'='.repeat(40)}\n\nYour secret key:\n${key}\n\nKeep this key safe. If you lose it, your account is gone forever.\nDo not share this key with anyone.\n\nGenerated: ${new Date().toISOString()}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kairo-secret-key.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const email = `${key.slice(0, 12).toLowerCase()}@secretkey.kairo.app`;
      const password = key;
      await base44.auth.register({ email, password, full_name: `User_${key.slice(0, 6)}` });
      await base44.auth.loginViaEmailPassword(email, password);
      onSuccess({ method: 'secret_key', secretKey: key });
    } catch (err) {
      setError(err.message || 'Something went wrong creating your account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 rounded-xl mb-5" style={{ background: `${colors.accent.primary}08`, border: `1px solid ${colors.accent.primary}20` }}>
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.accent.primary }} />
          <div>
            <h3 className="text-[14px] font-bold mb-1" style={{ color: colors.text.primary }}>What is a Secret Key account?</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: colors.text.secondary }}>
              A Secret Key account requires zero personal information. No email, no phone number, no name. Your key is your identity. It's the most private way to use Kairo — we store absolutely nothing about you.
            </p>
          </div>
        </div>
      </div>

      <label className="block text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: colors.text.muted }}>Your Secret Key</label>
      <div className="p-4 rounded-xl mb-3 font-mono text-center select-all break-all" style={{ background: colors.bg.base, border: `1px solid ${colors.border.subtle}` }}>
        <span className="text-[18px] font-bold tracking-wider" style={{ color: colors.text.primary }}>{key}</span>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={copyKey} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.06)]" style={{ color: colors.text.primary, border: `1px solid ${colors.border.subtle}` }}>
          {copied ? <Check className="w-4 h-4" style={{ color: colors.success }} /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy Key'}
        </button>
        <button onClick={downloadKey} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.06)]" style={{ color: colors.text.primary, border: `1px solid ${colors.border.subtle}` }}>
          <Download className="w-4 h-4" /> Download .txt
        </button>
      </div>

      <div className="p-4 rounded-xl mb-5" style={{ background: `${colors.warning}08`, border: `1px solid ${colors.warning}20` }}>
        <p className="text-[12px] font-semibold" style={{ color: colors.warning }}>
          If you lose this key, your account is gone forever. There is no recovery. No password reset. Nothing.
        </p>
      </div>

      <label className="flex items-start gap-3 mb-5 cursor-pointer select-none" onClick={() => setSaved(!saved)}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
          style={{ background: saved ? colors.accent.primary : 'transparent', border: `2px solid ${saved ? colors.accent.primary : colors.border.subtle}` }}>
          {saved && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-[13px] leading-relaxed" style={{ color: colors.text.secondary }}>
          I have saved my key somewhere safe. I understand that if I lose it, my account is gone forever.
        </span>
      </label>

      {error && <div className="mb-4 px-4 py-3 rounded-xl text-[13px] font-medium" style={{ background: `${colors.danger}15`, color: colors.danger }}>{error}</div>}

      <button onClick={handleCreate} disabled={!saved || loading}
        className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
        style={{ background: colors.accent.primary }}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </div>
  );
}

// ─── Signup Method: Google OAuth ─────────────────────────────────────────────

function GoogleSignup({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await base44.auth.loginWithProvider('google');
    } catch (err) {
      setError(err.message || 'Google sign-in didn\'t work. Try again or use email instead.');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl text-[13px] font-medium" style={{ background: `${colors.danger}15`, color: colors.danger }}>{error}</div>}
      <button onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-[14px] font-semibold transition-all hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50"
        style={{ background: colors.bg.surface, color: colors.text.primary, border: `1px solid ${colors.border.subtle}` }}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        {loading ? 'Connecting...' : 'Continue with Google'}
      </button>
      <p className="text-center text-[12px] mt-4" style={{ color: colors.text.muted }}>
        You'll be redirected to Google to sign in.
      </p>
    </div>
  );
}

// ─── Celebration Screen ──────────────────────────────────────────────────────

function Celebration({ onContinue }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const colors = ['#2dd4bf', '#34d399', '#fbbf24', '#f87171', '#5eead4', '#f472b6', '#60a5fa'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: colors.bg.base }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative text-center z-10 k-fade-in">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: colors.accent.primary, boxShadow: `0 0 60px ${colors.accent.primary}40` }}>
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-[36px] font-extrabold mb-3" style={{ color: colors.text.primary }}>Welcome to Kairo!</h1>
        <p className="text-[16px] mb-10" style={{ color: colors.text.muted }}>Your account is ready. Let's get you set up.</p>
        <button onClick={onContinue} className="px-10 py-4 rounded-xl text-[16px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]" style={{ background: colors.accent.primary }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding Steps ────────────────────────────────────────────────────────

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo1',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo2',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo3',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo4',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo5',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=kairo6',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=kairo7',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=kairo8',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=kairo9',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=kairo10',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=kairo11',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=kairo12',
];

const INTERESTS = [
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'anime', label: 'Anime', icon: Sparkles },
  { id: 'sports', label: 'Sports', icon: Dumbbell },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'cooking', label: 'Cooking', icon: UtensilsCrossed },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'finance', label: 'Finance', icon: TrendingUp },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
];

function StepUsername({ data, onChange, onNext }) {
  const [username, setUsername] = useState(data.username || '');
  const [status, setStatus] = useState(null);
  const debounce = useRef(null);

  const check = useCallback((val) => {
    clearTimeout(debounce.current);
    if (!val || val.length < 3) { setStatus(null); return; }
    setStatus('checking');
    debounce.current = setTimeout(async () => {
      try {
        const existing = await base44.entities.UserProfile.filter({ username: val.toLowerCase() });
        setStatus(existing.length === 0 ? 'available' : 'taken');
      } catch { setStatus('available'); }
    }, 400);
  }, []);

  return (
    <div>
      <h2 className="text-[24px] font-extrabold mb-2" style={{ color: colors.text.primary }}>Choose a username</h2>
      <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>This is how others will find you on Kairo.</p>
      <div className="relative">
        <input type="text" value={username}
          onChange={e => { const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20); setUsername(v); check(v); onChange({ username: v }); }}
          placeholder="Pick a username" autoFocus
          className="w-full px-4 py-3 rounded-xl text-[16px] outline-none pr-10" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${status === 'taken' ? colors.danger : status === 'available' ? colors.success : colors.border.subtle}` }} />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {status === 'available' && <Check className="w-5 h-5" style={{ color: colors.success }} />}
          {status === 'taken' && <X className="w-5 h-5" style={{ color: colors.danger }} />}
          {status === 'checking' && <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.subtle, borderTopColor: colors.accent.primary }} />}
        </div>
      </div>
      {status === 'taken' && <p className="text-[12px] mt-2" style={{ color: colors.danger }}>That username is taken. Try another.</p>}
      {status === 'available' && <p className="text-[12px] mt-2" style={{ color: colors.success }}>Username available!</p>}
    </div>
  );
}

function StepAvatar({ data, onChange }) {
  const [selected, setSelected] = useState(data.avatar || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSelected(file_url);
      onChange({ avatar: file_url });
    } catch { /* ignore */ }
    setUploading(false);
  };

  return (
    <div>
      <h2 className="text-[24px] font-extrabold mb-2" style={{ color: colors.text.primary }}>Pick an avatar</h2>
      <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>Upload a photo or choose from our collection.</p>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center" style={{ background: colors.bg.elevated, border: `3px solid ${colors.accent.primary}` }}>
            {selected ? <img src={selected} alt="" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8" style={{ color: colors.text.muted }} />}
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: colors.accent.primary }}>
            {uploading ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> : <Upload className="w-4 h-4 text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>
      <p className="text-[12px] font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: colors.text.muted }}>Or choose one</p>
      <div className="grid grid-cols-6 gap-3">
        {DEFAULT_AVATARS.map((url, i) => (
          <button key={i} onClick={() => { setSelected(url); onChange({ avatar: url }); }}
            className="w-full aspect-square rounded-full overflow-hidden transition-all hover:scale-110"
            style={{ border: selected === url ? `3px solid ${colors.accent.primary}` : `2px solid ${colors.border.subtle}`, opacity: selected === url ? 1 : 0.7 }}>
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInterests({ data, onChange }) {
  const [selected, setSelected] = useState(data.interests || []);

  const toggle = (id) => {
    const next = selected.includes(id) ? selected.filter(x => x !== id) : selected.length < 5 ? [...selected, id] : selected;
    setSelected(next);
    onChange({ interests: next });
  };

  return (
    <div>
      <h2 className="text-[24px] font-extrabold mb-2" style={{ color: colors.text.primary }}>What are you into?</h2>
      <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>Pick 3 to 5 interests. We'll suggest servers you'll love.</p>
      <div className="grid grid-cols-3 gap-3">
        {INTERESTS.map(i => {
          const active = selected.includes(i.id);
          return (
            <button key={i.id} onClick={() => toggle(i.id)}
              className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: active ? `${colors.accent.primary}15` : colors.elevated, border: `1px solid ${active ? colors.accent.primary : colors.border.subtle}` }}>
              <i.icon className="w-5 h-5" style={{ color: active ? colors.accent.primary : colors.text.muted }} />
              <span className="text-[12px] font-semibold" style={{ color: active ? colors.text.primary : colors.text.secondary }}>{i.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[12px] text-center mt-3" style={{ color: colors.text.muted }}>{selected.length}/5 selected</p>
    </div>
  );
}

function StepFirstServer({ data, onChange }) {
  const options = [
    { id: 'create', icon: Sparkles, title: 'Create my own server', desc: 'Start fresh with your own community. You\'re the boss.' },
    { id: 'browse', icon: Search, title: 'Browse suggested servers', desc: 'Discover communities based on your interests.' },
    { id: 'explore', icon: Globe, title: 'Explore on my own', desc: 'Skip for now and find servers at your own pace.' },
  ];

  return (
    <div>
      <h2 className="text-[24px] font-extrabold mb-2" style={{ color: colors.text.primary }}>Your first server</h2>
      <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>How do you want to start?</p>
      <div className="space-y-3">
        {options.map(o => {
          const active = data.firstServer === o.id;
          return (
            <button key={o.id} onClick={() => onChange({ firstServer: o.id })}
              className="w-full flex items-start gap-4 p-5 rounded-xl transition-all text-left hover:scale-[1.01]"
              style={{ background: active ? `${colors.accent.primary}10` : colors.elevated, border: `1px solid ${active ? colors.accent.primary : colors.border.subtle}` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: active ? `${colors.accent.primary}20` : colors.bg.overlay }}>
                <o.icon className="w-6 h-6" style={{ color: active ? colors.accent.primary : colors.text.muted }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold mb-1" style={{ color: colors.text.primary }}>{o.title}</h3>
                <p className="text-[13px]" style={{ color: colors.text.muted }}>{o.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPWA({ data, onChange }) {
  const [canInstall, setCanInstall] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); deferredPrompt.current = e; setCanInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: colors.accent.primary }}>
        <Crown className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-[24px] font-extrabold mb-2" style={{ color: colors.text.primary }}>Install Kairo</h2>
      <p className="text-[14px] mb-8" style={{ color: colors.text.muted }}>
        Get the full app experience. Install Kairo on your device for faster access and notifications.
      </p>
      {canInstall ? (
        <button onClick={install} className="px-8 py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110" style={{ background: colors.accent.primary }}>
          Install App
        </button>
      ) : (
        <p className="text-[13px] px-6 py-3 rounded-xl" style={{ background: colors.bg.elevated, color: colors.text.muted }}>
          Open Kairo in Chrome or Edge to install as an app, or just use it in your browser.
        </p>
      )}
    </div>
  );
}

// ─── Onboarding Flow ─────────────────────────────────────────────────────────

function Onboarding({ signupData }) {
  const [step, setStep] = useState(signupData?.username ? 1 : 0);
  const [data, setData] = useState({ username: signupData?.username || '', avatar: '', interests: [], firstServer: '' });
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  const update = (partial) => setData(prev => ({ ...prev, ...partial }));

  const finish = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.me();
      if (!me) { window.location.href = '/'; return; }
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      const profileData = {
        display_name: data.username || me.full_name || me.email?.split('@')[0],
        username: data.username || me.email?.split('@')[0],
        avatar_url: data.avatar || '',
        interests: data.interests,
        status: 'online',
        is_online: true,
      };
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, profileData);
      } else {
        await base44.entities.UserProfile.create({ user_id: me.id, user_email: me.email, ...profileData });
      }
    } catch (err) {
      console.warn('Onboarding save failed:', err);
    }
    window.location.href = '/';
  };

  const canNext = () => {
    if (step === 0) return data.username.length >= 3;
    return true;
  };

  const next = () => {
    if (step === totalSteps - 1) { finish(); return; }
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };

  const steps = [
    <StepUsername data={data} onChange={update} onNext={next} />,
    <StepAvatar data={data} onChange={update} />,
    <StepInterests data={data} onChange={update} />,
    <StepFirstServer data={data} onChange={update} />,
    <StepPWA data={data} onChange={update} />,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: colors.bg.base }}>
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= step ? colors.accent.primary : 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>

        <div className="rounded-2xl p-8" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.subtle}` }}>
          {steps[step]}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="flex items-center gap-1 text-[13px] font-semibold transition-opacity disabled:opacity-30 hover:opacity-100" style={{ color: colors.text.secondary }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => { if (step < totalSteps - 1) setStep(s => s + 1); else finish(); }}
            className="text-[13px] font-semibold" style={{ color: colors.text.muted }}>
            Skip
          </button>
          <button onClick={next} disabled={!canNext() || saving}
            className="flex items-center gap-1 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
            style={{ background: colors.accent.primary }}>
            {saving ? 'Saving...' : step === totalSteps - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Register Page ──────────────────────────────────────────────────────

export default function Register() {
  const [method, setMethod] = useState('email');
  const [phase, setPhase] = useState('signup');
  const [signupData, setSignupData] = useState(null);

  const handleSuccess = (data) => {
    setSignupData(data);
    setPhase('celebration');
  };

  if (phase === 'celebration') return <Celebration onContinue={() => setPhase('onboarding')} />;
  if (phase === 'onboarding') return <Onboarding signupData={signupData} />;

  const methods = [
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'secret_key', icon: Key, label: 'Secret Key' },
    { id: 'google', icon: Globe, label: 'Google' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: colors.bg.void, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12" style={{ background: colors.bg.void }}>
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: colors.accent.primary }}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 style={{ fontSize: typography['3xl'].size, fontWeight: typography.weight.bold, color: colors.text.primary, marginBottom: 8 }}>Kairo</h1>
          <p style={{ fontSize: typography.body.size, color: colors.text.muted }}>A better place to talk. Free. Private. No ads.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: colors.bg.base }}>
        <div className="w-full max-w-[440px] relative">
          <div className="text-center mb-8 lg:hidden">
            <a href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: colors.accent.primary }}>
                <Crown className="w-5 h-5 text-white" />
              </div>
            </a>
          </div>
          <h1 className="text-[28px] font-extrabold mb-1" style={{ color: colors.text.primary }}>Create an account</h1>
          <p className="mb-6" style={{ fontSize: typography.base.size, color: colors.text.muted }}>Choose how you want to join Kairo</p>

          <div className="flex rounded-xl p-1 mb-6" style={{ background: colors.bg.elevated }}>
            {methods.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
                style={{ background: method === m.id ? colors.accent.primary : 'transparent', color: method === m.id ? '#fff' : colors.text.muted, fontSize: typography.compact.size, fontWeight: typography.weight.semibold }}>
                <m.icon className="w-4 h-4" /> {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl p-8" style={{ background: colors.bg.float, border: `1px solid ${colors.border.medium}`, boxShadow: shadows.xl }}>
            {method === 'email' && <EmailSignup onSuccess={handleSuccess} />}
            {method === 'secret_key' && <SecretKeySignup onSuccess={handleSuccess} />}
            {method === 'google' && <GoogleSignup onSuccess={handleSuccess} />}
          </div>

          <div className="text-center mt-6">
            <p style={{ fontSize: typography.compact.size, color: colors.text.muted }}>
              Already have an account?{' '}
              <a href="/login" className="font-semibold hover:underline" style={{ color: colors.accent.primary }}>Sign in</a>
            </p>
          </div>
          <p className="text-center mt-4" style={{ fontSize: typography.sm.size, color: colors.text.muted }}>
            <a href="/" className="hover:underline" style={{ color: colors.text.secondary }}>Back to Kairo</a>
          </p>
        </div>
      </div>
    </div>
  );
}
