import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import { useAuth } from './hooks/useAuth';
import { useServers, useServerData } from './hooks/useServers';
import { useMessages } from './hooks/useMessages';
import { useFriends } from './hooks/useFriends';
import { useConversations, useDMMessages } from './hooks/useConversations';
import { base44 } from '@/api/base44Client';

import ServerRail from './layout/ServerRail.jsx';
import ChannelPanel from './layout/ChannelPanel.jsx';
import DMPanel from './layout/DMPanel.jsx';
import MemberPanel from './layout/MemberPanel.jsx';
import UserPanel from './layout/UserPanel.jsx';
import ChatHeader from './layout/ChatHeader.jsx';

import ChatMessages from './chat/ChatMessages.jsx';
import ChatInput from './chat/ChatInput.jsx';

import FriendsView from './panels/FriendsView.jsx';
import EmptyView from './panels/EmptyView.jsx';

import AddFriendModal from './modals/AddFriendModal';
import CreateServerModal from './modals/CreateServerModal';
import JoinServerModal from './modals/JoinServerModal';
import SettingsModal from './modals/SettingsModal';
import CreateChannelModal from './modals/CreateChannelModal.jsx';
import CreateGroupDMModal from './modals/CreateGroupDMModal.jsx';

import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

function AppContent() {
  const queryClient = useQueryClient();
  const { user, profile, setStatus, logout, updateProfile } = useAuth();
  const { profiles } = useProfiles();

  const [view, setView] = useState('dms');
  const [activeServer, setActiveServer] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMembers, setShowMembers] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const [modal, setModal] = useState(null);
  const [createChannelCategory, setCreateChannelCategory] = useState(null);

  const { servers, createServer, joinServer, createChannel, isCreating, isJoining } = useServers(user?.id);
  const { categories, channels, members, roles } = useServerData(activeServer?.id);
  const { messages, sendMessage, editMessage, deleteMessage, toggleReaction, pinMessage, isLoading: messagesLoading } = useMessages(activeChannel?.id);
  const { friends, incomingRequests, outgoingRequests, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriends(user?.id, user?.email);
  const { conversations, startConversation, createGroupConversation } = useConversations(user?.id, user?.email);
  const { messages: dmMessages, sendMessage: sendDM, editMessage: editDM, deleteMessage: deleteDM, toggleReaction: toggleDMReaction, isLoading: dmLoading } = useDMMessages(activeConversation?.id);

  // Unread DM count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadDMs', user?.id],
    queryFn: async () => {
      if (!conversations.length) return 0;
      let count = 0;
      for (const conv of conversations) {
        const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conv.id, is_read: false });
        const unread = msgs.filter(m => m.author_id !== user?.id);
        count += unread.length;
      }
      return count;
    },
    enabled: !!user?.id && conversations.length > 0,
    refetchInterval: 10000,
  });

  // Typing indicators
  const [typingUsers, setTypingUsers] = useState([]);
  const typingRef = React.useRef(null);

  const sendTyping = useCallback(async () => {
    if (!user?.id) return;
    const target = activeConversation?.id ? { conversation_id: activeConversation.id } : activeChannel?.id ? { channel_id: activeChannel.id } : null;
    if (!target) return;
    const existing = await base44.entities.TypingIndicator.filter({ user_id: user.id, ...target });
    if (existing.length > 0) {
      await base44.entities.TypingIndicator.update(existing[0].id, { started_at: new Date().toISOString() });
    } else {
      await base44.entities.TypingIndicator.create({ user_id: user.id, user_name: profile?.display_name || user.full_name, ...target, started_at: new Date().toISOString() });
    }
  }, [user?.id, activeConversation?.id, activeChannel?.id, profile?.display_name]);

  // Poll typing indicators
  useEffect(() => {
    const targetId = activeConversation?.id || activeChannel?.id;
    if (!targetId) { setTypingUsers([]); return; }
    const poll = async () => {
      const filter = activeConversation?.id ? { conversation_id: activeConversation.id } : { channel_id: activeChannel.id };
      const indicators = await base44.entities.TypingIndicator.filter(filter);
      const now = Date.now();
      setTypingUsers(indicators.filter(t => t.user_id !== user?.id && (now - new Date(t.started_at).getTime()) < 5000));
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [activeConversation?.id, activeChannel?.id, user?.id]);

  const profilesMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(profiles) ? profiles : []).forEach(p => map.set(p.user_id, p));
    return map;
  }, [profiles]);

  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const text = channels.find(c => c.type === 'text');
      if (text) setActiveChannel(text);
    }
  }, [activeServer, channels]);

  useEffect(() => {
    if (view !== 'server') setActiveChannel(null);
  }, [view]);

  const selectServer = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
    setView('server');
  };

  const goHome = () => { setView('dms'); setActiveServer(null); setActiveChannel(null); };
  const goFriends = () => { setView('friends'); setActiveConversation(null); };

  const handleStartDM = async (friend) => {
    const conv = await startConversation({
      friendId: friend.friend_id, friendName: friend.friend_name,
      friendAvatar: friend.friend_avatar, userName: profile?.display_name, userAvatar: profile?.avatar_url,
    });
    setActiveConversation(conv);
    setView('dms');
  };

  const handleSend = async (data) => {
    if (activeConversation) {
      await sendDM({ ...data, senderId: user.id, senderName: profile?.display_name || user.full_name, senderAvatar: profile?.avatar_url });
    } else if (activeChannel) {
      await sendMessage({
        ...data, channelId: activeChannel.id, serverId: activeServer?.id,
        author: { id: user.id, name: profile?.display_name || user.full_name, avatar: profile?.avatar_url, badges: profile?.badges || [] },
      });
    }
    setReplyTo(null);
  };

  const handleCreateServer = async (data) => {
    const server = await createServer({ ...data, userId: user.id, userEmail: user.email });
    selectServer(server);
  };

  const handleJoinServer = async (inviteCode) => {
    const server = await joinServer({ inviteCode, userId: user.id, userEmail: user.email });
    selectServer(server);
  };

  const handleCreateChannel = async (channelData) => {
    if (!activeServer?.id) return;
    await createChannel({ ...channelData, server_id: activeServer.id, position: channels.length });
    queryClient.invalidateQueries({ queryKey: ['channels', activeServer.id] });
    setModal(null);
  };

  const handleCreateGroupDM = async ({ name, participants }) => {
    const conv = await createGroupConversation({
      name,
      participantList: [
        { user_id: user.id, user_email: user.email, user_name: profile?.display_name, avatar: profile?.avatar_url },
        ...participants,
      ],
    });
    setActiveConversation(conv);
    setView('dms');
    setModal(null);
  };

  const isInChat = (view === 'server' && activeChannel) || (view === 'dms' && activeConversation);
  const currentMessages = activeConversation ? dmMessages : messages;
  const isLoadingMessages = activeConversation ? dmLoading : messagesLoading;
  const channelLabel = activeConversation ? (activeConversation.name || (() => {
    const other = activeConversation.participants?.find(p => p.user_id !== user?.id);
    return other?.user_name || 'DM';
  })()) : activeChannel?.name || '';

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#0e0e0e' }}>
      {/* Server rail */}
      <ServerRail
        servers={servers}
        activeServerId={activeServer?.id}
        onServerSelect={selectServer}
        onHomeClick={goHome}
        onCreateServer={() => setModal('create-server')}
        onDiscover={() => setModal('join-server')}
        isHome={view === 'dms' || view === 'friends'}
        pendingRequests={incomingRequests.length + unreadCount}
      />

      {/* Side panel */}
      <div className="w-[240px] flex-shrink-0 flex flex-col" style={{ background: '#131313' }}>
        {view === 'server' && activeServer ? (
          <ChannelPanel
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={setActiveChannel}
            onCreateChannel={(catId) => { setCreateChannelCategory(catId); setModal('create-channel'); }}
          />
        ) : (
          <DMPanel
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            onSelect={(conv) => { setActiveConversation(conv); setView('dms'); }}
            onFriendsClick={goFriends}
            currentUserId={user?.id}
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
          onStatusChange={setStatus}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#0e0e0e' }}>
        {isInChat && (
          <ChatHeader
            channel={activeChannel}
            conversation={activeConversation ? { ...activeConversation, current_user_id: user?.id } : null}
            memberCount={members.length}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
          />
        )}
        {view === 'friends' && (
          <div className="h-12 px-5 flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-[15px] font-semibold text-white">Friends</span>
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          {view === 'friends' ? (
            <FriendsView
              friends={friends}
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              onAddFriend={() => setModal('add-friend')}
              onMessage={handleStartDM}
              onAccept={acceptRequest}
              onDecline={declineRequest}
              onRemove={removeFriend}
            />
          ) : isInChat ? (
            <>
              <div className="flex-1 flex flex-col min-w-0">
                <ChatMessages
                  messages={currentMessages}
                  currentUserId={user?.id}
                  channelName={channelLabel}
                  isLoading={isLoadingMessages}
                  isDM={!!activeConversation}
                  onReply={setReplyTo}
                  onEdit={(msg) => {
                    const c = prompt('Edit message:', msg.content);
                    if (c && c !== msg.content) {
                      if (activeConversation) editDM({ messageId: msg.id, content: c });
                      else editMessage({ messageId: msg.id, content: c });
                    }
                  }}
                  onDelete={(msg) => {
                    if (confirm('Delete?')) {
                      if (activeConversation) deleteDM(msg.id);
                      else deleteMessage(msg.id);
                    }
                  }}
                  onReact={(msg, emoji) => {
                    if (activeConversation) toggleDMReaction({ messageId: msg.id, emoji, userId: user.id, currentReactions: msg.reactions });
                    else toggleReaction({ messageId: msg.id, emoji, userId: user.id, currentReactions: msg.reactions });
                  }}
                  onPin={(msg) => {
                    if (!activeConversation) pinMessage({ messageId: msg.id, isPinned: msg.is_pinned });
                  }}
                />
                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="px-4 pb-1 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {typingUsers.map(t => t.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                )}
                <ChatInput
                  channelName={channelLabel}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  onSend={handleSend}
                  onTyping={sendTyping}
                />
              </div>
              {view === 'server' && showMembers && (
                <MemberPanel members={members} profiles={profilesMap} roles={roles} ownerId={activeServer?.owner_id} onMessage={handleStartDM} />
              )}
            </>
          ) : (
            <EmptyView onCreateServer={() => setModal('create-server')} onJoinServer={() => setModal('join-server')} />
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === 'add-friend' && <AddFriendModal isOpen onClose={() => setModal(null)} onSendRequest={sendRequest} currentUserId={user?.id} />}
      {modal === 'create-server' && <CreateServerModal isOpen onClose={() => setModal(null)} onCreate={handleCreateServer} isCreating={isCreating} />}
      {modal === 'join-server' && <JoinServerModal isOpen onClose={() => setModal(null)} onJoin={handleJoinServer} isJoining={isJoining} />}
      {modal === 'settings' && <SettingsModal isOpen onClose={() => setModal(null)} profile={profile} onUpdateProfile={updateProfile} onLogout={logout} />}
      {modal === 'create-channel' && (
        <CreateChannelModal
          isOpen
          onClose={() => setModal(null)}
          onCreate={handleCreateChannel}
          categories={categories}
          defaultCategoryId={createChannelCategory}
        />
      )}
      {modal === 'create-group-dm' && (
        <CreateGroupDMModal
          isOpen
          onClose={() => setModal(null)}
          friends={friends}
          onCreate={handleCreateGroupDM}
        />
      )}
    </div>
  );
}

export default function KairoApp() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}