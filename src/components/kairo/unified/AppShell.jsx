import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AnimatePresence, motion } from 'framer-motion';
import { useProfiles } from '@/components/kairo/core/ProfileProvider';

import ServerRail from '@/components/kairo/unified/layout/ServerRail';
import ChannelPanel from '@/components/kairo/unified/layout/ChannelPanel';
import DMPanel from '@/components/kairo/unified/layout/DMPanel';
import UserPanel from '@/components/kairo/unified/layout/UserPanel';
import ChatHeader from '@/components/kairo/unified/layout/ChatHeader';
import MemberPanel from '@/components/kairo/unified/layout/MemberPanel';
import ChatArea from '@/components/kairo/unified/chat/ChatArea';
import ChatInput from '@/components/kairo/unified/chat/ChatInput';
import FriendsView from '@/components/kairo/unified/views/FriendsView';
import EmptyView from '@/components/kairo/unified/views/EmptyView';
import ModPanel from '@/components/kairo/unified/views/ModPanel';
import ServerSettingsView from '@/components/kairo/unified/views/ServerSettingsView';
import ThreadPanel from '@/components/kairo/unified/views/ThreadPanel';

import CreateServerModal from '@/components/kairo/unified/modals/CreateServerModal';
import JoinServerModal from '@/components/kairo/unified/modals/JoinServerModal';
import CreateChannelModal from '@/components/kairo/unified/modals/CreateChannelModal';
import CreateGroupDMModal from '@/components/kairo/unified/modals/CreateGroupDMModal';
import AddFriendModal from '@/components/kairo/unified/modals/AddFriendModal';
import SettingsModal from '@/components/kairo/unified/modals/SettingsModal';
import InviteModal from '@/components/kairo/unified/modals/InviteModal';
import UserProfilePopup from '@/components/kairo/unified/modals/UserProfilePopup';

export default function AppShell({ currentUser }) {
  const qc = useQueryClient();
  const { profiles, getProfile, refreshAllProfiles } = useProfiles();

  // Navigation
  const [view, setView] = useState('dms'); // dms | server | friends | moderation | serverSettings
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [activeThread, setActiveThread] = useState(null);

  // Audio
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  // Modals
  const [modal, setModal] = useState(null);
  const [createChannelCat, setCreateChannelCat] = useState(null);
  const [profilePopup, setProfilePopup] = useState(null);

  // Inline edit state
  const [editingMessage, setEditingMessage] = useState(null);

  // ─── Data Queries ───
  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser.email],
    queryFn: async () => {
      const p = await base44.entities.UserProfile.filter({ user_email: currentUser.email });
      return p[0] || null;
    },
  });

  const { data: servers = [] } = useQuery({
    queryKey: ['myServers', currentUser.id],
    queryFn: async () => {
      const [allServers, memberships] = await Promise.all([
        base44.entities.Server.list(),
        base44.entities.ServerMember.list(),
      ]);
      const myMemberIds = new Set(
        memberships
          .filter(m => m.user_id === currentUser.id || m.user_email === currentUser.email || m.created_by === currentUser.email)
          .map(m => m.server_id)
      );
      return allServers.filter(s => myMemberIds.has(s.id) || s.owner_id === currentUser.id || s.created_by === currentUser.email);
    },
  });

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

  const { data: members = [] } = useQuery({
    queryKey: ['members', activeServer?.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', activeServer?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: activeServer.id }),
    enabled: !!activeServer?.id,
  });

  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['messages', activeChannel?.id],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: activeChannel.id }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!activeChannel?.id,
    refetchInterval: 5000,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', currentUser.email],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_at', 50);
      return all.filter(c => c.participants?.some(p => p.user_email === currentUser.email || p.user_id === currentUser.id));
    },
  });

  const { data: dmMessages = [], isLoading: dmLoading } = useQuery({
    queryKey: ['dmMessages', activeConversation?.id],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: activeConversation.id }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!activeConversation?.id,
    refetchInterval: 5000,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', currentUser.id],
    queryFn: () => base44.entities.Friendship.filter({ user_id: currentUser.id, status: 'accepted' }),
    enabled: !!currentUser.id,
  });

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests', currentUser.id],
    queryFn: async () => {
      const all = await base44.entities.Friendship.filter({ status: 'pending' });
      return all.filter(f => f.friend_id === currentUser.id || f.friend_email === currentUser.email);
    },
    enabled: !!currentUser.id,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ['outgoingRequests', currentUser.id],
    queryFn: () => base44.entities.Friendship.filter({ user_id: currentUser.id, status: 'pending' }),
    enabled: !!currentUser.id,
  });

  const { data: threads = [] } = useQuery({
    queryKey: ['threads', activeChannel?.id],
    queryFn: () => base44.entities.Thread.filter({ channel_id: activeChannel.id }),
    enabled: !!activeChannel?.id,
  });

  const { data: pinnedMessages = [] } = useQuery({
    queryKey: ['pinned', activeChannel?.id],
    queryFn: () => base44.entities.Message.filter({ channel_id: activeChannel.id, is_pinned: true }),
    enabled: !!activeChannel?.id,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!activeChannel?.id) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.channel_id === activeChannel.id || event.data?.channel_id === activeChannel?.id) {
        qc.invalidateQueries({ queryKey: ['messages', activeChannel.id] });
      }
    });
    return unsub;
  }, [activeChannel?.id]);

  useEffect(() => {
    if (!activeConversation?.id) return;
    const unsub = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id === activeConversation.id) {
        qc.invalidateQueries({ queryKey: ['dmMessages', activeConversation.id] });
      }
    });
    return unsub;
  }, [activeConversation?.id]);

  // Profiles map
  const profilesMap = useMemo(() => {
    const map = new Map();
    profiles?.forEach(p => { map.set(p.user_id, p); map.set(p.user_email, p); });
    return map;
  }, [profiles]);

  // ─── Mutations ───
  const createServer = useMutation({
    mutationFn: async ({ name, template }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const server = await base44.entities.Server.create({
        name, owner_id: currentUser.id, template: template || 'blank',
        invite_code: code, member_count: 1,
      });
      await base44.entities.ServerMember.create({
        server_id: server.id, user_id: currentUser.id, user_email: currentUser.email,
        joined_at: new Date().toISOString(),
      });
      await base44.entities.Role.create({ server_id: server.id, name: '@everyone', is_default: true, position: 0 });
      const cat = await base44.entities.Category.create({ server_id: server.id, name: 'Text Channels', position: 0 });
      await base44.entities.Channel.create({ server_id: server.id, category_id: cat.id, name: 'general', type: 'text', position: 0 });
      const vCat = await base44.entities.Category.create({ server_id: server.id, name: 'Voice Channels', position: 1 });
      await base44.entities.Channel.create({ server_id: server.id, category_id: vCat.id, name: 'General', type: 'voice', position: 0 });
      return server;
    },
    onSuccess: (server) => {
      qc.invalidateQueries({ queryKey: ['myServers'] });
      selectServer(server);
      setModal(null);
    },
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
        await base44.entities.ServerMember.create({
          server_id: server.id, user_id: currentUser.id, user_email: currentUser.email,
          joined_at: new Date().toISOString(),
        });
        await base44.entities.Server.update(server.id, { member_count: (server.member_count || 1) + 1 });
      }
      return server;
    },
    onSuccess: (server) => {
      qc.invalidateQueries({ queryKey: ['myServers'] });
      selectServer(server);
      setModal(null);
    },
  });

  const sendMsg = useMutation({
    mutationFn: async ({ content, attachments, replyToId, replyPreview }) => {
      return base44.entities.Message.create({
        channel_id: activeChannel.id, server_id: activeServer.id,
        author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        author_badges: profile?.badges || [],
        content, attachments,
        type: replyToId ? 'reply' : 'default',
        reply_to_id: replyToId, reply_preview: replyPreview,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
      setReplyTo(null);
    },
  });

  const sendDM = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      await base44.entities.Conversation.update(activeConversation.id, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content?.slice(0, 50),
      });
      return base44.entities.DirectMessage.create({
        conversation_id: activeConversation.id,
        author_id: currentUser.id,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        content, attachments,
        type: replyToId ? 'reply' : 'default',
        reply_to_id: replyToId,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setReplyTo(null);
    },
  });

  const editMsg = useCallback(async (msgId, newContent) => {
    await base44.entities.Message.update(msgId, { content: newContent, is_edited: true, edited_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    setEditingMessage(null);
  }, [activeChannel?.id]);

  const deleteMsg = useCallback(async (msgId) => {
    await base44.entities.Message.update(msgId, { is_deleted: true });
    qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
  }, [activeChannel?.id]);

  const editDM = useCallback(async (msgId, newContent) => {
    await base44.entities.DirectMessage.update(msgId, { content: newContent, is_edited: true });
    qc.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
    setEditingMessage(null);
  }, [activeConversation?.id]);

  const deleteDM = useCallback(async (msgId) => {
    await base44.entities.DirectMessage.update(msgId, { is_deleted: true });
    qc.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
  }, [activeConversation?.id]);

  const reactMsg = useCallback(async (msg, emoji, isDM) => {
    const reactions = msg.reactions || [];
    const existing = reactions.find(r => r.emoji === emoji);
    let updated;
    if (existing) {
      const has = existing.users?.includes(currentUser.id);
      if (has) {
        updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser.id) } : r).filter(r => r.count > 0);
      } else {
        updated = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), currentUser.id] } : r);
      }
    } else {
      updated = [...reactions, { emoji, count: 1, users: [currentUser.id] }];
    }
    if (isDM) {
      await base44.entities.DirectMessage.update(msg.id, { reactions: updated });
      qc.invalidateQueries({ queryKey: ['dmMessages', activeConversation?.id] });
    } else {
      await base44.entities.Message.update(msg.id, { reactions: updated });
      qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    }
  }, [currentUser.id, activeChannel?.id, activeConversation?.id]);

  const pinMsg = useCallback(async (msg) => {
    await base44.entities.Message.update(msg.id, { is_pinned: !msg.is_pinned });
    qc.invalidateQueries({ queryKey: ['messages', activeChannel?.id] });
    qc.invalidateQueries({ queryKey: ['pinned', activeChannel?.id] });
  }, [activeChannel?.id]);

  const createChannel = useMutation({
    mutationFn: (data) => base44.entities.Channel.create({ ...data, server_id: activeServer.id, position: channels.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels', activeServer?.id] }); setModal(null); },
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      if (!profile?.id) return;
      await base44.entities.UserProfile.update(profile.id, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myProfile'] }); refreshAllProfiles(); },
  });

  // ─── Navigation ───
  const selectServer = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
    setActiveThread(null);
    setView('server');
  };

  const goHome = () => { setActiveServer(null); setActiveChannel(null); setView('dms'); };
  const goFriends = () => { setActiveConversation(null); setView('friends'); };

  // Auto-select first text channel
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const first = channels.find(c => c.type === 'text');
      if (first) setActiveChannel(first);
    }
  }, [activeServer, channels]);

  const handleSend = async (data) => {
    if (activeConversation) {
      await sendDM.mutateAsync(data);
    } else if (activeChannel) {
      await sendMsg.mutateAsync(data);
    }
  };

  const handleStartDM = async (friend) => {
    const existing = conversations.find(c => c.participants?.some(p => p.user_id === friend.friend_id));
    if (existing) {
      setActiveConversation(existing);
      setView('dms');
      return;
    }
    const conv = await base44.entities.Conversation.create({
      type: 'dm',
      participants: [
        { user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url },
        { user_id: friend.friend_id, user_email: friend.friend_email, user_name: friend.friend_name, avatar: friend.friend_avatar },
      ],
      last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConversation(conv);
    setView('dms');
  };

  const handleCreateGroupDM = async ({ name, participants }) => {
    const conv = await base44.entities.Conversation.create({
      type: 'group', name,
      participants: [
        { user_id: currentUser.id, user_email: currentUser.email, user_name: profile?.display_name, avatar: profile?.avatar_url },
        ...participants,
      ],
      owner_id: currentUser.id,
      last_message_at: new Date().toISOString(),
    });
    qc.invalidateQueries({ queryKey: ['conversations'] });
    setActiveConversation(conv);
    setView('dms');
    setModal(null);
  };

  const handleOpenThread = async (msg) => {
    let thread = threads.find(t => t.parent_message_id === msg.id);
    if (!thread) {
      thread = await base44.entities.Thread.create({
        channel_id: activeChannel.id, server_id: activeServer.id,
        parent_message_id: msg.id, name: msg.content?.slice(0, 50) || 'Thread',
        created_by: currentUser.id, created_by_name: profile?.display_name,
        message_count: 0, last_message_at: new Date().toISOString(),
      });
      qc.invalidateQueries({ queryKey: ['threads'] });
    }
    setActiveThread(thread);
  };

  // Determine what's active
  const isInChat = (view === 'server' && activeChannel) || (view === 'dms' && activeConversation);
  const currentMsgs = activeConversation ? dmMessages : messages;
  const currentLoading = activeConversation ? dmLoading : msgsLoading;
  const isDM = !!activeConversation;
  const channelLabel = activeConversation
    ? (activeConversation.name || activeConversation.participants?.find(p => p.user_id !== currentUser.id)?.user_name || 'DM')
    : (activeChannel?.name || '');

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#0e0e0e' }}>
      {/* Server Rail */}
      <ServerRail
        servers={servers}
        activeServerId={activeServer?.id}
        onServerSelect={selectServer}
        onHomeClick={goHome}
        onCreateServer={() => setModal('create-server')}
        onDiscover={() => setModal('join-server')}
        isHome={view === 'dms' || view === 'friends'}
        pendingRequests={incomingRequests.length}
      />

      {/* Side Panel */}
      <div className="w-[240px] flex-shrink-0 flex flex-col" style={{ background: '#131313' }}>
        {view === 'server' || view === 'moderation' || view === 'serverSettings' ? (
          <ChannelPanel
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={(ch) => { setActiveChannel(ch); setView('server'); setActiveThread(null); }}
            onCreateChannel={(catId) => { setCreateChannelCat(catId); setModal('create-channel'); }}
            onServerSettings={() => setView('serverSettings')}
            onModeration={() => setView('moderation')}
            onInvite={() => setModal('invite')}
            isOwner={activeServer?.owner_id === currentUser.id || activeServer?.created_by === currentUser.email}
          />
        ) : (
          <DMPanel
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            onSelect={(conv) => { setActiveConversation(conv); setView('dms'); }}
            onFriendsClick={goFriends}
            currentUserId={currentUser.id}
            onCreateGroupDM={() => setModal('create-group-dm')}
          />
        )}
        <UserPanel
          profile={profile}
          isMuted={isMuted}
          isDeafened={isDeafened}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleDeafen={() => setIsDeafened(!isDeafened)}
          onSettings={() => setModal('settings')}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0e0e0e' }}>
        {view === 'moderation' && activeServer ? (
          <ModPanel
            server={activeServer}
            members={members}
            roles={roles}
            profilesMap={profilesMap}
            currentUserId={currentUser.id}
            onBack={() => setView('server')}
          />
        ) : view === 'serverSettings' && activeServer ? (
          <ServerSettingsView
            server={activeServer}
            categories={categories}
            channels={channels}
            roles={roles}
            members={members}
            profilesMap={profilesMap}
            currentUser={currentUser}
            onBack={() => setView('server')}
          />
        ) : view === 'friends' ? (
          <FriendsView
            friends={friends}
            incomingRequests={incomingRequests}
            outgoingRequests={outgoingRequests}
            onAddFriend={() => setModal('add-friend')}
            onMessage={handleStartDM}
            onAccept={async (r) => {
              await base44.entities.Friendship.update(r.id, { status: 'accepted' });
              await base44.entities.Friendship.create({
                user_id: r.friend_id || currentUser.id, friend_id: r.user_id,
                friend_email: r.created_by, friend_name: r.initiated_by === r.user_id ? (profilesMap.get(r.user_id)?.display_name || 'User') : 'User',
                status: 'accepted', initiated_by: r.initiated_by,
              });
              qc.invalidateQueries({ queryKey: ['friends'] });
              qc.invalidateQueries({ queryKey: ['incomingRequests'] });
            }}
            onDecline={async (r) => {
              await base44.entities.Friendship.delete(r.id);
              qc.invalidateQueries({ queryKey: ['incomingRequests'] });
            }}
            onRemove={async (f) => {
              if (!confirm(`Remove ${f.friend_name}?`)) return;
              await base44.entities.Friendship.delete(f.id);
              qc.invalidateQueries({ queryKey: ['friends'] });
            }}
          />
        ) : isInChat ? (
          <>
            <ChatHeader
              channel={activeChannel}
              conversation={activeConversation}
              currentUserId={currentUser.id}
              memberCount={members.length}
              showMembers={showMembers}
              onToggleMembers={() => setShowMembers(!showMembers)}
              pinnedCount={pinnedMessages.length}
            />
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 flex flex-col min-w-0">
                <ChatArea
                  messages={currentMsgs}
                  currentUserId={currentUser.id}
                  channelName={channelLabel}
                  isLoading={currentLoading}
                  isDM={isDM}
                  onReply={setReplyTo}
                  onEdit={(msg) => setEditingMessage(msg)}
                  onDelete={(msg) => {
                    if (!confirm('Delete this message?')) return;
                    isDM ? deleteDM(msg.id) : deleteMsg(msg.id);
                  }}
                  onReact={(msg, emoji) => reactMsg(msg, emoji, isDM)}
                  onPin={isDM ? undefined : pinMsg}
                  onThread={isDM ? undefined : handleOpenThread}
                  onProfileClick={(userId) => setProfilePopup(userId)}
                  editingMessage={editingMessage}
                  onEditSave={(msgId, content) => isDM ? editDM(msgId, content) : editMsg(msgId, content)}
                  onEditCancel={() => setEditingMessage(null)}
                />
                <ChatInput
                  channelName={channelLabel}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  onSend={handleSend}
                />
              </div>
              {view === 'server' && showMembers && (
                <MemberPanel
                  members={members}
                  profilesMap={profilesMap}
                  roles={roles}
                  ownerId={activeServer?.owner_id}
                  onProfileClick={(userId) => setProfilePopup(userId)}
                />
              )}
              {activeThread && (
                <ThreadPanel
                  thread={activeThread}
                  currentUser={{ id: currentUser.id, name: profile?.display_name, avatar: profile?.avatar_url }}
                  onClose={() => setActiveThread(null)}
                />
              )}
            </div>
          </>
        ) : (
          <EmptyView
            onCreateServer={() => setModal('create-server')}
            onJoinServer={() => setModal('join-server')}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'create-server' && <CreateServerModal onClose={() => setModal(null)} onCreate={(d) => createServer.mutate(d)} isCreating={createServer.isPending} />}
        {modal === 'join-server' && <JoinServerModal onClose={() => setModal(null)} onJoin={(c) => joinServer.mutate(c)} isJoining={joinServer.isPending} />}
        {modal === 'create-channel' && <CreateChannelModal onClose={() => setModal(null)} onCreate={(d) => createChannel.mutate(d)} categories={categories} defaultCategoryId={createChannelCat} />}
        {modal === 'create-group-dm' && <CreateGroupDMModal onClose={() => setModal(null)} friends={friends} onCreate={handleCreateGroupDM} />}
        {modal === 'add-friend' && <AddFriendModal onClose={() => setModal(null)} currentUserId={currentUser.id} />}
        {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} profile={profile} onUpdate={(d) => updateProfile.mutate(d)} onLogout={() => base44.auth.logout()} />}
        {modal === 'invite' && activeServer && <InviteModal onClose={() => setModal(null)} server={activeServer} />}
      </AnimatePresence>

      {profilePopup && (
        <UserProfilePopup
          userId={profilePopup}
          profilesMap={profilesMap}
          onClose={() => setProfilePopup(null)}
          onMessage={(userId) => {
            const friend = friends.find(f => f.friend_id === userId);
            if (friend) handleStartDM(friend);
            setProfilePopup(null);
          }}
        />
      )}
    </div>
  );
}