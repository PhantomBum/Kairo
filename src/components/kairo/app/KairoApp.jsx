import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from './hooks/useAuth';
import { useServers, useServerData } from './hooks/useServers';
import { useMessages } from './hooks/useMessages';
import { useFriends } from './hooks/useFriends';
import { useConversations, useDMMessages } from './hooks/useConversations';

import ServerSidebar from './layout/ServerSidebar';
import ChannelSidebar from './layout/ChannelSidebar';
import DMSidebar from './layout/DMSidebar';
import MemberSidebar from './layout/MemberSidebar';
import UserBar from './layout/UserBar';
import ChatHeader from './layout/ChatHeader';

import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';

import FriendsPanel from './panels/FriendsPanel';
import WelcomeScreen from './panels/WelcomeScreen';

import AddFriendModal from './modals/AddFriendModal';
import CreateServerModal from './modals/CreateServerModal';
import JoinServerModal from './modals/JoinServerModal';
import SettingsModal from './modals/SettingsModal';

import { ProfileProvider, useProfiles } from '@/components/kairo/core/ProfileProvider';

function KairoAppContent() {
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
  
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { servers, createServer, joinServer, isCreating, isJoining } = useServers(user?.id);
  const { categories, channels, members, roles } = useServerData(activeServer?.id);
  const { messages, sendMessage, editMessage, deleteMessage, toggleReaction, pinMessage, isLoading: messagesLoading } = useMessages(activeChannel?.id);
  const { friends, incomingRequests, outgoingRequests, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriends(user?.id, user?.email);
  const { conversations, startConversation } = useConversations(user?.id, user?.email);
  const { messages: dmMessages, sendMessage: sendDM, isLoading: dmLoading } = useDMMessages(activeConversation?.id);
  
  const profilesMap = useMemo(() => {
    const map = new Map();
    profiles?.forEach(p => map.set(p.user_id, p));
    return map;
  }, [profiles]);
  
  useEffect(() => {
    if (activeServer && channels.length > 0 && !activeChannel) {
      const textChannel = channels.find(c => c.type === 'text');
      if (textChannel) setActiveChannel(textChannel);
    }
  }, [activeServer, channels]);
  
  useEffect(() => {
    if (view !== 'server') setActiveChannel(null);
  }, [view]);
  
  const handleServerSelect = (server) => {
    setActiveServer(server);
    setActiveChannel(null);
    setActiveConversation(null);
    setView('server');
  };
  
  const handleDMsClick = () => { setView('dms'); setActiveServer(null); setActiveChannel(null); };
  const handleFriendsClick = () => { setView('friends'); setActiveConversation(null); };
  
  const handleStartDM = async (friend) => {
    const conv = await startConversation({
      friendId: friend.friend_id, friendName: friend.friend_name,
      friendAvatar: friend.friend_avatar, userName: profile?.display_name, userAvatar: profile?.avatar_url,
    });
    setActiveConversation(conv);
    setView('dms');
  };
  
  const handleSendMessage = async (data) => {
    if (activeConversation) {
      await sendDM({ ...data, senderId: user.id, senderName: profile?.display_name || user.full_name, senderAvatar: profile?.avatar_url });
    } else if (activeChannel) {
      await sendMessage({ ...data, channelId: activeChannel.id, serverId: activeServer?.id,
        author: { id: user.id, name: profile?.display_name || user.full_name, avatar: profile?.avatar_url, badges: profile?.badges || [] },
      });
    }
    setReplyTo(null);
  };
  
  const handleCreateServer = async (data) => {
    const server = await createServer({ ...data, userId: user.id, userEmail: user.email });
    handleServerSelect(server);
  };
  
  const handleJoinServer = async (inviteCode) => {
    const server = await joinServer({ inviteCode, userId: user.id, userEmail: user.email });
    handleServerSelect(server);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.display_name || user?.full_name || 'there';
    if (hour < 6) return { text: `Good night, ${name}`, emoji: '🌙' };
    if (hour < 12) return { text: `Good morning, ${name}`, emoji: '☀️' };
    if (hour < 18) return { text: `Good afternoon, ${name}`, emoji: '👋' };
    return { text: `Good evening, ${name}`, emoji: '🌙' };
  };

  return (
    <div className="h-screen w-screen flex bg-[#0c0c0c] overflow-hidden">
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
      
      <div className="flex flex-col w-[240px] flex-shrink-0 bg-[#141414]">
        {view === 'server' && activeServer ? (
          <ChannelSidebar
            server={activeServer}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannel?.id}
            onChannelClick={setActiveChannel}
            onServerSettings={() => {}}
            onInvite={() => { if (activeServer?.invite_code) navigator.clipboard.writeText(`https://kairo.app/invite/${activeServer.invite_code}`); }}
          />
        ) : (
          <DMSidebar
            conversations={conversations}
            activeConversationId={activeConversation?.id}
            onConversationSelect={(conv) => { setActiveConversation(conv); setView('dms'); }}
            onShowFriends={handleFriendsClick}
            onCreateDM={() => setShowAddFriend(true)}
            onCloseConversation={() => setActiveConversation(null)}
            currentUserId={user?.id}
          />
        )}
        
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
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c]">
        {view === 'server' && activeChannel && (
          <ChatHeader channel={activeChannel} memberCount={members.length} showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)} onShowSearch={() => {}} onShowPinned={() => {}} />
        )}
        {view === 'dms' && activeConversation && (
          <ChatHeader conversation={{ ...activeConversation, current_user_id: user?.id }} onStartCall={() => {}} onStartVideo={() => {}} />
        )}
        {view === 'friends' && (
          <div className="h-12 px-6 flex items-center border-b border-white/[0.06] bg-[#0c0c0c]">
            <span className="font-semibold text-white text-[15px]">Friends</span>
          </div>
        )}
        
        <div className="flex-1 flex min-h-0">
          {view === 'friends' ? (
            <FriendsPanel
              friends={friends} incomingRequests={incomingRequests} outgoingRequests={outgoingRequests}
              onAddFriend={() => setShowAddFriend(true)} onMessage={handleStartDM}
              onAcceptRequest={acceptRequest} onDeclineRequest={declineRequest} onRemoveFriend={removeFriend}
            />
          ) : view === 'server' && activeChannel ? (
            <>
              <div className="flex-1 flex flex-col min-w-0">
                <MessageList messages={messages} currentUserId={user?.id} channelName={activeChannel.name}
                  isLoading={messagesLoading} onReply={setReplyTo}
                  onEdit={(msg) => { const c = prompt('Edit message:', msg.content); if (c && c !== msg.content) editMessage({ messageId: msg.id, content: c }); }}
                  onDelete={(msg) => { if (confirm('Delete this message?')) deleteMessage(msg.id); }}
                  onReact={(msg, emoji) => toggleReaction({ messageId: msg.id, emoji, userId: user.id, currentReactions: msg.reactions })}
                  onPin={(msg) => pinMessage({ messageId: msg.id, isPinned: msg.is_pinned })} />
                <MessageInput channelName={activeChannel.name} replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)} onSendMessage={handleSendMessage} />
              </div>
              {showMembers && (
                <MemberSidebar members={members} profiles={profilesMap} roles={roles} ownerId={activeServer?.owner_id} onMessage={handleStartDM} />
              )}
            </>
          ) : view === 'dms' && activeConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              <MessageList messages={dmMessages} currentUserId={user?.id} channelName={activeConversation.name || 'DM'}
                isLoading={dmLoading} onReply={setReplyTo} onEdit={() => {}} onDelete={() => {}} onReact={() => {}} onPin={() => {}} />
              <MessageInput channelName="this conversation" replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)} onSendMessage={handleSendMessage} />
            </div>
          ) : (
            <WelcomeScreen
              greeting={getGreeting()}
              onCreateServer={() => setShowCreateServer(true)}
              onJoinServer={() => setShowJoinServer(true)}
              onDiscover={() => setShowJoinServer(true)}
            />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showAddFriend && <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} onSendRequest={sendRequest} currentUserId={user?.id} />}
        {showCreateServer && <CreateServerModal isOpen={showCreateServer} onClose={() => setShowCreateServer(false)} onCreate={handleCreateServer} isCreating={isCreating} />}
        {showJoinServer && <JoinServerModal isOpen={showJoinServer} onClose={() => setShowJoinServer(false)} onJoin={handleJoinServer} isJoining={isJoining} />}
        {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} profile={profile} onUpdateProfile={updateProfile} onLogout={logout} />}
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