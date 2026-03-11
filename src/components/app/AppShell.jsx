import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { useServers, useCategories, useChannels, useMembers, useRoles, useMessages, useDMMessages, useConversations, useFriends, useFriendRequests, useMyProfile } from '@/components/app/hooks/useData';
import { useOptimisticMessages } from '@/components/app/performance/useOptimistic';
import { useChannelCache } from '@/components/app/performance/useChannelCache';
import { useSwipeGesture } from '@/components/app/mobile/useSwipeGesture';
import ConnectionBanner from '@/components/app/performance/ConnectionBanner';
import MobileNav from '@/components/app/mobile/MobileNav';

import ServerRailWithContext from '@/components/app/layout/ServerRailWithContext';
import DraggableChannelSidebar from '@/components/app/layout/DraggableChannelSidebar';
import DMSidebar from '@/components/app/layout/DMSidebar';
import UserBar from '@/components/app/layout/UserBar';
import ChatHeader from '@/components/app/layout/ChatHeader';
import MemberPanel from '@/components/app/layout/MemberPanel';
import VirtualMessageList from '@/components/app/performance/VirtualMessageList';
import ChatInput from '@/components/app/chat/ChatInput';
import FriendsView from '@/components/app/views/FriendsView';
import EmptyView from '@/components/app/views/EmptyView';
import VoiceChannelView from '@/components/app/views/VoiceChannelView';
import DMMediaGallery from '@/components/app/views/DMMediaGallery';

import CreateServerModal from '@/components/app/modals/CreateServerModal';
import JoinServerModal from '@/components/app/modals/JoinServerModal';
import CreateChannelModal from '@/components/app/modals/CreateChannelModal';
import AddFriendModal from '@/components/app/modals/AddFriendModal';
import SettingsModal from '@/components/app/modals/SettingsModal';
import InviteModal from '@/components/app/modals/InviteModal';
import ServerSettingsModal from '@/components/app/modals/ServerSettingsModal';
import UserProfileModal from '@/components/app/modals/UserProfileModal';
import CreateGroupDMModal from '@/components/app/modals/CreateGroupDMModal';
import PinnedMessagesModal from '@/components/app/modals/PinnedMessagesModal';
import StatusPickerModal from '@/components/app/modals/StatusPickerModal';
import KairoEliteModal from '@/components/app/modals/KairoEliteModal';
import ModPanelModal from '@/components/app/modals/ModPanelModal';
import AnalyticsDashboardModal from '@/components/app/modals/AnalyticsDashboardModal';
import ChannelSettingsModal from '@/components/app/modals/ChannelSettingsModal';

export default function AppShell({ currentUser }) {
  const qc = useQueryClient();
  const { getProfile, refresh: refreshProfiles } = useProfiles();
  const { optimisticMsgs, optimisticIds, addOptimistic, confirmOptimistic, revertOptimistic } = useOptimisticMessages();
  const { trackChannel, prefetchNearby } = useChannelCache();

  const [view, setView] = useState('home');
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [channelToEdit, setChannelToEdit] = useState(null);
  const [mobileTab, setMobileTab] = useState('servers');

  const { data: profile } = useMyProfile(currentUser.email);
  const { data: servers = [] } = useServers(currentUser.id, currentUser.email);
  const { data: categories = [] } = useCategories(activeServer?.id);
  const { data: channels = [] } = useChannels(activeServer?.id);
  const { data: members = [] } = useMembers(activeServer?.id);
  const { data: roles = [] } = useRoles(activeServer?.id);
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeChannel?.id);
  const { data: dmMessages = [], isLoading: dmLoading } = useDMMessages(activeConv?.id);
  const { data: conversations = [] } = useConversations(currentUser.email, currentUser.id);
  const { data: friends = [] } = useFriends(currentUser.id);
  const { incoming: incomingReqs, outgoing: outgoingReqs } = useFriendRequests(currentUser.id, currentUser.email);

  useEffect(() => { if (activeServer && channels.length > 0 && !activeChannel) { const first = channels.find(c => c.type === 'text'); if (first) setActiveChannel(first); } }, [activeServer, channels]);
  useEffect(() => { setReplyTo(null); setEditingMsg(null); setShowMediaGallery(false); }, [activeChannel?.id, activeConv?.id]);
  // Track channel for cache and prefetch nearby
  useEffect(() => { trackChannel(activeChannel?.id); prefetchNearby(channels, activeChannel?.id); }, [activeChannel?.id, channels]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') { e.preventDefault(); setIsMuted(m => !m); }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') { e.preventDefault(); setIsDeafened(d => !d); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const createServer = useMutation({
    mutationFn: async ({ name, template, icon_url }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const server = await base44.entities.Server.create({ name, owner_id: currentUser.id, template: template || 'blank', invite_code: code, member_count: 1, icon_url });
      await base44.entities.ServerMember.create({ server_id: server.id, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString(), role_ids: [] });
      await base44.entities.Role.create({ server_id: server.id, name: '@everyone', is_default: true, position: 0, color: '#99AAB5' });
      const cat = await base44.entities.Category.create({ server_id: server.id, name: 'Text Channels', position: 0 });
      await base44.entities.Channel.create({ server_id: server.id, category_id: cat.id, name: 'general', type: 'text', position: 0 });
      if (template !== 'private' && template !== 'blank') await base44.entities.Channel.create({ server_id: server.id, category_id: cat.id, name: 'off-topic', type: 'text', position: 1 });
      const vCat = await base44.entities.Category.create({ server_id: server.id, name: 'Voice Channels', position: 1 });
      await base44.entities.Channel.create({ server_id: server.id, category_id: vCat.id, name: 'General', type: 'voice', position: 0 });
      return server;
    },
    onSuccess: (server) => { qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); setModal(null); },
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
        await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
      }
      return server;
    },
    onSuccess: (server) => { qc.invalidateQueries({ queryKey: ['servers'] }); selectServer(server); setModal(null); },
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
    onError: (_, vars) => { if (vars._tempId) revertOptimistic(vars._tempId); },
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
    onError: (_, vars) => { if (vars._tempId) revertOptimistic(vars._tempId); },
  });

  const createChannel = useMutation({
    mutationFn: (data) => base44.entities.Channel.create({ ...data, server_id: activeServer.id, position: channels.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels', activeServer?.id] }); setModal(null); },
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => { if (profile?.id) await base44.entities.UserProfile.update(profile.id, data); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myProfile'] }); refreshProfiles(); },
  });

  const selectServer = (s) => { setActiveServer(s); setActiveChannel(null); setActiveConv(null); setView('server'); };
  const goHome = () => { setActiveServer(null); setActiveChannel(null); setView('home'); };
  const goFriends = () => { setActiveConv(null); setView('friends'); };

  const handleSend = async (data) => {
    const optimistic = addOptimistic({
      author_id: currentUser.id,
      author_name: profile?.display_name || currentUser.full_name,
      author_avatar: profile?.avatar_url,
      content: data.content,
      attachments: data.attachments,
      channel_id: activeChannel?.id,
      conversation_id: activeConv?.id,
    });
    if (!optimistic.allowed) return; // Rate limited
    const payload = { ...data, _tempId: optimistic.tempId };
    if (activeConv) await sendDM.mutateAsync(payload);
    else if (activeChannel) await sendMsg.mutateAsync(payload);
  };

  const editMsg = useCallback(async (id, content) => {
    if (activeConv) await base44.entities.DirectMessage.update(id, { content, is_edited: true });
    else await base44.entities.Message.update(id, { content, is_edited: true, edited_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: activeConv ? ['dmMessages', activeConv.id] : ['messages', activeChannel?.id] });
    setEditingMsg(null);
  }, [activeChannel?.id, activeConv?.id]);

  const deleteMsg = useCallback(async (msg) => {
    if (!confirm('Delete this message?')) return;
    if (activeConv) await base44.entities.DirectMessage.update(msg.id, { is_deleted: true });
    else await base44.entities.Message.update(msg.id, { is_deleted: true });
    qc.invalidateQueries({ queryKey: activeConv ? ['dmMessages', activeConv?.id] : ['messages', activeChannel?.id] });
  }, [activeChannel?.id, activeConv?.id]);

  const pinMsg = useCallback(async (msg) => {
    if (activeConv) { await base44.entities.DirectMessage.update(msg.id, { is_pinned: !msg.is_pinned }); qc.invalidateQueries({ queryKey: ['dmMessages', activeConv?.id] }); }
    else { await base44.entities.Message.update(msg.id, { is_pinned: !msg.is_pinned }); qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] }); }
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
    if (activeConv) await base44.entities.DirectMessage.update(msg.id, { reactions: updated });
    else await base44.entities.Message.update(msg.id, { reactions: updated });
    qc.invalidateQueries({ queryKey: activeConv ? ['dmMessages', activeConv?.id] : ['messages', activeChannel?.id] });
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

  const handleNoteToSelf = async () => {
    const existing = conversations.find(c => c.participants?.length === 1 && c.participants[0].user_id === currentUser.id);
    if (existing) { setActiveConv(existing); setView('home'); return; }
    const conv = await base44.entities.Conversation.create({
      type: 'dm', name: 'Note to Self',
      participants: [{ user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url }],
      last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConv(conv); setView('home');
  };

  const handleStatusUpdate = async ({ status, customStatus }) => {
    if (profile?.id) { await base44.entities.UserProfile.update(profile.id, { status, custom_status: customStatus }); qc.invalidateQueries({ queryKey: ['myProfile'] }); refreshProfiles(); }
    setModal(null);
  };

  const leaveServer = async (server) => {
    if (server.owner_id === currentUser.id) { alert("You can't leave a server you own."); return; }
    if (!confirm(`Leave ${server.name}?`)) return;
    const mems = await base44.entities.ServerMember.filter({ server_id: server.id, user_id: currentUser.id });
    for (const m of mems) await base44.entities.ServerMember.delete(m.id);
    await base44.entities.Server.update(server.id, { member_count: Math.max(1, (server.member_count || 1) - 1) });
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
    if (!confirm(`Block ${targetName}? They won't be able to DM you or see your status.`)) return;
    // Remove friendship if exists
    const existing = friends.find(f => f.friend_id === targetId);
    if (existing) await base44.entities.Friendship.delete(existing.id);
    await base44.entities.BlockedUser.create({ user_id: currentUser.id, blocked_user_id: targetId, blocked_email: targetEmail, blocked_name: targetName });
    qc.invalidateQueries({ queryKey: ['friends'] });
  };

  // Computed
  const isDM = !!activeConv;
  const isVoiceChannel = activeChannel?.type === 'voice' || activeChannel?.type === 'stage';
  const isInChat = (view === 'server' && activeChannel && !isVoiceChannel) || (view === 'home' && activeConv);
  const isInVoice = view === 'server' && activeChannel && isVoiceChannel;
  const currentMsgs = isDM ? dmMessages : messages;
  const currentLoading = isDM ? dmLoading : msgsLoading;
  const channelLabel = isDM ? (activeConv.name || activeConv.participants?.find(p => p.user_id !== currentUser.id)?.user_name || 'DM') : (activeChannel?.name || '');
  const pinnedCount = isDM ? dmMessages.filter(m => m.is_pinned).length : messages.filter(m => m.is_pinned).length;
  const isOwner = activeServer?.owner_id === currentUser.id || activeServer?.created_by === currentUser.email;
  const profileModal = profileUserId ? getProfile(profileUserId) : null;
  const profileMember = profileUserId ? members.find(m => m.user_id === profileUserId) : null;
  const hasElite = profile?.badges?.includes('premium') || false;
  const isFriendProfile = profileUserId ? friends.some(f => f.friend_id === profileUserId) : false;

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <ServerRailWithContext servers={servers} activeServerId={activeServer?.id} onServerSelect={selectServer} onHomeClick={goHome}
        onCreateServer={() => setModal('create-server')} onDiscover={() => setModal('join-server')}
        onElite={() => setModal('elite')} onLeaveServer={leaveServer}
        isHome={view === 'home' || view === 'friends'} badge={incomingReqs.length} />

      <div className="w-[232px] flex-shrink-0 flex flex-col" style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>
        {view === 'server' ? (
          <DraggableChannelSidebar server={activeServer} categories={categories} channels={channels}
            activeId={activeChannel?.id} onSelect={setActiveChannel}
            onAdd={(catId) => { setModalData(catId); setModal('create-channel'); }}
            onSettings={() => setModal('server-settings')} onInvite={() => setModal('invite')}
            onModPanel={() => setModal('mod-panel')} onAnalytics={() => setModal('analytics')}
            onChannelSettings={(ch) => { setChannelToEdit(ch); setModal('channel-settings'); }}
            isOwner={isOwner} />
        ) : (
          <DMSidebar conversations={conversations} activeId={activeConv?.id}
            onSelect={(c) => { setActiveConv(c); setView('home'); }}
            onFriends={goFriends} onCreateGroup={() => setModal('create-group-dm')}
            onNoteToSelf={handleNoteToSelf}
            currentUserId={currentUser.id} incomingRequestCount={incomingReqs.length} />
        )}
        <UserBar profile={profile} isMuted={isMuted} isDeafened={isDeafened}
          onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)}
          onSettings={() => setModal('settings')} onStatusClick={() => setModal('status')} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: 'var(--bg-base)' }}>
        {view === 'friends' ? (
          <FriendsView friends={friends} incomingRequests={incomingReqs} outgoingRequests={outgoingReqs}
            onAddFriend={() => setModal('add-friend')} onMessage={handleStartDM} onBlock={handleBlock}
            onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }}
            onAccept={async (r) => {
              await base44.entities.Friendship.update(r.id, { status: 'accepted' });
              const sp = getProfile(r.user_id);
              await base44.entities.Friendship.create({ user_id: r.friend_id || currentUser.id, friend_id: r.user_id, friend_email: r.created_by, friend_name: sp?.display_name || 'User', friend_avatar: sp?.avatar_url, status: 'accepted', initiated_by: r.initiated_by });
              qc.invalidateQueries({ queryKey: ['friends'] }); qc.invalidateQueries({ queryKey: ['incomingRequests'] });
            }}
            onDecline={async (r) => { await base44.entities.Friendship.delete(r.id); qc.invalidateQueries({ queryKey: ['incomingRequests'] }); }}
            onRemove={async (f) => { if (!confirm(`Remove ${f.friend_name}?`)) return; await base44.entities.Friendship.delete(f.id); qc.invalidateQueries({ queryKey: ['friends'] }); }} />
        ) : isInVoice ? (
          <>
            <ChatHeader channel={activeChannel} isDM={false} showMembers={showMembers} onToggleMembers={() => setShowMembers(!showMembers)} />
            <div className="flex-1 flex min-h-0">
              <VoiceChannelView channel={activeChannel} currentUser={currentUser} isMuted={isMuted} isDeafened={isDeafened}
                onToggleMute={() => setIsMuted(!isMuted)} onToggleDeafen={() => setIsDeafened(!isDeafened)} onDisconnect={() => {}} />
              {showMembers && <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id} onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }} />}
            </div>
          </>
        ) : isInChat ? (
          <>
            <ChatHeader channel={activeChannel} conversation={activeConv} currentUserId={currentUser.id}
              showMembers={showMembers} onToggleMembers={() => setShowMembers(!showMembers)}
              isDM={isDM} onPinned={() => setModal('pinned')} pinnedCount={pinnedCount}
              onMediaGallery={isDM ? () => setShowMediaGallery(!showMediaGallery) : undefined} />
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-w-0">
                <MessageList messages={currentMsgs} currentUserId={currentUser.id} channelName={channelLabel}
                  isLoading={currentLoading} isDM={isDM} onReply={setReplyTo} onEdit={setEditingMsg}
                  onDelete={deleteMsg} onReact={reactMsg} onPin={pinMsg}
                  onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }}
                  editingMessage={editingMsg} onEditSave={editMsg} onEditCancel={() => setEditingMsg(null)} />
                <ChatInput channelName={channelLabel} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} onSend={handleSend} />
              </div>
              {view === 'server' && showMembers && <MemberPanel members={members} roles={roles} ownerId={activeServer?.owner_id} onProfileClick={(id) => { setProfileUserId(id); setModal('profile'); }} />}
              {isDM && showMediaGallery && <DMMediaGallery messages={currentMsgs} onClose={() => setShowMediaGallery(false)} />}
            </div>
          </>
        ) : (
          <EmptyView onCreateServer={() => setModal('create-server')} onJoinServer={() => setModal('join-server')} />
        )}
      </div>

      <AnimatePresence>
        {modal === 'create-server' && <CreateServerModal onClose={() => setModal(null)} onCreate={(d) => createServer.mutate(d)} isCreating={createServer.isPending} />}
        {modal === 'join-server' && <JoinServerModal onClose={() => setModal(null)} onJoin={(c) => joinServer.mutate(c)} isJoining={joinServer.isPending} />}
        {modal === 'create-channel' && <CreateChannelModal onClose={() => setModal(null)} onCreate={(d) => createChannel.mutate(d)} categories={categories} defaultCategoryId={modalData} />}
        {modal === 'add-friend' && <AddFriendModal onClose={() => setModal(null)} currentUserId={currentUser.id} />}
        {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} profile={profile} onUpdate={(d) => updateProfile.mutate(d)} onLogout={() => base44.auth.logout()} />}
        {modal === 'invite' && activeServer && <InviteModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'server-settings' && activeServer && <ServerSettingsModal onClose={(r) => { setModal(null); if (r === 'deleted') goHome(); }} server={activeServer} currentUserId={currentUser.id} />}
        {modal === 'profile' && profileModal && (
          <UserProfileModal onClose={() => { setModal(null); setProfileUserId(null); }} profile={profileModal} memberData={profileMember} roles={roles}
            isCurrentUser={profileUserId === currentUser.id} friends={friends} mutualServers={servers.slice(0, 5)}
            onMessage={isFriendProfile ? () => { const f = friends.find(x => x.friend_id === profileUserId); if (f) { handleStartDM(f); setModal(null); setProfileUserId(null); } } : undefined}
            onAddFriend={!isFriendProfile && profileUserId !== currentUser.id ? handleAddFriendFromProfile : undefined}
            onBlock={handleBlock} />
        )}
        {modal === 'create-group-dm' && <CreateGroupDMModal onClose={() => setModal(null)} friends={friends} onCreate={handleCreateGroupDM} />}
        {modal === 'pinned' && <PinnedMessagesModal onClose={() => setModal(null)} messages={currentMsgs.filter(m => m.is_pinned)} onUnpin={pinMsg} />}
        {modal === 'status' && <StatusPickerModal onClose={() => setModal(null)} currentStatus={profile?.status} customStatus={profile?.custom_status} onSave={handleStatusUpdate} />}
        {modal === 'elite' && <KairoEliteModal onClose={() => setModal(null)} profile={profile} hasElite={hasElite} />}
        {modal === 'mod-panel' && activeServer && <ModPanelModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'analytics' && activeServer && <AnalyticsDashboardModal onClose={() => setModal(null)} server={activeServer} />}
        {modal === 'channel-settings' && channelToEdit && (
          <ChannelSettingsModal onClose={() => { setModal(null); setChannelToEdit(null); }} channel={channelToEdit}
            onDelete={() => { if (activeChannel?.id === channelToEdit.id) setActiveChannel(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}