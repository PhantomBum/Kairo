import React, { createContext, useContext, useMemo } from 'react';

// Permission flags (bitfield)
export const Permissions = {
  // General
  ADMINISTRATOR: 1 << 0,
  VIEW_CHANNELS: 1 << 1,
  MANAGE_CHANNELS: 1 << 2,
  MANAGE_ROLES: 1 << 3,
  MANAGE_SERVER: 1 << 4,
  
  // Membership
  KICK_MEMBERS: 1 << 5,
  BAN_MEMBERS: 1 << 6,
  CREATE_INVITE: 1 << 7,
  CHANGE_NICKNAME: 1 << 8,
  MANAGE_NICKNAMES: 1 << 9,
  
  // Text
  SEND_MESSAGES: 1 << 10,
  EMBED_LINKS: 1 << 11,
  ATTACH_FILES: 1 << 12,
  ADD_REACTIONS: 1 << 13,
  USE_EXTERNAL_EMOJIS: 1 << 14,
  MENTION_EVERYONE: 1 << 15,
  MANAGE_MESSAGES: 1 << 16,
  READ_MESSAGE_HISTORY: 1 << 17,
  SEND_TTS: 1 << 18,
  USE_SLASH_COMMANDS: 1 << 19,
  
  // Voice
  CONNECT: 1 << 20,
  SPEAK: 1 << 21,
  VIDEO: 1 << 22,
  MUTE_MEMBERS: 1 << 23,
  DEAFEN_MEMBERS: 1 << 24,
  MOVE_MEMBERS: 1 << 25,
  USE_VOICE_ACTIVITY: 1 << 26,
  PRIORITY_SPEAKER: 1 << 27,
  STREAM: 1 << 28,
  
  // Stage
  REQUEST_TO_SPEAK: 1 << 29,
  
  // Events
  MANAGE_EVENTS: 1 << 30,
};

// Default permissions for @everyone
export const DEFAULT_PERMISSIONS = 
  Permissions.VIEW_CHANNELS |
  Permissions.SEND_MESSAGES |
  Permissions.EMBED_LINKS |
  Permissions.ATTACH_FILES |
  Permissions.ADD_REACTIONS |
  Permissions.USE_EXTERNAL_EMOJIS |
  Permissions.READ_MESSAGE_HISTORY |
  Permissions.CONNECT |
  Permissions.SPEAK |
  Permissions.VIDEO |
  Permissions.USE_VOICE_ACTIVITY |
  Permissions.STREAM |
  Permissions.CHANGE_NICKNAME |
  Permissions.CREATE_INVITE |
  Permissions.USE_SLASH_COMMANDS |
  Permissions.REQUEST_TO_SPEAK;

// All permissions
export const ALL_PERMISSIONS = Object.values(Permissions).reduce((a, b) => a | b, 0);

// Permission context
const PermissionContext = createContext({
  permissions: 0,
  hasPermission: () => false,
  hasAny: () => false,
  hasAll: () => false,
  isOwner: false,
  isAdmin: false,
});

export function PermissionProvider({ 
  children, 
  server, 
  member, 
  roles = [], 
  channel = null,
  currentUserId 
}) {
  const computed = useMemo(() => {
    const isOwner = server?.owner_id === currentUserId;
    
    // Owner has all permissions
    if (isOwner) {
      return {
        permissions: ALL_PERMISSIONS,
        isOwner: true,
        isAdmin: true,
      };
    }
    
    // Get member's roles
    const memberRoleIds = member?.role_ids || [];
    const memberRoles = roles.filter(r => memberRoleIds.includes(r.id) || r.is_default);
    
    // Calculate base permissions from roles
    let permissions = 0;
    for (const role of memberRoles) {
      permissions |= (role.permissions_bitfield || DEFAULT_PERMISSIONS);
    }
    
    // Administrator overrides everything
    const isAdmin = (permissions & Permissions.ADMINISTRATOR) !== 0;
    if (isAdmin) {
      return {
        permissions: ALL_PERMISSIONS,
        isOwner: false,
        isAdmin: true,
      };
    }
    
    // Apply channel permission overwrites
    if (channel?.permission_overwrites) {
      for (const overwrite of channel.permission_overwrites) {
        // Role overwrite
        if (overwrite.type === 'role' && memberRoleIds.includes(overwrite.id)) {
          permissions &= ~(overwrite.deny || 0);
          permissions |= (overwrite.allow || 0);
        }
        // Member-specific overwrite
        if (overwrite.type === 'member' && overwrite.id === currentUserId) {
          permissions &= ~(overwrite.deny || 0);
          permissions |= (overwrite.allow || 0);
        }
      }
    }
    
    return {
      permissions,
      isOwner: false,
      isAdmin: false,
    };
  }, [server, member, roles, channel, currentUserId]);

  const hasPermission = (perm) => (computed.permissions & perm) !== 0;
  const hasAny = (...perms) => perms.some(p => hasPermission(p));
  const hasAll = (...perms) => perms.every(p => hasPermission(p));

  return (
    <PermissionContext.Provider value={{
      ...computed,
      hasPermission,
      hasAny,
      hasAll,
    }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}

// HOC for permission-gated components
export function withPermission(Component, requiredPermission) {
  return function PermissionGated(props) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(requiredPermission)) {
      return null;
    }
    
    return <Component {...props} />;
  };
}

// Component for conditionally rendering based on permissions
export function PermissionGate({ permission, permissions, any = false, children, fallback = null }) {
  const { hasPermission, hasAny, hasAll } = usePermissions();
  
  const perms = permissions || [permission];
  const hasRequired = any ? hasAny(...perms) : hasAll(...perms);
  
  if (!hasRequired) return fallback;
  return children;
}

// Utility to convert permission array to bitfield
export function permissionsToBitfield(permissionNames) {
  return permissionNames.reduce((bf, name) => {
    const perm = Permissions[name.toUpperCase()];
    return perm ? bf | perm : bf;
  }, 0);
}

// Utility to convert bitfield to permission array
export function bitfieldToPermissions(bitfield) {
  return Object.entries(Permissions)
    .filter(([_, value]) => (bitfield & value) !== 0)
    .map(([name]) => name);
}