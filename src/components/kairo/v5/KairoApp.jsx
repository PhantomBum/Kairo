import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';

// V5 Layout components
import AppShell from './layout/AppShell';
import ServerBar from './layout/ServerBar';
import ChannelPanel from './layout/ChannelPanel';
import ChatHeader from './layout/ChatHeader';
import UserPanel from './layout/UserPanel';

// V5 Panel components
import MemberPanel from './panels/MemberPanel';
import DMPanel from './panels/DMPanel';
import FriendsPanel from './panels/FriendsPanel';

// V5 Chat components
import MessageList from './chat/MessageList';
import MessageComposer from './chat/MessageComposer';

// V5 Modals
import AddFriendModal from './modals/AddFriendModal';
import JoinServerModal from './modals/JoinServerModal';
import CreateServerModal from './modals/CreateServerModal';
import SettingsModal from './modals/SettingsModal';
import ServerSettingsModal from './modals/ServerSettingsModal';
import DiscoverServersModal from './modals/DiscoverServersModal';

// Providers
import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

// Feature hooks
import { useRealtimeMessages, useRealtimeDMs, useRealtimeTyping } from '@/components/kairo/core/RealtimeMessages';
import { useSlowMode, SlowModeIndicator } from '@/components/kairo/features/SlowMode';
import { useReadReceipts } from '@/components/kairo/features/ReadReceipts';
import { KickMemberModal, BanMemberModal, TimeoutMemberModal } from '@/components/kairo/moderation/ModerationActions';
import { NSFWGate } from '@/components/kairo/features/NSFWChannel';
import { CreatePollModal } from '@/components/kairo/features/Polls';
import { ScheduleMessageModal } from '@/components/kairo/features/MessageScheduler';
import { processAutoMod, executeAutoModAction } from '@/components/kairo/moderation/AutoModProcessor';
import { ForumChannelView } from '@/components/kairo/features/ForumChannel';
import { AdvancedSearchModal } from '@/components/kairo/v4/features/AdvancedSearch';
import { NitroCheckoutModal, BoostCheckoutModal } from '@/components/kairo/v4/features/NitroCheckout';

function KairoAppContent() {
  const queryClient = useQueryClient();
  const { profiles, getProfile } = useProfiles();
  
  // Core state
  const [view, setView] = useState('dms');
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  
  // Modal state - ALL MODALS
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showKickMember, setShowKickMember] = useState(null);
  const [showBanMember, setShowBanMember] = useState(null);
  const [showTimeoutMember, setShowTimeoutMember] = useState(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showScheduleMessage, setShowScheduleMessage] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showNitroCheckout, setShowNitroCheckout] = useState(false);
  const [showBoostCheckout, setShowBoostCheckout] = useState(false);
  
  // Current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ 
        user_email: currentUser.email 
      });
      return profiles[0];
    },
    enabled: !!currentUser?.email,
  });
  
  // Servers
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
  
  // Categories and channels
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
  
  // Members
  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Roles
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
  
  // Messages
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
  
  // DM Messages for active conversation
  const { data: dmMessages = [], isLoading: dmMessagesLoading } = useQuery({
    queryKey: ['dmMessages', activeConversation?.id],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: activeConversation.id });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!activeConversation?.id,
  });
  
  // Auto-mod rules
  const { data: autoModRules = [] } = useQuery({
    queryKey: ['autoModRules', activeServer?.id],
    queryFn: () => base44.entities.AutoModRule.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });
  
  // Real-time subscriptions
  useRealtimeMessages(activeChannel?.id, view === 'server');
  useRealtimeDMs(activeConversation?.id, view === 'dms');
  useRealtimeTyping(activeChannel?.id, activeConversation?.id);
  
  // Slow mode
  const { canSend: canSendSlowMode, remainingTime: slowModeRemaining, recordMessage } = useSlowMode(
    activeChannel?.id,
    activeChannel?.slow_mode_seconds || 0,
    currentUser?.id
  );
  
  // Read receipts
  const { markAsRead } = useReadReceipts(
    activeChannel?.id,
    activeConversation?.id,
    currentUser?.id
  );
  
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
      if (!canSendSlowMode && activeChannel) {
        throw new Error(`Please wait ${slowModeRemaining}s`);
      }
      
      // For DMs
      if (activeConversation) {
        return base44.entities.DirectMessage.create({
          conversation_id: activeConversation.id,
          sender_id: currentUser.id,
          sender_name: userProfile?.display_name || currentUser.full_name,
          sender_avatar: userProfile?.avatar_url,
          content,
          attachments,
        });
      }
      
      // For channels
      const messageData = {
        content,
        attachments,
        author_id: currentUser.id,
      };
      
      const modResult = await processAutoMod(messageData, activeServer?.id, autoModRules);
      
      if (!modResult.allowed) {
        await executeAutoModAction(modResult, messageData, activeServer?.id, currentUser.id);
        throw new Error(`Message blocked`);
      }
      
      const message = await base44.entities.Message.create({
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
      
      recordMessage();
      return message;
    },
    onSuccess: () => {
      if (activeConversation) {
        queryClient.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
      }
      setReplyTo(null);
    },
  });
  
  // Friend mutations
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (username, targetUser) => {
      let target = targetUser;
      if (!target) {
        const profiles = await base44.entities.UserProfile.list();
        target = profiles.find(p => 
          p.username?.toLowerCase() === username.toLowerCase() ||
          p.display_name?.toLowerCase() === username.toLowerCase()
        );
      }
      
      if (!target) throw new Error('User not found');
      
      // Check if already friends or request pending
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendships'] }),
  });
  
  const acceptFriendMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.Friendship.update(request.id, { status: 'accepted' });
      
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
      
      // Check if already member
      const existing = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: currentUser.id,
      });
      if (existing.length > 0) throw new Error('Already a member');
      
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
      setShowJoinServer(false);
    },
  });
  
  // Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile) {
        await base44.entities.UserProfile.update(userProfile.id, data);
      }
    },
    onSuccess: () => {
      refetchProfile();
    },
  });
  
  // Auto-select channel
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const textChannel = channels.find(c => c.type === 'text');
      if (textChannel) setActiveChannel(textChannel);
    }
  }, [activeServer, channels]);
  
  useEffect(() => {
    if (view !== 'server') {
      setActiveChannel(null);
    }
  }, [view]);
  
  // Profile map
  const profilesMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(profiles) ? profiles : []).forEach(p => map.set(p.user_id, p));
    return map;
  }, [profiles]);
  
  // Message handlers
  const handleEditMessage = async (message) => {
    const newContent = prompt('Edit message:', message.content);
    if (newContent && newContent !== message.content) {
      await base44.entities.Message.update(message.id, { 
        content: newContent, 
        is_edited: true,
        edited_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    }
  };
  
  const handleDeleteMessage = async (message) => {
    if (confirm('Delete this message?')) {
      await base44.entities.Message.update(message.id, { is_deleted: true });
      queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    }
  };
  
  const handlePinMessage = async (message) => {
    await base44.entities.Message.update(message.id, { is_pinned: !message.is_pinned });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };
  
  const handleToggleReaction = async (message, emoji) => {
    const reactions = message.reactions || [];
    const existing = reactions.find(r => r.emoji === emoji);
    
    let newReactions;
    if (existing) {
      const hasReacted = existing.users?.includes(currentUser.id);
      if (hasReacted) {
        newReactions = reactions.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id) }
            : r
        ).filter(r => r.count > 0);
      } else {
        newReactions = reactions.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count + 1, users: [...(r.users || []), currentUser.id] }
            : r
        );
      }
    } else {
      newReactions = [...reactions, { emoji, count: 1, users: [currentUser.id] }];
    }
    
    await base44.entities.Message.update(message.id, { reactions: newReactions });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };
  
  // Navigation handlers
  const handleServerSelect = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
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
    setActiveConversation(null);
  };
  
  const handleStartDM = async (friend) => {
    let conversation = conversations.find(c => 
      c.participants?.some(p => p.user_id === friend.friend_id)
    );
    
    if (!conversation) {
      conversation = await base44.entities.Conversation.create({
        participants: [
          { user_id: currentUser.id, user_name: userProfile?.display_name, user_avatar: userProfile?.avatar_url },
          { user_id: friend.friend_id, user_name: friend.friend_name, user_avatar: friend.friend_avatar },
        ],
        is_group: false,
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
    
    setActiveConversation(conversation);
    setView('dms');
  };
  
  const handleConversationSelect = (conv) => {
    setActiveConversation(conv);
    setView('dms');
  };
  
  const handleCloseConversation = async (conv) => {
    // Just remove from view, don't delete
    if (activeConversation?.id === conv.id) {
      setActiveConversation(null);
    }
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
          onNitro={() => setShowNitroCheckout(true)}
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
            onInvite={() => {
              navigator.clipboard.writeText(`https://kairo.app/invite/${activeServer.invite_code}`);
            }}
            voiceStates={voiceStates}
          />
        ) : view === 'dms' || view === 'friends' ? (
          <DMPanel
            conversations={conversations}
            friends={friends}
            activeConversationId={activeConversation?.id}
            onConversationSelect={handleConversationSelect}
            onShowFriends={handleFriendsClick}
            onCreateDM={() => setShowAddFriend(true)}
            onCloseConversation={handleCloseConversation}
            onJoinServer={() => setShowJoinServer(true)}
            onNitro={() => setShowNitroCheckout(true)}
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
            onShowSearch={() => setShowAdvancedSearch(true)}
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
            onKick={setShowKickMember}
            onBan={setShowBanMember}
            onTimeout={setShowTimeoutMember}
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
          isPremium={userProfile?.badges?.includes('premium')}
          onLogout={() => base44.auth.logout()}
          onStatusChange={async (status) => {
            if (userProfile) {
              await base44.entities.UserProfile.update(userProfile.id, { status });
              queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            }
          }}
        />
      }
    >
      {/* Main content */}
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
        <NSFWGate channel={activeChannel} onConfirm={() => {}}>
          {activeChannel.type === 'forum' ? (
            <ForumChannelView
              channel={activeChannel}
              serverId={activeServer?.id}
              currentUser={currentUser}
              onPostSelect={() => {}}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <MessageList
                messages={messages}
                currentUserId={currentUser?.id}
                channelName={activeChannel.name}
                isLoading={messagesLoading}
                onReply={setReplyTo}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReact={(msg) => handleToggleReaction(msg, '👍')}
                onToggleReaction={handleToggleReaction}
                onPin={handlePinMessage}
                onAvatarClick={() => {}}
              />
              <div>
                <SlowModeIndicator 
                  seconds={activeChannel?.slow_mode_seconds} 
                  remainingTime={slowModeRemaining}
                  className="px-4 pb-2"
                />
                <MessageComposer
                  channelName={activeChannel.name}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  onSendMessage={(data) => sendMessageMutation.mutate(data)}
                  members={members}
                  disabled={!canSendSlowMode}
                  onCreatePoll={() => setShowCreatePoll(true)}
                  onScheduleMessage={() => setShowScheduleMessage(true)}
                />
              </div>
            </div>
          )}
        </NSFWGate>
      ) : view === 'dms' && activeConversation ? (
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList
            messages={dmMessages}
            currentUserId={currentUser?.id}
            channelName={activeConversation.name || activeConversation.participants?.find(p => p.user_id !== currentUser?.id)?.user_name || 'DM'}
            isLoading={dmMessagesLoading}
            onReply={setReplyTo}
            onEdit={() => {}}
            onDelete={() => {}}
            onReact={() => {}}
            onToggleReaction={() => {}}
            onPin={() => {}}
            onAvatarClick={() => {}}
          />
          <MessageComposer
            channelName={activeConversation.name || 'this conversation'}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSendMessage={(data) => sendMessageMutation.mutate(data)}
            members={[]}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 flex items-center justify-center mb-4">
              <span className="text-4xl">👋</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to Kairo</h2>
            <p className="text-sm text-zinc-500 mb-6">Select a server or start a conversation</p>
            <div className="flex items-center justify-center gap-3">
              <button 
                onClick={() => setShowCreateServer(true)}
                className="px-4 h-9 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Create Server
              </button>
              <button 
                onClick={() => setShowJoinServer(true)}
                className="px-4 h-9 text-sm font-medium text-zinc-300 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg transition-colors"
              >
                Join Server
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ALL MODALS */}
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
            onDiscover={() => {
              setShowJoinServer(false);
              setShowDiscover(true);
            }}
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
        
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            profile={userProfile}
            onUpdateProfile={(data) => updateProfileMutation.mutate(data)}
            onLogout={() => base44.auth.logout()}
          />
        )}
        
        {showServerSettings && (
          <ServerSettingsModal
            isOpen={showServerSettings}
            onClose={() => setShowServerSettings(false)}
            server={activeServer}
            members={members}
            onUpdate={(updated) => {
              setActiveServer(updated);
              queryClient.invalidateQueries({ queryKey: ['memberServers'] });
            }}
          />
        )}
        
        {showDiscover && (
          <DiscoverServersModal
            isOpen={showDiscover}
            onClose={() => setShowDiscover(false)}
            currentUser={currentUser}
            onJoinServer={handleServerSelect}
          />
        )}
        
        {showKickMember && (
          <KickMemberModal
            isOpen={!!showKickMember}
            onClose={() => setShowKickMember(null)}
            member={showKickMember}
            server={activeServer}
          />
        )}
        
        {showBanMember && (
          <BanMemberModal
            isOpen={!!showBanMember}
            onClose={() => setShowBanMember(null)}
            member={showBanMember}
            server={activeServer}
          />
        )}
        
        {showTimeoutMember && (
          <TimeoutMemberModal
            isOpen={!!showTimeoutMember}
            onClose={() => setShowTimeoutMember(null)}
            member={showTimeoutMember}
            server={activeServer}
          />
        )}
        
        {showCreatePoll && (
          <CreatePollModal
            isOpen={showCreatePoll}
            onClose={() => setShowCreatePoll(false)}
            channelId={activeChannel?.id}
            serverId={activeServer?.id}
            currentUser={currentUser}
          />
        )}
        
        {showScheduleMessage && (
          <ScheduleMessageModal
            isOpen={showScheduleMessage}
            onClose={() => setShowScheduleMessage(false)}
            channelId={activeChannel?.id}
            serverId={activeServer?.id}
            currentUser={currentUser}
          />
        )}
        
        {showAdvancedSearch && (
          <AdvancedSearchModal
            isOpen={showAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
            serverId={activeServer?.id}
          />
        )}
        
        {showNitroCheckout && (
          <NitroCheckoutModal
            isOpen={showNitroCheckout}
            onClose={() => setShowNitroCheckout(false)}
            currentUser={currentUser}
          />
        )}
        
        {showBoostCheckout && (
          <BoostCheckoutModal
            isOpen={showBoostCheckout}
            onClose={() => setShowBoostCheckout(false)}
            server={activeServer}
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