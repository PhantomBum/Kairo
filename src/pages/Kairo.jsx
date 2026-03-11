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
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-deep, #050505)' }} role="status" aria-label="Loading Kairo">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(232,228,217,0.03)' }}>
            <span className="text-2xl font-bold" style={{ color: 'rgba(232,228,217,0.4)', fontFamily: 'monospace' }}>K</span>
          </div>
          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.04)', borderTopColor: 'rgba(232,228,217,0.3)' }} aria-hidden="true" />
          <p className="text-[11px] mt-4" style={{ color: 'rgba(232,228,217,0.2)' }}>Loading...</p>
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