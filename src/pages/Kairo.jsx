import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ProfileProvider } from '@/components/kairo/core/ProfileProvider';
import AppShell from '@/components/kairo/unified/AppShell';

function KairoInner() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Check localStorage for key-based auth (from Landing page)
      const savedUser = localStorage.getItem('kairo_current_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);

        // Update profile status to online
        if (user.id) {
          try {
            await base44.entities.UserProfile.update(user.id, {
              status: 'online',
              is_online: true,
              last_seen: new Date().toISOString(),
            });
          } catch (e) {}
        }

        // AppShell expects { id, email, full_name } shape
        // The localStorage user is a UserProfile record, adapt it
        setCurrentUser({
          id: user.user_id || user.id,
          email: user.user_email || user.email,
          full_name: user.display_name || user.full_name || 'User',
          // Keep the profile record id for reference
          _profileId: user.id,
          _raw: user,
        });
        setIsReady(true);
        return;
      }

      // Fallback: try base44 auth
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          // Ensure profile exists
          const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
          if (profiles.length === 0) {
            await base44.entities.UserProfile.create({
              user_id: user.id,
              user_email: user.email,
              display_name: user.full_name || user.email.split('@')[0],
              username: user.email.split('@')[0],
              status: 'online',
              is_online: true,
              badges: [],
            });
          } else {
            await base44.entities.UserProfile.update(profiles[0].id, {
              status: 'online',
              is_online: true,
              last_seen: new Date().toISOString(),
            });
          }
          setCurrentUser(user);
          setIsReady(true);
          return;
        }
      } catch (e) {}

      // No auth at all - redirect to Landing
      navigate(createPageUrl('Landing'));
    };

    init();

    // Set offline when leaving
    return () => {
      const saved = localStorage.getItem('kairo_current_user');
      if (saved) {
        const user = JSON.parse(saved);
        if (user.id) {
          base44.entities.UserProfile.update(user.id, {
            status: 'offline',
            is_online: false,
          }).catch(() => {});
        }
      }
    };
  }, [navigate]);

  if (!isReady || !currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0e0e0e' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <span className="text-xl font-bold text-white">K</span>
          </div>
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <AppShell currentUser={currentUser} />;
}

export default function KairoPage() {
  return (
    <ProfileProvider>
      <KairoInner />
    </ProfileProvider>
  );
}