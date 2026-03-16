/**
 * Kairo Settings — Kloak-style card layout. Account, Privacy, Notifications, Danger zone.
 */
import React, { useState } from 'react';
import { User, Shield, Bell, LogOut, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const SIDEBAR_STYLE = {
  width: 200,
  padding: '24px 12px',
  borderRight: '1px solid rgba(255,255,255,0.04)',
  flexShrink: 0,
  background: '#0d0d0f',
};

const NAV_LABEL_STYLE = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#555566',
  padding: '0 8px 8px',
};

const NAV_ITEM_STYLE = (active) => ({
  height: 36,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '0 8px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: active ? 500 : 400,
  color: active ? '#ffffff' : '#888899',
  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left',
  transition: 'background 100ms ease, color 100ms ease',
});

const CARD_STYLE = {
  background: '#111114',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 14,
};

const CARD_ICON_STYLE = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888899',
  flexShrink: 0,
};

const SECTIONS = [
  { id: 'account', label: 'User Settings', icon: User },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Account', icon: LogOut, danger: true },
];

export default function KairoSettingsView({ onClose }) {
  const { user, checkAppState } = useAuth();
  const [section, setSection] = useState('account');
  const [displayName, setDisplayName] = useState(user?.full_name || '');

  const handleLogout = async () => {
    try {
      await base44.auth.logout(`${window.location.origin}/login`);
      toast.success('Signed out');
    } catch (e) {
      toast.error(e?.message || 'Sign out failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    try {
      await base44.auth.updateMe({ full_name: displayName.trim() || undefined });
      await checkAppState?.();
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e?.message || 'Update failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0a0a0b', flex: 1, minWidth: 0 }}>
      {/* Left nav */}
      <nav style={SIDEBAR_STYLE}>
        <div style={NAV_LABEL_STYLE}>Settings</div>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            style={NAV_ITEM_STYLE(section === s.id)}
            onClick={() => setSection(s.id)}
          >
            <s.icon size={18} style={s.danger ? { color: '#ef4444' } : {}} />
            {s.label}
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: section === s.id ? 1 : 0.3 }} />
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {SECTIONS.find((s) => s.id === section)?.label || 'Settings'}
          </h1>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 14,
              color: '#888899',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Back to app
          </button>
        </div>

        {section === 'account' && (
          <>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 24 }}>
              Manage your account and profile.
            </p>
            <div style={CARD_STYLE}>
              <div style={CARD_ICON_STYLE}>
                <User size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>Display name</div>
                <p style={{ fontSize: 13, color: '#888899', marginBottom: 12 }}>
                  This is how others see you in servers and DMs.
                </p>
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="k-input"
                    style={{ marginBottom: 0, flex: 1, maxWidth: 280 }}
                  />
                  <button type="submit" className="k-btn k-btn-primary">Save</button>
                </form>
              </div>
            </div>
            <div style={CARD_STYLE}>
              <div style={CARD_ICON_STYLE}>
                <User size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>Email</div>
                <p style={{ fontSize: 13, color: '#888899' }}>{user?.email || '—'}</p>
              </div>
            </div>
          </>
        )}

        {section === 'privacy' && (
          <>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 24 }}>
              Control who can message you and what others see.
            </p>
            <div style={CARD_STYLE}>
              <div style={CARD_ICON_STYLE}>
                <Shield size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>Privacy</div>
                <p style={{ fontSize: 13, color: '#888899' }}>
                  More privacy options coming soon. For now, only people with your invite link can join servers you create.
                </p>
              </div>
            </div>
          </>
        )}

        {section === 'notifications' && (
          <>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 24 }}>
              Choose what you get notified about.
            </p>
            <div style={CARD_STYLE}>
              <div style={CARD_ICON_STYLE}>
                <Bell size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>Notifications</div>
                <p style={{ fontSize: 13, color: '#888899' }}>
                  Notification preferences will be available in a future update.
                </p>
              </div>
            </div>
          </>
        )}

        {section === 'danger' && (
          <>
            <p style={{ fontSize: 13, color: '#888899', marginBottom: 24 }}>
              Sign out or manage your account.
            </p>
            <div style={{ ...CARD_STYLE, borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
              <div style={{ ...CARD_ICON_STYLE, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                <LogOut size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#ef4444', marginBottom: 4 }}>Sign out</div>
                <p style={{ fontSize: 13, color: '#888899', marginBottom: 12 }}>
                  Sign out of Kairo on this device. You can sign back in anytime.
                </p>
                <button type="button" onClick={handleLogout} className="k-btn k-btn-danger">
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
