import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const Ctx = createContext(null);

export function ProfileProvider({ children }) {
  const { data: profiles = [], refetch } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const map = useMemo(() => {
    const m = {};
    profiles.forEach(p => {
      if (p.user_id) m[p.user_id] = p;
      if (p.user_email) m[p.user_email.toLowerCase()] = p;
    });
    return m;
  }, [profiles]);

  const getProfile = useCallback((id) => {
    if (!id) return null;
    return map[id] || map[String(id).toLowerCase()] || null;
  }, [map]);

  const value = useMemo(() => ({ profiles, map, getProfile, refresh: refetch }), [profiles, map, getProfile, refetch]);

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfiles() {
  return useContext(Ctx) || { profiles: [], map: {}, getProfile: () => null, refresh: () => {} };
}