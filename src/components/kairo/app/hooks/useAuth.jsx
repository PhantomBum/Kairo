import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['auth', 'profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
  });

  const setStatus = async (status) => {
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { 
        status, 
        is_online: status !== 'offline' && status !== 'invisible',
        last_seen: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    }
  };

  const logout = () => base44.auth.logout();

  return {
    user,
    profile,
    isLoading: userLoading || profileLoading,
    isAuthenticated: !!user,
    updateProfile: updateProfile.mutate,
    setStatus,
    logout,
  };
}