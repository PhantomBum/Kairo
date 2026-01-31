import React from 'react';
import { Hash, Volume2, Users, Search, Pin, Bell, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

export default function ChatHeader({
  // Channel mode
  channel,
  memberCount,
  showMembers,
  onToggleMembers,
  onShowSearch,
  onShowPinned,
  // DM mode
  conversation,
  onStartCall,
  onStartVideo,
}) {
  const isChannel = !!channel;
  const isDM = !!conversation;

  if (isChannel) {
    const Icon = channel.type === 'voice' ? Volume2 : Hash;
    
    return (
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f10]">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <h2 className="font-semibold text-white truncate">{channel.name}</h2>
          {channel.description && (
            <>
              <div className="w-px h-4 bg-white/[0.1] mx-1" />
              <p className="text-sm text-zinc-500 truncate">{channel.description}</p>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip content="Search">
            <button
              onClick={onShowSearch}
              className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content="Pinned Messages">
            <button
              onClick={onShowPinned}
              className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <Pin className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content={showMembers ? 'Hide Members' : 'Show Members'}>
            <button
              onClick={onToggleMembers}
              className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                showMembers 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
              )}
            >
              <Users className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  if (isDM) {
    const otherParticipant = conversation.participants?.find(p => p.user_id !== conversation.current_user_id);
    const name = conversation.name || otherParticipant?.user_name || 'Unknown';
    const avatar = conversation.icon_url || otherParticipant?.user_avatar;

    return (
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0f0f10]">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar src={avatar} name={name} size="sm" />
          <h2 className="font-semibold text-white truncate">{name}</h2>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip content="Start Voice Call">
            <button
              onClick={onStartCall}
              className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content="Start Video Call">
            <button
              onClick={onStartVideo}
              className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <Video className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return null;
}