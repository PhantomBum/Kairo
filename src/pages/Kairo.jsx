import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ProfileProvider } from '@/components/app/providers/ProfileProvider';
import ErrorBoundary from '@/components/app/shared/ErrorBoundary';
import AppShell from '@/components/app/AppShell';
import { colors } from '@/components/app/design/tokens';

function KairoInner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length === 0) {
        await base44.entities.UserProfile.create({
          user_id: me.id, user_email: me.email,
          display_name: me.full_name || me.email.split('@')[0],
          username: me.email.split('@')[0],
          status: 'online', is_online: true,
        });
      } else {
        await base44.entities.UserProfile.update(profiles[0].id, { is_online: true, status: profiles[0].status === 'offline' ? 'online' : profiles[0].status, last_seen: new Date().toISOString() });
      }
      setUser({ id: me.id, email: me.email, full_name: me.full_name });
      setLoading(false);
    };
    init();
    return () => {
      const cleanup = async () => {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return;
        const me = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles[0]) await base44.entities.UserProfile.update(profiles[0].id, { is_online: false, last_seen: new Date().toISOString() });
      };
      cleanup();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: colors.bg.base }} role="status" aria-label="Loading Kairo">
        <div className="text-center k-fade-in">
          <div className="w-18 h-18 rounded-[20px] mx-auto mb-8 flex items-center justify-center"
            style={{ width: 72, height: 72, background: `linear-gradient(135deg, ${colors.accent.primary}, ${colors.accent.active})`, boxShadow: `0 0 40px ${colors.accent.primary}20, 0 0 80px ${colors.accent.primary}08` }}>
            <span className="text-4xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>K</span>
          </div>
          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
          <p className="text-[13px] mt-5 font-medium" style={{ color: colors.text.disabled }}>Loading...</p>
        </div>
      </div>
    );
  }

  return <AppShell currentUser={user} />;
}

export default function Kairo() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <KairoInner />
      </ProfileProvider>
    </ErrorBoundary>
  );
}