import React from 'react';
import { Hash, Volume2, Users, Pin, Bell, Search, Menu, MoreHorizontal, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import IconButton from '../primitives/IconButton';

export default function ChatHeader({
  channel,
  conversation,
  memberCount,
  showMembers,
  onToggleMembers,
  onShowPinned,
  onShowSearch,
  onMenuToggle,
  onStartCall,
  onStartVideo,
}) {
  const isChannel = !!channel;
  const Icon = isChannel 
    ? (channel.type === 'voice' ? Volume2 : Hash)
    : null;
  
  const name = isChannel 
    ? channel.name 
    : conversation?.name || conversation?.participants?.[0]?.user_name;
  
  const description = isChannel ? channel.description : null;

  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04] bg-[#09090b] flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle */}
        <IconButton
          icon={Menu}
          size="sm"
          variant="ghost"
          className="md:hidden"
          onClick={onMenuToggle}
        />
        
        {/* Channel/DM info */}
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-5 h-5 text-zinc-500 flex-shrink-0" />}
          <h2 className="font-semibold text-white truncate">{name}</h2>
        </div>
        
        {/* Description divider & text */}
        {description && (
          <>
            <div className="hidden md:block w-px h-6 bg-white/[0.08]" />
            <p className="hidden md:block text-sm text-zinc-500 truncate max-w-xs">
              {description}
            </p>
          </>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* DM call buttons */}
        {!isChannel && (
          <>
            <IconButton
              icon={Phone}
              size="sm"
              variant="ghost"
              tooltip="Start Call"
              onClick={onStartCall}
            />
            <IconButton
              icon={Video}
              size="sm"
              variant="ghost"
              tooltip="Start Video Call"
              onClick={onStartVideo}
            />
          </>
        )}
        
        {/* Search */}
        <IconButton
          icon={Search}
          size="sm"
          variant="ghost"
          tooltip="Search"
          onClick={onShowSearch}
          className="hidden md:flex"
        />
        
        {/* Pinned messages */}
        {isChannel && (
          <IconButton
            icon={Pin}
            size="sm"
            variant="ghost"
            tooltip="Pinned Messages"
            onClick={onShowPinned}
          />
        )}
        
        {/* Member toggle */}
        {isChannel && (
          <IconButton
            icon={Users}
            size="sm"
            variant="ghost"
            tooltip={showMembers ? 'Hide Members' : 'Show Members'}
            onClick={onToggleMembers}
            active={showMembers}
            className="hidden md:flex"
          />
        )}
      </div>
    </div>
  );
}