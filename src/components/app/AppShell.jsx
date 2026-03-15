import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { useServers, useCategories, useChannels, useMembers, useRoles, useMessages, useDMMessages, useConversations, useFriends, useFriendRequests, useBlocked, useMyProfile, useVoiceStates } from '@/components/app/hooks/useData';
import { useOptimisticMessages } from '@/components/app/performance/useOptimistic';
import { useChannelCache } from '@/components/app/performance/useChannelCache';
import { useSwipeGesture, useSwipePanels } from '@/components/app/mobile/useSwipeGesture';
import { useKeyboardHeight, useIsMobile } from '@/components/app/mobile/useKeyboardHeight';
import ConnectionBanner from '@/components/app/performance/ConnectionBanner';
import MobileNav from '@/components/app/mobile/MobileNav';
const MobileActionSheet = lazy(() => import('@/components/app/mobile/MobileActionSheet'));
import { colors } from '@/components/app/design/tokens';
import { toast } from '@/components/ui/use-toast';

import ServerRailWithContext from '@/components/app/layout/ServerRailWithContext';
import DraggableChannelSidebar from '@/components/app/layout/DraggableChannelSidebar';
import DMSidebar from '@/components/app/layout/DMSidebar';
import UserBar from '@/components/app/layout/UserBar';
import ChatHeader from '@/components/app/layout/ChatHeader';
import MemberPanel from '@/components/app/layout/MemberPanel';
import VirtualMessageList from '@/components/app/performance/VirtualMessageList';
import ChatInput from '@/components/app/chat/ChatInput';
import ChannelSearchBar from '@/components/app/chat/ChannelSearchBar';
const FriendsView = lazy(() => import('@/components/app/views/FriendsView'));
const VoiceChannelView = lazy(() => import('@/components/app/views/VoiceChannelView'));
const DMMediaGallery = lazy(() => import('@/components/app/views/DMMediaGallery'));
import EmptyView from '@/components/app/views/EmptyView';
import NSFWGate from '@/components/app/shared/NSFWGate';
import GlobalTopBar from '@/components/app/layout/GlobalTopBar';
import VoiceConnectedBar from '@/components/app/layout/VoiceConnectedBar';
import { AnnouncementView, ForumView, StageView, MediaView, PollsView, CanvasView, BoardsView, SoundsView, MarksView, EventsView, TicketView } from '@/components/app/views/ChannelViews';
import { processAutoMod, executeAutoModAction } from '@/components/kairo/moderation/AutoModProcessor';

// Lazy-loaded modals — only downloaded when opened
const CreateServerModal = lazy(() => import('@/components/app/modals/CreateServerModal'));
const JoinServerModal = lazy(() => import('@/components/app/modals/JoinServerModal'));
const CreateChannelModal = lazy(() => import('@/components/app/modals/CreateChannelModal'));
const AddFriendModal = lazy(() => import('@/components/app/modals/AddFriendModal'));
const SettingsModal = lazy(() => import('@/components/app/modals/SettingsModal'));
const InviteModal = lazy(() => import('@/components/app/modals/InviteModal'));
const ServerSettingsModal = lazy(() => import('@/components/app/modals/ServerSettingsModal'));
const UserProfileModal = lazy(() => import('@/components/app/modals/UserProfileModal'));
const CreateGroupDMModal = lazy(() => import('@/components/app/modals/CreateGroupDMModal'));
const PinnedMessagesModal = lazy(() => import('@/components/app/modals/PinnedMessagesModal'));
const StatusPickerModal = lazy(() => import('@/components/app/modals/StatusPickerModal'));
const KairoEliteModal = lazy(() => import('@/components/app/modals/KairoEliteModal'));
const ModPanelModal = lazy(() => import('@/components/app/modals/ModPanelModal'));
const AnalyticsDashboardModal = lazy(() => import('@/components/app/modals/AnalyticsDashboardModal'));
const ChannelSettingsModal = lazy(() => import('@/components/app/modals/ChannelSettingsModal'));
const ServerBackupsModal = lazy(() => import('@/components/app/modals/ServerBackupsModal'));
const InvitePreviewModal = lazy(() => import('@/components/app/modals/InvitePreviewModal'));
const CreateCategoryModal = lazy(() => import('@/components/app/modals/CreateCategoryModal'));
const DiscoverModal = lazy(() => import('@/components/app/modals/DiscoverModal'));
const AdminPanelModal = lazy(() => import('@/components/app/modals/AdminPanelModal'));
const AdvancedSearch = lazy(() => import('@/components/app/features/AdvancedSearch'));
const MediaGallery = lazy(() => import('@/components/app/features/MediaGallery'));
const PrivacyDashboard = lazy(() => import('@/components/app/features/PrivacyDashboard'));
const ActivityStatus = lazy(() => import('@/components/app/features/ActivityStatus'));
const QuickActions = lazy(() => import('@/components/app/features/QuickActions'));
const KairoWrapped = lazy(() => import('@/components/app/features/KairoWrapped'));
const ServerMoments = lazy(() => import('@/components/app/features/ServerMoments'));
const MarkAsMomentModal = lazy(() => import('@/components/app/features/ServerMoments').then(m => ({ default: m.MarkAsMomentModal })));

const SpacesView = lazy(() => import('@/components/app/features/KairoSpaces'));
const KairoBoards = lazy(() => import('@/components/app/features/KairoBoards'));
const StarredMessagesPanel = lazy(() => import('@/components/app/features/StarredMessages'));
const ServerNotes = lazy(() => import('@/components/app/features/ServerNotes'));
const JumpToDate = lazy(() => import('@/components/app/features/JumpToDate'));
const ServerShopView = lazy(() => import('@/components/app/views/ServerShopView'));

import QuickStatusPopup from '@/components/app/features/QuickStatusPopup';
import { useBadgeCheck } from '@/components/app/badges/useBadgeCheck';
import BadgeNotification from '@/components/app/badges/BadgeNotification';
import DMCallView, { IncomingCallOverlay, OutgoingCallOverlay } from '@/components/app/views/DMCallView';
import SecretChatView, { SecretChatConfirmModal } from '@/components/app/features/SecretChat';
import NotificationCenter, { useNotifications } from '@/components/app/features/NotificationCenter';
import ThemeEnforcer from '@/components/app/providers/ThemeEnforcer';
import TypingIndicator from '@/components/app/features/TypingIndicator';
import { useTypingEmitter } from '@/components/app/features/useTypingEmitter';
import { useDesktopNotifications } from '@/components/app/features/DesktopNotifications';
import { playNotificationSound } from '@/components/app/features/NotificationSounds';
import { useServerBoosts, getAvailableBoosts, BoostConfirmModal } from '@/components/app/features/ServerBoost';

const ForwardMessageModal = lazy(() => import('@/components/app/modals/ForwardMessageModal'));
const ConfirmDeleteModal = lazy(() => import('@/components/app/modals/ConfirmDeleteModal'));
const ScheduleMessageModal = lazy(() => import('@/components/app/features/ScheduleMessageModal'));
const ThreadView = lazy(() => import('@/components/kairo/threads/ThreadView'));

function ModalSuspense({ children }) {
  return <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)' }} /></div>}>{children}</Suspense>;
}

export default function AppShell({ currentUser }) {
  const qc = useQueryClient();
  const { getProfile, refresh: refreshProfiles } = useProfiles();
  const { optimisticMsgs, optimisticIds, failedIds, addOptimistic, confirmOptimistic, revertOptimistic, retryFailed, clearFailed } = useOptimisticMessages();
  const { trackChannel, prefetchNearby } = useChannelCache();

  const [view, setView] = useState('home');
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [memberPanelByChannel, setMemberPanelByChannel] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-member-panel-by-channel') || '{}'); } catch { return {}; }
  });
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  // showMobileSidebar derived from mobilePanel state below
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isMuted, setIsMuted] = useState(() => { try { return sessionStorage.getItem('kairo-muted') === 'true'; } catch { return false; } });
  const [isDeafened, setIsDeafened] = useState(() => { try { return sessionStorage.getItem('kairo-deafened') === 'true'; } catch { return false; } });
  const [profileUserId, setProfileUserId] = useState(null);
  const [channelToEdit, setChannelToEdit] = useState(null);
  const [mobileTab, setMobileTab] = useState('servers');
  const [nsfwAccepted, setNsfwAccepted] = useState(new Set());
  const [inviteCode, setInviteCode] = useState(null);
  const [showStarred, setShowStarred] = useState(false);
  const [showQuickStatus, setShowQuickStatus] = useState(false);
  const [showServerNotes, setShowServerNotes] = useState(false);
  const [showJumpToDate, setShowJumpToDate] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [threadMsg, setThreadMsg] = useState(null);
  const [secretChat, setSecretChat] = useState(false);
  const [showSecretConfirm, setShowSecretConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [channelSearchOpen, setChannelSearchOpen] = useState(false);
  const [highlightTargetId, setHighlightTargetId] = useState(null);
  const [showBoostConfirm, setShowBoostConfirm] = useState(false);
  const [showServerShop, setShowServerShop] = useState(false);
  const [mobileActionMsg, setMobileActionMsg] = useState(null);
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null);
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
  const [slowModeUntil, setSlowModeUntil] = useState(0);
  const [slowModeRemaining, setSlowModeRemaining] = useState(0);
  const pendingJumpRef = useRef(null);
  const processedNotifRef = useRef(new Set());

  const isMobile = useIsMobile();
  const keyboardHeight = useKeyboardHeight();
  const { panel: mobilePanel, handlers: mobilePanelHandlers, openLeft, openRight, goCenter, setPanel: setMobilePanel } = useSwipePanels();

  const { data: profile } = useMyProfile(currentUser.email);
  const { newBadges, dismissBadge } = useBadgeCheck(currentUser.id, profile?.id);
  const emitTyping = useTypingEmitter(currentUser, profile);
  const { notify } = useDesktopNotifications({
    enabled: profile?.settings?.desktop_notifs !== false,
    soundEnabled: profile?.settings?.sound_notifs !== false,
    soundName: profile?.settings?.notification_sound || 'default',
    currentUserId: currentUser.id,
    ghostMode: profile?.settings?.ghost_mode,
  });
  const { notifications, addNotification, markRead: markNotifRead, markAllRead: markAllNotifsRead, unreadCount: notifUnreadCount } = useNotifications(currentUser.id);
  const unreadMentionCount = notifications.filter(n => !n.read && (n.type === 'mention' || n.type === 'reply')).length;
  const { data: servers = [] } = useServers(currentUser.id, currentUser.email);
  const { data: categories = [] } = useCategories(activeServer?.id);
  const { data: channels = [] } = useChannels(activeServer?.id);
  const { data: members = [] } = useMembers(activeServer?.id);
  const { data: roles = [] } = useRoles(activeServer?.id);
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeChannel?.id);
  const { data: dmMessages = [], isLoading: dmLoading } = useDMMessages(activeConv?.id);
  const { data: conversations = [] } = useConversations(currentUser.email, currentUser.id);
  const { data: friends = [] } = useFriends(currentUser.id);
  const { data: blockedUsers = [] } = useBlocked(currentUser.id);
  const { incoming: incomingReqs, outgoing: outgoingReqs } = useFriendRequests(currentUser.id, currentUser.email);
  const { data: voiceStates = [] } = useVoiceStates(activeServer?.id);
  const { data: autoModRules = [] } = useQuery({
    queryKey: ['autoModRules', activeServer?.id],
    queryFn: () => activeServer?.id ? base44.entities.AutoModRule.filter({ server_id: activeServer.id }) : [],
    enabled: !!activeServer?.id, staleTime: 60000,
  });

  const { boosts: serverBoosts, boostCount, level: boostLevel, refresh: refreshBoosts } = useServerBoosts(activeServer?.id);
  const userHasBoosted = serverBoosts.some(b => b.user_id === currentUser.id);
  const availableBoosts = getAvailableBoosts(profile, currentUser.email);

  useEffect(() => { if (activeServer && channels.length > 0 && !activeChannel) { const first = channels.sort((a, b) => (a.position || 0) - (b.position || 0)).find(c => c.type === 'text'); if (first) setActiveChannel(first); } }, [activeServer, channels]);
  // Apply pending jump (channel + message) after server/channels load
  useEffect(() => {
    const p = pendingJumpRef.current;
    if (!p?.channelId || !activeServer || activeServer.id !== p.serverId) return;
    const ch = channels.find(c => c.id === p.channelId);
    if (ch) {
      setActiveChannel(ch);
      pendingJumpRef.current = null;
      if (p.messageId) {
        setTimeout(() => {
          const el = document.querySelector(`[data-msg-id="${p.messageId}"]`);
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); }
        }, 300);
      }
    }
  }, [activeServer, channels]);
  // Persist mute/deafen state for session
  useEffect(() => { try { sessionStorage.setItem('kairo-muted', isMuted); } catch {} }, [isMuted]);
  useEffect(() => { try { sessionStorage.setItem('kairo-deafened', isDeafened); } catch {} }, [isDeafened]);
  // Real-time subscriptions are handled in useData hooks — no duplicate needed here
  useEffect(() => { setReplyTo(null); setEditingMsg(null); setShowMediaGallery(false); setSecretChat(false); setChannelSearchOpen(false); }, [activeChannel?.id, activeConv?.id]);
  useEffect(() => {
    if (!activeChannel?.id) return;
    const saved = memberPanelByChannel[activeChannel.id];
    setShowMembers(saved === undefined ? !isMobile : !!saved);
  }, [activeChannel?.id, memberPanelByChannel, isMobile]);
  // Track channel for cache and prefetch nearby
  useEffect(() => { trackChannel(activeChannel?.id); prefetchNearby(channels, activeChannel?.id); }, [activeChannel?.id, channels]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') { e.preventDefault(); setIsMuted(m => !m); }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setIsDeafened(d => !d); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setModal('quick-actions'); }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); setModal('settings'); }
      if (e.key === 'Escape' && modal) { e.preventDefault(); setModal(null); setProfileUserId(null); setChannelToEdit(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal]);

  // Notify on new DM messages
  const prevDmCountRef = React.useRef(dmMessages.length);
  useEffect(() => {
    if (dmMessages.length > prevDmCountRef.current) {
      const newest = dmMessages[dmMessages.length - 1];
      if (newest && newest.author_id !== currentUser.id) {
        notify(`${newest.author_name}`, newest.content?.slice(0, 80), newest.author_avatar);
        addNotification({ type: 'dm', title: newest.author_name, content: newest.content?.slice(0, 100) || 'Sent a message', sender_id: newest.author_id, conversation_id: activeConv?.id, message_id: newest.id });
      }
    }
    prevDmCountRef.current = dmMessages.length;
  }, [dmMessages.length]);

  // Ghost mode: set status to offline
  useEffect(() => {
    if (!profile?.id) return;
    if (profile?.settings?.ghost_mode && profile?.status !== 'invisible') {
      base44.entities.UserProfile.update(profile.id, { status: 'invisible', is_online: false });
    }
  }, [profile?.settings?.ghost_mode, profile?.id]);

  // Intercept invite links pasted/navigated within the app
  useEffect(() => {
    const checkUrl = () => {
      const path = window.location.pathname + window.location.search;
      const inviteMatch = path.match(/[?&]code=([A-Za-z0-9]+)/);
      const hashMatch = window.location.hash.match(/invite.*[?&]code=([A-Za-z0-9]+)/i);
      const foundCode = inviteMatch?.[1] || hashMatch?.[1];
      if (foundCode && !inviteCode) {
        setInviteCode(foundCode);
        setModal('invite-preview');
      }
    };
    checkUrl();
  }, []);

  useEffect(() => {
    if (unreadMentionCount > 0) {
      document.title = `(${unreadMentionCount}) Kairo`;
    } else if (notifUnreadCount > 0) {
      document.title = '• Kairo';
    } else {
      document.title = 'Kairo';
    }
  }, [unreadMentionCount, notifUnreadCount]);

  const createServer = useMutation({
    mutationFn: async ({ name, template, icon_url, templateData }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const server = await base44.entities.Server.create({ name, owner_id: currentUser.id, template: template || 'custom', invite_code: code, member_count: 1, icon_url });
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString(), role_ids: [] });
      await base44.entities.Role.create({ server_id: server.id, name: '@everyone', is_default: true, position: 0, color: '#99AAB5' });

      if (templateData?.categories) {
        for (let ci = 0; ci < templateData.categories.length; ci++) {
          const catDef = templateData.categories[ci];
          const cat = await base44.entities.Category.create({ server_id: server.id, name: catDef.name, position: ci });
          for (let chi = 0; chi < catDef.channels.length; chi++) {
            const chDef = catDef.channels[chi];
            await base44.entities.Channel.create({ server_id: server.id, category_id: cat.id, name: chDef.name, type: chDef.type || 'text', position: chi });
          }
        }
      } else {
        const cat = await base44.entities.Category.create({ server_id: server.id, name: 'Text Channels', position: 0 });
        await base44.entities.Channel.create({ server_id: server.id, category_id: cat.id, name: 'general', type: 'text', position: 0 });
        const vCat = await base44.entities.Category.create({ server_id: server.id, name: 'Voice Channels', position: 1 });
        await base44.entities.Channel.create({ server_id: server.id, category_id: vCat.id, name: 'General', type: 'voice', position: 0 });
      }
      return server;
    },
    onSuccess: (server) => { qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); setModal(null); },
    onError: (err) => { toast({ title: 'Couldn\'t create server', description: err?.message || 'Please try again.', variant: 'error' }); },
  });

  const joinServer = useMutation({
    mutationFn: async (code) => {
      let clean = code.trim().toUpperCase();
      if (clean.includes('/INVITE/')) clean = clean.split('/INVITE/')[1]?.split(/[?#]/)[0] || '';
      const all = await base44.entities.Server.list();
      const server = all.find(s => (s.invite_code || '').toUpperCase() === clean);
      if (!server) throw new Error('Invalid invite code');
      const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: currentUser.id });
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({ server_id: server.id, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString(), role_ids: [] });
        const allMems = await base44.entities.ServerMember.filter({ server_id: server.id });
        await base44.entities.Server.update(server.id, { member_count: allMems.filter(m => !m.is_banned).length });
      }
      return server;
    },
    onSuccess: (server) => { qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); setModal(null); },
    onError: (err) => { toast({ title: 'Couldn\'t join server', description: err?.message || 'Invalid invite code.', variant: 'error' }); },
  });

  const sendMsg = useMutation({
    mutationFn: async ({ content, attachments, replyToId, replyPreview, _tempId }) => {
      const msg = await base44.entities.Message.create({
        channel_id: activeChannel.id, server_id: activeServer.id, author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url,
        author_badges: profile?.badges || [], content, attachments,
        type: replyToId ? 'reply' : 'default', reply_to_id: replyToId, reply_preview: replyPreview,
      });
      return { msg, _tempId };
    },
    onSuccess: ({ _tempId }) => { if (_tempId) confirmOptimistic(_tempId); qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] }); setReplyTo(null); },
    onError: (_, vars) => {
      if (vars._tempId) revertOptimistic(vars._tempId, { content: vars.content, attachments: vars.attachments, replyToId: vars.replyToId, replyPreview: vars.replyPreview });
    },
  });

  const sendDM = useMutation({
    mutationFn: async ({ content, attachments, replyToId, _tempId }) => {
      await base44.entities.Conversation.update(activeConv.id, { last_message_at: new Date().toISOString(), last_message_preview: content?.slice(0, 50) });
      const msg = await base44.entities.DirectMessage.create({
        conversation_id: activeConv.id, author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url,
        content, attachments, type: replyToId ? 'reply' : 'default', reply_to_id: replyToId,
      });
      return { msg, _tempId };
    },
    onSuccess: ({ _tempId }) => { if (_tempId) confirmOptimistic(_tempId); qc.invalidateQueries({ queryKey: ['dmMessages', activeConv?.id] }); qc.invalidateQueries({ queryKey: ['conversations'] }); setReplyTo(null); },
    onError: (_, vars) => {
      if (vars._tempId) revertOptimistic(vars._tempId, { content: vars.content, attachments: vars.attachments, replyToId: vars.replyToId });
    },
  });

  const createChannel = useMutation({
    mutationFn: (data) => base44.entities.Channel.create({ ...data, server_id: activeServer.id, position: channels.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels', activeServer?.id] }); setModal(null); },
    onError: (err) => { toast({ title: 'Couldn\'t create channel', description: err?.message || 'Please try again.', variant: 'error' }); },
  });

  const createCategory = useMutation({
    mutationFn: (name) => base44.entities.Category.create({ server_id: activeServer.id, name, position: categories.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories', activeServer?.id] }); setModal(null); },
    onError: (err) => { toast({ title: 'Couldn\'t create category', description: err?.message || 'Please try again.', variant: 'error' }); },
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => { if (profile?.id) await base44.entities.UserProfile.update(profile.id, data); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myProfile'] }); refreshProfiles(); },
    onError: (err) => { toast({ title: 'Couldn\'t save settings', description: err?.message || 'Please try again.', variant: 'error' }); },
  });

  const selectServer = (s) => { setActiveServer(s); setActiveChannel(null); setActiveConv(null); setView('server'); setShowMobileSidebar(false); setReplyTo(null); setEditingMsg(null); setShowMediaGallery(false); setModal(null); setProfileUserId(null); setThreadMsg(null); };
  const goHome = () => { setActiveServer(null); setActiveChannel(null); setView('home'); setShowMobileSidebar(false); setReplyTo(null); setEditingMsg(null); setShowMediaGallery(false); };
  const goFriends = () => { setActiveConv(null); setView('friends'); setShowMobileSidebar(false); setReplyTo(null); setEditingMsg(null); setShowMediaGallery(false); };

  const handleSend = async (data) => {
    if (!isDM && activeSlowModeSeconds > 0 && slowModeRemaining > 0) return;
    // AutoMod check for server channels
    if (activeChannel && activeServer && autoModRules.length > 0) {
      try {
        const modResult = await processAutoMod(data, activeServer.id, autoModRules);
        if (!modResult.allowed) {
          await executeAutoModAction(modResult, data, activeServer.id, currentUser.id);
          return; // Message blocked
        }
      } catch {}
    }
    const optimistic = addOptimistic({
      author_id: currentUser.id,
      author_name: profile?.display_name || currentUser.full_name,
      author_avatar: profile?.avatar_url,
      content: data.content,
      attachments: data.attachments,
      channel_id: activeChannel?.id,
      conversation_id: activeConv?.id,
    });
    if (!optimistic.allowed) return;
    const payload = { ...data, _tempId: optimistic.tempId };
    if (activeConv) await sendDM.mutateAsync(payload);
    else if (activeChannel) {
      await sendMsg.mutateAsync(payload);
      if (activeSlowModeSeconds > 0) {
        setSlowModeUntil(Date.now() + activeSlowModeSeconds * 1000);
      }
    }
  };

  const editMsg = useCallback(async (id, content) => {
    const qk = activeConv ? ['dmMessages', activeConv.id] : ['messages', activeChannel?.id];
    qc.setQueryData(qk, (prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map(m => m.id === id ? { ...m, content, is_edited: true, edited_at: new Date().toISOString() } : m);
    });
    setEditingMsg(null);
    try {
      if (activeConv) await base44.entities.DirectMessage.update(id, { content, is_edited: true });
      else await base44.entities.Message.update(id, { content, is_edited: true, edited_at: new Date().toISOString() });
    } catch (err) {
      console.error('Message edit failed:', err);
      qc.invalidateQueries({ queryKey: qk });
    }
  }, [activeChannel?.id, activeConv?.id]);

  const deleteMsg = useCallback((msg) => {
    setDeleteConfirmMsg(msg);
    setDeleteConfirmBatch(null);
  }, []);

  const deleteConfirmClearSelectionRef = useRef(null);
  const leaveVoiceRef = useRef(null);

  const deleteMsgBatch = useCallback((msgs, onConfirmed) => {
    deleteConfirmClearSelectionRef.current = onConfirmed || null;
    if (msgs.length === 1) {
      setDeleteConfirmMsg(msgs[0]);
      setDeleteConfirmBatch(null);
    } else {
      setDeleteConfirmBatch(msgs);
      setDeleteConfirmMsg(null);
    }
  }, []);

  const confirmDeleteMsg = useCallback(async () => {
    const qk = activeConv ? ['dmMessages', activeConv?.id] : ['messages', activeChannel?.id];
    const toDelete = deleteConfirmMsg ? [deleteConfirmMsg] : (deleteConfirmBatch || []);
    setDeleteConfirmMsg(null);
    setDeleteConfirmBatch(null);
    for (const msg of toDelete) {
      try {
        if (activeConv) await base44.entities.DirectMessage.update(msg.id, { is_deleted: true });
        else await base44.entities.Message.update(msg.id, { is_deleted: true });
      } catch (err) {
        console.error('Message delete failed:', err);
      }
    }
    if (toDelete.length > 0) qc.invalidateQueries({ queryKey: qk });
    deleteConfirmClearSelectionRef.current?.();
    deleteConfirmClearSelectionRef.current = null;
  }, [deleteConfirmMsg, deleteConfirmBatch, activeChannel?.id, activeConv?.id]);

  const pinMsg = useCallback(async (msg) => {
    const newPinned = !msg.is_pinned;
    const qk = activeConv ? ['dmMessages', activeConv?.id] : ['messages', activeChannel?.id];
    try {
      if (activeConv) { await base44.entities.DirectMessage.update(msg.id, { is_pinned: newPinned }); }
      else { await base44.entities.Message.update(msg.id, { is_pinned: newPinned }); }
      qc.invalidateQueries({ queryKey: qk });
      if (newPinned) {
        const el = document.querySelector(`[data-msg-id="${msg.id}"]`);
        if (el) { el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 2000); }
      }
    } catch (err) {
      console.error('Pin failed:', err);
    }
  }, [activeChannel?.id, activeConv?.id]);

  const reactMsg = useCallback(async (msg, emoji) => {
    const reactions = msg.reactions || [];
    const existing = reactions.find(r => r.emoji === emoji);
    let updated;
    if (existing) {
      const has = existing.users?.includes(currentUser.id);
      if (has) updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id) } : r).filter(r => r.count > 0);
      else updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), currentUser.id] } : r);
    } else { updated = [...reactions, { emoji, count: 1, users: [currentUser.id] }]; }
    const qk = activeConv ? ['dmMessages', activeConv?.id] : ['messages', activeChannel?.id];
    try {
      if (activeConv) await base44.entities.DirectMessage.update(msg.id, { reactions: updated });
      else await base44.entities.Message.update(msg.id, { reactions: updated });
      qc.invalidateQueries({ queryKey: qk });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  }, [currentUser.id, activeChannel?.id, activeConv?.id]);

  const handleStartDM = async (friend) => {
    const existing = conversations.find(c => c.participants?.some(p => p.user_id === friend.friend_id));
    if (existing) { setActiveConv(existing); setView('home'); return; }
    const conv = await base44.entities.Conversation.create({
      type: 'dm', participants: [
        { user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url },
        { user_id: friend.friend_id, user_email: friend.friend_email, user_name: friend.friend_name, avatar: friend.friend_avatar },
      ], last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConv(conv); setView('home');
  };

  const handleCreateGroupDM = async ({ name, participants, icon_url }) => {
    const conv = await base44.entities.Conversation.create({
      type: 'group', name, icon_url,
      participants: [{ user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url }, ...participants],
      owner_id: currentUser.id, last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConv(conv); setView('home'); setModal(null);
  };

  const noteToSelfLock = React.useRef(false);
  const handleNoteToSelf = async () => {
    // Check both by participant length and by name to catch edge cases
    const existing = conversations.find(c =>
      (c.participants?.length === 1 && c.participants[0].user_id === currentUser.id) ||
      (c.name === 'Note to Self' && c.participants?.every(p => p.user_id === currentUser.id))
    );
    if (existing) { setActiveConv(existing); setView('home'); return; }
    // Prevent duplicate creation from double-clicks
    if (noteToSelfLock.current) return;
    noteToSelfLock.current = true;
    const conv = await base44.entities.Conversation.create({
      type: 'dm', name: 'Note to Self',
      participants: [{ user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url }],
      last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConv(conv); setView('home');
    noteToSelfLock.current = false;
  };

  const handleStatusUpdate = async ({ status, customStatus }) => {
    if (profile?.id) { await base44.entities.UserProfile.update(profile.id, { status, custom_status: customStatus }); qc.invalidateQueries({ queryKey: ['myProfile'] }); refreshProfiles(); }
    setModal(null);
  };

  const leaveServer = async (server) => {
    if (server.owner_id === currentUser.id) { alert("You can't leave a server you own. Transfer ownership first in Server Settings \u2192 Ownership."); return; }
    if (!confirm(`Leave ${server.name}? You can always come back with an invite.`)) return;
    const mems = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: currentUser.id });
    for (const m of mems) await base44.entities.ServerMember.delete(m.id);
    // Update member count based on actual members
    const remaining = await base44.entities.ServerMember.filter({ server_id: server.id });
    await base44.entities.Server.update(server.id, { member_count: remaining.filter(m => !m.is_banned).length });
    qc.invalidateQueries({ queryKey: ['servers'] }); qc.invalidateQueries({ queryKey: ['members'] });
    if (activeServer?.id === server.id) goHome();
  };

  const handleAddFriendFromProfile = async (targetProfile) => {
    await base44.entities.Friendship.create({ user_id: currentUser.id, friend_id: targetProfile.user_id, friend_email: targetProfile.user_email, friend_name: targetProfile.display_name, friend_avatar: targetProfile.avatar_url, status: 'pending', initiated_by: currentUser.id });
    qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
    setModal(null); setProfileUserId(null);
  };

  const handleBlock = async (target) => {
    const targetId = target.friend_id || target.user_id;
    const targetEmail = target.friend_email || target.user_email;
    const targetName = target.friend_name || target.display_name;
    if (!confirm(`Block ${targetName}? They won't be able to message you or see when you're online.`)) return;
    // Remove all friendships with this user (both directions)
    const existing = friends.find(f => f.friend_id === targetId);
    if (existing) await base44.entities.Friendship.delete(existing.id);
    // Also check for pending requests from/to this user
    const pendingFrom = incomingReqs.find(r => r.user_id === targetId || r.friend_id === targetId);
    if (pendingFrom) await base44.entities.Friendship.delete(pendingFrom.id);
    const pendingTo = outgoingReqs.find(r => r.friend_id === targetId);
    if (pendingTo) await base44.entities.Friendship.delete(pendingTo.id);
    await base44.entities.BlockedUser.create({ user_id: currentUser.id, blocked_user_id: targetId, blocked_email: targetEmail, blocked_name: targetName });
    // Immediately invalidate all relevant queries so block takes effect instantly
    qc.invalidateQueries({ queryKey: ['friends'] });
    qc.invalidateQueries({ queryKey: ['blocked'] });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    qc.invalidateQueries({ queryKey: ['incomingRequests'] });
    qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
    // If currently in a DM with the blocked user, navigate away
    if (activeConv?.participants?.some(p => p.user_id === targetId)) {
      setActiveConv(null);
      setView('home');
    }
    // Close profile modal if viewing blocked user
    if (profileUserId === targetId) {
      setProfileUserId(null);
      setModal(null);
    }
  };

  // DM Call handlers
  const startCall = async (isVideo) => {
    if (!activeConv || activeCall || outgoingCall) return;
    const other = activeConv.participants?.find(p => p.user_id !== currentUser.id);
    const call = await base44.entities.DMCall.create({
      conversation_id: activeConv.id,
      initiator_id: currentUser.id,
      initiator_name: profile?.display_name || currentUser.full_name,
      status: 'ringing',
      is_video_call: isVideo,
      started_at: new Date().toISOString(),
      participants: [{ user_id: currentUser.id, user_name: profile?.display_name || currentUser.full_name, joined_at: new Date().toISOString() }],
    });
    setOutgoingCall({ ...call, recipientName: other?.user_name, recipientAvatar: other?.avatar });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    await base44.entities.DMCall.update(incomingCall.id, {
      status: 'ongoing',
      participants: [...(incomingCall.participants || []), { user_id: currentUser.id, user_name: profile?.display_name || currentUser.full_name, joined_at: new Date().toISOString() }],
    });
    const updated = { ...incomingCall, status: 'ongoing' };
    setActiveCall(updated);
    // Navigate to the conversation if not already there
    if (!activeConv || activeConv.id !== incomingCall.conversation_id) {
      const conv = conversations.find(c => c.id === incomingCall.conversation_id);
      if (conv) { setActiveConv(conv); setView('home'); }
    }
    setIncomingCall(null);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    await base44.entities.DMCall.update(incomingCall.id, { status: 'missed', ended_at: new Date().toISOString() });
    setIncomingCall(null);
  };

  const cancelOutgoing = async () => {
    if (!outgoingCall) return;
    await base44.entities.DMCall.update(outgoingCall.id, { status: 'missed', ended_at: new Date().toISOString() });
    setOutgoingCall(null);
  };

  const endCall = async () => {
    const callId = activeCall?.id || outgoingCall?.id;
    if (callId) {
      await base44.entities.DMCall.update(callId, { status: 'ended', ended_at: new Date().toISOString() });
    }
    setActiveCall(null);
    setOutgoingCall(null);
  };

  // Poll for incoming calls & outgoing call status changes
  useEffect(() => {
    if (!currentUser?.id) return;
    const interval = setInterval(async () => {
      // Check for incoming ringing calls in my conversations
      if (!activeCall && !incomingCall) {
        const ringing = await base44.entities.DMCall.filter({ status: 'ringing' });
        const incoming = ringing.find(c =>
          c.initiator_id !== currentUser.id &&
          conversations.some(conv => conv.id === c.conversation_id)
        );
        if (incoming) setIncomingCall(incoming);
      }
      // If outgoing, check if other party accepted
      if (outgoingCall) {
        const updated = await base44.entities.DMCall.filter({ conversation_id: outgoingCall.conversation_id, status: 'ongoing' });
        const match = updated.find(c => c.id === outgoingCall.id);
        if (match) {
          setActiveCall(match);
          setOutgoingCall(null);
        } else {
          // Check if it was declined/missed
          const missed = await base44.entities.DMCall.filter({ conversation_id: outgoingCall.conversation_id });
          const orig = missed.find(c => c.id === outgoingCall.id);
          if (orig && (orig.status === 'missed' || orig.status === 'ended')) {
            setOutgoingCall(null);
          }
        }
      }
      // If in active call, check if it ended
      if (activeCall) {
        const all = await base44.entities.DMCall.filter({ conversation_id: activeCall.conversation_id });
        const current = all.find(c => c.id === activeCall.id);
        if (current?.status === 'ended') {
          setActiveCall(null);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser?.id, conversations, activeCall, outgoingCall, incomingCall]);

  // Swipe gestures for mobile
  const swipeHandlers = isMobile ? mobilePanelHandlers : {};
  const setShowMobileSidebar = (v) => { if (v) openLeft(); else goCenter(); };
  const toggleMembers = useCallback(() => {
    if (isMobile) { mobilePanel === 'right' ? goCenter() : openRight(); }
    else {
      setShowMembers(prev => {
        const next = !prev;
        if (activeChannel?.id) {
          setMemberPanelByChannel(map => {
            const updated = { ...map, [activeChannel.id]: next };
            try { localStorage.setItem('kairo-member-panel-by-channel', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
        return next;
      });
    }
  }, [isMobile, mobilePanel, goCenter, openRight, activeChannel?.id]);

  // Computed
  const isDM = !!activeConv;
  const chType = activeChannel?.type;
  const isVoiceChannel = chType === 'voice';
  const isStageChannel = chType === 'stage';
  const isBoardChannel = chType === 'board';
  const specialTypes = ['forum', 'announcement', 'stage', 'media', 'polls', 'canvas', 'sounds', 'marks', 'events', 'tickets'];
  const isSpecialChannel = view === 'server' && activeChannel && specialTypes.includes(chType);
  const isNsfw = activeChannel?.is_nsfw && !nsfwAccepted.has(activeChannel?.id);
  const isInChat = (view === 'server' && activeChannel && !isVoiceChannel && !isStageChannel && !isBoardChannel && !isSpecialChannel && !isNsfw) || (view === 'home' && activeConv);
  const isInVoice = view === 'server' && activeChannel && isVoiceChannel;
  const isInBoard = view === 'server' && activeChannel && isBoardChannel;
  const activeSlowModeSeconds = isDM ? 0 : (activeChannel?.slow_mode_seconds || 0);
  // Merge optimistic messages with real messages, deduplicating content that already arrived
  const baseMsgs = isDM ? dmMessages : messages;
  const filteredOptimistic = optimisticMsgs.filter(m => {
    // Only show optimistic msgs for current view
    if (isDM ? m.conversation_id !== activeConv?.id : m.channel_id !== activeChannel?.id) return false;
    // Remove if a real message with same content from same author arrived (dedup)
    return !baseMsgs.some(real =>
      real.author_id === m.author_id &&
      real.content === m.content &&
      Math.abs(new Date(real.created_date) - new Date(m.created_date)) < 10000
    );
  });
  const currentMsgs = [...baseMsgs, ...filteredOptimistic];
  const currentLoading = isDM ? dmLoading : msgsLoading;
  const channelLabel = isDM ? (activeConv.name || activeConv.participants?.find(p => p.user_id !== currentUser.id)?.user_name || 'DM') : (activeChannel?.name || '');

  // Create notifications for mentions and replies (only for messages created in last 2 min = "new")
  useEffect(() => {
    if (!baseMsgs?.length || !addNotification || profile?.settings?.mention_notifs === false) return;
    const twoMinAgo = Date.now() - 2 * 60 * 1000;
    const myName = (profile?.display_name || currentUser.full_name || '').toLowerCase().replace(/\s+/g, '');
    const myUsername = (profile?.username || currentUser.email?.split('@')[0] || '').toLowerCase();
    const mentionRegex = /@(\w+)/g;
    for (const msg of baseMsgs) {
      const msgTime = new Date(msg.created_date).getTime();
      if (msgTime < twoMinAgo || msg.author_id === currentUser.id || msg.is_deleted || processedNotifRef.current.has(msg.id)) continue;
      processedNotifRef.current.add(msg.id);
      if (processedNotifRef.current.size > 500) {
        const arr = [...processedNotifRef.current];
        processedNotifRef.current = new Set(arr.slice(-250));
      }
      const isReply = msg.reply_to_id && baseMsgs.some(m => m.id === msg.reply_to_id && m.author_id === currentUser.id);
      let isMention = false;
      if (msg.content) {
        const matches = [...msg.content.matchAll(mentionRegex)];
        isMention = matches.some(([, name]) => {
          const n = (name || '').toLowerCase().replace(/\s+/g, '');
          return n === myName || n === myUsername || msg.content?.toLowerCase().includes('@everyone') || msg.content?.toLowerCase().includes('@here');
        });
      }
      if (isMention || isReply) {
        const type = isReply ? 'reply' : 'mention';
        const payload = {
          type,
          title: isReply ? 'Reply' : 'Mention',
          content: `${msg.author_name || 'Someone'}: ${(msg.content || '').slice(0, 60)}${(msg.content?.length || 0) > 60 ? '…' : ''}`,
          server_id: activeServer?.id,
          channel_id: activeChannel?.id,
          channel_name: channelLabel,
          message_id: msg.id,
          author_id: msg.author_id,
          author_name: msg.author_name,
        };
        if (isDM) payload.conversation_id = activeConv?.id;
        addNotification(payload);
      }
    }
  }, [baseMsgs, currentUser.id, profile?.display_name, profile?.username, profile?.settings?.mention_notifs, addNotification, activeServer?.id, activeChannel?.id, activeConv?.id, channelLabel, isDM]);

  useEffect(() => {
    if (!slowModeUntil) { setSlowModeRemaining(0); return; }
    const tick = () => setSlowModeRemaining(Math.max(0, Math.ceil((slowModeUntil - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [slowModeUntil]);

  const starMsg = useCallback((msg) => {
    const key = `kairo-starred-${currentUser.id}`;
    let starred = [];
    try { starred = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    const exists = starred.some(m => m.id === msg.id);
    const updated = exists ? starred.filter(m => m.id !== msg.id) : [...starred, { ...msg, channel_name: channelLabel }];
    try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
  }, [currentUser.id, channelLabel]);

  const highlightMsg = useCallback(async (msg) => {
    await base44.entities.Highlight.create({
      user_id: currentUser.id,
      message_id: msg.id,
      message_content: msg.content,
      message_author: msg.author_name,
      channel_name: channelLabel,
      server_id: activeServer?.id,
      server_name: activeServer?.name,
    });
  }, [currentUser.id, channelLabel, activeServer?.id, activeServer?.name]);

  const pinnedCount = isDM ? dmMessages.filter(m => m.is_pinned).length : messages.filter(m => m.is_pinned).length;
  const isOwner = activeServer?.owner_id === currentUser.id || activeServer?.created_by === currentUser.email;
  const profileModal = profileUserId ? getProfile(profileUserId) : null;
  const profileMember = profileUserId ? members.find(m => m.user_id === profileUserId) : null;
  const hasElite = profile?.badges?.includes('premium') || false;
  const hasLite = profile?.badges?.includes('lite') || false;
  const isAppOwner = currentUser.role === 'admin';
  const isFriendProfile = profileUserId ? friends.some(f => f.friend_id === profileUserId) : false;
  const onlineMemberCount = members.filter(m => getProfile(m.user_id)?.is_online).length;
  const messageLimit = hasElite || isAppOwner ? 4000 : hasLite ? 2500 : 2000;

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden" style={{ background: colors.bg.base }} {...swipeHandlers}>
      <ThemeEnforcer
        theme={profile?.settings?.theme || 'dark'}
        fontScaling={profile?.settings?.font_scaling}
        saturation={profile?.settings?.saturation}
        accentColor={profile?.accent_color}
        reducedMotion={profile?.settings?.reduced_motion}
      />
      <ConnectionBanner />

      {/* Desktop: always show. Mobile: slide-in panel */}
      <div className={`mobile-panel-left ${mobilePanel === 'left' ? 'open' : ''} md:!relative md:!transform-none md:!transition-none md:flex flex-row`}
        style={{ display: mobilePanel === 'left' || !isMobile ? 'flex' : 'flex' }}
        role="navigation" aria-label="Sidebar">
        <ServerRailWithContext servers={servers} activeServerId={activeServer?.id} onServerSelect={selectServer} onHomeClick={goHome}
          onCreateServer={() => setModal('create-server')} onDiscover={() => setModal('discover')}
          onElite={() => setModal('elite')} onLeaveServer={leaveServer}
          isHome={view === 'home' || view === 'friends'} badge={incomingReqs.length}
          currentUserId={currentUser.id} isAppOwner={isAppOwner} onAdminPanel={() => setModal('admin-panel')}
          onServerNotes={(id) => { setShowServerNotes(id); }}
          compact={profile?.settings?.compact_servers}
          onWrapped={() => setModal('wrapped')} />

        <div className="app-channel-sidebar w-[240px] flex-shrink-0 flex flex-col overflow-hidden" style={{ background: colors.bg.surface }}>
          {view === 'server' ? (
            <DraggableChannelSidebar server={activeServer} categories={categories} channels={channels}
              activeId={activeChannel?.id} onSelect={(ch) => { setActiveChannel(ch); setShowMobileSidebar(false); }}
              onAdd={(catId) => { setModalData(catId); setModal('create-channel'); }}
              onAddCategory={() => setModal('create-category')}
              onSettings={() => setModal('server-settings')} onInvite={() => setModal('invite')}
              onModPanel={() => setModal('mod-panel')} onAnalytics={() => setModal('analytics')} onBackups={() => setModal('server-backups')}
              onChannelSettings={(ch) => { setChannelToEdit(ch); setModal('channel-settings'); }}
              onJumpToDate={() => setShowJumpToDate(true)}
              onLeaveServer={() => leaveServer(activeServer)}
              voiceStates={voiceStates}
              isOwner={isOwner}
              boostCount={boostCount} boostLevel={boostLevel} isBoosted={userHasBoosted}
              onBoost={() => setShowBoostConfirm(true)} onShop={() => setShowServerShop(true)}
              shopEnabled={activeServer?.shop_enabled}
              memberCount={members.length}
              onlineCount={onlineMemberCount} />
          ) : (
            <DMSidebar conversations={conversations} activeId={activeConv?.id}
              onSelect={(c) => { setActiveConv(c); setSecretChat(false); setView('home'); setShowMobileSidebar(false); }}
              onFriends={goFriends} onCreateGroup={() => setModal('create-group-dm')}
              onNoteToSelf={handleNoteToSelf}
              currentUserId={currentUser.id} incomingRequestCount={incomingReqs.length}
              blockedUserIds={(blockedUsers || []).map(b => b.blocked_user_id)}
              friendIds={(friends || []).map(f => f.friend_id)}
              onBlock={handleBlock} />
          )}
          {/* Voice connected bar — persists while navigating */}
          {(() => {
            const myVoiceState = voiceStates.find(v => v.user_id === currentUser.id);
            if (!myVoiceState) return null;
            const voiceCh = channels.find(c => c.id === myVoiceState.channel_id);
            return (
              <VoiceConnectedBar
                channelName={voiceCh?.name || 'Voice'} serverName={activeServer?.name}
                isMuted={isMuted} isDeafened={isDeafened}
                onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
                onDisconnect={async () => {
                  const leave = leaveVoiceRef.current;
                  if (leave) await leave();
                  else if (voiceCh) setActiveChannel(voiceCh);
                }}
                onClick={() => { if (voiceCh) setActiveChannel(voiceCh); }} />
            );
          })()}
          <div className="border-t" style={{ borderColor: colors.border?.subtle || colors.border?.default }}>
            <div className="relative">
            <UserBar profile={profile} isMuted={isMuted} isDeafened={isDeafened}
              onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
              onSettings={() => setModal('settings')} onStatusClick={() => setShowQuickStatus(!showQuickStatus)}
              userEmail={currentUser?.email} />
            {showQuickStatus && (
              <QuickStatusPopup currentStatus={profile?.status} customStatus={profile?.custom_status}
                onSave={(data) => { handleStatusUpdate(data); setShowQuickStatus(false); }}
                onClose={() => setShowQuickStatus(false)} />
            )}
            </div>
          </div>
        </div>

      </div>
      {/* Mobile panel backdrops */}
      <div className={`mobile-backdrop ${mobilePanel !== 'center' ? 'visible' : ''} md:hidden`}
        onClick={goCenter} />

      {/* Mobile right panel for members */}
      {isMobile && view === 'server' && (
        <div className={`mobile-panel-right ${mobilePanel === 'right' ? 'open' : ''} md:hidden`}
          style={{ background: colors.bg.surface }}>
          <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id}
            onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); goCenter(); }} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 relative k-channel-fade" style={{ background: colors.bg.elevated }} role="main" key={activeChannel?.id || activeConv?.id || view}>
        {view === 'spaces' ? (
          <>
            <GlobalTopBar onSearch={() => setModal('search')} notificationCount={notifUnreadCount} onNotifications={() => setShowNotifications(true)} />
            <SpacesView currentUser={currentUser} profile={profile} />
          </>
        ) : view === 'friends' ? (
          <>
          <GlobalTopBar onSearch={() => setModal('search')} notificationCount={notifUnreadCount} onNotifications={() => setShowNotifications(true)} />
          <FriendsView friends={friends} incomingRequests={incomingReqs} outgoingRequests={outgoingReqs}
            blocked={blockedUsers}
            onAddFriend={() => setModal('add-friend')} onMessage={handleStartDM} onBlock={handleBlock}
            onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }}
            onAccept={async (r) => {
              await base44.entities.Friendship.update(r.id, { status: 'accepted' });
              const sp = getProfile(r.user_id);
              const friendName = sp?.display_name || r.friend_name || 'User';
              await base44.entities.Friendship.create({ user_id: r.friend_id || currentUser.id, friend_id: r.user_id, friend_email: r.created_by, friend_name: friendName, friend_avatar: sp?.avatar_url, status: 'accepted', initiated_by: r.initiated_by });
              addNotification({ type: 'friend_request', title: 'New Friend', content: `You are now friends with ${friendName}` });
              qc.invalidateQueries({ queryKey: ['friends'] }); qc.invalidateQueries({ queryKey: ['incomingRequests'] }); qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
            }}
            onDecline={async (r) => { await base44.entities.Friendship.delete(r.id); qc.invalidateQueries({ queryKey: ['incomingRequests'] }); }}
            onRemove={async (f) => { if (!confirm(`Remove ${f.friend_name} from your friends? You can always add them back later.`)) return; await base44.entities.Friendship.delete(f.id); qc.invalidateQueries({ queryKey: ['friends'] }); }}
            onUnblock={async (b) => { if (!confirm(`Unblock ${b.blocked_name || 'this user'}? They'll be able to message you again.`)) return; await base44.entities.BlockedUser.delete(b.id); qc.invalidateQueries({ queryKey: ['blocked'] }); qc.invalidateQueries({ queryKey: ['conversations'] }); }}
            onCancelRequest={async (r) => { await base44.entities.Friendship.delete(r.id); qc.invalidateQueries({ queryKey: ['outgoingRequests'] }); }} />
          </>
        ) : view === 'server' && isNsfw ? (
          <>
            <ChatHeader channel={activeChannel} isDM={false} showMembers={showMembers} onToggleMembers={toggleMembers} serverName={activeServer?.name} slowModeSeconds={activeSlowModeSeconds} />
            <NSFWGate channelName={activeChannel.name} onAccept={() => setNsfwAccepted(prev => new Set([...prev, activeChannel.id]))} />
          </>
        ) : isInBoard ? (
          <>
            <ChatHeader channel={activeChannel} isDM={false} showMembers={showMembers} onToggleMembers={toggleMembers} serverName={activeServer?.name} slowModeSeconds={activeSlowModeSeconds} />
            <KairoBoards channel={activeChannel} serverId={activeServer?.id} />
          </>
        ) : isInVoice ? (
          <>
            <ChatHeader channel={activeChannel} isDM={false} showMembers={showMembers} onToggleMembers={toggleMembers} serverName={activeServer?.name} slowModeSeconds={activeSlowModeSeconds} />
            <div className="flex-1 flex min-h-0">
              <VoiceChannelView channel={activeChannel} currentUser={currentUser} isMuted={isMuted} isDeafened={isDeafened}
                onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
                onDisconnect={() => { setActiveChannel(null); leaveVoiceRef.current = null; }}
                onRegisterLeave={(fn) => { leaveVoiceRef.current = fn; }} />
              {showMembers && <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id} onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }} />}
            </div>
          </>
        ) : isSpecialChannel ? (
          <>
            <ChatHeader channel={activeChannel} isDM={false} showMembers={showMembers} onToggleMembers={toggleMembers}
              onPinned={() => setModal('pinned')} pinnedCount={pinnedCount} onSearch={() => setModal('search')} serverName={activeServer?.name}
              onMoments={() => setModal('moments')} onThreads={() => { if (threadMsg) setThreadMsg(null); }} onInbox={() => setShowNotifications(true)} slowModeSeconds={activeSlowModeSeconds} />
            <div className="flex-1 flex min-h-0">
              {chType === 'announcement' && (
                isOwner ? (
                  <div className="flex-1 flex flex-col min-w-0">
                    <AnnouncementView channel={activeChannel} messages={currentMsgs} isAdmin={true} />
                    <TypingIndicator channelId={activeChannel?.id} currentUserId={currentUser.id} />
                    <ChatInput channelName={channelLabel} channelId={activeChannel?.id} serverId={activeServer?.id}
                      replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSend={handleSend}
                      members={members} getProfile={getProfile}
                      hasElite={hasElite} hasLite={hasLite}
                      maxChars={messageLimit}
                      slowModeRemaining={slowModeRemaining}
                      onTyping={() => emitTyping(activeChannel?.id)}
                      onSchedule={() => setModal('schedule-message')}
                      onEditLast={() => {
                        const myMsgs = currentMsgs.filter(m => m.author_id === currentUser.id && !m.is_deleted);
                        if (myMsgs.length > 0) setEditingMsg(myMsgs[myMsgs.length - 1]);
                      }} />
                  </div>
                ) : (
                  <AnnouncementView channel={activeChannel} messages={currentMsgs} isAdmin={false} />
                )
              )}
              {chType === 'forum' && <ForumView channel={activeChannel} />}
              {chType === 'stage' && <StageView channel={activeChannel} />}
              {chType === 'media' && <MediaView channel={activeChannel} isAdmin={isOwner} />}
              {chType === 'polls' && <PollsView channel={activeChannel} />}
              {chType === 'canvas' && <CanvasView channel={activeChannel} />}
              {chType === 'sounds' && <SoundsView channel={activeChannel} isAdmin={isOwner} />}
              {chType === 'marks' && <MarksView channel={activeChannel} serverId={activeServer?.id} />}
              {chType === 'events' && <EventsView channel={activeChannel} />}
              {chType === 'tickets' && <TicketView channel={activeChannel} />}
              {view === 'server' && showMembers && <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id} onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }} />}
            </div>
          </>
        ) : isInChat ? (
          <>
            <ChatHeader channel={activeChannel} conversation={activeConv} currentUserId={currentUser.id}
              showMembers={showMembers} onToggleMembers={toggleMembers}
              isDM={isDM} onPinned={() => setModal('pinned')} pinnedCount={pinnedCount}
              onMediaGallery={isDM ? () => setShowMediaGallery(!showMediaGallery) : () => setModal('media-gallery')}
              onSearch={isInChat ? () => setChannelSearchOpen(true) : () => setModal('search')}
              onStarred={() => setShowStarred(true)}
              onVoiceCall={isDM ? () => startCall(false) : undefined}
              onVideoCall={isDM ? () => startCall(true) : undefined}
              serverName={activeServer?.name}
              secretChat={secretChat}
              onToggleSecret={isDM ? () => {
                if (secretChat) { setSecretChat(false); }
                else { setShowSecretConfirm(true); }
              } : undefined}
              onThreads={!isDM ? () => { /* toggle thread panel visibility */ if (threadMsg) setThreadMsg(null); } : undefined}
              onInbox={() => setShowNotifications(true)}
              slowModeSeconds={isDM ? 0 : activeSlowModeSeconds} />
            <div className="flex-1 flex min-h-0">
              {isDM && secretChat ? (
                <SecretChatView currentUserId={currentUser.id}
                  currentUserName={profile?.display_name || currentUser.full_name}
                  otherUserName={activeConv?.participants?.find(p => p.user_id !== currentUser.id)?.user_name || 'User'}
                  onExit={() => setSecretChat(false)} />
              ) : (
              <div className="flex-1 flex flex-col min-w-0">
                {channelSearchOpen && (
                  <ChannelSearchBar messages={currentMsgs} channelName={channelLabel}
                    onJumpToMessage={(id) => {
                      setHighlightTargetId(id);
                      setChannelSearchOpen(false);
                      setTimeout(() => setHighlightTargetId(null), 100);
                    }}
                    onClose={() => setChannelSearchOpen(false)} />
                )}
                <VirtualMessageList messages={currentMsgs} currentUserId={currentUser.id} channelName={channelLabel}
                  highlightTargetId={highlightTargetId}
                  isLoading={currentLoading} isDM={isDM} onReply={setReplyTo} onEdit={setEditingMsg}
                  onDelete={deleteMsg} onDeleteBatch={deleteMsgBatch} onReact={reactMsg} onPin={pinMsg} onStar={starMsg}
                  onForward={(msg) => { setForwardMsg(msg); setModal('forward'); }}
                  onHighlight={highlightMsg}
                  isAdmin={isDM || isOwner}
                  onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }}
                  editingMessage={editingMsg} onEditSave={editMsg} onEditCancel={() => setEditingMsg(null)}
                  onLongPress={isMobile ? setMobileActionMsg : undefined}
                  optimisticIds={optimisticIds} failedIds={failedIds}
                  onRetryFailed={(tempId) => {
                    const payload = retryFailed(tempId);
                    if (!payload) return;
                    const { _tempId, ...data } = payload;
                    if (activeConv) sendDM.mutate({ ...data, _tempId });
                    else if (activeChannel) sendMsg.mutate({ ...data, _tempId });
                  }}
                  onDismissFailed={clearFailed}
                  members={members} getProfile={getProfile}
                  onMarkMoment={isOwner && !isDM ? (msg) => { setModalData(msg); setModal('mark-moment'); } : undefined}
                  onOpenThread={!isDM ? (msg) => setThreadMsg(msg) : undefined} />
                <TypingIndicator channelId={activeChannel?.id || activeConv?.id} currentUserId={currentUser.id} />
                <ChatInput channelName={channelLabel} channelId={activeChannel?.id || activeConv?.id} serverId={activeServer?.id} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSend={handleSend}
                  members={isDM ? [] : members} getProfile={getProfile}
                  maxChars={messageLimit}
                  hasElite={hasElite} hasLite={hasLite}
                  slowModeRemaining={isDM ? 0 : slowModeRemaining}
                  onTyping={() => emitTyping(activeChannel?.id || activeConv?.id)}
                  onSchedule={!isDM ? () => setModal('schedule-message') : undefined}
                  onEditLast={() => {
                    const myMsgs = currentMsgs.filter(m => m.author_id === currentUser.id && !m.is_deleted);
                    if (myMsgs.length > 0) setEditingMsg(myMsgs[myMsgs.length - 1]);
                  }} />
              </div>
              )}
              {view === 'server' && showMembers && !isMobile && !threadMsg && <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id} onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }} />}
              {threadMsg && (
                <Suspense fallback={null}>
                  <ThreadView isOpen={!!threadMsg} onClose={() => setThreadMsg(null)} parentMessage={threadMsg} channelId={activeChannel?.id}
                    currentUser={{ user_id: currentUser.id, display_name: profile?.display_name || currentUser.full_name, avatar_url: profile?.avatar_url }}
                    serverName={activeServer?.name} />
                </Suspense>
              )}
              {isDM && showMediaGallery && <DMMediaGallery messages={currentMsgs} onClose={() => setShowMediaGallery(false)} />}
            </div>
          </>
        ) : view === 'server' && activeServer && !activeChannel ? (
          <>
            <GlobalTopBar onSearch={() => setModal('search')} notificationCount={notifUnreadCount} onNotifications={() => setShowNotifications(true)} />
            <EmptyView emptyServer serverName={activeServer.name}
              onCreateChannel={isOwner ? () => { setModalData(categories[0]?.id); setModal('create-channel'); } : undefined} />
          </>
        ) : (
          <>
            <GlobalTopBar onSearch={() => setModal('search')} notificationCount={notifUnreadCount} onNotifications={() => setShowNotifications(true)} />
            <EmptyView onCreateServer={() => setModal('create-server')} onJoinServer={() => setModal('discover')} />
          </>
        )}
      </div>

      {/* Hidden VoiceChannelView when in voice but viewing another channel — keeps connection so disconnect works */}
      {(() => {
        const myVS = voiceStates.find(v => v.user_id === currentUser.id);
        const vCh = myVS ? channels.find(c => c.id === myVS.channel_id) : null;
        if (!myVS || !vCh || isInVoice) return null;
        return (
          <div style={{ position: 'fixed', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }} aria-hidden="true">
            <VoiceChannelView channel={vCh} currentUser={currentUser} isMuted={isMuted} isDeafened={isDeafened}
              onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
              onDisconnect={() => {}}
              onRegisterLeave={(fn) => { leaveVoiceRef.current = fn; }} />
          </div>
        );
      })()}

      <ModalSuspense>
      <AnimatePresence>
        {modal === 'create-server' && <CreateServerModal onClose={() => setModal(null)} onCreate={(d) => createServer.mutate(d)} isCreating={createServer.isPending} />}
        {modal === 'join-server' && <JoinServerModal onClose={() => setModal(null)} onJoin={(c) => joinServer.mutate(c)} isJoining={joinServer.isPending} />}
        {modal === 'discover' && <DiscoverModal onClose={() => setModal(null)} currentUserId={currentUser.id} currentUserEmail={currentUser.email}
          onJoinSuccess={(server) => { qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); setModal(null); }} />}
        {modal === 'admin-panel' && <AdminPanelModal onClose={() => setModal(null)} />}
        {modal === 'create-channel' && <CreateChannelModal onClose={() => setModal(null)} onCreate={(d) => createChannel.mutate(d)} categories={categories} defaultCategoryId={modalData} />}
        {modal === 'create-category' && <CreateCategoryModal onClose={() => setModal(null)} onCreate={(name) => createCategory.mutate(name)} />}
        {modal === 'add-friend' && <AddFriendModal onClose={() => setModal(null)} currentUserId={currentUser.id} />}
        {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} profile={profile} onUpdate={(d) => updateProfile.mutate(d)} onLogout={() => base44.auth.logout()} currentUser={currentUser} onAdminPanel={() => { setModal(null); setTimeout(() => setModal('admin-panel'), 100); }} onElite={() => setTimeout(() => setModal('elite'), 100)} />}
        {modal === 'invite' && activeServer && <InviteModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'server-settings' && activeServer && <ServerSettingsModal onClose={(r) => { setModal(null); if (r === 'deleted' || r === 'transferred') { qc.invalidateQueries({ queryKey: ['servers'] }); goHome(); } }} server={activeServer} currentUserId={currentUser.id} />}
        {modal === 'profile' && profileModal && (
          <UserProfileModal onClose={() => { setModal(null); setProfileUserId(null); }} profile={profileModal} memberData={profileMember} roles={roles}
            isCurrentUser={profileUserId === currentUser.id} friends={friends} mutualServers={servers.slice(0, 5)}
            onMessage={isFriendProfile ? () => { const f = friends.find(x => x.friend_id === profileUserId); if (f) { handleStartDM(f); setModal(null); setProfileUserId(null); } } : undefined}
            onAddFriend={!isFriendProfile && profileUserId !== currentUser.id ? handleAddFriendFromProfile : undefined}
            onBlock={handleBlock} />
        )}
        {modal === 'create-group-dm' && <CreateGroupDMModal onClose={() => setModal(null)} friends={friends} onCreate={handleCreateGroupDM} hasElite={hasElite} />}
        {modal === 'pinned' && <PinnedMessagesModal onClose={() => setModal(null)} messages={currentMsgs} onUnpin={pinMsg}
          onJumpToMessage={(msg) => { setModal(null); setTimeout(() => { const el = document.querySelector(`[data-msg-id="${msg.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); } }, 100); }} />}
        {modal === 'status' && <StatusPickerModal onClose={() => setModal(null)} currentStatus={profile?.status} customStatus={profile?.custom_status} onSave={handleStatusUpdate} />}
        {modal === 'elite' && <KairoEliteModal onClose={() => setModal(null)} profile={profile} hasElite={hasElite || isAppOwner} currentUser={currentUser} />}
        {modal === 'mod-panel' && activeServer && <ModPanelModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'analytics' && activeServer && <AnalyticsDashboardModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'channel-settings' && channelToEdit && (
          <ChannelSettingsModal onClose={() => { setModal(null); setChannelToEdit(null); }} channel={channelToEdit}
            onDelete={() => { if (activeChannel?.id === channelToEdit.id) setActiveChannel(null); }} />
        )}
        {modal === 'server-backups' && activeServer && <ServerBackupsModal onClose={() => setModal(null)} server={activeServer} currentUser={currentUser} />}
        {modal === 'search' && <AdvancedSearch onClose={() => setModal(null)} servers={servers} currentUserId={currentUser.id}
          onJumpToMessage={(msg) => {
            setModal(null);
            // Navigate to the right server/channel if needed
            if (msg.server_id) {
              const s = servers.find(sv => sv.id === msg.server_id);
              if (s && s.id !== activeServer?.id) selectServer(s);
            }
            setTimeout(() => { const el = document.querySelector(`[data-msg-id="${msg.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(123,108,246,0.15)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); } }, 200);
          }} />}
        {modal === 'invite-preview' && inviteCode && (
          <InvitePreviewModal
            code={inviteCode}
            currentUser={currentUser}
            onClose={() => { setModal(null); setInviteCode(null); }}
            onJoinSuccess={(server) => { setInviteCode(null); setModal(null); qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); }}
          />
        )}
        {modal === 'media-gallery' && <MediaGallery onClose={() => setModal(null)} messages={currentMsgs} channelName={channelLabel} />}
        {modal === 'privacy-dashboard' && <PrivacyDashboard onClose={() => setModal(null)} profile={profile} currentUser={currentUser} onUpdate={(d) => updateProfile.mutate(d)} />}
        {modal === 'activity' && <ActivityStatus onClose={() => setModal(null)} profile={profile} onUpdate={(d) => updateProfile.mutate(d)} />}
        {modal === 'forward' && forwardMsg && <ForwardMessageModal onClose={() => { setModal(null); setForwardMsg(null); }} message={forwardMsg} channels={channels} conversations={conversations} currentUser={currentUser} profile={profile} />}
        {modal === 'schedule-message' && <ScheduleMessageModal onClose={() => setModal(null)} channelId={activeChannel?.id} serverId={activeServer?.id} currentUser={currentUser} profile={profile} />}
        {modal === 'quick-actions' && <QuickActions onClose={() => setModal(null)}
          recentChannels={channels.map(ch => ({ ...ch, serverName: activeServer?.name }))}
          recentDMs={conversations.slice(0, 5).map(c => ({ id: c.id, name: c.name || c.participants?.map(p => p.user_name).join(', ') || 'DM' }))}
          onAction={(action, data) => {
            if (action === 'create-server') setModal('create-server');
            else if (action === 'create-channel') setModal('create-channel');
            else if (action === 'add-friend') setModal('add-friend');
            else if (action === 'settings') setModal('settings');
            else if (action === 'discover') setModal('discover');
            else if (action === 'elite') setModal('elite');
            else if (action === 'mark-read') { /* clear notifications */ }
            else if (action === 'channel' && data) { setActiveChannel(data); setModal(null); }
          }} />}
        {modal === 'wrapped' && <KairoWrapped onClose={() => setModal(null)} currentUser={currentUser} profile={profile} />}
        {modal === 'moments' && activeServer && <ServerMoments serverId={activeServer.id} serverName={activeServer.name} onClose={() => setModal(null)} />}
        {modal === 'mark-moment' && modalData && <MarkAsMomentModal message={modalData} serverId={activeServer?.id} channelName={activeChannel?.name} onClose={() => setModal(null)} onSuccess={() => {}} />}
        {(deleteConfirmMsg || (deleteConfirmBatch && deleteConfirmBatch.length > 0)) && (
          <ConfirmDeleteModal
            title={deleteConfirmBatch?.length > 1 ? `Delete ${deleteConfirmBatch.length} messages?` : 'Delete message?'}
            subtitle={deleteConfirmBatch?.length > 1 ? 'This cannot be undone.' : "It's gone for good."}
            onConfirm={confirmDeleteMsg}
            onClose={() => { setDeleteConfirmMsg(null); setDeleteConfirmBatch(null); }}
          />
        )}
      </AnimatePresence>
      </ModalSuspense>

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter notifications={notifications} onClose={() => setShowNotifications(false)}
          onMarkRead={markNotifRead} onMarkAllRead={markAllNotifsRead}
          onJump={(n) => {
            setShowNotifications(false);
            markNotifRead(n.id);
            if (n.conversation_id) {
              const conv = conversations.find(c => c.id === n.conversation_id);
              if (conv) {
                setView('dms'); setActiveConv(conv); setActiveServer(null); setActiveChannel(null); setShowMobileSidebar(false);
                if (n.message_id) {
                  setTimeout(() => {
                    const el = document.querySelector(`[data-msg-id="${n.message_id}"]`);
                    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); }
                  }, 300);
                }
              }
              return;
            }
            if (n.server_id && n.channel_id) {
              const s = servers.find(sv => sv.id === n.server_id);
              if (s) {
                if (s.id !== activeServer?.id) {
                  selectServer(s);
                  pendingJumpRef.current = { serverId: s.id, channelId: n.channel_id, messageId: n.message_id };
                } else {
                  const ch = channels.find(c => c.id === n.channel_id);
                  if (ch) setActiveChannel(ch);
                  if (n.message_id) {
                    setTimeout(() => {
                      const el = document.querySelector(`[data-msg-id="${n.message_id}"]`);
                      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); }
                    }, 200);
                  }
                }
              }
            } else if (n.message_id) {
              setTimeout(() => {
                const el = document.querySelector(`[data-msg-id="${n.message_id}"]`);
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); }
              }, 200);
            }
          }}
          onReplyDM={async (n, text) => {
            if (n.conversation_id) {
              const conv = conversations.find(c => c.id === n.conversation_id);
              if (conv) {
                await base44.entities.Conversation.update(conv.id, { last_message_at: new Date().toISOString(), last_message_preview: text.slice(0, 50) });
                await base44.entities.DirectMessage.create({ conversation_id: conv.id, author_id: currentUser.id, author_name: profile?.display_name || currentUser.full_name, author_avatar: profile?.avatar_url, content: text, type: 'default' });
                qc.invalidateQueries({ queryKey: ['dmMessages', conv.id] }); qc.invalidateQueries({ queryKey: ['conversations'] });
              }
            }
          }} />
      )}

      {/* Secret Chat Confirm */}
      {showSecretConfirm && (
        <SecretChatConfirmModal
          otherUserName={activeConv?.participants?.find(p => p.user_id !== currentUser.id)?.user_name || 'User'}
          onConfirm={() => { setSecretChat(true); setShowSecretConfirm(false); }}
          onCancel={() => setShowSecretConfirm(false)} />
      )}

      {/* Starred Messages */}
      {showStarred && (
        <StarredMessagesPanel onClose={() => setShowStarred(false)} currentUserId={currentUser.id}
          onJumpToMessage={(msg) => {
            setShowStarred(false);
            if (msg.server_id) { const s = servers.find(sv => sv.id === msg.server_id); if (s && s.id !== activeServer?.id) selectServer(s); }
            setTimeout(() => { const el = document.querySelector(`[data-msg-id="${msg.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(240,178,50,0.12)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); } }, 200);
          }} />
      )}

      {/* Server Notes */}
      {showServerNotes && <ServerNotes serverId={showServerNotes} onClose={() => setShowServerNotes(false)} />}

      {/* Jump to Date */}
      {showJumpToDate && (
        <JumpToDate onClose={() => setShowJumpToDate(false)} onJump={(date) => {
          const target = date.getTime();
          const sorted = [...currentMsgs].sort((a, b) => Math.abs(new Date(a.created_date).getTime() - target) - Math.abs(new Date(b.created_date).getTime() - target));
          const nearest = sorted[0];
          if (nearest) {
            setTimeout(() => { const el = document.querySelector(`[data-msg-id="${nearest.id}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.background = 'rgba(123,108,246,0.15)'; el.style.transition = 'background 0.3s'; setTimeout(() => { el.style.background = ''; }, 3000); } }, 100);
          }
        }} />
      )}

      {/* DM Calls */}
      {activeCall && (
        <DMCallView call={activeCall} conversation={conversations.find(c => c.id === activeCall.conversation_id) || activeConv}
          currentUser={currentUser} profile={profile} onEndCall={endCall} />
      )}
      {outgoingCall && !activeCall && (
        <OutgoingCallOverlay recipientName={outgoingCall.recipientName} recipientAvatar={outgoingCall.recipientAvatar}
          isVideoCall={outgoingCall.is_video_call} onCancel={cancelOutgoing} />
      )}
      {incomingCall && !activeCall && (
        <IncomingCallOverlay call={incomingCall} onAccept={acceptCall} onDecline={declineCall} />
      )}

      {/* Badge earned notifications */}
      {newBadges.length > 0 && (
        <BadgeNotification badge={newBadges[0]} onDismiss={() => dismissBadge(newBadges[0])} />
      )}

      {/* Boost confirm modal */}
      {showBoostConfirm && activeServer && (
        <BoostConfirmModal
          serverName={activeServer.name}
          available={availableBoosts}
          isBoosted={userHasBoosted}
          onConfirm={async () => {
            try {
              await base44.entities.ServerBoost.create({
                server_id: activeServer.id, user_id: currentUser.id,
                user_name: profile?.display_name || currentUser.email?.split('@')[0],
                user_email: currentUser.email, boosted_at: new Date().toISOString(),
              });
              await base44.entities.UserProfile.update(profile.id, { boosts_used: (profile.boosts_used || 0) + 1 });
              await base44.entities.Message.create({
                server_id: activeServer.id,
                channel_id: channels.find(c => c.name === 'general' || c.type === 'text')?.id || channels[0]?.id,
                content: `⚡ **${profile?.display_name || currentUser.email?.split('@')[0]}** just boosted the server! ${activeServer.name} now has **${boostCount + 1} boosts**!`,
                user_id: 'system', user_email: 'system@kairo.app', user_name: 'Kairo',
                type: 'system',
              });
              qc.invalidateQueries({ queryKey: ['messages'] });
              qc.invalidateQueries({ queryKey: ['profile'] });
              refreshBoosts();
            } catch {}
            setShowBoostConfirm(false);
          }}
          onRemove={async () => {
            try {
              const myBoost = serverBoosts.find(b => b.user_id === currentUser.id);
              if (myBoost) {
                await base44.entities.ServerBoost.update(myBoost.id, { ended_at: new Date().toISOString() });
                await base44.entities.UserProfile.update(profile.id, { boosts_used: Math.max(0, (profile.boosts_used || 1) - 1) });
                refreshBoosts();
                qc.invalidateQueries({ queryKey: ['profile'] });
              }
            } catch {}
            setShowBoostConfirm(false);
          }}
          onCancel={() => setShowBoostConfirm(false)}
        />
      )}

      {/* Server Shop overlay */}
      {showServerShop && activeServer && (
        <div className="fixed inset-0 z-50 flex" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowServerShop(false)}>
          <div className="w-full max-w-3xl mx-auto flex flex-col my-8 rounded-2xl overflow-hidden"
            style={{ background: '#1e1e23', border: '1px solid #33333d' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #33333d' }}>
              <span className="text-[15px] font-bold" style={{ color: '#f0eff4' }}>{activeServer.name} Shop</span>
              <button onClick={() => setShowServerShop(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
                <span style={{ color: '#68677a', fontSize: 18 }}>&times;</span>
              </button>
            </div>
            <ServerShopView server={activeServer} currentUserId={currentUser.id} onClose={() => setShowServerShop(false)} />
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <MobileNav
        active={mobileTab} badge={incomingReqs.length}
        avatar={profile?.avatar_url}
        onChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'home') { goHome(); goCenter(); }
          else if (tab === 'servers') { openLeft(); }
          else if (tab === 'dms') { goHome(); openLeft(); }
          else if (tab === 'profile') setModal('settings');
        }} />

      {/* Mobile message action sheet */}
      {mobileActionMsg && (
        <ModalSuspense>
          <MobileActionSheet
            message={mobileActionMsg}
            isOwn={mobileActionMsg.author_id === currentUser.id}
            onClose={() => setMobileActionMsg(null)}
            onReact={(msg, emoji) => { if (emoji) reactMsg(msg, emoji); }}
            onReply={(msg) => { setReplyTo(msg); setMobileActionMsg(null); }}
            onEdit={(msg) => { setEditingMsg(msg); setMobileActionMsg(null); }}
            onPin={(msg) => pinMsg(msg)}
            onStar={(msg) => starMsg(msg)}
            onForward={(msg) => { setForwardMsg(msg); setModal('forward'); setMobileActionMsg(null); }}
            onDelete={(msg) => deleteMsg(msg)}
          />
        </ModalSuspense>
      )}
    </div>
  );
}