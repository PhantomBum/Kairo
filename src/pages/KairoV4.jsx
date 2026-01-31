import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

// New V6 App from ground up
import KairoApp from '@/components/kairo/app/KairoApp';

export default function KairoV4Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (!authed) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated === true,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length === 0) {
        // Create profile if doesn't exist
        return base44.entities.UserProfile.create({
          user_id: user.id,
          user_email: user.email,
          display_name: user.full_name || user.email.split('@')[0],
          username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6),
          status: 'online',
          is_online: true,
          settings: { theme: 'dark', message_display: 'cozy' },
        });
      }
      // Update online status
      await base44.entities.UserProfile.update(profiles[0].id, {
        status: 'online',
        is_online: true,
        last_seen: new Date().toISOString(),
      });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  // Loading state
  if (isAuthenticated === null || userLoading || profileLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin mx-auto" />
          <p className="text-sm text-zinc-500 mt-3">Loading Kairo...</p>
        </div>
      </div>
    );
  }

  return <KairoApp />;
}