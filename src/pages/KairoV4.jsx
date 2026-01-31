import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import KairoApp from '@/components/kairo/v4/KairoApp';
import LoadingScreen from '@/components/kairo/LoadingScreen';

export default function KairoV4Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login
          base44.auth.redirectToLogin(window.location.href);
        }
      } catch (err) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

  // Check if user has a profile
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated,
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({
        user_email: currentUser.email,
      });
      return profiles[0];
    },
    enabled: !!currentUser?.email,
  });

  // Create profile if doesn't exist
  useEffect(() => {
    const createProfile = async () => {
      if (currentUser && !profileLoading && !userProfile) {
        await base44.entities.UserProfile.create({
          user_id: currentUser.id,
          user_email: currentUser.email,
          display_name: currentUser.full_name || 'User',
          username: currentUser.email.split('@')[0],
          status: 'online',
          badges: [],
        });
      }
    };
    createProfile();
  }, [currentUser, userProfile, profileLoading]);

  if (!isAuthenticated || isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <KairoApp />;
}