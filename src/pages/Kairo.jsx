import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Hash, Users, Pin, Bell, Search, Inbox, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import LoadingScreen from '@/components/kairo/LoadingScreen';
import Sidebar from '@/components/kairo/Sidebar';
import ChannelSidebar from '@/components/kairo/ChannelSidebar';
import DMSidebar from '@/components/kairo/DMSidebar';
import MessageList from '@/components/kairo/MessageList';
import MessageInput from '@/components/kairo/MessageInput';
import VoicePanel from '@/components/kairo/VoicePanel';
import MemberList from '@/components/kairo/MemberList';
import UserStatusBar from '@/components/kairo/UserStatusBar';
import VoiceConnectionBar from '@/components/kairo/VoiceConnectionBar';
import CreateServerModal from '@/components/kairo/CreateServerModal';
import CreateChannelModal from '@/components/kairo/CreateChannelModal';
import SettingsModal from '@/components/kairo/SettingsModal';
import InviteModal from '@/components/kairo/InviteModal';
import AddFriendModal from '@/components/kairo/AddFriendModal';
import JoinServerModal from '@/components/kairo/JoinServerModal';
import DiscoverServers from '@/components/kairo/DiscoverServers';
import CommandPalette from '@/components/kairo/CommandPalette';

// Channel header
function ChannelHeader({ channel, memberCount, onMembersToggle, showMembers }) {
  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50 bg-[#121214]">
      <div className="flex items-center gap-2">
        <Hash className="w-5 h-5 text-zinc-500" />
        <h2 className="font-semibold text-white">{channel?.name || 'general'}</h2>
        {channel?.topic && (
          <>
            <div className="w-px h-4 bg-zinc-700 mx-2" />
            <span className="text-sm text-zinc-500 truncate max-w-[300px]">{channel.topic}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800/50">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800/50">
          <Pin className="w-5 h-5" />
        </button>
        <button
          onClick={onMembersToggle}
          className={cn(
            "p-2 transition-colors rounded",
            showMembers 
              ? "text-white bg-zinc-800/50" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Users className="w-5 h-5" />
        </button>
        <div className="relative ml-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-40 h-7 pl-8 pr-2 bg-zinc-900 border-none rounded text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800/50">
          <Inbox className="w-5 h-5" />
        </button>
        <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded hover:bg-zinc-800/50">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function KairoPage() {
  const queryClient = useQueryClient();
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation state
  const [view, setView] = useState('dms'); // 'dms' | 'server' | 'discover'
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  
  // Voice state
  const [voiceChannel, setVoiceChannel] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListeningOnly, setIsListeningOnly] = useState(false);
  
  // Modal state
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createChannelCategory, setCreateChannelCategory] = useState(null);
  
  // Reply state
  const [replyTo, setReplyTo] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) return profiles[0];
      // Create default profile
      const newProfile = await base44.entities.UserProfile.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        display_name: currentUser.full_name || 'User',
        username: currentUser.email?.split('@')[0],
        status: 'online',
        settings: {
          theme: 'dark',
          message_display: 'cozy',
          dm_privacy: 'everyone',
          friend_requests: 'everyone',
          read_receipts: true,
          typing_indicators: true
        }
      });
      return newProfile;
    },
    enabled: !!currentUser?.email
  });

  // Fetch servers user is member of
  const { data: memberServers = [] } = useQuery({
    queryKey: ['memberServers', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const memberships = await base44.entities.ServerMember.filter({ user_email: currentUser.email });
      if (memberships.length === 0) return [];
      
      const serverIds = memberships.map(m => m.server_id);
      const servers = await base44.entities.Server.list();
      return servers.filter(s => serverIds.includes(s.id));
    },
    enabled: !!currentUser?.email
  });

  // Fetch categories for active server
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', activeServer?.id],
    queryFn: () => base44.entities.Category.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch channels for active server
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', activeServer?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch messages for active channel
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', activeChannel?.id],
    queryFn: () => base44.entities.Message.filter({ channel_id: activeChannel.id }, '-created_date', 100),
    enabled: !!activeChannel?.id
  });

  // Fetch server members
  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch roles for active server
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', activeServer?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch voice states for active server
  const { data: voiceStates = [] } = useQuery({
    queryKey: ['voiceStates', activeServer?.id],
    queryFn: () => base44.entities.VoiceState.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const allConvos = await base44.entities.Conversation.list('-last_message_at', 50);
      return allConvos.filter(c => 
        c.participants?.some(p => p.user_email === currentUser.email)
      );
    },
    enabled: !!currentUser?.email
  });

  // Fetch friends
  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const friendships = await base44.entities.Friendship.filter({ 
        user_id: currentUser.id,
        status: 'accepted'
      });
      return friendships;
    },
    enabled: !!currentUser?.id
  });

  // Fetch DM messages
  const { data: dmMessages = [], isLoading: dmMessagesLoading } = useQuery({
    queryKey: ['dmMessages', activeConversation?.id],
    queryFn: () => base44.entities.DirectMessage.filter(
      { conversation_id: activeConversation.id },
      '-created_date',
      100
    ),
    enabled: !!activeConversation?.id
  });

  // Fetch public servers for discovery
  const { data: publicServers = [] } = useQuery({
    queryKey: ['publicServers'],
    queryFn: () => base44.entities.Server.filter({ is_public: true })
  });

  // Mutations
  const createServerMutation = useMutation({
    mutationFn: async ({ name, description, icon_url, template, templateChannels }) => {
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create server
      const server = await base44.entities.Server.create({
        name,
        description,
        icon_url,
        owner_id: currentUser.id,
        template,
        invite_code: inviteCode,
        member_count: 1
      });

      // Create default role
      await base44.entities.Role.create({
        server_id: server.id,
        name: '@everyone',
        is_default: true,
        position: 0,
        permissions: ['view_channels', 'send_messages', 'read_message_history']
      });

      // Add owner as member
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: currentUser.id,
        user_email: currentUser.email,
        joined_at: new Date().toISOString()
      });

      // Create template channels if any
      if (templateChannels?.length > 0) {
        for (const catData of templateChannels) {
          let categoryId = null;
          
          if (catData.category) {
            const category = await base44.entities.Category.create({
              server_id: server.id,
              name: catData.category,
              position: templateChannels.indexOf(catData)
            });
            categoryId = category.id;
          }

          for (const channelData of catData.channels) {
            await base44.entities.Channel.create({
              server_id: server.id,
              category_id: categoryId,
              name: channelData.name,
              type: channelData.type,
              position: catData.channels.indexOf(channelData)
            });
          }
        }
      } else {
        // Create default general channel
        await base44.entities.Channel.create({
          server_id: server.id,
          name: 'general',
          type: 'text',
          position: 0
        });
      }

      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      setActiveServer(server);
      setView('server');
    }
  });

  const createChannelMutation = useMutation({
    mutationFn: async (channelData) => {
      return base44.entities.Channel.create({
        ...channelData,
        server_id: activeServer.id,
        position: channels.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', activeServer?.id] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      const replyPreview = replyToId && replyTo ? {
        author_name: replyTo.author_name,
        content: replyTo.content?.slice(0, 100)
      } : null;

      return base44.entities.Message.create({
        channel_id: activeChannel.id,
        server_id: activeServer.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name,
        author_avatar: userProfile?.avatar_url,
        content,
        attachments,
        type: replyToId ? 'reply' : 'default',
        reply_to_id: replyToId,
        reply_preview: replyPreview
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
      setReplyTo(null);
    }
  });

  const sendDMMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      // Update conversation last message
      await base44.entities.Conversation.update(activeConversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content?.slice(0, 50)
      });

      return base44.entities.DirectMessage.create({
        conversation_id: activeConversation.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name,
        author_avatar: userProfile?.avatar_url,
        content,
        attachments,
        type: replyToId ? 'reply' : 'default',
        reply_to_id: replyToId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setReplyTo(null);
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const joinServerMutation = useMutation({
    mutationFn: async (inviteCode) => {
      const servers = await base44.entities.Server.filter({ invite_code: inviteCode });
      if (servers.length === 0) throw new Error('Invalid invite code');
      
      const server = servers[0];
      
      // Check if already a member
      const existingMember = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_email: currentUser.email
      });
      
      if (existingMember.length > 0) {
        return server; // Already a member, just return the server
      }

      // Join the server
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: currentUser.id,
        user_email: currentUser.email,
        joined_at: new Date().toISOString()
      });

      // Update member count
      await base44.entities.Server.update(server.id, {
        member_count: (server.member_count || 0) + 1
      });

      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      setActiveServer(server);
      setView('server');
    }
  });

  // Set default channel when server changes
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const defaultChannel = channels.find(c => c.type === 'text') || channels[0];
      setActiveChannel(defaultChannel);
    }
  }, [activeServer, channels, activeChannel]);

  // Handle server selection
  const handleServerSelect = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
    setView('server');
  };

  // Handle DMs click
  const handleDMsClick = () => {
    setActiveServer(null);
    setActiveChannel(null);
    setView('dms');
  };

  // Handle voice channel join
  const handleJoinVoice = async (channel) => {
    if (voiceChannel?.id === channel.id) return;
    
    // Leave current voice channel if any
    if (voiceChannel) {
      const existingState = voiceStates.find(v => 
        v.user_id === currentUser.id && v.channel_id === voiceChannel.id
      );
      if (existingState) {
        await base44.entities.VoiceState.delete(existingState.id);
      }
    }

    // Join new voice channel
    await base44.entities.VoiceState.create({
      user_id: currentUser.id,
      user_email: currentUser.email,
      user_name: userProfile?.display_name || currentUser.full_name,
      user_avatar: userProfile?.avatar_url,
      server_id: activeServer.id,
      channel_id: channel.id,
      is_self_muted: isMuted,
      is_self_deafened: isDeafened
    });

    setVoiceChannel(channel);
    queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
  };

  // Handle voice disconnect
  const handleVoiceDisconnect = async () => {
    if (!voiceChannel) return;
    
    const existingState = voiceStates.find(v => 
      v.user_id === currentUser.id && v.channel_id === voiceChannel.id
    );
    if (existingState) {
      await base44.entities.VoiceState.delete(existingState.id);
    }
    
    setVoiceChannel(null);
    setIsMuted(false);
    setIsDeafened(false);
    setIsVideo(false);
    setIsStreaming(false);
    setIsListeningOnly(false);
    queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
  };

  // Handle channel click (text or voice)
  const handleChannelClick = (channel) => {
    if (channel.type === 'voice' || channel.type === 'stage') {
      handleJoinVoice(channel);
    } else {
      setActiveChannel(channel);
    }
  };

  // Handle message actions
  const handleReact = async (messageId, emoji) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.emoji === emoji);

    let newReactions;
    if (existingReaction) {
      const hasReacted = existingReaction.users?.includes(currentUser.id);
      if (hasReacted) {
        // Remove reaction
        newReactions = reactions.map(r => {
          if (r.emoji === emoji) {
            return {
              ...r,
              count: r.count - 1,
              users: r.users.filter(u => u !== currentUser.id)
            };
          }
          return r;
        }).filter(r => r.count > 0);
      } else {
        // Add to existing reaction
        newReactions = reactions.map(r => {
          if (r.emoji === emoji) {
            return {
              ...r,
              count: r.count + 1,
              users: [...(r.users || []), currentUser.id]
            };
          }
          return r;
        });
      }
    } else {
      // New reaction
      newReactions = [...reactions, { emoji, count: 1, users: [currentUser.id] }];
    }

    await base44.entities.Message.update(messageId, { reactions: newReactions });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };

  const handleDeleteMessage = async (messageId) => {
    await base44.entities.Message.delete(messageId);
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };

  // Loading screen
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  // Discover view
  if (view === 'discover') {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <Sidebar
          servers={memberServers}
          activeServerId={null}
          onServerSelect={handleServerSelect}
          onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')}
          onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)}
          isDMsActive={false}
          userProfile={userProfile}
        />
        <DiscoverServers
          servers={publicServers}
          onJoinServer={(server) => joinServerMutation.mutate(server.invite_code)}
          onBack={() => setView('dms')}
        />
        
        <AnimatePresence>
          {showCreateServer && (
            <CreateServerModal
              isOpen={showCreateServer}
              onClose={() => setShowCreateServer(false)}
              onCreate={(data) => createServerMutation.mutate(data)}
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
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#0a0a0b]">
      {/* Main Sidebar */}
      <Sidebar
        servers={memberServers}
        activeServerId={activeServer?.id}
        onServerSelect={handleServerSelect}
        onDMsClick={handleDMsClick}
        onDiscoverClick={() => setView('discover')}
        onCreateServer={() => setShowCreateServer(true)}
        onSettingsClick={() => setShowSettings(true)}
        isDMsActive={view === 'dms'}
        userProfile={userProfile}
      />

      {/* Channel/DM Sidebar */}
      {view === 'dms' ? (
        <div className="flex flex-col">
          <DMSidebar
            conversations={conversations}
            friends={friends}
            activeConversationId={activeConversation?.id}
            onConversationSelect={(convo) => setActiveConversation(convo)}
            onConversationClose={() => setActiveConversation(null)}
            onNewDM={() => {}}
            onAddFriend={() => setShowAddFriend(true)}
          />
          <UserStatusBar
            profile={userProfile}
            isMuted={isMuted}
            isDeafened={isDeafened}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)}
            onStatusChange={(status) => updateProfileMutation.mutate({ status })}
            onCustomStatusChange={(customStatus) => updateProfileMutation.mutate({ custom_status: customStatus })}
          />
        </div>
      ) : (
        <div className="flex flex-col">
          <ChannelSidebar
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={handleChannelClick}
            onServerSettings={() => {}}
            onCreateChannel={(categoryId) => {
              setCreateChannelCategory(categoryId);
              setShowCreateChannel(true);
            }}
            onInvite={() => setShowInvite(true)}
            voiceStates={voiceStates}
          />
          {voiceChannel && (
            <VoiceConnectionBar
              channel={voiceChannel}
              server={activeServer}
              onDisconnect={handleVoiceDisconnect}
              onOpenVoicePanel={() => setActiveChannel(voiceChannel)}
            />
          )}
          <UserStatusBar
            profile={userProfile}
            isMuted={isMuted}
            isDeafened={isDeafened}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)}
            onStatusChange={(status) => updateProfileMutation.mutate({ status })}
            onCustomStatusChange={(customStatus) => updateProfileMutation.mutate({ custom_status: customStatus })}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {view === 'server' && activeChannel ? (
          activeChannel.type === 'voice' || activeChannel.type === 'stage' ? (
            <VoicePanel
              channel={activeChannel}
              voiceUsers={voiceStates.filter(v => v.channel_id === activeChannel.id)}
              currentUserId={currentUser?.id}
              onLeave={handleVoiceDisconnect}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleDeafen={() => setIsDeafened(!isDeafened)}
              onToggleVideo={() => setIsVideo(!isVideo)}
              onStartStream={() => setIsStreaming(!isStreaming)}
              onToggleListenOnly={() => setIsListeningOnly(!isListeningOnly)}
              isMuted={isMuted}
              isDeafened={isDeafened}
              isVideo={isVideo}
              isStreaming={isStreaming}
              isListeningOnly={isListeningOnly}
            />
          ) : (
            <>
              <ChannelHeader
                channel={activeChannel}
                memberCount={members.length}
                onMembersToggle={() => setShowMembers(!showMembers)}
                showMembers={showMembers}
              />
              <div className="flex-1 flex min-h-0">
                <div className="flex-1 flex flex-col bg-[#121214]">
                  <MessageList
                    messages={[...messages].reverse()}
                    currentUserId={currentUser?.id}
                    onReply={(msg) => setReplyTo(msg)}
                    onEdit={() => {}}
                    onDelete={handleDeleteMessage}
                    onReact={handleReact}
                    isLoading={messagesLoading}
                  />
                  <MessageInput
                    channelName={activeChannel?.name}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    onSendMessage={(data) => sendMessageMutation.mutate(data)}
                  />
                </div>
                {showMembers && (
                  <MemberList
                    members={members.map(m => ({
                      ...m,
                      user_name: m.nickname || m.user_email?.split('@')[0],
                      status: 'online'
                    }))}
                    roles={roles}
                    ownerId={activeServer?.owner_id}
                  />
                )}
              </div>
            </>
          )
        ) : view === 'dms' && activeConversation ? (
          <>
            <div className="h-12 px-4 flex items-center border-b border-zinc-800/50 bg-[#121214]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {activeConversation.participants?.[0]?.user_name?.charAt(0) || '?'}
                </div>
                <span className="font-semibold text-white">
                  {activeConversation.name || activeConversation.participants?.[0]?.user_name}
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-[#121214]">
              <MessageList
                messages={[...dmMessages].reverse()}
                currentUserId={currentUser?.id}
                onReply={(msg) => setReplyTo(msg)}
                onReact={() => {}}
                isLoading={dmMessagesLoading}
              />
              <MessageInput
                channelName={activeConversation.participants?.[0]?.user_name}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSendMessage={(data) => sendDMMutation.mutate(data)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#121214]">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                <span className="text-5xl font-bold text-white">K</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Kairo</h2>
              <p className="text-zinc-500 max-w-md">
                {view === 'dms' 
                  ? 'Select a conversation to start chatting, or add a friend to get started.'
                  : 'Select a channel to start chatting, or create a new server to begin.'
                }
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {view === 'dms' ? (
                  <button
                    onClick={() => setShowAddFriend(true)}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Friend
                  </button>
                ) : (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Invite People
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateServer && (
          <CreateServerModal
            isOpen={showCreateServer}
            onClose={() => setShowCreateServer(false)}
            onCreate={(data) => createServerMutation.mutate(data)}
          />
        )}
        {showCreateChannel && (
          <CreateChannelModal
            isOpen={showCreateChannel}
            onClose={() => setShowCreateChannel(false)}
            onCreate={(data) => createChannelMutation.mutate(data)}
            categories={categories}
            defaultCategoryId={createChannelCategory}
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
        {showInvite && (
          <InviteModal
            isOpen={showInvite}
            onClose={() => setShowInvite(false)}
            server={activeServer}
          />
        )}
        {showAddFriend && (
          <AddFriendModal
            isOpen={showAddFriend}
            onClose={() => setShowAddFriend(false)}
            onSendRequest={async (username) => {
              // Find user by username and create friend request
              const profiles = await base44.entities.UserProfile.filter({ username });
              if (profiles.length === 0) throw new Error('User not found');
              
              await base44.entities.Friendship.create({
                user_id: currentUser.id,
                friend_id: profiles[0].user_id,
                friend_email: profiles[0].user_email,
                friend_name: profiles[0].display_name,
                friend_avatar: profiles[0].avatar_url,
                status: 'pending',
                initiated_by: currentUser.id
              });
            }}
          />
        )}
        {showJoinServer && (
          <JoinServerModal
            isOpen={showJoinServer}
            onClose={() => setShowJoinServer(false)}
            onJoin={(code) => joinServerMutation.mutate(code)}
            onDiscover={() => setView('discover')}
          />
        )}
        {showCommandPalette && (
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            servers={memberServers}
            channels={channels}
            conversations={conversations}
            onCommand={(cmd) => {
              switch (cmd.id) {
                case 'focus-mode':
                  updateProfileMutation.mutate({ settings: { ...userProfile?.settings, focus_mode: !userProfile?.settings?.focus_mode } });
                  break;
                case 'ghost-mode':
                  updateProfileMutation.mutate({ settings: { ...userProfile?.settings, ghost_mode: !userProfile?.settings?.ghost_mode } });
                  break;
                case 'create-server':
                  setShowCreateServer(true);
                  break;
                case 'join-server':
                  setShowJoinServer(true);
                  break;
                case 'add-friend':
                  setShowAddFriend(true);
                  break;
                case 'settings':
                  setShowSettings(true);
                  break;
                case 'dms':
                  handleDMsClick();
                  break;
                default:
                  if (cmd.id.startsWith('server-')) {
                    handleServerSelect(cmd.data);
                  } else if (cmd.id.startsWith('channel-')) {
                    handleChannelClick(cmd.data);
                  } else if (cmd.id.startsWith('dm-')) {
                    setActiveConversation(cmd.data);
                    setView('dms');
                  }
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}