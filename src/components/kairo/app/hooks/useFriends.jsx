import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useFriends(userId, userEmail) {
  const queryClient = useQueryClient();

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId }),
    enabled: !!userId,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['friendRequests', userId],
    queryFn: async () => {
      const pending = await base44.entities.Friendship.filter({ status: 'pending' });
      return pending.filter(f => 
        f.friend_id === userId || 
        f.friend_email?.toLowerCase() === userEmail?.toLowerCase()
      );
    },
    enabled: !!userId,
  });

  const friends = friendships.filter(f => f.status === 'accepted');
  const outgoingRequests = friendships.filter(f => f.status === 'pending');

  const sendRequest = useMutation({
    mutationFn: async ({ username, targetUser }) => {
      let target = targetUser;
      if (!target) {
        const profiles = await base44.entities.UserProfile.list();
        target = profiles.find(p => 
          p.username?.toLowerCase() === username?.toLowerCase() ||
          p.display_name?.toLowerCase() === username?.toLowerCase()
        );
      }
      if (!target) throw new Error('User not found');

      const existing = await base44.entities.Friendship.filter({
        user_id: userId,
        friend_id: target.user_id,
      });
      if (existing.length > 0) throw new Error('Already friends or request pending');

      return base44.entities.Friendship.create({
        user_id: userId,
        friend_id: target.user_id,
        friend_email: target.user_email,
        friend_name: target.display_name || target.username,
        friend_avatar: target.avatar_url,
        status: 'pending',
        initiated_by: userId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async (request) => {
      await base44.entities.Friendship.update(request.id, { status: 'accepted' });
      
      const senderProfiles = await base44.entities.UserProfile.filter({ user_id: request.user_id });
      const sender = senderProfiles[0];
      
      await base44.entities.Friendship.create({
        user_id: userId,
        friend_id: request.user_id,
        friend_email: sender?.user_email,
        friend_name: sender?.display_name || 'User',
        friend_avatar: sender?.avatar_url,
        status: 'accepted',
        initiated_by: request.user_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });

  const declineRequest = useMutation({
    mutationFn: async (request) => {
      await base44.entities.Friendship.delete(request.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });

  const removeFriend = useMutation({
    mutationFn: async (friendship) => {
      await base44.entities.Friendship.delete(friendship.id);
      
      if (friendship.status === 'accepted') {
        const reverse = await base44.entities.Friendship.filter({
          user_id: friendship.friend_id,
          friend_id: userId,
        });
        if (reverse.length > 0) {
          await base44.entities.Friendship.delete(reverse[0].id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    sendRequest: sendRequest.mutateAsync,
    acceptRequest: acceptRequest.mutateAsync,
    declineRequest: declineRequest.mutateAsync,
    removeFriend: removeFriend.mutateAsync,
    isSending: sendRequest.isPending,
  };
}