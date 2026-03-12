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
      // Check if this is the platform owner (admin role = first user / app creator)
      const isOwner = me.role === 'admin';
      if (profiles.length === 0) {
        const ownerBadges = isOwner ? ['owner', 'admin', 'premium', 'verified', 'partner', 'early_supporter', 'developer', 'moderator'] : [];
        await base44.entities.UserProfile.create({
          user_id: me.id, user_email: me.email,
          display_name: me.full_name || me.email.split('@')[0],
          username: me.email.split('@')[0],
          status: 'online', is_online: true,
          badges: ownerBadges,
        });
        // Grant owner lifetime credits
        if (isOwner) {
          const existingCredits = await base44.entities.UserCredits.filter({ user_id: me.id });
          if (existingCredits.length === 0) {
            await base44.entities.UserCredits.create({ user_id: me.id, user_email: me.email, balance: 999999, lifetime_earned: 999999, is_kairo_owner: true, has_nitro: true });
          }
        }
      } else {
        const updateData = { is_online: true, status: profiles[0].status === 'offline' ? 'online' : profiles[0].status, last_seen: new Date().toISOString() };
        // Ensure owner always has all badges & perks
        if (isOwner && !profiles[0].badges?.includes('owner')) {
          updateData.badges = ['owner', 'admin', 'premium', 'verified', 'partner', 'early_supporter', 'developer', 'moderator'];
        }
        await base44.entities.UserProfile.update(profiles[0].id, updateData);
        // Ensure owner credits exist
        if (isOwner) {
          const existingCredits = await base44.entities.UserCredits.filter({ user_id: me.id });
          if (existingCredits.length === 0) {
            await base44.entities.UserCredits.create({ user_id: me.id, user_email: me.email, balance: 999999, lifetime_earned: 999999, is_kairo_owner: true, has_nitro: true });
          } else if (!existingCredits[0].is_kairo_owner) {
            await base44.entities.UserCredits.update(existingCredits[0].id, { balance: 999999, is_kairo_owner: true, has_nitro: true });
          }
        }
      }
      setUser({ id: me.id, email: me.email, full_name: me.full_name, role: me.role });
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
          <div className="mx-auto mb-6 flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: 16, background: colors.accent.primary }}>
            <span className="text-4xl font-bold text-white">K</span>
          </div>
          <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.06)', borderTopColor: colors.accent.primary }} />
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