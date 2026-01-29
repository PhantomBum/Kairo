import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Hash, Users, Pin, Bell, Search, Inbox, HelpCircle, ShoppingBag, Calendar, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Core Components
import LoadingScreen from '@/components/kairo/LoadingScreen';
import SidebarNew from '@/components/kairo/SidebarNew';
import ChannelSidebar from '@/components/kairo/ChannelSidebar';
import DMSidebar from '@/components/kairo/DMSidebar';
import MessageList from '@/components/kairo/MessageList';
import MessageInput from '@/components/kairo/MessageInput';
import MemberList from '@/components/kairo/MemberList';
import UserStatusBar from '@/components/kairo/UserStatusBar';
import VoiceConnectionBar from '@/components/kairo/VoiceConnectionBar';

// Modals
import CreateServerModal from '@/components/kairo/CreateServerModal';
import CreateChannelModal from '@/components/kairo/CreateChannelModal';
import CommandPalette from '@/components/kairo/CommandPalette';
import ServerPreviewModal from '@/components/kairo/ServerPreviewModal';

// Feature Components
import ServerHub from '@/components/kairo/ServerHub';
import WebRTCVoice from '@/components/kairo/voice/WebRTCVoice';
import FullSettingsModal from '@/components/kairo/settings/FullSettingsModal';
import ShopPage from '@/components/kairo/shop/ShopPage';
import EventsPage from '@/components/kairo/events/EventsPage';
import ProfileEditor from '@/components/kairo/profile/ProfileEditor';
import TypingIndicator from '@/components/kairo/chat/TypingIndicator';
import { IncomingCallModal, ActiveCallModal, OutgoingCallModal } from '@/components/kairo/voice/DMCallModal';

// New v2.0 Components
import FriendSystem from '@/components/kairo/friends/FriendSystem';
import { CreateInviteModal, JoinByInviteModal } from '@/components/kairo/invites/InviteSystem';
import { ExportBlueprintModal, ImportBlueprintModal, useApplyBlueprint } from '@/components/kairo/server/ServerBlueprint';
import { WorkspaceProvider, useWorkspace } from '@/components/kairo/core/WorkspaceProvider';
import { RealtimeProvider, useRealtime } from '@/components/kairo/core/RealtimeProvider';
import { AuditLogViewer, AutoModerationSettings } from '@/components/kairo/moderation/ModerationTools';
import AddFriendModal from '@/components/kairo/AddFriendModal';

// Channel header component
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
            showMembers ? "text-white bg-zinc-800/50" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
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
  const [view, setView] = useState('dms'); // 'dms' | 'server' | 'discover' | 'shop' | 'events' | 'friends'
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
  
  // DM Call state
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  
  // Modal state
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [previewServer, setPreviewServer] = useState(null);
  const [createChannelCategory, setCreateChannelCategory] = useState(null);
  const [showExportBlueprint, setShowExportBlueprint] = useState(false);
  const [showImportBlueprint, setShowImportBlueprint] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  // Reply state
  const [replyTo, setReplyTo] = useState(null);

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
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: currentUser.email });
      if (profiles.length > 0) return profiles[0];
      const newProfile = await base44.entities.UserProfile.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        display_name: currentUser.full_name || 'User',
        username: currentUser.email?.split('@')[0],
        status: 'online',
        settings: { theme: 'dark', message_display: 'cozy' }
      });
      return newProfile;
    },
    enabled: !!currentUser?.email
  });

  // Fetch user settings
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const settings = await base44.entities.UserSettings.filter({ user_email: currentUser.email });
      if (settings.length > 0) return settings[0];
      return base44.entities.UserSettings.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        appearance: { theme: 'dark', message_display: 'cozy' },
        notifications: { desktop_enabled: true, sounds_enabled: true },
        privacy: { dm_privacy: 'everyone', read_receipts: true, typing_indicators: true },
        voice: { input_mode: 'voice_activity', noise_suppression: true },
        kairo_features: { focus_mode: false, ghost_mode: false }
      });
    },
    enabled: !!currentUser?.email
  });

  // Fetch user credits
  const { data: userCredits } = useQuery({
    queryKey: ['userCredits', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const credits = await base44.entities.UserCredits.filter({ user_email: currentUser.email });
      if (credits.length > 0) return credits[0];
      return base44.entities.UserCredits.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        balance: 1000, // Free starting credits
        has_nitro: true // Free nitro for everyone
      });
    },
    enabled: !!currentUser?.email
  });

  // Fetch user inventory
  const { data: userInventory = [] } = useQuery({
    queryKey: ['userInventory', currentUser?.id],
    queryFn: () => base44.entities.UserInventory.filter({ user_id: currentUser?.id }),
    enabled: !!currentUser?.id
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

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', activeServer?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id
  });

  // Fetch voice states
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
      return allConvos.filter(c => c.participants?.some(p => p.user_email === currentUser.email));
    },
    enabled: !!currentUser?.email
  });

  // Fetch friends
  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      return base44.entities.Friendship.filter({ user_id: currentUser.id, status: 'accepted' });
    },
    enabled: !!currentUser?.id
  });

  // Fetch DM messages
  const { data: dmMessages = [], isLoading: dmMessagesLoading } = useQuery({
    queryKey: ['dmMessages', activeConversation?.id],
    queryFn: () => base44.entities.DirectMessage.filter({ conversation_id: activeConversation.id }, '-created_date', 100),
    enabled: !!activeConversation?.id
  });

  // Fetch typing indicators
  const { data: typingUsers = [] } = useQuery({
    queryKey: ['typing', activeChannel?.id || activeConversation?.id],
    queryFn: async () => {
      const filter = activeChannel?.id 
        ? { channel_id: activeChannel.id }
        : { conversation_id: activeConversation?.id };
      const indicators = await base44.entities.TypingIndicator.filter(filter);
      // Filter out old typing indicators (> 5 seconds)
      const now = new Date();
      return indicators.filter(i => {
        const started = new Date(i.started_at);
        return (now - started) < 5000 && i.user_id !== currentUser?.id;
      });
    },
    enabled: !!(activeChannel?.id || activeConversation?.id),
    refetchInterval: 2000
  });

  // Fetch public servers
  const { data: publicServers = [] } = useQuery({
    queryKey: ['publicServers'],
    queryFn: () => base44.entities.Server.filter({ is_public: true })
  });

  // Mutations
  const createServerMutation = useMutation({
    mutationFn: async ({ name, description, icon_url, template, templateChannels }) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const server = await base44.entities.Server.create({
        name, description, icon_url, owner_id: currentUser.id, template, invite_code: inviteCode, member_count: 1
      });
      await base44.entities.Role.create({
        server_id: server.id, name: '@everyone', is_default: true, position: 0,
        permissions: ['view_channels', 'send_messages', 'read_message_history']
      });
      await base44.entities.ServerMember.create({
        server_id: server.id, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString()
      });
      if (templateChannels?.length > 0) {
        for (const catData of templateChannels) {
          let categoryId = null;
          if (catData.category) {
            const category = await base44.entities.Category.create({ server_id: server.id, name: catData.category, position: templateChannels.indexOf(catData) });
            categoryId = category.id;
          }
          for (const channelData of catData.channels) {
            await base44.entities.Channel.create({ server_id: server.id, category_id: categoryId, name: channelData.name, type: channelData.type, position: catData.channels.indexOf(channelData) });
          }
        }
      } else {
        await base44.entities.Channel.create({ server_id: server.id, name: 'general', type: 'text', position: 0 });
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
    mutationFn: async (channelData) => base44.entities.Channel.create({ ...channelData, server_id: activeServer.id, position: channels.length }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels', activeServer?.id] })
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      const replyPreview = replyToId && replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 100) } : null;
      return base44.entities.Message.create({
        channel_id: activeChannel.id, server_id: activeServer.id, author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name, author_avatar: userProfile?.avatar_url,
        content, attachments, type: replyToId ? 'reply' : 'default', reply_to_id: replyToId, reply_preview: replyPreview
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] }); setReplyTo(null); }
  });

  const sendDMMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      await base44.entities.Conversation.update(activeConversation.id, { last_message_at: new Date().toISOString(), last_message_preview: content?.slice(0, 50) });
      return base44.entities.DirectMessage.create({
        conversation_id: activeConversation.id, author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name, author_avatar: userProfile?.avatar_url,
        content, attachments, type: replyToId ? 'reply' : 'default', reply_to_id: replyToId
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] }); queryClient.invalidateQueries({ queryKey: ['conversations'] }); setReplyTo(null); }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.UserSettings.update(userSettings.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSettings'] })
  });

  const joinServerMutation = useMutation({
    mutationFn: async (codeOrServerId) => {
      // Try to find by invite code first
      let servers = await base44.entities.Server.filter({ invite_code: codeOrServerId });
      // If not found by invite code, try by server ID (for direct join from discover)
      if (servers.length === 0) {
        const serverById = await base44.entities.Server.filter({ id: codeOrServerId });
        if (serverById.length > 0) servers = serverById;
      }
      if (servers.length === 0) throw new Error('Invalid invite code or server not found');
      const server = servers[0];
      const existingMember = await base44.entities.ServerMember.filter({ server_id: server.id, user_email: currentUser.email });
      if (existingMember.length > 0) return server; // Already a member
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString() });
      await base44.entities.Server.update(server.id, { member_count: (server.member_count || 0) + 1 });
      return server;
    },
    onSuccess: (server) => { 
      queryClient.invalidateQueries({ queryKey: ['memberServers'] }); 
      setActiveServer(server); 
      setView('server'); 
      setPreviewServer(null);
      setShowJoinServer(false);
    }
  });

  // Typing indicator
  const sendTypingIndicator = useCallback(async () => {
    if (!currentUser || (!activeChannel?.id && !activeConversation?.id)) return;
    const filter = activeChannel?.id ? { user_id: currentUser.id, channel_id: activeChannel.id } : { user_id: currentUser.id, conversation_id: activeConversation.id };
    const existing = await base44.entities.TypingIndicator.filter(filter);
    if (existing.length > 0) {
      await base44.entities.TypingIndicator.update(existing[0].id, { started_at: new Date().toISOString() });
    } else {
      await base44.entities.TypingIndicator.create({ ...filter, user_name: userProfile?.display_name, started_at: new Date().toISOString() });
    }
  }, [currentUser, activeChannel?.id, activeConversation?.id, userProfile?.display_name]);

  // Set default channel when server changes
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const defaultChannel = channels.find(c => c.type === 'text') || channels[0];
      setActiveChannel(defaultChannel);
    }
  }, [activeServer, channels, activeChannel]);

  const handleServerSelect = (server) => { setActiveServer(server); setActiveChannel(null); setActiveConversation(null); setView('server'); };
  const handleDMsClick = () => { setActiveServer(null); setActiveChannel(null); setView('dms'); };
  
  const handleJoinVoice = async (channel) => {
    if (voiceChannel?.id === channel.id) return;
    if (voiceChannel) {
      const existingState = voiceStates.find(v => v.user_id === currentUser.id && v.channel_id === voiceChannel.id);
      if (existingState) await base44.entities.VoiceState.delete(existingState.id);
    }
    await base44.entities.VoiceState.create({
      user_id: currentUser.id, user_email: currentUser.email, user_name: userProfile?.display_name || currentUser.full_name,
      user_avatar: userProfile?.avatar_url, server_id: activeServer.id, channel_id: channel.id, is_self_muted: isMuted, is_self_deafened: isDeafened
    });
    setVoiceChannel(channel);
    queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
  };

  const handleVoiceDisconnect = async () => {
    if (!voiceChannel) return;
    const existingState = voiceStates.find(v => v.user_id === currentUser.id && v.channel_id === voiceChannel.id);
    if (existingState) await base44.entities.VoiceState.delete(existingState.id);
    setVoiceChannel(null); setIsMuted(false); setIsDeafened(false); setIsVideo(false); setIsStreaming(false); setIsListeningOnly(false);
    queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
  };

  const handleChannelClick = (channel) => {
    if (channel.type === 'voice' || channel.type === 'stage') handleJoinVoice(channel);
    else setActiveChannel(channel);
  };

  const handleReact = async (messageId, emoji) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    const reactions = message.reactions || [];
    const existingReaction = reactions.find(r => r.emoji === emoji);
    let newReactions;
    if (existingReaction) {
      const hasReacted = existingReaction.users?.includes(currentUser.id);
      if (hasReacted) {
        newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id) } : r).filter(r => r.count > 0);
      } else {
        newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), currentUser.id] } : r);
      }
    } else {
      newReactions = [...reactions, { emoji, count: 1, users: [currentUser.id] }];
    }
    await base44.entities.Message.update(messageId, { reactions: newReactions });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };

  const handleDeleteMessage = async (messageId) => {
    await base44.entities.Message.delete(messageId);
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };

  const handleCommandPaletteCommand = (cmd) => {
    switch (cmd.id) {
      case 'focus-mode': updateSettingsMutation.mutate({ kairo_features: { ...userSettings?.kairo_features, focus_mode: !userSettings?.kairo_features?.focus_mode } }); break;
      case 'ghost-mode': updateSettingsMutation.mutate({ kairo_features: { ...userSettings?.kairo_features, ghost_mode: !userSettings?.kairo_features?.ghost_mode } }); break;
      case 'create-server': setShowCreateServer(true); break;
      case 'join-server': setShowJoinServer(true); break;
      case 'add-friend': setShowAddFriend(true); break;
      case 'settings': setShowSettings(true); break;
      case 'dms': handleDMsClick(); break;
      default:
        if (cmd.id.startsWith('server-')) handleServerSelect(cmd.data);
        else if (cmd.id.startsWith('channel-')) handleChannelClick(cmd.data);
        else if (cmd.id.startsWith('dm-')) { setActiveConversation(cmd.data); setView('dms'); }
    }
  };

  // Loading screen
  if (isLoading) return <LoadingScreen onComplete={() => setIsLoading(false)} />;

  // Discover view
  if (view === 'discover') {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <Sidebar servers={memberServers} activeServerId={null} onServerSelect={handleServerSelect} onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} onFriendsClick={() => setView('friends')} isDMsActive={false} userProfile={userProfile} />
        <DiscoverServers servers={publicServers} onJoinServer={(server) => setPreviewServer(server)} onBack={() => setView('dms')} />
        <AnimatePresence>
          {showCreateServer && <CreateServerModal isOpen={showCreateServer} onClose={() => setShowCreateServer(false)} onCreate={(data) => createServerMutation.mutate(data)} />}
          {showSettings && <FullSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} profile={userProfile} userSettings={userSettings} onUpdateProfile={(data) => updateProfileMutation.mutate(data)} onUpdateSettings={(data) => updateSettingsMutation.mutate(data)} onLogout={() => base44.auth.logout()} />}
          {previewServer && <ServerPreviewModal server={previewServer} isOpen={!!previewServer} onClose={() => setPreviewServer(null)} onJoin={() => joinServerMutation.mutate(previewServer.invite_code)} isJoining={joinServerMutation.isPending} />}
        </AnimatePresence>
      </div>
    );
  }

  // Friends view (v2.0)
  if (view === 'friends') {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <Sidebar servers={memberServers} activeServerId={null} onServerSelect={handleServerSelect} onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} onFriendsClick={() => setView('friends')} isDMsActive={false} userProfile={userProfile} />
        <div className="flex flex-col">
          <DMSidebar conversations={conversations} friends={friends} activeConversationId={activeConversation?.id}
            onConversationSelect={(convo) => { setActiveConversation(convo); setView('dms'); }} onConversationClose={() => setActiveConversation(null)}
            onNewDM={() => {}} onAddFriend={() => setShowAddFriend(true)} onJoinServer={() => setShowJoinServer(true)} />
          <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
        </div>
        <FriendSystem 
          currentUser={currentUser}
          onStartDM={async (friend) => {
            // Find or create conversation
            const existing = conversations.find(c => 
              c.participants?.some(p => p.user_id === friend.friend_id)
            );
            if (existing) {
              setActiveConversation(existing);
            } else {
              const newConvo = await base44.entities.Conversation.create({
                type: 'dm',
                participants: [
                  { user_id: currentUser.id, user_email: currentUser.email, user_name: userProfile?.display_name },
                  { user_id: friend.friend_id, user_email: friend.friend_email, user_name: friend.friend_name, avatar: friend.friend_avatar }
                ]
              });
              setActiveConversation(newConvo);
            }
            setView('dms');
          }}
          onAddFriend={() => setShowAddFriend(true)}
        />
        <AnimatePresence>
          {showAddFriend && <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} onSendRequest={async (username) => {
            const profiles = await base44.entities.UserProfile.filter({ username });
            if (profiles.length === 0) throw new Error('User not found');
            await base44.entities.Friendship.create({ user_id: currentUser.id, friend_id: profiles[0].user_id, friend_email: profiles[0].user_email, friend_name: profiles[0].display_name, friend_avatar: profiles[0].avatar_url, status: 'pending', initiated_by: currentUser.id });
            queryClient.invalidateQueries({ queryKey: ['friendships'] });
          }} />}
          {showJoinServer && <JoinByInviteModal isOpen={showJoinServer} onClose={() => setShowJoinServer(false)} onJoin={(code) => joinServerMutation.mutate(code)} isJoining={joinServerMutation.isPending} />}
          {showSettings && <FullSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} profile={userProfile} userSettings={userSettings} onUpdateProfile={(data) => updateProfileMutation.mutate(data)} onUpdateSettings={(data) => updateSettingsMutation.mutate(data)} onLogout={() => base44.auth.logout()} />}
        </AnimatePresence>
      </div>
    );
  }

  // Shop view
  if (view === 'shop') {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <Sidebar servers={memberServers} activeServerId={null} onServerSelect={handleServerSelect} onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} onFriendsClick={() => setView('friends')} isDMsActive={false} userProfile={userProfile} />
        <ShopPage currentUser={currentUser} userCredits={userCredits} friends={friends} />
      </div>
    );
  }

  // Events view
  if (view === 'events' && activeServer) {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <Sidebar servers={memberServers} activeServerId={activeServer?.id} onServerSelect={handleServerSelect} onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} onFriendsClick={() => setView('friends')} isDMsActive={false} userProfile={userProfile} />
        <div className="flex flex-col">
          <ChannelSidebar server={activeServer} categories={categories} channels={channels} activeChannelId={activeChannel?.id}
            onChannelClick={handleChannelClick} onServerSettings={() => {}} onCreateChannel={(categoryId) => { setCreateChannelCategory(categoryId); setShowCreateChannel(true); }}
            onInvite={() => setShowInvite(true)} voiceStates={voiceStates} />
          {voiceChannel && <VoiceConnectionBar channel={voiceChannel} server={activeServer} onDisconnect={handleVoiceDisconnect} />}
          <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
        </div>
        <EventsPage serverId={activeServer?.id} channels={channels} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className={cn("h-screen flex bg-[#0a0a0b]", userSettings?.kairo_features?.focus_mode && "opacity-80")}>
      <Sidebar servers={memberServers} activeServerId={activeServer?.id} onServerSelect={handleServerSelect} onDMsClick={handleDMsClick}
        onDiscoverClick={() => setView('discover')} onCreateServer={() => setShowCreateServer(true)}
        onSettingsClick={() => setShowSettings(true)} onProfileClick={() => setShowProfileEditor(true)}
        onFriendsClick={() => setView('friends')} isDMsActive={view === 'dms'} userProfile={userProfile} />

      {view === 'dms' ? (
        <div className="flex flex-col">
          <DMSidebar conversations={conversations} friends={friends} activeConversationId={activeConversation?.id}
            onConversationSelect={(convo) => setActiveConversation(convo)} onConversationClose={() => setActiveConversation(null)}
            onNewDM={() => {}} onAddFriend={() => setShowAddFriend(true)} onJoinServer={() => setShowJoinServer(true)} />
          <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
        </div>
      ) : (
        <div className="flex flex-col">
          <ChannelSidebar server={activeServer} categories={categories} channels={channels} activeChannelId={activeChannel?.id}
            onChannelClick={handleChannelClick} onServerSettings={() => {}} onCreateChannel={(categoryId) => { setCreateChannelCategory(categoryId); setShowCreateChannel(true); }}
            onInvite={() => setShowInvite(true)} voiceStates={voiceStates} />
          {voiceChannel && <VoiceConnectionBar channel={voiceChannel} server={activeServer} onDisconnect={handleVoiceDisconnect} />}
          <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {view === 'server' && activeChannel ? (
          activeChannel.type === 'voice' || activeChannel.type === 'stage' ? (
            <WebRTCVoice 
              channelId={activeChannel.id}
              serverId={activeServer?.id}
              channelName={activeChannel.name}
              serverName={activeServer?.name}
              participants={voiceStates.filter(v => v.channel_id === activeChannel.id)}
              currentUserId={currentUser?.id}
              onLeave={handleVoiceDisconnect}
              onUpdateState={(state) => {
                const existing = voiceStates.find(v => v.user_id === currentUser?.id && v.channel_id === activeChannel.id);
                if (existing) {
                  base44.entities.VoiceState.update(existing.id, state);
                }
                if (state.is_self_muted !== undefined) setIsMuted(state.is_self_muted);
                if (state.is_self_deafened !== undefined) setIsDeafened(state.is_self_deafened);
              }}
              isListenOnly={isListeningOnly}
            />
          ) : (
            <>
              <ChannelHeader channel={activeChannel} memberCount={members.length} onMembersToggle={() => setShowMembers(!showMembers)} showMembers={showMembers} />
              <div className="flex-1 flex min-h-0">
                <div className="flex-1 flex flex-col bg-[#121214]">
                  <MessageList messages={[...messages].reverse()} currentUserId={currentUser?.id} onReply={(msg) => setReplyTo(msg)} onEdit={() => {}} onDelete={handleDeleteMessage} onReact={handleReact} isLoading={messagesLoading} />
                  <TypingIndicator typingUsers={typingUsers} className="px-4" />
                  <MessageInput channelName={activeChannel?.name} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSendMessage={(data) => sendMessageMutation.mutate(data)} onTyping={sendTypingIndicator} />
                </div>
                {showMembers && <MemberList members={members.map(m => ({ ...m, user_name: m.nickname || m.user_email?.split('@')[0], status: 'online' }))} roles={roles} ownerId={activeServer?.owner_id} />}
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
                <span className="font-semibold text-white">{activeConversation.name || activeConversation.participants?.[0]?.user_name}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-[#121214]">
              <MessageList messages={[...dmMessages].reverse()} currentUserId={currentUser?.id} onReply={(msg) => setReplyTo(msg)} onReact={() => {}} isLoading={dmMessagesLoading} />
              <TypingIndicator typingUsers={typingUsers} className="px-4" />
              <MessageInput channelName={activeConversation.participants?.[0]?.user_name} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSendMessage={(data) => sendDMMutation.mutate(data)} onTyping={sendTypingIndicator} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#121214]">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                <span className="text-5xl font-bold text-white">K</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Kairo</h2>
              <p className="text-zinc-500 max-w-md">{view === 'dms' ? 'Select a conversation to start chatting, or add a friend to get started.' : 'Select a channel to start chatting, or create a new server to begin.'}</p>
              <div className="mt-6 flex justify-center gap-3">
                {view === 'dms' ? <button onClick={() => setShowAddFriend(true)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">Add Friend</button> : 
                  <button onClick={() => setShowInvite(true)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">Invite People</button>}
                <button onClick={() => setView('shop')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Shop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateServer && <CreateServerModal isOpen={showCreateServer} onClose={() => setShowCreateServer(false)} onCreate={(data) => createServerMutation.mutate(data)} />}
        {showCreateChannel && <CreateChannelModal isOpen={showCreateChannel} onClose={() => setShowCreateChannel(false)} onCreate={(data) => createChannelMutation.mutate(data)} categories={categories} defaultCategoryId={createChannelCategory} />}
        {showSettings && <FullSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} profile={userProfile} userSettings={userSettings} onUpdateProfile={(data) => updateProfileMutation.mutate(data)} onUpdateSettings={(data) => updateSettingsMutation.mutate(data)} onLogout={() => base44.auth.logout()} />}
        {showInvite && <CreateInviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} server={activeServer} />}
        {showJoinServer && <JoinByInviteModal isOpen={showJoinServer} onClose={() => setShowJoinServer(false)} onJoin={(code) => joinServerMutation.mutate(code)} isJoining={joinServerMutation.isPending} />}
        {showExportBlueprint && activeServer && <ExportBlueprintModal server={activeServer} isOpen={showExportBlueprint} onClose={() => setShowExportBlueprint(false)} />}
        {showAddFriend && <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} onSendRequest={async (username) => {
          const profiles = await base44.entities.UserProfile.filter({ username });
          if (profiles.length === 0) throw new Error('User not found');
          await base44.entities.Friendship.create({ user_id: currentUser.id, friend_id: profiles[0].user_id, friend_email: profiles[0].user_email, friend_name: profiles[0].display_name, friend_avatar: profiles[0].avatar_url, status: 'pending', initiated_by: currentUser.id });
        }} />}

        {showCommandPalette && <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} servers={memberServers} channels={channels} conversations={conversations} onCommand={handleCommandPaletteCommand} />}
        {showProfileEditor && <ProfileEditor profile={userProfile} inventory={userInventory} onUpdateProfile={(data) => updateProfileMutation.mutate(data)} onClose={() => setShowProfileEditor(false)} />}
        {previewServer && <ServerPreviewModal server={previewServer} isOpen={!!previewServer} onClose={() => setPreviewServer(null)} onJoin={() => joinServerMutation.mutate(previewServer.invite_code)} isJoining={joinServerMutation.isPending} />}
        {incomingCall && <IncomingCallModal call={incomingCall} caller={incomingCall.caller} onAccept={() => { setActiveCall(incomingCall); setIncomingCall(null); }} onDecline={() => setIncomingCall(null)} />}
        {outgoingCall && <OutgoingCallModal recipient={outgoingCall.recipient} isVideoCall={outgoingCall.isVideo} onCancel={() => setOutgoingCall(null)} />}
        {activeCall && <ActiveCallModal call={activeCall} participants={activeCall.participants} currentUserId={currentUser?.id} onEndCall={() => setActiveCall(null)} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)} onToggleVideo={() => setIsVideo(!isVideo)} onToggleScreenShare={() => setIsStreaming(!isStreaming)} isMuted={isMuted} isDeafened={isDeafened} isVideo={isVideo} isScreenSharing={isStreaming} />}
      </AnimatePresence>
    </div>
  );
}