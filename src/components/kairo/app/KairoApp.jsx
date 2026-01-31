import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useServers, useServerData } from './hooks/useServers';
import { useMessages } from './hooks/useMessages';
import { useFriends } from './hooks/useFriends';
import { useConversations, useDMMessages } from './hooks/useConversations';

// Layout
import ServerSidebar from './layout/ServerSidebar';
import ChannelSidebar from './layout/ChannelSidebar';
import DMSidebar from './layout/DMSidebar';
import MemberSidebar from './layout/MemberSidebar';
import UserBar from './layout/UserBar';
import ChatHeader from './layout/ChatHeader';

// Chat
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';

// Panels
import FriendsPanel from './panels/FriendsPanel';

// Modals
import AddFriendModal from './modals/AddFriendModal';
import CreateServerModal from './modals/CreateServerModal';
import JoinServerModal from './modals/JoinServerModal';
import SettingsModal from './modals/SettingsModal';

// Providers
import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

function KairoAppContent() {
  const queryClient = useQueryClient();
  const { user, profile, setStatus, logout, updateProfile } = useAuth();
  const { profiles } = useProfiles();
  
  // Core navigation state
  const [view, setView] = useState('dms'); // 'dms' | 'friends' | 'server'
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
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Data hooks
  const { servers, createServer, joinServer, isCreating, isJoining } = useServers(user?.id);
  const { categories, channels, members, roles } = useServerData(activeServer?.id);
  const { messages, sendMessage, editMessage, deleteMessage, toggleReaction, pinMessage, isLoading: messagesLoading } = useMessages(activeChannel?.id);
  const { friends, incomingRequests, outgoingRequests, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriends(user?.id, user?.email);
  const { conversations, startConversation } = useConversations(user?.id, user?.email);
  const { messages: dmMessages, sendMessage: sendDM, isLoading: dmLoading } = useDMMessages(activeConversation?.id);
  
  // Profile map for member sidebar
  const profilesMap = useMemo(() => {
    const map = new Map();
    profiles?.forEach(p => map.set(p.user_id, p));
    return map;
  }, [profiles]);
  
  // Auto-select first text channel when server changes
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const textChannel = channels.find(c => c.type === 'text');
      if (textChannel) setActiveChannel(textChannel);
    }
  }, [activeServer, channels]);
  
  // Clear channel when leaving server view
  useEffect(() => {
    if (view !== 'server') {
      setActiveChannel(null);
    }
  }, [view]);
  
  // Handlers
  const handleServerSelect = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
    setView('server');
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
    const conv = await startConversation({
      friendId: friend.friend_id,
      friendName: friend.friend_name,
      friendAvatar: friend.friend_avatar,
      userName: profile?.display_name,
      userAvatar: profile?.avatar_url,
    });
    setActiveConversation(conv);
    setView('dms');
  };
  
  const handleSendMessage = async (data) => {
    if (activeConversation) {
      await sendDM({
        ...data,
        senderId: user.id,
        senderName: profile?.display_name || user.full_name,
        senderAvatar: profile?.avatar_url,
      });
    } else if (activeChannel) {
      await sendMessage({
        ...data,
        channelId: activeChannel.id,
        serverId: activeServer?.id,
        author: {
          id: user.id,
          name: profile?.display_name || user.full_name,
          avatar: profile?.avatar_url,
          badges: profile?.badges || [],
        },
      });
    }
    setReplyTo(null);
  };
  
  const handleCreateServer = async (data) => {
    const server = await createServer({
      ...data,
      userId: user.id,
      userEmail: user.email,
    });
    handleServerSelect(server);
  };
  
  const handleJoinServer = async (inviteCode) => {
    const server = await joinServer({
      inviteCode,
      userId: user.id,
      userEmail: user.email,
    });
    handleServerSelect(server);
  };
  
  const handleCopyInvite = () => {
    if (activeServer?.invite_code) {
      navigator.clipboard.writeText(`https://kairo.app/invite/${activeServer.invite_code}`);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#0a0a0b] overflow-hidden">
      {/* Server sidebar */}
      <ServerSidebar
        servers={servers}
        activeServerId={activeServer?.id}
        onServerSelect={handleServerSelect}
        onDMsClick={handleDMsClick}
        onCreateServer={() => setShowCreateServer(true)}
        onDiscoverClick={() => setShowJoinServer(true)}
        isDMsActive={view === 'dms' || view === 'friends'}
        pendingRequests={incomingRequests.length}
      />
      
      {/* Secondary sidebar */}
      <div className="flex flex-col">
        {view === 'server' && activeServer ? (
          <ChannelSidebar
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={setActiveChannel}
            onServerSettings={() => {}}
            onInvite={handleCopyInvite}
          />
        ) : (
          <DMSidebar
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            onConversationSelect={(conv) => {
              setActiveConversation(conv);
              setView('dms');
            }}
            onShowFriends={handleFriendsClick}
            onCreateDM={() => setShowAddFriend(true)}
            onCloseConversation={() => setActiveConversation(null)}
            currentUserId={user?.id}
          />
        )}
        
        {/* User bar */}
        <UserBar
          profile={profile}
          isMuted={isMuted}
          isDeafened={isDeafened}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleDeafen={() => setIsDeafened(!isDeafened)}
          onOpenSettings={() => setShowSettings(true)}
          onStatusChange={setStatus}
        />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {view === 'server' && activeChannel && (
          <ChatHeader
            channel={activeChannel}
            memberCount={members.length}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
            onShowSearch={() => {}}
            onShowPinned={() => {}}
          />
        )}
        {view === 'dms' && activeConversation && (
          <ChatHeader
            conversation={{ ...activeConversation, current_user_id: user?.id }}
            onStartCall={() => {}}
            onStartVideo={() => {}}
          />
        )}
        
        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {view === 'friends' ? (
            <FriendsPanel
              friends={friends}
              incomingRequests={incomingRequests}
              outgoingRequests={outgoingRequests}
              onAddFriend={() => setShowAddFriend(true)}
              onMessage={handleStartDM}
              onAcceptRequest={acceptRequest}
              onDeclineRequest={declineRequest}
              onRemoveFriend={removeFriend}
            />
          ) : view === 'server' && activeChannel ? (
            <>
              <div className="flex-1 flex flex-col min-w-0">
                <MessageList
                  messages={messages}
                  currentUserId={user?.id}
                  channelName={activeChannel.name}
                  isLoading={messagesLoading}
                  onReply={setReplyTo}
                  onEdit={(msg) => {
                    const newContent = prompt('Edit message:', msg.content);
                    if (newContent && newContent !== msg.content) {
                      editMessage({ messageId: msg.id, content: newContent });
                    }
                  }}
                  onDelete={(msg) => {
                    if (confirm('Delete this message?')) {
                      deleteMessage(msg.id);
                    }
                  }}
                  onReact={(msg, emoji) => toggleReaction({ 
                    messageId: msg.id, 
                    emoji, 
                    userId: user.id, 
                    currentReactions: msg.reactions 
                  })}
                  onPin={(msg) => pinMessage({ messageId: msg.id, isPinned: msg.is_pinned })}
                />
                <MessageInput
                  channelName={activeChannel.name}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  onSendMessage={handleSendMessage}
                />
              </div>
              {showMembers && (
                <MemberSidebar
                  members={members}
                  profiles={profilesMap}
                  roles={roles}
                  ownerId={activeServer?.owner_id}
                  onMessage={handleStartDM}
                />
              )}
            </>
          ) : view === 'dms' && activeConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              <MessageList
                messages={dmMessages}
                currentUserId={user?.id}
                channelName={activeConversation.name || 'DM'}
                isLoading={dmLoading}
                onReply={setReplyTo}
                onEdit={() => {}}
                onDelete={() => {}}
                onReact={() => {}}
                onPin={() => {}}
              />
              <MessageInput
                channelName="this conversation"
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSendMessage={handleSendMessage}
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
        </div>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showAddFriend && (
          <AddFriendModal
            isOpen={showAddFriend}
            onClose={() => setShowAddFriend(false)}
            onSendRequest={sendRequest}
            currentUserId={user?.id}
          />
        )}
        {showCreateServer && (
          <CreateServerModal
            isOpen={showCreateServer}
            onClose={() => setShowCreateServer(false)}
            onCreate={handleCreateServer}
            isCreating={isCreating}
          />
        )}
        {showJoinServer && (
          <JoinServerModal
            isOpen={showJoinServer}
            onClose={() => setShowJoinServer(false)}
            onJoin={handleJoinServer}
            isJoining={isJoining}
          />
        )}
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            profile={profile}
            onUpdateProfile={updateProfile}
            onLogout={logout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KairoApp() {
  return (
    <ProfileProvider>
      <KairoAppContent />
    </ProfileProvider>
  );
}