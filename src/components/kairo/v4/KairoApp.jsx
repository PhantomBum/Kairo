import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';

// Layout components
import AppShell from './layout/AppShell';
import ServerBar from './layout/ServerBar';
import ChannelPanel from './layout/ChannelPanel';
import ChatHeader from './layout/ChatHeader';
import UserPanel from './layout/UserPanel';

// Panel components
import MemberPanel from './panels/MemberPanel';
import DMPanel from './panels/DMPanel';
import FriendsPanel from './panels/FriendsPanel';

// Chat components
import MessageList from './chat/MessageList';
import MessageComposer from './chat/MessageComposer';

// Modals
import AddFriendModal from './modals/AddFriendModal';
import JoinServerModal from './modals/JoinServerModal';
import CreateServerModal from './modals/CreateServerModal';
import Modal from './primitives/Modal';

// Providers
import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

function KairoAppContent() {
  const queryClient = useQueryClient();
  const { profiles, profileMap, getProfile } = useProfiles();
  
  // Core state
  const [view, setView] = useState('dms'); // 'server' | 'dms' | 'friends'
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  
  // Modal state
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  
  // Current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ 
        user_email: currentUser.email 
      });
      return profiles[0];
    },
    enabled: !!currentUser?.email,
  });
  
  // Servers the user is a member of
  const { data: memberServers = [] } = useQuery({
    queryKey: ['memberServers', currentUser?.id],
    queryFn: async () => {
      const memberships = await base44.entities.ServerMember.filter({
        user_id: currentUser.id,
      });
      const serverIds = memberships.map(m => m.server_id);
      if (serverIds.length === 0) return [];
      
      const servers = await base44.entities.Server.list();
      return servers.filter(s => serverIds.includes(s.id));
    },
    enabled: !!currentUser?.id,
  });
  
  // Categories and channels for active server
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', activeServer?.id],
    queryFn: () => base44.entities.Category.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', activeServer?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Members for active server
  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Roles for active server
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', activeServer?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Voice states
  const { data: voiceStates = [] } = useQuery({
    queryKey: ['voiceStates', activeServer?.id],
    queryFn: () => base44.entities.VoiceState.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Messages for active channel
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeChannel?.id],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: activeChannel.id });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!activeChannel?.id,
  });
  
  // DM Conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: async () => {
      const convos = await base44.entities.Conversation.filter({});
      return convos.filter(c => 
        c.participants?.some(p => 
          p.user_id === currentUser.id || p.user_email === currentUser.email
        )
      );
    },
    enabled: !!currentUser?.id,
  });
  
  // Friends
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.id],
    queryFn: () => base44.entities.Friendship.filter({ user_id: currentUser.id }),
    enabled: !!currentUser?.id,
  });
  
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests', currentUser?.id],
    queryFn: async () => {
      const pending = await base44.entities.Friendship.filter({ status: 'pending' });
      return pending.filter(f => 
        f.friend_id === currentUser.id || 
        f.friend_email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
    },
    enabled: !!currentUser?.id,
  });
  
  const friends = friendships.filter(f => f.status === 'accepted');
  const outgoingRequests = friendships.filter(f => f.status === 'pending');
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      return base44.entities.Message.create({
        channel_id: activeChannel.id,
        server_id: activeServer?.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name,
        author_avatar: userProfile?.avatar_url,
        author_badges: userProfile?.badges || [],
        content,
        attachments,
        reply_to_id: replyToId,
        type: replyToId ? 'reply' : 'default',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
      setReplyTo(null);
    },
  });
  
  // Friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (username, targetUser) => {
      // Find user by username
      let target = targetUser;
      if (!target) {
        const profiles = await base44.entities.UserProfile.list();
        target = profiles.find(p => 
          p.username?.toLowerCase() === username.toLowerCase() ||
          p.display_name?.toLowerCase() === username.toLowerCase()
        );
      }
      
      if (!target) throw new Error('User not found');
      
      // Check if already friends
      const existing = await base44.entities.Friendship.filter({
        user_id: currentUser.id,
        friend_id: target.user_id,
      });
      if (existing.length > 0) throw new Error('Already friends or request pending');
      
      return base44.entities.Friendship.create({
        user_id: currentUser.id,
        friend_id: target.user_id,
        friend_email: target.user_email,
        friend_name: target.display_name || target.username,
        friend_avatar: target.avatar_url,
        status: 'pending',
        initiated_by: currentUser.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    },
  });
  
  // Accept friend request
  const acceptFriendMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.Friendship.update(request.id, { status: 'accepted' });
      
      // Create reverse friendship
      const senderProfiles = await base44.entities.UserProfile.filter({ user_id: request.user_id });
      const sender = senderProfiles[0];
      
      await base44.entities.Friendship.create({
        user_id: currentUser.id,
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
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    },
  });
  
  // Decline/remove friend
  const removeFriendMutation = useMutation({
    mutationFn: async (friendship) => {
      await base44.entities.Friendship.delete(friendship.id);
      
      if (friendship.status === 'accepted') {
        const reverse = await base44.entities.Friendship.filter({
          user_id: friendship.friend_id,
          friend_id: friendship.user_id,
        });
        if (reverse.length > 0) {
          await base44.entities.Friendship.delete(reverse[0].id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    },
  });
  
  // Join server
  const joinServerMutation = useMutation({
    mutationFn: async (inviteCode) => {
      const servers = await base44.entities.Server.filter({ invite_code: inviteCode });
      const server = servers[0];
      if (!server) throw new Error('Invalid invite code');
      
      // Check if already a member
      const existing = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: currentUser.id,
      });
      if (existing.length > 0) throw new Error('Already a member of this server');
      
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: currentUser.id,
        user_email: currentUser.email,
        joined_at: new Date().toISOString(),
      });
      
      await base44.entities.Server.update(server.id, {
        member_count: (server.member_count || 1) + 1,
      });
      
      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      setActiveServer(server);
      setView('server');
    },
  });
  
  // Auto-select first channel when server changes
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const textChannel = channels.find(c => c.type === 'text');
      if (textChannel) setActiveChannel(textChannel);
    }
  }, [activeServer, channels]);
  
  // Clear channel when switching away from server
  useEffect(() => {
    if (view !== 'server') {
      setActiveChannel(null);
    }
  }, [view]);
  
  // Profile map for members
  const profilesMap = useMemo(() => {
    const map = new Map();
    profiles?.forEach(p => map.set(p.user_id, p));
    return map;
  }, [profiles]);
  
  // Handlers
  const handleServerSelect = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setView('server');
  };
  
  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
  };
  
  const handleDMsClick = () => {
    setView('dms');
    setActiveServer(null);
    setActiveChannel(null);
  };
  
  const handleFriendsClick = () => {
    setView('friends');
  };
  
  const handleStartDM = async (friend) => {
    // Find or create conversation
    let conversation = conversations.find(c => 
      c.participants?.some(p => p.user_id === friend.friend_id)
    );
    
    if (!conversation) {
      conversation = await base44.entities.Conversation.create({
        participants: [
          { user_id: currentUser.id, user_name: userProfile?.display_name },
          { user_id: friend.friend_id, user_name: friend.friend_name, user_avatar: friend.friend_avatar },
        ],
        is_group: false,
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
    
    setActiveConversation(conversation);
    setView('dms');
  };

  return (
    <AppShell
      sidebar={
        <ServerBar
          servers={memberServers}
          activeServerId={activeServer?.id}
          onServerSelect={handleServerSelect}
          onDMsClick={handleDMsClick}
          onCreateServer={() => setShowCreateServer(true)}
          onDiscoverClick={() => setShowDiscover(true)}
          isDMsActive={view === 'dms' || view === 'friends'}
        />
      }
      secondarySidebar={
        view === 'server' && activeServer ? (
          <ChannelPanel
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={handleChannelSelect}
            onServerSettings={() => setShowServerSettings(true)}
            onInvite={() => {}}
            voiceStates={voiceStates}
          />
        ) : view === 'dms' || view === 'friends' ? (
          <DMPanel
            conversations={conversations}
            friends={friends}
            activeConversationId={activeConversation?.id}
            onConversationSelect={setActiveConversation}
            onFriendSelect={handleStartDM}
            onShowFriends={handleFriendsClick}
            onCreateDM={() => setShowAddFriend(true)}
          />
        ) : null
      }
      header={
        view === 'server' && activeChannel ? (
          <ChatHeader
            channel={activeChannel}
            memberCount={members.length}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
            onShowSearch={() => {}}
            onShowPinned={() => {}}
          />
        ) : view === 'dms' && activeConversation ? (
          <ChatHeader
            conversation={activeConversation}
            onStartCall={() => {}}
            onStartVideo={() => {}}
          />
        ) : null
      }
      rightPanel={
        view === 'server' && showMembers && activeServer ? (
          <MemberPanel
            members={members}
            profiles={profilesMap}
            roles={roles}
            ownerId={activeServer.owner_id}
            onMessage={handleStartDM}
          />
        ) : null
      }
      footer={
        <UserPanel
          profile={userProfile}
          isMuted={isMuted}
          isDeafened={isDeafened}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleDeafen={() => setIsDeafened(!isDeafened)}
          onOpenSettings={() => setShowSettings(true)}
          onStatusChange={async (status) => {
            if (userProfile) {
              await base44.entities.UserProfile.update(userProfile.id, { status });
              queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            }
          }}
        />
      }
    >
      {/* Main content area */}
      {view === 'friends' ? (
        <FriendsPanel
          friends={friends}
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onAddFriend={() => setShowAddFriend(true)}
          onMessage={handleStartDM}
          onAcceptRequest={(r) => acceptFriendMutation.mutate(r)}
          onDeclineRequest={(r) => removeFriendMutation.mutate(r)}
          onRemoveFriend={(f) => removeFriendMutation.mutate(f)}
        />
      ) : view === 'server' && activeChannel ? (
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList
            messages={messages}
            currentUserId={currentUser?.id}
            channelName={activeChannel.name}
            isLoading={messagesLoading}
            onReply={setReplyTo}
            onEdit={() => {}}
            onDelete={() => {}}
            onReact={() => {}}
            onToggleReaction={() => {}}
            onPin={() => {}}
            onAvatarClick={() => {}}
          />
          <MessageComposer
            channelName={activeChannel.name}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSendMessage={(data) => sendMessageMutation.mutate(data)}
            members={members}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to Kairo</h2>
            <p className="text-zinc-500">Select a server or start a conversation</p>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <AnimatePresence>
        {showAddFriend && (
          <AddFriendModal
            isOpen={showAddFriend}
            onClose={() => setShowAddFriend(false)}
            onSendRequest={(username, user) => sendFriendRequestMutation.mutateAsync(username, user)}
            currentUserId={currentUser?.id}
          />
        )}
        
        {showJoinServer && (
          <JoinServerModal
            isOpen={showJoinServer}
            onClose={() => setShowJoinServer(false)}
            onJoin={(code) => joinServerMutation.mutateAsync(code)}
            onDiscover={() => setShowDiscover(true)}
          />
        )}
        
        {showCreateServer && (
          <CreateServerModal
            isOpen={showCreateServer}
            onClose={() => setShowCreateServer(false)}
            onCreate={handleServerSelect}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}

export default function KairoApp() {
  return (
    <ProfileProvider>
      <KairoAppContent />
    </ProfileProvider>
  );
}