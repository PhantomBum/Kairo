import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

import AppShell from '@/components/kairo/unified/AppShell.jsx';

function KairoInner() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin();
        return;
      }
      const user = await base44.auth.me();
      setCurrentUser(user);

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
      setIsReady(true);
    };
    init();
  }, []);

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

export default function KairoV4Page() {
  return (
    <ProfileProvider>
      <KairoInner />
    </ProfileProvider>
  );
}