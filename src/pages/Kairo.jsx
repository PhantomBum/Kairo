import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ProfileProvider } from '@/components/app/providers/ProfileProvider';
import AppShell from '@/components/app/AppShell';

function KairoInner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      const me = await base44.auth.me();
      // Ensure profile exists
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
      // Set offline on unmount
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
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>K</span>
          </div>
          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
        </div>
      </div>
    );
  }

  return <AppShell currentUser={user} />;
}

export default function Kairo() {
  return (
    <ProfileProvider>
      <KairoInner />
    </ProfileProvider>
  );
}