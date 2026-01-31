import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, UserPlus, UserMinus, MoreHorizontal, 
  Volume2, VolumeX, Shield, Crown, Youtube, Clock,
  MapPin, Calendar, Link as LinkIcon, Twitter, Github,
  Instagram, Globe, Music, Gamepad2, Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import UserBadges from '../UserBadges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-rose-500',
  offline: 'bg-zinc-600',
  invisible: 'bg-zinc-600'
};

const activityIcons = {
  playing: Gamepad2,
  listening: Music,
  watching: Film,
  streaming: Youtube
};

function SocialLink({ platform, url, username }) {
  const icons = {
    twitter: Twitter,
    github: Github,
    instagram: Instagram,
    website: Globe,
    youtube: Youtube
  };
  const Icon = icons[platform] || LinkIcon;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <Icon className="w-4 h-4 text-zinc-400" />
      <span className="text-sm text-zinc-300">{username || platform}</span>
    </a>
  );
}

function RichPresence({ activity }) {
  if (!activity?.name) return null;
  
  const Icon = activityIcons[activity.type] || Gamepad2;
  const typeLabels = {
    playing: 'Playing',
    listening: 'Listening to',
    watching: 'Watching',
    streaming: 'Streaming'
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      {activity.large_image && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img src={activity.large_image} alt="" className="w-full h-full object-cover" />
          {activity.small_image && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#111113] overflow-hidden">
              <img src={activity.small_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {typeLabels[activity.type] || 'Playing'}
        </p>
        <p className="text-sm font-medium text-white truncate">{activity.name}</p>
        {activity.details && (
          <p className="text-xs text-zinc-400 truncate">{activity.details}</p>
        )}
        {activity.state && (
          <p className="text-xs text-zinc-500 truncate">{activity.state}</p>
        )}
        {activity.start_timestamp && (
          <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(activity.start_timestamp), 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}

export default function EnhancedUserCard({
  profile,
  isFriend,
  isSelf,
  mutualServers = [],
  mutualFriends = [],
  onMessage,
  onAddFriend,
  onRemoveFriend,
  onBlock,
  onViewProfile,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('about');

  const accentColor = profile?.accent_color || '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-80 rounded-xl bg-[#111113] border border-white/[0.06] overflow-hidden shadow-2xl"
    >
      {/* Banner */}
      <div 
        className="h-24 relative"
        style={{ 
          background: profile?.banner_url 
            ? `url(${profile.banner_url}) center/cover` 
            : `linear-gradient(135deg, ${accentColor}40, ${accentColor}10)`
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111113]" />
      </div>

      {/* Avatar & Status */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="relative inline-block">
          <div 
            className="w-20 h-20 rounded-full overflow-hidden border-4"
            style={{ borderColor: '#111113' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)` }}
              >
                <span className="text-white text-2xl font-semibold">
                  {profile?.display_name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>
          
          {/* Status dot */}
          <div className={cn(
            "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4",
            statusColors[profile?.status || 'offline']
          )} style={{ borderColor: '#111113' }} />
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{profile?.display_name || 'User'}</h3>
          {profile?.badges?.length > 0 && (
            <UserBadges badges={profile.badges} size="sm" />
          )}
          {profile?.youtube_channel?.show_icon && profile?.youtube_channel?.url && (
            <a href={profile.youtube_channel.url} target="_blank" rel="noopener noreferrer">
              <Youtube className="w-4 h-4 text-red-500" />
            </a>
          )}
        </div>
        
        <p className="text-sm text-zinc-500">@{profile?.username || 'unknown'}</p>
        
        {profile?.pronouns && (
          <p className="text-xs text-zinc-600 mt-0.5">{profile.pronouns}</p>
        )}

        {/* Custom status */}
        {profile?.custom_status?.text && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-white/5 rounded-lg">
            {profile.custom_status.emoji && (
              <span>{profile.custom_status.emoji}</span>
            )}
            <span className="text-sm text-zinc-400">{profile.custom_status.text}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {['about', 'mutual', 'activity'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-medium capitalize transition-colors relative",
              activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: accentColor }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-48 overflow-y-auto">
        {activeTab === 'about' && (
          <div className="space-y-3">
            {profile?.bio && (
              <p className="text-sm text-zinc-400">{profile.bio}</p>
            )}
            
            {/* Social links */}
            {profile?.social_links && Object.keys(profile.social_links).some(k => profile.social_links[k]) && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(profile.social_links).map(([platform, value]) => (
                  value && (
                    <SocialLink
                      key={platform}
                      platform={platform}
                      url={value.startsWith('http') ? value : `https://${value}`}
                      username={value.split('/').pop()}
                    />
                  )
                ))}
              </div>
            )}

            {/* Member since */}
            {profile?.created_date && (
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <Calendar className="w-3 h-3" />
                <span>Kairo member since {format(new Date(profile.created_date), 'MMM yyyy')}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'mutual' && (
          <div className="space-y-4">
            {/* Mutual servers */}
            {mutualServers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase mb-2">
                  Mutual Servers — {mutualServers.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mutualServers.slice(0, 6).map(server => (
                    <div
                      key={server.id}
                      className="w-9 h-9 rounded-xl overflow-hidden bg-white/5"
                    >
                      {server.icon_url ? (
                        <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                          {server.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mutual friends */}
            {mutualFriends.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase mb-2">
                  Mutual Friends — {mutualFriends.length}
                </p>
                <div className="flex -space-x-2">
                  {mutualFriends.slice(0, 8).map(friend => (
                    <div
                      key={friend.id}
                      className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#111113] bg-zinc-700"
                    >
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                          {friend.display_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mutualServers.length === 0 && mutualFriends.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No mutual connections</p>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            {profile?.rich_presence?.name ? (
              <RichPresence activity={profile.rich_presence} />
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">No current activity</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="flex items-center gap-2 p-4 border-t border-white/[0.06]">
          <Button
            onClick={onMessage}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          
          {isFriend ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-white/10">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1a1a1c] border-white/[0.08]">
                <DropdownMenuItem onClick={onViewProfile} className="text-zinc-300 focus:text-white focus:bg-white/5">
                  View Full Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem onClick={onRemoveFriend} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove Friend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBlock} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                  <Shield className="w-4 h-4 mr-2" />
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onAddFriend}
              variant="outline"
              className="border-white/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Friend
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}