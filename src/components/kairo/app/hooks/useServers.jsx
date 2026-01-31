import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useServers(userId) {
  const queryClient = useQueryClient();

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ['servers', userId],
    queryFn: async () => {
      const memberships = await base44.entities.ServerMember.filter({ user_id: userId });
      if (memberships.length === 0) return [];
      const serverIds = memberships.map(m => m.server_id);
      const allServers = await base44.entities.Server.list();
      return allServers.filter(s => serverIds.includes(s.id));
    },
    enabled: !!userId,
  });

  const createServer = useMutation({
    mutationFn: async ({ name, icon, template, userId, userEmail }) => {
      let iconUrl = null;
      if (icon) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: icon });
        iconUrl = file_url;
      }

      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      const server = await base44.entities.Server.create({
        name,
        icon_url: iconUrl,
        owner_id: userId,
        template: template || 'blank',
        invite_code: inviteCode,
        member_count: 1,
        is_public: false,
      });

      const category = await base44.entities.Category.create({
        server_id: server.id,
        name: 'Text Channels',
        position: 0,
      });

      await base44.entities.Channel.create({
        server_id: server.id,
        category_id: category.id,
        name: 'general',
        type: 'text',
        position: 0,
      });

      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: userId,
        user_email: userEmail,
        joined_at: new Date().toISOString(),
      });

      return server;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  const joinServer = useMutation({
    mutationFn: async ({ inviteCode, userId, userEmail }) => {
      const servers = await base44.entities.Server.filter({ invite_code: inviteCode });
      if (servers.length === 0) throw new Error('Invalid invite code');
      
      const server = servers[0];
      
      const existing = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: userId,
      });
      if (existing.length > 0) throw new Error('Already a member');

      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: userId,
        user_email: userEmail,
        joined_at: new Date().toISOString(),
      });

      await base44.entities.Server.update(server.id, {
        member_count: (server.member_count || 1) + 1,
      });

      return server;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  const leaveServer = useMutation({
    mutationFn: async ({ serverId, userId }) => {
      const memberships = await base44.entities.ServerMember.filter({
        server_id: serverId,
        user_id: userId,
      });
      if (memberships.length > 0) {
        await base44.entities.ServerMember.delete(memberships[0].id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  return {
    servers,
    isLoading,
    createServer: createServer.mutateAsync,
    joinServer: joinServer.mutateAsync,
    leaveServer: leaveServer.mutateAsync,
    isCreating: createServer.isPending,
    isJoining: joinServer.isPending,
  };
}

export function useServerData(serverId) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', serverId],
    queryFn: () => base44.entities.Category.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels', serverId],
    queryFn: () => base44.entities.Channel.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', serverId],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', serverId],
    queryFn: () => base44.entities.Role.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  return { categories, channels, members, roles };
}