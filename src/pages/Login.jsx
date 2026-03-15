import React, { useState } from 'react';
import { Crown, Mail, Key, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { checkRateLimit, getRemainingAttempts } from '@/lib/security/rateLimiter';
import { validateEmail } from '@/lib/security/sanitizer';
import { colors, typography } from '@/components/app/design/tokens';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function FormInput({ label, error: fieldError, right, className, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-2" style={{ fontSize: typography.label.size, fontWeight: typography.weight.semibold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>{label}</label>}
      <div className="relative">
        <Input {...props} className={cn("h-11 rounded-xl px-4", right && "pr-11", fieldError && "border-[var(--color-danger)]", className)} style={{ background: colors.bg.base, borderColor: fieldError ? colors.danger : undefined }} />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {fieldError && <p className="mt-1" style={{ fontSize: typography.sm.size, color: colors.danger }}>{fieldError}</p>}
    </div>
  );
}

// ─── Email Login ─────────────────────────────────────────────────────────────

function EmailLogin({ onForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const rateCheck = checkRateLimit('login', email);
    if (!rateCheck.allowed) {
      setError('Too many tries. Wait a few minutes and try again.');
      return;
    }
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('returnUrl') || '/';
    } catch (err) {
      const remaining = getRemainingAttempts('login', email);
      if (remaining <= 0) {
        setError('Too many tries. Wait a few minutes and try again.');
      } else {
        setError(`That doesn't match. Double check and try again. (${remaining} attempts left)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: `${colors.danger}20`, color: colors.danger, fontSize: typography.compact.size, fontWeight: typography.weight.medium }}>{error}</div>}
      <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
      <div className="mb-2">
        <FormInput label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Your password" autoComplete="current-password" required
          right={
            <button type="button" onClick={() => setShowPw(!showPw)} className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors" tabIndex={-1}>
              {showPw ? <EyeOff className="w-4 h-4" style={{ color: colors.text.muted }} /> : <Eye className="w-4 h-4" style={{ color: colors.text.muted }} />}
            </button>
          }
        />
      </div>
      <div className="flex justify-end mb-5">
        <button type="button" onClick={onForgot} className="hover:underline transition-opacity" style={{ fontSize: typography.sm.size, fontWeight: typography.weight.semibold, color: colors.accent.primary }}>
          Forgot password?
        </button>
      </div>
      <Button type="submit" disabled={loading} loading={loading} className="w-full h-11 rounded-xl">
        {loading ? 'Signing in...' : 'Log In'}
      </Button>
    </form>
  );
}

// ─── Secret Key Login ────────────────────────────────────────────────────────

function SecretKeyLogin() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!key.trim() || key.trim().length < 20) {
      setError('Please enter a valid secret key');
      return;
    }

    const rateCheck = checkRateLimit('login', key.slice(0, 12));
    if (!rateCheck.allowed) {
      setError('Too many tries. Wait a few minutes and try again.');
      return;
    }

    setLoading(true);
    try {
      const email = `${key.trim().slice(0, 12).toLowerCase()}@secretkey.kairo.app`;
      await base44.auth.loginViaEmailPassword(email, key.trim());
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get('returnUrl') || '/';
    } catch {
      const remaining = getRemainingAttempts('login', key.slice(0, 12));
      if (remaining <= 0) {
        setError('Too many tries. Wait a few minutes and try again.');
      } else {
        setError(`We couldn't find that account. Check your key and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: `${colors.danger}20`, color: colors.danger, fontSize: typography.compact.size, fontWeight: typography.weight.medium }}>{error}</div>}
      <div className="p-4 rounded-xl mb-5" style={{ background: colors.accent.dim, border: `1px solid ${colors.accent.glow}` }}>
        <p style={{ fontSize: typography.compact.size, color: colors.text.secondary }}>
          Paste the 24-character secret key you saved when you created your account.
        </p>
      </div>
      <FormInput label="Secret Key" type="text" value={key} onChange={e => setKey(e.target.value)}
        placeholder="Paste your secret key" autoComplete="off" required />
      <Button type="submit" disabled={loading} loading={loading} className="w-full h-11 rounded-xl">
        {loading ? 'Signing in...' : 'Log In with Secret Key'}
      </Button>
    </form>
  );
}

// ─── Google Login ────────────────────────────────────────────────────────────

function GoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await base44.auth.loginWithProvider('google');
    } catch (err) {
      setError(err.message || 'Google sign-in didn\'t work. Try again or use another method.');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: `${colors.danger}20`, color: colors.danger, fontSize: typography.compact.size, fontWeight: typography.weight.medium }}>{error}</div>}
      <Button onClick={handleGoogle} disabled={loading} variant="outline" className="w-full h-11 rounded-xl gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        {loading ? 'Connecting...' : 'Continue with Google'}
      </Button>
      <p className="text-center mt-4" style={{ fontSize: typography.sm.size, color: colors.text.muted }}>
        You'll be redirected to Google to sign in.
      </p>
    </div>
  );
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Couldn\'t send the reset email. Check your address and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${colors.success}20` }}>
          <Check className="w-7 h-7" style={{ color: colors.success }} />
        </div>
        <h2 className="mb-2" style={{ fontSize: typography.title.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Check your email</h2>
        <p className="mb-6" style={{ fontSize: typography.base.size, color: colors.text.muted }}>
          We sent a password reset link to <strong style={{ color: colors.text.secondary }}>{email}</strong>. Check your inbox and spam folder.
        </p>
        <button onClick={onBack} className="hover:underline" style={{ fontSize: typography.compact.size, fontWeight: typography.weight.semibold, color: colors.accent.primary }}>
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={onBack} className="flex items-center gap-1 mb-5 hover:underline" style={{ fontSize: typography.compact.size, fontWeight: typography.weight.semibold, color: colors.accent.primary }}>
        <ArrowLeft className="w-4 h-4" /> Back to login
      </button>
      <h2 className="mb-2" style={{ fontSize: typography.title.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Reset your password</h2>
      <p className="mb-6" style={{ fontSize: typography.base.size, color: colors.text.muted }}>Enter your email and we'll send you a reset link.</p>
      {error && <div className="mb-4 px-4 py-3 rounded-xl" style={{ background: `${colors.danger}20`, color: colors.danger, fontSize: typography.compact.size, fontWeight: typography.weight.medium }}>{error}</div>}
      <FormInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
      <Button type="submit" disabled={loading} loading={loading} className="w-full h-11 rounded-xl">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  );
}

// ─── Main Login Page ─────────────────────────────────────────────────────────

export default function Login() {
  const [method, setMethod] = useState('email');
  const [view, setView] = useState('login');

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
          <h1 className="text-[28px] font-extrabold mb-1" style={{ color: colors.text.primary }}>Welcome back</h1>
          <p className="mb-6" style={{ fontSize: typography.base.size, color: colors.text.muted }}>Sign in to Kairo</p>

          {view === 'login' && (
            <>
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
                {method === 'email' && <EmailLogin onForgot={() => setView('forgot')} />}
                {method === 'secret_key' && <SecretKeyLogin />}
                {method === 'google' && <GoogleLogin />}
              </div>
            </>
          )}

          {view === 'forgot' && (
            <div className="rounded-xl p-8" style={{ background: colors.bg.float, border: `1px solid ${colors.border.medium}`, boxShadow: shadows.xl }}>
              <ForgotPassword onBack={() => setView('login')} />
            </div>
          )}

          <div className="text-center mt-6">
            <p style={{ fontSize: typography.compact.size, color: colors.text.muted }}>
              Don't have an account?{' '}
              <a href="/register" className="font-semibold hover:underline" style={{ color: colors.accent.primary }}>Sign up</a>
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
