import React from 'react';
import { motion } from 'framer-motion';
import { 
  Hash, Volume2, Megaphone, Users, Search, Bell, Pin, 
  Phone, Video, MoreVertical, AtSign, Inbox, HelpCircle,
  MessageSquare, Podcast
} from 'lucide-react';
import { cn } from '@/lib/utils';
import IconButton from '../primitives/IconButton';

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Megaphone,
  stage: Podcast,
  forum: MessageSquare,
};

export default function ChatHeader({
  channel,
  conversation,
  memberCount,
  showMembers,
  onToggleMembers,
  onShowSearch,
  onShowPinned,
  onShowInbox,
  onStartCall,
  onStartVideo,
}) {
  // DM mode
  if (conversation) {
    const otherUser = conversation.participants?.find(p => p.user_id !== conversation.owner_id) || {};
    
    return (
      <header className="h-12 px-4 flex items-center justify-between bg-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
              {otherUser.user_avatar && (
                <img src={otherUser.user_avatar} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            {otherUser.status === 'online' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#050506]" />
            )}
          </div>
          
          <div>
            <h1 className="font-semibold text-white text-sm">
              {otherUser.user_name || conversation.name || 'Direct Message'}
            </h1>
            {otherUser.status && (
              <p className="text-[11px] text-zinc-500 capitalize">{otherUser.status}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          <IconButton icon={Phone} tooltip="Start Voice Call" onClick={onStartCall} />
          <IconButton icon={Video} tooltip="Start Video Call" onClick={onStartVideo} />
          <div className="w-px h-5 bg-white/[0.08] mx-1" />
          <IconButton icon={Pin} tooltip="Pinned Messages" onClick={onShowPinned} />
          <IconButton icon={Search} tooltip="Search" onClick={onShowSearch} />
        </div>
      </header>
    );
  }
  
  // Channel mode
  if (!channel) return null;
  
  const Icon = channelIcons[channel.type] || Hash;
  
  return (
    <header className="h-12 px-4 flex items-center justify-between bg-transparent flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 text-zinc-500 flex-shrink-0" />
        
        <h1 className="font-semibold text-white text-sm truncate">
          {channel.name}
        </h1>
        
        {channel.description && (
          <>
            <div className="w-px h-4 bg-white/[0.08] flex-shrink-0" />
            <p className="text-xs text-zinc-500 truncate max-w-xs">
              {channel.description}
            </p>
          </>
        )}
      </div>
      
      <div className="flex items-center gap-0.5">
        {channel.type === 'voice' || channel.type === 'stage' ? (
          <>
            <IconButton icon={Video} tooltip="Start Video" />
            <IconButton icon={Users} tooltip="Show Participants" />
          </>
        ) : (
          <>
            <IconButton icon={AtSign} tooltip="Threads" />
            <IconButton icon={Pin} tooltip="Pinned Messages" onClick={onShowPinned} />
            <IconButton icon={Bell} tooltip="Notification Settings" />
          </>
        )}
        
        <div className="w-px h-5 bg-white/[0.08] mx-1" />
        
        <IconButton 
          icon={Users} 
          tooltip={showMembers ? "Hide Members" : "Show Members"}
          onClick={onToggleMembers}
          active={showMembers}
        />
        
        <div className="relative ml-1">
          <input
            type="text"
            placeholder="Search"
            onClick={onShowSearch}
            readOnly
            className="w-36 h-7 px-2 text-xs bg-[#0a0a0c] border border-white/[0.06] rounded-md text-zinc-400 placeholder:text-zinc-600 cursor-pointer hover:border-white/[0.12] transition-colors"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
        </div>
        
        <IconButton icon={Inbox} tooltip="Inbox" />
        <IconButton icon={HelpCircle} tooltip="Help" />
      </div>
    </header>
  );
}