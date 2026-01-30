import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Hash, Users, Pin, Bell, Search, MessageSquare, Settings, ShoppingBag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

// Core Components
import LoadingScreen from '@/components/kairo/LoadingScreen';
import ImprovedSidebar from '@/components/kairo/ImprovedSidebar';
import UpdateLogsModal from '@/components/kairo/UpdateLogsModal';
import NotificationsPanel from '@/components/kairo/NotificationsPanel';
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
import ServerSettingsModal from '@/components/kairo/ServerSettingsModal';

// Feature Components
import ServerHub from '@/components/kairo/ServerHub';
import WebRTCVoice from '@/components/kairo/voice/WebRTCVoice';
import FullSettingsModal from '@/components/kairo/settings/FullSettingsModal';
import ShopPage from '@/components/kairo/shop/ShopPage';
import EventsPage from '@/components/kairo/events/EventsPage';
import ProfileEditor from '@/components/kairo/profile/ProfileEditor';
import TypingIndicator from '@/components/kairo/chat/TypingIndicator';
import { IncomingCallModal, ActiveCallModal, OutgoingCallModal } from '@/components/kairo/voice/DMCallModal';
import WelcomeScreen from '@/components/kairo/WelcomeScreen';

// New v2.0 Components
import FriendSystem from '@/components/kairo/friends/FriendSystem';
import { CreateInviteModal, JoinByInviteModal } from '@/components/kairo/invites/InviteSystem';
import { ExportBlueprintModal, ImportBlueprintModal, useApplyBlueprint } from '@/components/kairo/server/ServerBlueprint';
import { WorkspaceProvider, useWorkspace } from '@/components/kairo/core/WorkspaceProvider';
import { RealtimeProvider, useRealtime } from '@/components/kairo/core/RealtimeProvider';
import { AuditLogViewer, AutoModerationSettings } from '@/components/kairo/moderation/ModerationTools';
import AddFriendModal from '@/components/kairo/AddFriendModal';
import AppMarketplace from '@/components/kairo/apps/AppMarketplace';
import WebhookManager from '@/components/kairo/apps/WebhookManager';
import RoleManager from '@/components/kairo/roles/RoleManager';
import VoiceChannel from '@/components/kairo/voice/VoiceChannel';
import ShopIntegrated from '@/components/kairo/shop/ShopIntegrated';
import EnhancedReactions from '@/components/kairo/enhanced/EnhancedReactions';
import { PollMessage, AnnouncementMessage, SystemPrompt } from '@/components/kairo/enhanced/NewMessageTypes';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/components/kairo/enhanced/KeyboardShortcuts';
import InlineEditField from '@/components/kairo/enhanced/InlineEditField';
import ConnectionMonitor from '@/components/kairo/core/ConnectionMonitor';
import { LoadingSpinner, SkeletonMessage, SyncingIndicator } from '@/components/kairo/core/LoadingState';
import { usePresenceSync, useVoiceStateSync, useMessageSync } from '@/components/kairo/core/PresenceSync';
import { useCacheOptimization, usePrefetchStrategies } from '@/components/kairo/core/CacheManager';
import CrossAppIndicator from '@/components/kairo/crossapp/CrossAppIndicator';
import BridgeManager from '@/components/kairo/crossapp/BridgeManager';
import ThreadPanel from '@/components/kairo/chat/ThreadPanel';
import ForwardMessageModal from '@/components/kairo/chat/ForwardMessageModal';
import PinnedMessagesPanel from '@/components/kairo/chat/PinnedMessagesPanel';
import GlobalSearch from '@/components/kairo/search/GlobalSearch';
import CreateGroupDMModal from '@/components/kairo/CreateGroupDMModal';

// Channel header component
function ChannelHeader({ channel, memberCount, onMembersToggle, showMembers, onShowPinned, showPinned }) {
  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/30 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Hash className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-[15px]">{channel?.name || 'general'}</h2>
          {channel?.topic && (
            <p className="text-xs text-zinc-500 truncate max-w-[300px]">{channel.topic}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl hover:bg-zinc-800/50">
          <Bell className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={onShowPinned}
          className={cn(
            "p-2 transition-colors rounded-xl",
            showPinned ? "text-violet-400 bg-violet-500/15" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Pin className="w-[18px] h-[18px]" />
        </button>
        <button
          onClick={onMembersToggle}
          className={cn(
            "p-2 transition-colors rounded-xl",
            showMembers ? "text-violet-400 bg-violet-500/15" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Users className="w-[18px] h-[18px]" />
        </button>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl hover:bg-zinc-800/50"
        >
          <Search className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}

export default function KairoPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
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
  const [showUpdateLogs, setShowUpdateLogs] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppMarketplace, setShowAppMarketplace] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showBridgeManager, setShowBridgeManager] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState('connected');
  
  // Reply state
  const [replyTo, setReplyTo] = useState(null);

  // Thread state
  const [activeThread, setActiveThread] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);

  // Get current user from localStorage (key-based auth)
  const [currentUser, setCurrentUser] = React.useState(null);

  // Core system hooks (after currentUser is declared)
  useCacheOptimization();
  usePrefetchStrategies(activeServer, activeChannel);
  usePresenceSync(currentUser?.id);
  useVoiceStateSync(currentUser?.id, voiceChannel);
  useMessageSync(activeChannel?.id, view === 'server');

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+k': () => setShowCommandPalette(true),
    'ctrl+f': () => setShowGlobalSearch(true),
    'ctrl+shift+a': () => {}, // Toggle sidebar - handled in ImprovedSidebar
    'ctrl+shift+m': () => setShowMembers(!showMembers),
    'ctrl+/': () => setShowKeyboardShortcuts(true),
    'escape': () => {
      setShowCommandPalette(false);
      setShowSettings(false);
      setShowKeyboardShortcuts(false);
      setShowGlobalSearch(false);
    }
  });

  React.useEffect(() => {
    const savedUser = localStorage.getItem('kairo_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      console.log('[INIT] Loaded user from localStorage:', user);
      setCurrentUser(user);
    } else {
      navigate(createPageUrl('Landing'));
    }
  }, [navigate]);

  // Fetch fresh user profile data
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return currentUser;
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) {
        const profile = profiles[0];
        localStorage.setItem('kairo_current_user', JSON.stringify(profile));
        setCurrentUser(profile);
        return profile;
      }
      return currentUser;
    },
    enabled: !!currentUser?.id,
    staleTime: 300000,
    refetchInterval: false
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

  // Auto-add premium badge if user has nitro
  useEffect(() => {
    if (userCredits?.has_nitro && userProfile?.id && !userProfile?.badges?.includes('premium')) {
      updateProfileMutation.mutate({
        badges: [...new Set([...(userProfile.badges || []), 'premium'])]
      });
    }
  }, [userCredits?.has_nitro, userProfile?.id, userProfile?.badges]);

  // Fetch user inventory
  const { data: userInventory = [] } = useQuery({
    queryKey: ['userInventory', currentUser?.id],
    queryFn: () => base44.entities.UserInventory.filter({ user_id: currentUser?.id }),
    enabled: !!currentUser?.id
  });

  // Fetch servers user is member of - optimized
  // ServerMember.user_id and Server.owner_id use UserProfile.user_id (like 'user_xxx'), NOT the record id
  const { data: memberServers = [], isLoading: serversLoading } = useQuery({
    queryKey: ['memberServers', currentUser?.user_id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      // Try user_id field first (the internal user identifier like 'user_xxx')
      // Fall back to record id if user_id doesn't exist
      const userId = currentUser.user_id || currentUser.id;
      console.log('[SERVER FETCH] Looking for userId:', userId, 'currentUser:', currentUser);
      
      // Find memberships by user_id
      const memberships = await base44.entities.ServerMember.filter({ user_id: userId });
      console.log('[SERVER FETCH] memberships found:', memberships.length);
      
      // Get servers from memberships
      let serverIds = [...new Set(memberships.map(m => m.server_id))];
      
      // Also check for servers owned by this user
      const ownedServers = await base44.entities.Server.filter({ owner_id: userId });
      console.log('[SERVER FETCH] ownedServers found:', ownedServers.length);
      
      // Combine owned server IDs
      ownedServers.forEach(s => {
        if (!serverIds.includes(s.id)) serverIds.push(s.id);
      });
      
      console.log('[SERVER FETCH] total serverIds:', serverIds);
      
      if (serverIds.length === 0) return [];
      
      const allServers = await base44.entities.Server.list();
      return allServers.filter(s => serverIds.includes(s.id));
    },
    enabled: !!currentUser,
    staleTime: 30000,
    refetchInterval: false
  });

  // Debug logging for servers
  useEffect(() => {
    console.log('[SERVERS DEBUG] memberServers:', memberServers);
    console.log('[SERVERS DEBUG] currentUser:', currentUser);
  }, [memberServers, currentUser]);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: currentUser?.id, is_read: false }),
    enabled: !!currentUser?.id,
    staleTime: 300000,
    refetchInterval: false
  });

  // Check for new updates
  const { data: latestUpdate } = useQuery({
    queryKey: ['latestUpdate'],
    queryFn: async () => {
      const updates = await base44.entities.UpdateLog.list('-release_date', 1);
      return updates[0];
    },
    staleTime: 3600000 // 1 hour
  });

  const hasNewUpdates = latestUpdate && new Date(latestUpdate.release_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Fetch categories for active server
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', activeServer?.id],
    queryFn: () => base44.entities.Category.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
    staleTime: 60000,
    keepPreviousData: true
  });

  // Fetch channels for active server
  const { data: channels = [] } = useQuery({
    queryKey: ['channels', activeServer?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
    staleTime: 60000,
    keepPreviousData: true
  });

  // Fetch messages for active channel with optimized caching
  const { data: messages = [], isLoading: messagesLoading, isFetching: messagesFetching } = useQuery({
    queryKey: ['messages', activeChannel?.id],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: activeChannel.id, is_deleted: false }, '-created_date', 100);
      return msgs;
    },
    enabled: !!activeChannel?.id,
    staleTime: 30000,
    refetchInterval: false,
    keepPreviousData: true
  });

  // Fetch threads for active channel
  const { data: threads = [] } = useQuery({
    queryKey: ['threads', activeChannel?.id],
    queryFn: () => base44.entities.Thread.filter({ channel_id: activeChannel.id }),
    enabled: !!activeChannel?.id,
    staleTime: 300000,
    refetchInterval: false
  });

  // Fetch pinned messages
  const { data: pinnedMessages = [] } = useQuery({
    queryKey: ['pinnedMessages', activeChannel?.id],
    queryFn: () => base44.entities.Message.filter({ channel_id: activeChannel.id, is_pinned: true }),
    enabled: !!activeChannel?.id,
    staleTime: 300000,
    refetchInterval: false
  });

  // Debug logging for messages
  useEffect(() => {
    console.log('[MESSAGES DEBUG] messages:', messages);
    console.log('[MESSAGES DEBUG] activeChannel:', activeChannel);
    console.log('[MESSAGES DEBUG] messagesLoading:', messagesLoading);
  }, [messages, activeChannel, messagesLoading]);

  // Show syncing indicator when fetching
  useEffect(() => {
    setIsSyncing(messagesFetching);
  }, [messagesFetching]);

  // Fetch server members
  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
    staleTime: 30000,
    keepPreviousData: true
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles', activeServer?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
    staleTime: 60000,
    keepPreviousData: true
  });

  // Fetch voice states
  const { data: voiceStates = [] } = useQuery({
    queryKey: ['voiceStates', activeServer?.id],
    queryFn: () => base44.entities.VoiceState.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
    staleTime: 60000,
    refetchInterval: false
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
    enabled: !!activeConversation?.id,
    staleTime: 30000,
    refetchInterval: false,
    keepPreviousData: true
  });

  // Fetch typing indicators - disabled for performance
  const typingUsers = [];

  // Fetch public servers
  const { data: publicServers = [] } = useQuery({
    queryKey: ['publicServers'],
    queryFn: () => base44.entities.Server.filter({ is_public: true })
  });

  // Mutations
  const createServerMutation = useMutation({
    mutationFn: async ({ name, description, icon_url, banner_url, template, templateChannels }) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      // Use the same userId that will be used for fetching servers (user_id field or record id)
      const userId = currentUser.user_id || currentUser.id;
      const userEmail = currentUser.user_email || currentUser.email;
      console.log('[CREATE SERVER] userId:', userId, 'userEmail:', userEmail, 'currentUser:', currentUser);

      const server = await base44.entities.Server.create({
        name, description, icon_url, banner_url, owner_id: userId, template, invite_code: inviteCode, member_count: 1
      });
      await base44.entities.Role.create({
        server_id: server.id, name: '@everyone', is_default: true, position: 0,
        permissions: ['view_channels', 'send_messages', 'read_message_history']
      });
      await base44.entities.ServerMember.create({
        server_id: server.id, user_id: userId, user_email: userEmail, joined_at: new Date().toISOString()
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
    onSuccess: async (server) => {
      await queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      setShowCreateServer(false);
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
      if (!activeChannel?.id || !activeServer?.id || !currentUser?.id) throw new Error('Missing required data');
      
      const replyPreview = replyToId && replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 100) } : null;
      const message = await base44.entities.Message.create({
        channel_id: activeChannel.id, 
        server_id: activeServer.id, 
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name || currentUser.user_email?.split('@')[0] || 'User',
        author_avatar: userProfile?.avatar_url,
        author_badges: userProfile?.badges || [],
        author_youtube_url: userProfile?.youtube_channel?.url,
        author_youtube_show_icon: userProfile?.youtube_channel?.show_icon,
        content, 
        attachments, 
        type: replyToId ? 'reply' : 'default', 
        reply_to_id: replyToId, 
        reply_preview: replyPreview,
        is_pinned: false,
        is_deleted: false
      });

      try {
        await base44.functions.invoke('sendToDiscord', { channel_id: activeChannel.id, content, attachments });
      } catch (e) {}

      return message;
    },
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['messages', activeChannel?.id] });
      const previousMessages = queryClient.getQueryData(['messages', activeChannel?.id]);
      const optimisticMessage = {
        id: 'temp-' + Date.now(),
        ...newMsg,
        channel_id: activeChannel.id,
        server_id: activeServer.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name || currentUser.user_email?.split('@')[0] || 'User',
        author_avatar: userProfile?.avatar_url,
        author_badges: userProfile?.badges || [],
        author_youtube_url: userProfile?.youtube_channel?.url,
        author_youtube_show_icon: userProfile?.youtube_channel?.show_icon,
        created_date: new Date().toISOString(),
        type: newMsg.replyToId ? 'reply' : 'default',
        reply_to_id: newMsg.replyToId,
        reply_preview: newMsg.replyToId && replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 100) } : null,
        is_pinned: false,
        is_deleted: false
      };
      // Messages are fetched in descending order, so prepend the new message
      queryClient.setQueryData(['messages', activeChannel?.id], old => [optimisticMessage, ...(old || [])]);
      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(['messages', activeChannel?.id], context.previousMessages);
    },
    onSuccess: (data) => { 
      // Update cache with real message instead of invalidating
      queryClient.setQueryData(['messages', activeChannel?.id], old => {
        const withoutTemp = (old || []).filter(m => !m.id.toString().startsWith('temp-'));
        return [data, ...withoutTemp];
      });
      setReplyTo(null); 
    }
  });

  const sendDMMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      if (!activeConversation?.id || !currentUser?.id) {
        throw new Error('Missing required data for sending DM');
      }
      
      await base44.entities.Conversation.update(activeConversation.id, { last_message_at: new Date().toISOString(), last_message_preview: content?.slice(0, 50) });
      const message = await base44.entities.DirectMessage.create({
        conversation_id: activeConversation.id, 
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name || currentUser.user_email?.split('@')[0] || 'User',
        author_avatar: userProfile?.avatar_url,
        author_badges: userProfile?.badges || [],
        author_youtube_url: userProfile?.youtube_channel?.url,
        author_youtube_show_icon: userProfile?.youtube_channel?.show_icon,
        content, 
        attachments, 
        type: replyToId ? 'reply' : 'default', 
        reply_to_id: replyToId
      });
      return message;
    },
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ['dmMessages', activeConversation?.id] });
      const previousMessages = queryClient.getQueryData(['dmMessages', activeConversation?.id]);
      const optimisticMessage = {
        id: 'temp-' + Date.now(),
        ...newMsg,
        conversation_id: activeConversation.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name || currentUser.user_email?.split('@')[0] || 'User',
        author_avatar: userProfile?.avatar_url,
        author_badges: userProfile?.badges || [],
        author_youtube_url: userProfile?.youtube_channel?.url,
        author_youtube_show_icon: userProfile?.youtube_channel?.show_icon,
        created_date: new Date().toISOString(),
        type: newMsg.replyToId ? 'reply' : 'default',
        reply_to_id: newMsg.replyToId
      };
      queryClient.setQueryData(['dmMessages', activeConversation?.id], old => [optimisticMessage, ...(old || [])]);
      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(['dmMessages', activeConversation?.id], context.previousMessages);
    },
    onSuccess: (data) => { 
      queryClient.setQueryData(['dmMessages', activeConversation?.id], old => {
        const withoutTemp = (old || []).filter(m => !m.id.toString().startsWith('temp-'));
        return [data, ...withoutTemp];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] }); 
      setReplyTo(null); 
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (!userProfile?.id) throw new Error('No profile to update');
      return await base44.entities.UserProfile.update(userProfile.id, data);
    },
    onSuccess: async (updatedProfile) => {
      // Force immediate refetch
      const freshProfile = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
      if (freshProfile.length > 0) {
        const newProfile = freshProfile[0];
        localStorage.setItem('kairo_current_user', JSON.stringify(newProfile));
        setCurrentUser(newProfile);
        
        // Update query cache
        queryClient.setQueryData(['userProfile', currentUser.id], newProfile);
      }
      
      // Invalidate to trigger re-render
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.UserSettings.update(userSettings.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSettings'] })
  });

  const joinServerMutation = useMutation({
    mutationFn: async (codeOrServerId) => {
      const userId = currentUser.user_id || currentUser.id;
      const userEmail = currentUser.user_email || currentUser.email;

      // Try to find by invite code first
      let servers = await base44.entities.Server.filter({ invite_code: codeOrServerId });
      // If not found by invite code, try by server ID (for direct join from discover)
      if (servers.length === 0) {
        const serverById = await base44.entities.Server.filter({ id: codeOrServerId });
        if (serverById.length > 0) servers = serverById;
      }
      if (servers.length === 0) throw new Error('Invalid invite code or server not found');
      const server = servers[0];

      // Check if already a member
      const existingMember = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: userId });
      if (existingMember.length > 0) return server;

      await base44.entities.ServerMember.create({ 
        server_id: server.id, 
        user_id: userId, 
        user_email: userEmail, 
        joined_at: new Date().toISOString() 
      });
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
    await base44.entities.Message.update(messageId, { is_deleted: true });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  };

  const handleThreadClick = async (message) => {
    let thread = threads.find(t => t.parent_message_id === message.id);
    if (!thread) {
      thread = await base44.entities.Thread.create({
        channel_id: activeChannel.id,
        server_id: activeServer.id,
        parent_message_id: message.id,
        name: message.content?.slice(0, 50) || 'Thread',
        created_by: currentUser.id,
        message_count: 0,
        last_message_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    }
    setActiveThread(thread);
  };

  const handlePinMessage = async (message) => {
    await base44.entities.Message.update(message.id, { is_pinned: !message.is_pinned });
    queryClient.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    queryClient.invalidateQueries({ queryKey: ['pinnedMessages', activeChannel?.id] });
  };

  const handleLeaveServer = async (server) => {
    if (!confirm(`Are you sure you want to leave ${server.name}?`)) return;
    
    try {
      const membership = await base44.entities.ServerMember.filter({ 
        server_id: server.id, 
        user_id: currentUser.id 
      });
      
      if (membership.length > 0) {
        await base44.entities.ServerMember.delete(membership[0].id);
        await base44.entities.Server.update(server.id, { 
          member_count: Math.max((server.member_count || 1) - 1, 0) 
        });
        queryClient.invalidateQueries({ queryKey: ['memberServers'] });
        
        if (activeServer?.id === server.id) {
          setActiveServer(null);
          setActiveChannel(null);
          setView('dms');
        }
      }
    } catch (error) {
      console.error('Failed to leave server:', error);
      alert('Failed to leave server. Please try again.');
    }
  };

  // Listen for custom events
  useEffect(() => {
    const handleShowApps = () => setShowAppMarketplace(true);
    const handleShowWebhooks = () => setShowWebhooks(true);
    const handleShowRoles = () => setShowRoles(true);
    const handleShowBridges = () => setShowBridgeManager(true);
    const handleLeaveServerEvent = (e) => handleLeaveServer(e.detail);
    const handleUpdateStatus = (e) => {
      if (userProfile?.id) {
        updateProfileMutation.mutate({ status: e.detail });
      }
    };

    const handleOpenSearch = () => setShowGlobalSearch(true);

    window.addEventListener('kairo:show-apps', handleShowApps);
    window.addEventListener('kairo:show-webhooks', handleShowWebhooks);
    window.addEventListener('kairo:show-roles', handleShowRoles);
    window.addEventListener('kairo:show-bridges', handleShowBridges);
    window.addEventListener('kairo:leave-server', handleLeaveServerEvent);
    window.addEventListener('kairo:update-status', handleUpdateStatus);
    window.addEventListener('kairo:open-search', handleOpenSearch);

    return () => {
      window.removeEventListener('kairo:show-apps', handleShowApps);
      window.removeEventListener('kairo:show-webhooks', handleShowWebhooks);
      window.removeEventListener('kairo:show-roles', handleShowRoles);
      window.removeEventListener('kairo:show-bridges', handleShowBridges);
      window.removeEventListener('kairo:leave-server', handleLeaveServerEvent);
      window.removeEventListener('kairo:update-status', handleUpdateStatus);
      window.removeEventListener('kairo:open-search', handleOpenSearch);
    };
  }, [activeServer, currentUser, userProfile]);

  const handleCommandPaletteCommand = (cmd) => {
    switch (cmd.id) {
      case 'focus-mode': updateSettingsMutation.mutate({ kairo_features: { ...userSettings?.kairo_features, focus_mode: !userSettings?.kairo_features?.focus_mode } }); break;
      case 'ghost-mode': updateSettingsMutation.mutate({ kairo_features: { ...userSettings?.kairo_features, ghost_mode: !userSettings?.kairo_features?.ghost_mode } }); break;
      case 'create-server': setShowCreateServer(true); break;
      case 'join-server': setShowJoinServer(true); break;
      case 'add-friend': setShowAddFriend(true); break;
      case 'settings': setShowSettings(true); break;
      case 'dms': handleDMsClick(); break;
      case 'shop': setShowShop(true); break;
      case 'shortcuts': setShowKeyboardShortcuts(true); break;
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
        <ImprovedSidebar 
          servers={memberServers} 
          activeServerId={null} 
          onServerSelect={handleServerSelect} 
          onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} 
          onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} 
          onFriendsClick={() => setView('friends')} 
          onProfileClick={() => setShowProfileEditor(true)} 
          onUpdateLogsClick={() => setShowUpdateLogs(true)}
          onNotificationsClick={() => setShowNotifications(true)}
          onLeaveServer={handleLeaveServer}
          isDMsActive={false} 
          userProfile={userProfile}
          notifications={notifications}
          hasNewUpdates={hasNewUpdates}
        />
        <ServerHub servers={publicServers} onJoinServer={(server) => setPreviewServer(server)} onBack={() => setView('dms')} />
        <AnimatePresence>
          {showCreateServer && <CreateServerModal isOpen={showCreateServer} onClose={() => setShowCreateServer(false)} onCreate={(data) => createServerMutation.mutate(data)} />}
          {showSettings && <FullSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} profile={userProfile} userSettings={userSettings} onUpdateProfile={(data) => updateProfileMutation.mutate(data)} onUpdateSettings={(data) => updateSettingsMutation.mutate(data)} onLogout={() => base44.auth.logout()} />}
          {previewServer && <ServerPreviewModal server={previewServer} isOpen={!!previewServer} onClose={() => setPreviewServer(null)} onJoin={() => joinServerMutation.mutate(previewServer.invite_code)} isJoining={joinServerMutation.isPending} />}
          {showUpdateLogs && <UpdateLogsModal isOpen={showUpdateLogs} onClose={() => setShowUpdateLogs(false)} />}
          {showNotifications && <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} currentUser={currentUser} />}
        </AnimatePresence>
      </div>
    );
  }

  // Friends view (v2.0)
  if (view === 'friends') {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <ImprovedSidebar 
          servers={memberServers} 
          activeServerId={null} 
          onServerSelect={handleServerSelect} 
          onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} 
          onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} 
          onFriendsClick={() => setView('friends')} 
          onProfileClick={() => setShowProfileEditor(true)}
          onUpdateLogsClick={() => setShowUpdateLogs(true)}
          onNotificationsClick={() => setShowNotifications(true)}
          onShopClick={() => setShowShop(true)}
          onLeaveServer={handleLeaveServer}
          isDMsActive={false} 
          userProfile={userProfile}
          notifications={notifications}
          hasNewUpdates={hasNewUpdates}
        />
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
          {showUpdateLogs && <UpdateLogsModal isOpen={showUpdateLogs} onClose={() => setShowUpdateLogs(false)} />}
          {showNotifications && <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} currentUser={currentUser} />}
        </AnimatePresence>
      </div>
    );
  }



  // Events view
  if (view === 'events' && activeServer) {
    return (
      <div className="h-screen flex bg-[#0a0a0b]">
        <ImprovedSidebar 
          servers={memberServers} 
          activeServerId={activeServer?.id} 
          onServerSelect={handleServerSelect} 
          onDMsClick={handleDMsClick}
          onDiscoverClick={() => setView('discover')} 
          onCreateServer={() => setShowCreateServer(true)}
          onSettingsClick={() => setShowSettings(true)} 
          onFriendsClick={() => setView('friends')} 
          onProfileClick={() => setShowProfileEditor(true)}
          onUpdateLogsClick={() => setShowUpdateLogs(true)}
          onNotificationsClick={() => setShowNotifications(true)}
          onShopClick={() => setShowShop(true)}
          isDMsActive={false} 
          userProfile={userProfile}
          notifications={notifications}
          hasNewUpdates={hasNewUpdates}
        />
        <div className="flex flex-col">
          <ChannelSidebar server={activeServer} categories={categories} channels={channels} activeChannelId={activeChannel?.id}
            onChannelClick={handleChannelClick} onServerSettings={() => setShowServerSettings(true)} onCreateChannel={(categoryId) => { setCreateChannelCategory(categoryId); setShowCreateChannel(true); }}
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
    <>
      <ConnectionMonitor />
      <SyncingIndicator show={isSyncing} />
      <div className={cn("h-screen flex bg-[#0a0a0b]", userSettings?.kairo_features?.focus_mode && "opacity-80")}>
        <ImprovedSidebar 
        servers={memberServers} 
        activeServerId={activeServer?.id} 
        onServerSelect={handleServerSelect} 
        onDMsClick={handleDMsClick}
        onDiscoverClick={() => setView('discover')} 
        onCreateServer={() => setShowCreateServer(true)}
        onSettingsClick={() => setShowSettings(true)} 
        onProfileClick={() => setShowProfileEditor(true)}
        onFriendsClick={() => setView('friends')}
        onUpdateLogsClick={() => setShowUpdateLogs(true)}
        onNotificationsClick={() => setShowNotifications(true)}
        onShopClick={() => setShowShop(true)}
        onLeaveServer={handleLeaveServer}
        isDMsActive={view === 'dms'} 
        userProfile={userProfile}
        unreadDMs={conversations.filter(c => c.unread_count > 0).length}
        notifications={notifications}
        hasNewUpdates={hasNewUpdates}
      />

      {view === 'dms' ? (
        <div className="flex flex-col">
          <DMSidebar conversations={conversations} friends={friends} activeConversationId={activeConversation?.id}
            onConversationSelect={(convo) => setActiveConversation(convo)} onConversationClose={() => setActiveConversation(null)}
            onNewDM={() => setShowNewDM(true)} onAddFriend={() => setShowAddFriend(true)} onJoinServer={() => setShowJoinServer(true)} />
          <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
            onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
        </div>
      ) : (
      <div className="flex flex-col">
        <ChannelSidebar server={activeServer} categories={categories} channels={channels} activeChannelId={activeChannel?.id}
          onChannelClick={handleChannelClick} onServerSettings={() => setShowServerSettings(true)} onCreateChannel={(categoryId) => { setCreateChannelCategory(categoryId); setShowCreateChannel(true); }}
          onInvite={() => setShowInvite(true)} voiceStates={voiceStates} />
        {voiceChannel && <VoiceConnectionBar channel={voiceChannel} server={activeServer} onDisconnect={handleVoiceDisconnect} />}
        <UserStatusBar profile={userProfile} isMuted={isMuted} isDeafened={isDeafened} onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
          onOpenSettings={() => setShowSettings(true)} onStatusChange={(status) => updateProfileMutation.mutate({ status })} />
      </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {view === 'shop' ? (
        <ShopIntegrated currentUser={currentUser} activeServer={activeServer} />
      ) : view === 'server' && activeChannel ? (
          activeChannel.type === 'voice' || activeChannel.type === 'stage' ? (
            <VoiceChannel
              channel={activeChannel}
              participants={voiceStates.filter(v => v.channel_id === activeChannel.id)}
              currentUserId={currentUser?.id}
              isMuted={isMuted}
              isDeafened={isDeafened}
              isVideo={isVideo}
              isScreenSharing={isStreaming}
              onToggleMute={() => setIsMuted(!isMuted)}
              onToggleDeafen={() => setIsDeafened(!isDeafened)}
              onToggleVideo={() => setIsVideo(!isVideo)}
              onToggleScreenShare={() => setIsStreaming(!isStreaming)}
              onLeave={handleVoiceDisconnect}
            />
          ) : (
            <>
              <ChannelHeader 
                channel={activeChannel} 
                memberCount={members.length} 
                onMembersToggle={() => setShowMembers(!showMembers)} 
                showMembers={showMembers}
                onShowPinned={() => setShowPinnedPanel(!showPinnedPanel)}
                showPinned={showPinnedPanel}
              />
              <div className="flex-1 flex min-h-0">
                <div className="flex-1 flex flex-col bg-[#121214]">
                  {messagesLoading ? (
                    <div className="flex-1 overflow-y-auto">
                      <SkeletonMessage />
                      <SkeletonMessage />
                      <SkeletonMessage />
                      <SkeletonMessage />
                    </div>
                  ) : (
                    <>
                      <MessageList 
                        messages={[...messages].reverse()} 
                        currentUserId={currentUser?.id} 
                        onReply={(msg) => setReplyTo(msg)} 
                        onEdit={() => {}} 
                        onDelete={handleDeleteMessage} 
                        onReact={handleReact}
                        onThread={handleThreadClick}
                        onForward={(msg) => setForwardingMessage(msg)}
                        onPin={handlePinMessage}
                        isLoading={messagesLoading}
                        threads={threads}
                      />
                      <AnimatePresence>
                        {activeThread && (
                          <ThreadPanel
                            thread={activeThread}
                            parentMessage={messages.find(m => m.id === activeThread.parent_message_id)}
                            currentUser={userProfile || currentUser}
                            channelName={activeChannel.name}
                            onClose={() => setActiveThread(null)}
                          />
                        )}
                        {showPinnedPanel && (
                          <PinnedMessagesPanel
                            messages={pinnedMessages}
                            isOpen={showPinnedPanel}
                            onClose={() => setShowPinnedPanel(false)}
                            onUnpin={handlePinMessage}
                            onJumpTo={(msg) => {}}
                          />
                        )}
                      </AnimatePresence>
                    </>
                  )}
                  <TypingIndicator typingUsers={typingUsers} className="px-4" />
                  <MessageInput channelName={activeChannel?.name} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSendMessage={(data) => sendMessageMutation.mutate(data)} onTyping={sendTypingIndicator} />
                </div>
                {showMembers && <MemberList members={members.map(m => {
                const memberProfile = m.user_id === currentUser?.id ? userProfile : null;
                return {
                  ...m,
                  user_name: m.nickname || memberProfile?.display_name || m.user_email?.split('@')[0] || 'User',
                  user_avatar: memberProfile?.avatar_url,
                  status: memberProfile?.status || 'online',
                  badges: memberProfile?.badges || [],
                  youtube_url: memberProfile?.youtube_channel?.url,
                  youtube_show_icon: memberProfile?.youtube_channel?.show_icon
                };
              })} roles={roles} ownerId={activeServer?.owner_id} />}
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
          <WelcomeScreen
            view={view}
            onAddFriend={() => setShowAddFriend(true)}
            onInvite={() => setShowInvite(true)}
            onDiscover={() => setView('discover')}
            onShop={() => setShowShop(true)}
            onCreateServer={() => setShowCreateServer(true)}
          />
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
        {showUpdateLogs && <UpdateLogsModal isOpen={showUpdateLogs} onClose={() => setShowUpdateLogs(false)} />}
        {showNotifications && <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} currentUser={currentUser} />}
        {showAppMarketplace && <AppMarketplace server={activeServer} currentUser={currentUser} onClose={() => setShowAppMarketplace(false)} />}
        {showKeyboardShortcuts && <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />}
        {showServerSettings && activeServer && <ServerSettingsModal server={activeServer} currentUser={currentUser} channels={channels} onClose={() => setShowServerSettings(false)} />}
        {showBridgeManager && activeServer && <BridgeManager server={activeServer} channels={channels} isOpen={showBridgeManager} onClose={() => setShowBridgeManager(false)} />}
        {showShop && <div className="fixed inset-0 z-50 bg-black/80 flex">
          <div className="flex-1" onClick={() => setShowShop(false)} />
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl bg-zinc-900 border-l border-zinc-800 overflow-y-auto"
          >
            <ShopIntegrated currentUser={currentUser} activeServer={activeServer} />
            <div className="p-6 border-t border-zinc-800">
              <Button onClick={() => setShowShop(false)} variant="outline" className="w-full">Close Shop</Button>
            </div>
          </motion.div>
        </div>}
        {forwardingMessage && (
          <ForwardMessageModal
            message={forwardingMessage}
            channels={channels}
            conversations={conversations}
            currentUser={userProfile || currentUser}
            isOpen={!!forwardingMessage}
            onClose={() => setForwardingMessage(null)}
          />
        )}
        {showGlobalSearch && (
          <GlobalSearch
            isOpen={showGlobalSearch}
            onClose={() => setShowGlobalSearch(false)}
            serverId={activeServer?.id}
            onResultClick={(result) => {
              if (result.type === 'message' && result.channel_id) {
                const channel = channels.find(c => c.id === result.channel_id);
                if (channel) setActiveChannel(channel);
              }
            }}
          />
        )}
        {showNewDM && (
          <CreateGroupDMModal
            isOpen={showNewDM}
            onClose={() => setShowNewDM(false)}
            currentUser={userProfile || currentUser}
            friends={friends}
            onCreate={(convo) => {
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              setActiveConversation(convo);
              setShowNewDM(false);
            }}
          />
        )}
        </AnimatePresence>
      </div>
    </>
  );
}