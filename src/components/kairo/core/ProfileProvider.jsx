import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ProfileContext = createContext({
  profiles: {},
  getProfile: () => null,
  refreshProfile: () => {},
  refreshAllProfiles: () => {}
});

export function ProfileProvider({ children }) {
  const queryClient = useQueryClient();
  
  // Fetch all user profiles and index them by user_id
  const { data: allProfiles = [], refetch: refreshAllProfiles } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 120000 // Refresh every 2 minutes
  });

  // Create a map of profiles indexed by various identifiers for fast lookup
  const profilesMap = React.useMemo(() => {
    const map = {
      byId: {},
      byUserId: {},
      byEmail: {}
    };
    
    allProfiles.forEach(profile => {
      // Index by record ID
      if (profile.id) {
        map.byId[profile.id] = profile;
      }
      // Index by user_id field
      if (profile.user_id) {
        map.byUserId[profile.user_id] = profile;
      }
      // Index by email (lowercase for case-insensitive lookup)
      if (profile.user_email) {
        map.byEmail[profile.user_email.toLowerCase()] = profile;
      }
    });
    
    return map;
  }, [allProfiles]);

  // Get a profile by any identifier (user_id, email, or record id)
  const getProfile = useCallback((identifier) => {
    if (!identifier) return null;
    
    const id = String(identifier).toLowerCase();
    
    // Try by user_id first (most common)
    if (profilesMap.byUserId[identifier]) {
      return profilesMap.byUserId[identifier];
    }
    
    // Try by record ID
    if (profilesMap.byId[identifier]) {
      return profilesMap.byId[identifier];
    }
    
    // Try by email
    if (profilesMap.byEmail[id]) {
      return profilesMap.byEmail[id];
    }
    
    return null;
  }, [profilesMap]);

  // Refresh a specific profile
  const refreshProfile = useCallback(async (userId) => {
    await refreshAllProfiles();
  }, [refreshAllProfiles]);

  return (
    <ProfileContext.Provider value={{
      profiles: allProfiles,
      profilesMap,
      getProfile,
      refreshProfile,
      refreshAllProfiles
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (!context) {
    // Return defaults if not in provider
    return {
      profiles: [],
      profilesMap: { byId: {}, byUserId: {}, byEmail: {} },
      getProfile: () => null,
      refreshProfile: () => {},
      refreshAllProfiles: () => {}
    };
  }
  return context;
}

// Hook to get a single profile with fallback
export function useProfile(identifier) {
  const { getProfile } = useProfiles();
  return getProfile(identifier);
}

// Hook to enrich member data with profile info
export function useEnrichedMembers(members = [], currentUserId) {
  const { getProfile } = useProfiles();
  
  return React.useMemo(() => {
    return members.map(member => {
      // Try to find the profile for this member
      const profile = getProfile(member.user_id) || getProfile(member.user_email);
      
      if (profile) {
        return {
          ...member,
          user_name: member.nickname || profile.display_name || profile.username || member.user_email?.split('@')[0] || 'User',
          user_avatar: member.avatar_override || profile.avatar_url,
          banner_url: profile.banner_url,
          status: profile.status || 'offline',
          badges: profile.badges || [],
          youtube_url: profile.youtube_channel?.url,
          youtube_show_icon: profile.youtube_channel?.show_icon,
          bio: profile.bio,
          accent_color: profile.accent_color,
          pronouns: profile.pronouns
        };
      }
      
      // Fallback if no profile found
      return {
        ...member,
        user_name: member.nickname || member.user_email?.split('@')[0] || 'User',
        user_avatar: member.avatar_override,
        status: 'offline',
        badges: [],
        youtube_url: null,
        youtube_show_icon: false
      };
    });
  }, [members, getProfile]);
}