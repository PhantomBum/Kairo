import React from 'react';
import { motion } from 'framer-motion';
import { 
  Hash, Volume2, Bell, BellOff, Pin, Users, Search, 
  Inbox, HelpCircle, Phone, Video, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '../ui/Tooltip';
import Avatar from '../ui/Avatar';

function HeaderButton({ icon: Icon, label, onClick, active, badge }) {
  return (
    <Tooltip content={label}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          active 
            ? 'text-white bg-white/[0.1]' 
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
        )}
      >
        <Icon className="w-5 h-5" />
        {badge > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {badge}
          </div>
        )}
      </motion.button>
    </Tooltip>
  );
}

export default function ChatHeader({
  channel,
  conversation,
  memberCount,
  showMembers,
  onToggleMembers,
  onShowSearch,
  onShowPinned,
  onToggleNotifications,
  onStartCall,
  onStartVideo,
}) {
  // DM Header
  if (conversation) {
    const otherUser = conversation.participant_1_id === conversation.current_user_id 
      ? { 
          name: conversation.participant_2_name, 
          avatar: conversation.participant_2_avatar,
          status: conversation.participant_2_status
        }
      : {
          name: conversation.participant_1_name,
          avatar: conversation.participant_1_avatar,
          status: conversation.participant_1_status
        };

    return (
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04] bg-[#0f0f10]">
        <div className="flex items-center gap-3">
          <Avatar 
            src={otherUser.avatar} 
            name={otherUser.name} 
            size="sm" 
            status={otherUser.status}
          />
          <div>
            <h2 className="font-semibold text-white">{otherUser.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HeaderButton icon={Phone} label="Start Voice Call" onClick={onStartCall} />
          <HeaderButton icon={Video} label="Start Video Call" onClick={onStartVideo} />
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          <HeaderButton icon={Pin} label="Pinned Messages" onClick={onShowPinned} />
          <HeaderButton icon={Search} label="Search" onClick={onShowSearch} />
          <HeaderButton icon={Inbox} label="Inbox" />
          <HeaderButton icon={HelpCircle} label="Help" />
        </div>
      </div>
    );
  }

  // Channel Header
  const Icon = channel?.type === 'voice' ? Volume2 : Hash;
  const isVoice = channel?.type === 'voice' || channel?.type === 'stage';

  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04] bg-[#0f0f10]">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={cn(
          'w-5 h-5 flex-shrink-0',
          channel?.is_private ? 'text-amber-500' : 'text-zinc-400'
        )} />
        
        <h2 className="font-semibold text-white truncate">
          {channel?.name}
        </h2>

        {channel?.description && (
          <>
            <div className="w-px h-5 bg-white/[0.1] mx-2 flex-shrink-0" />
            <p className="text-sm text-zinc-500 truncate">
              {channel.description}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Voice channel specific */}
        {isVoice && (
          <>
            <HeaderButton icon={Phone} label="Join Voice" onClick={onStartCall} />
            <HeaderButton icon={Video} label="Join with Video" onClick={onStartVideo} />
            <div className="w-px h-6 bg-white/[0.06] mx-1" />
          </>
        )}

        {/* Common actions */}
        <HeaderButton 
          icon={Bell} 
          label="Notification Settings" 
          onClick={onToggleNotifications} 
        />
        <HeaderButton 
          icon={Pin} 
          label="Pinned Messages" 
          onClick={onShowPinned} 
        />
        
        <Tooltip content="Member List">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMembers}
            className={cn(
              'flex items-center gap-1.5 h-8 px-2 rounded-lg transition-colors',
              showMembers 
                ? 'text-white bg-white/[0.1]' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            )}
          >
            <Users className="w-5 h-5" />
            {memberCount > 0 && (
              <span className="text-sm font-medium">{memberCount}</span>
            )}
          </motion.button>
        </Tooltip>

        <div className="w-px h-6 bg-white/[0.06] mx-1" />

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-36 h-8 pl-8 pr-2 bg-[#0a0a0b] border border-white/[0.06] rounded-md text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:w-48 transition-all"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>

        <HeaderButton icon={Inbox} label="Inbox" badge={0} />
        <HeaderButton icon={HelpCircle} label="Help" />
      </div>
    </div>
  );
}