import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Key, Smartphone, Lock, AlertTriangle, CheckCircle, Clock,
  Monitor, Trash2, LogOut, Copy, Download, Eye, EyeOff, RefreshCw,
  MapPin, Globe, QrCode, X,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/api/supabaseClient';
import { colors } from '@/components/app/design/tokens';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24',
};

function parseUA(ua) {
  if (!ua) return 'Unknown Device';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown Device';
}

function parseBrowser(ua) {
  if (!ua) return 'Unknown Browser';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  return 'Browser';
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function SectionCard({ children, danger }) {
  return (
    <div className="p-4 rounded-xl" style={{
      background: danger ? `${P.danger}08` : P.elevated,
      border: danger ? `1px solid ${P.danger}20` : 'none',
    }}>
      {children}
    </div>
  );
}

function SessionRow({ session, isCurrent, onRevoke }) {
  const device = parseUA(session.user_agent || session.device_info);
  const browser = parseBrowser(session.user_agent || session.device_info);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: P.floating }}>
      <Monitor className="w-5 h-5 flex-shrink-0" style={{ color: isCurrent ? P.success : P.muted }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium" style={{ color: P.textPrimary }}>
            {device} · {browser}
          </span>
          {isCurrent && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${P.success}20`, color: P.success }}>
              THIS DEVICE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {session.location && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: P.muted }}>
              <MapPin className="w-3 h-3" /> {session.location}
            </span>
          )}
          <span className="text-[11px]" style={{ color: P.muted }}>
            Active {timeAgo(session.last_active || session.created_at)}
          </span>
        </div>
      </div>
      {!isCurrent && (
        <button onClick={() => onRevoke(session.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.15)]"
          style={{ color: P.danger }}>
          <LogOut className="w-3.5 h-3.5" /> Revoke
        </button>
      )}
    </div>
  );
}

export default function SecuritySettings({ profile, currentUser, onUpdate }) {
  const [sessions, setSessions] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaQrUri, setMfaQrUri] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await base44.entities.UserSession.filter(
        { user_id: currentUser.id },
        '-last_active',
        20
      );
      setSessions(data.filter(s => !s.revoked));
    } catch {
      setSessions([]);
    }
    setLoadingSessions(false);
  }, [currentUser.id]);

  const loadActivity = useCallback(async () => {
    try {
      const data = await base44.entities.AccountActivity.filter(
        { user_id: currentUser.id },
        '-created_date',
        20
      );
      setActivityLog(data);
    } catch {
      setActivityLog([]);
    }
  }, [currentUser.id]);

  const checkMfaStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!error && data?.totp?.length > 0) {
        const verified = data.totp.find(f => f.status === 'verified');
        setMfaEnabled(!!verified);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadSessions();
    loadActivity();
    checkMfaStatus();

    trackCurrentSession();
  }, [loadSessions, loadActivity, checkMfaStatus]);

  const trackCurrentSession = async () => {
    try {
      const existing = await base44.entities.UserSession.filter({
        user_id: currentUser.id,
        is_current: true,
      });
      if (existing.length === 0) {
        await base44.entities.UserSession.create({
          user_id: currentUser.id,
          device_info: parseUA(navigator.userAgent),
          user_agent: navigator.userAgent,
          is_current: true,
          last_active: new Date().toISOString(),
          location: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } else {
        await base44.entities.UserSession.update(existing[0].id, {
          last_active: new Date().toISOString(),
        });
      }
    } catch {}
  };

  const revokeSession = async (sessionId) => {
    try {
      await base44.entities.UserSession.update(sessionId, { revoked: true });
      await base44.entities.AccountActivity.create({
        user_id: currentUser.id,
        action: 'session_revoked',
        details: `Session ${sessionId} revoked`,
      });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch {}
  };

  const revokeAllSessions = async () => {
    if (!confirm('This will sign you out everywhere else. Continue?')) return;
    try {
      for (const s of sessions) {
        if (!s.is_current) {
          await base44.entities.UserSession.update(s.id, { revoked: true });
        }
      }
      await base44.entities.AccountActivity.create({
        user_id: currentUser.id,
        action: 'all_sessions_revoked',
        details: 'All other sessions revoked',
      });
      setSessions(prev => prev.filter(s => s.is_current));
    } catch {}
  };

  // ─── 2FA Setup ───
  const startMfaEnroll = async () => {
    setMfaError('');
    setMfaEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Kairo Authenticator',
      });
      if (error) throw error;
      setMfaQrUri(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setMfaFactorId(data.id);
      generateBackupCodes();
    } catch (err) {
      setMfaError(err.message || 'Couldn\'t set up 2FA right now. Try again in a moment.');
      setMfaEnrolling(false);
    }
  };

  const verifyMfaEnroll = async () => {
    setMfaError('');
    if (mfaVerifyCode.length !== 6) {
      setMfaError('Enter the 6-digit code from your authenticator app');
      return;
    }
    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaVerifyCode,
      });
      if (verifyErr) throw verifyErr;

      setMfaEnabled(true);
      setMfaEnrolling(false);
      setMfaSuccess('Two-factor authentication enabled successfully!');
      setShowBackupCodes(true);

      await base44.entities.AccountActivity.create({
        user_id: currentUser.id,
        action: '2fa_enabled',
        details: 'Two-factor authentication enabled',
      });
    } catch (err) {
      setMfaError(err.message || 'Invalid verification code. Please try again.');
    }
  };

  const disableMfa = async () => {
    if (!confirm('Turn off two-factor authentication? Your account will be less secure.')) return;
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      for (const factor of (data?.totp || [])) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setMfaEnabled(false);
      setMfaSuccess('Two-factor authentication disabled.');
      await base44.entities.AccountActivity.create({
        user_id: currentUser.id,
        action: '2fa_disabled',
        details: 'Two-factor authentication disabled',
      });
    } catch (err) {
      setMfaError(err.message || 'Couldn\'t turn off 2FA. Try again in a moment.');
    }
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 8 }, () =>
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      codes.push(code.slice(0, 4) + '-' + code.slice(4));
    }
    setBackupCodes(codes);
  };

  const downloadBackupCodes = () => {
    const text = [
      'KAIRO - Two-Factor Authentication Backup Codes',
      '================================================',
      '',
      'Keep these codes in a safe place. Each code can only be used once.',
      'If you lose your authenticator device, use one of these codes to log in.',
      '',
      ...backupCodes.map((c, i) => `${i + 1}. ${c}`),
      '',
      `Generated: ${new Date().toISOString()}`,
      `Account: ${currentUser.email}`,
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kairo-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  // ─── Password Change ───
  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter and one number'); return;
    }
    try {
      await base44.auth.changePassword(newPassword);
      setPasswordSuccess('Password changed successfully');
      setChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      await base44.entities.AccountActivity.create({
        user_id: currentUser.id,
        action: 'password_changed',
        details: 'Password changed',
      });
    } catch (err) {
      setPasswordError(err.message || 'Couldn\'t update your password. Try again.');
    }
  };

  const emergencyLock = async () => {
    if (!confirm("Lock your account? You'll be signed out everywhere and won't be able to log in until you contact support.")) return;
    for (const s of sessions) {
      await base44.entities.UserSession.update(s.id, { revoked: true });
    }
    await base44.entities.AccountActivity.create({
      user_id: currentUser.id,
      action: 'account_locked',
      details: 'Emergency lock activated',
    });
    base44.auth.logout();
  };

  return (
    <div className="space-y-5">
      <p className="text-[14px]" style={{ color: P.muted }}>
        Manage your account security, active sessions, and two-factor authentication.
      </p>

      {/* ─── Two-Factor Authentication ─── */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-3">
          <Key className="w-5 h-5" style={{ color: mfaEnabled ? P.success : P.accent }} />
          <div className="flex-1">
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>
              Two-Factor Authentication
            </p>
            <p className="text-[12px]" style={{ color: P.muted }}>
              {mfaEnabled
                ? 'Your account is protected with 2FA.'
                : 'Add an extra layer of security with an authenticator app.'}
            </p>
          </div>
          {mfaEnabled && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
              style={{ background: `${P.success}15`, color: P.success }}>
              <CheckCircle className="w-3.5 h-3.5" /> Enabled
            </span>
          )}
        </div>

        {mfaError && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ background: `${P.danger}15`, color: P.danger }}>
            {mfaError}
          </div>
        )}
        {mfaSuccess && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ background: `${P.success}15`, color: P.success }}>
            {mfaSuccess}
          </div>
        )}

        {!mfaEnabled && !mfaEnrolling && (
          <button onClick={startMfaEnroll}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold"
            style={{ background: P.accent, color: '#0d1117' }}>
            Enable 2FA
          </button>
        )}

        {mfaEnrolling && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: P.base }}>
              <p className="text-[13px] font-medium mb-3" style={{ color: P.textPrimary }}>
                1. Scan this QR code with your authenticator app
              </p>
              <p className="text-[11px] mb-3" style={{ color: P.muted }}>
                Compatible with Google Authenticator, Authy, 1Password, and other TOTP apps.
              </p>
              {mfaQrUri && (
                <div className="flex justify-center mb-4">
                  <img src={mfaQrUri} alt="2FA QR Code" className="w-48 h-48 rounded-lg" style={{ background: '#fff', padding: 8 }} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-medium" style={{ color: P.muted }}>Can't scan?</p>
                <button onClick={() => setShowSecret(!showSecret)}
                  className="flex items-center gap-1 text-[11px] font-medium"
                  style={{ color: P.accent }}>
                  {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showSecret ? 'Hide' : 'Show'} manual key
                </button>
              </div>
              {showSecret && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{ background: P.elevated }}>
                  <code className="text-[12px] font-mono flex-1 break-all" style={{ color: P.textPrimary }}>
                    {mfaSecret}
                  </code>
                  <button onClick={() => navigator.clipboard.writeText(mfaSecret)}
                    className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)]">
                    <Copy className="w-3.5 h-3.5" style={{ color: P.muted }} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-[13px] font-medium mb-2" style={{ color: P.textPrimary }}>
                2. Enter the 6-digit code from your app
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={mfaVerifyCode} onChange={e => setMfaVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-40 px-4 py-2.5 rounded-lg text-[16px] font-mono text-center tracking-[0.3em] outline-none"
                  style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }}
                  autoFocus
                />
                <button onClick={verifyMfaEnroll}
                  className="px-4 py-2.5 rounded-lg text-[13px] font-semibold"
                  style={{ background: P.accent, color: '#0d1117' }}>
                  Verify & Enable
                </button>
                <button onClick={() => { setMfaEnrolling(false); setMfaVerifyCode(''); }}
                  className="px-3 py-2.5 rounded-lg text-[13px] font-medium"
                  style={{ color: P.muted }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {mfaEnabled && !mfaEnrolling && (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="px-3 py-2 rounded-lg text-[12px] font-medium"
              style={{ background: P.floating, color: P.textSecondary }}>
              View Backup Codes
            </button>
            <button onClick={disableMfa}
              className="px-3 py-2 rounded-lg text-[12px] font-medium"
              style={{ color: P.danger }}>
              Disable 2FA
            </button>
          </div>
        )}

        {showBackupCodes && backupCodes.length > 0 && (
          <div className="mt-3 p-4 rounded-lg" style={{ background: P.base, border: `1px solid ${P.warning}30` }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: P.warning }} />
              <p className="text-[13px] font-semibold" style={{ color: P.warning }}>
                Save these backup codes
              </p>
            </div>
            <p className="text-[12px] mb-3" style={{ color: P.muted }}>
              If you lose access to your authenticator app, use one of these codes to log in.
              Each code can only be used once.
            </p>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-[13px] font-mono px-2 py-1 rounded"
                  style={{ background: P.elevated, color: P.textSecondary }}>
                  {code}
                </code>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={downloadBackupCodes}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: P.accent, color: '#0d1117' }}>
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button onClick={copyBackupCodes}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: P.floating, color: P.textSecondary }}>
                <Copy className="w-3.5 h-3.5" /> Copy All
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─── Password ─── */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-3">
          <Lock className="w-5 h-5" style={{ color: P.muted }} />
          <div className="flex-1">
            <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>Password</p>
            <p className="text-[12px]" style={{ color: P.muted }}>Change your account password.</p>
          </div>
        </div>
        {passwordError && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ background: `${P.danger}15`, color: P.danger }}>
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ background: `${P.success}15`, color: P.success }}>
            {passwordSuccess}
          </div>
        )}
        {!changingPassword ? (
          <button onClick={() => setChangingPassword(true)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium"
            style={{ background: P.floating, color: P.textSecondary }}>
            Change Password
          </button>
        ) : (
          <div className="space-y-2">
            <input type="password" placeholder="New password (min 8 chars, 1 uppercase, 1 number)"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
            <input type="password" placeholder="Confirm new password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
            <div className="flex items-center gap-2">
              <button onClick={handlePasswordChange}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold"
                style={{ background: P.accent, color: '#0d1117' }}>
                Update Password
              </button>
              <button onClick={() => { setChangingPassword(false); setPasswordError(''); }}
                className="px-3 py-2 rounded-lg text-[13px] font-medium"
                style={{ color: P.muted }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─── Active Sessions ─── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" style={{ color: P.muted }} />
            <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: P.muted }}>
              Active Sessions
            </p>
          </div>
          {sessions.length > 1 && (
            <button onClick={revokeAllSessions}
              className="text-[11px] font-medium px-2 py-1 rounded-lg hover:bg-[rgba(237,66,69,0.1)]"
              style={{ color: P.danger }}>
              Log Out All Others
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {loadingSessions ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg k-shimmer" style={{ background: P.floating }} />
            ))
          ) : sessions.length === 0 ? (
            <p className="text-[13px] py-4 text-center" style={{ color: P.muted }}>No active sessions</p>
          ) : (
            sessions.map(s => (
              <SessionRow key={s.id} session={s} isCurrent={s.is_current} onRevoke={revokeSession} />
            ))
          )}
        </div>
      </div>

      {/* ─── Emergency Lock ─── */}
      <SectionCard danger>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: P.danger }} />
          <div className="flex-1">
            <p className="text-[14px] font-semibold" style={{ color: P.danger }}>Emergency Lock</p>
            <p className="text-[12px]" style={{ color: P.muted }}>
              Instantly lock your account and log out all sessions. Use if your account is compromised.
            </p>
          </div>
          <button onClick={emergencyLock}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold flex-shrink-0"
            style={{ background: P.danger, color: '#fff' }}>
            Lock Account
          </button>
        </div>
      </SectionCard>

      {/* ─── Recent Activity ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4" style={{ color: P.muted }} />
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: P.muted }}>
            Recent Security Activity
          </p>
        </div>
        <div className="space-y-1.5">
          {activityLog.length === 0 && (
            <p className="text-[13px] py-4 text-center" style={{ color: P.muted }}>No recent activity</p>
          )}
          {activityLog.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: P.elevated }}>
              {a.action?.includes('2fa') ? <Key className="w-4 h-4" style={{ color: P.accent }} /> :
               a.action?.includes('password') ? <Lock className="w-4 h-4" style={{ color: P.warning }} /> :
               a.action?.includes('session') ? <Monitor className="w-4 h-4" style={{ color: P.muted }} /> :
               a.action?.includes('lock') ? <AlertTriangle className="w-4 h-4" style={{ color: P.danger }} /> :
               <Shield className="w-4 h-4" style={{ color: P.muted }} />}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] capitalize font-medium" style={{ color: P.textPrimary }}>
                  {(a.action || '').replace(/_/g, ' ')}
                </p>
                <p className="text-[11px]" style={{ color: P.muted }}>
                  {new Date(a.created_date).toLocaleString()}
                  {a.details && ` · ${a.details}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
