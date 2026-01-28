import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Users, Hash, Volume2, Calendar, Shield, ChevronRight,
  Eye, Clock, Globe, Lock, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function ServerPreviewModal({ 
  server, 
  isOpen, 
  onClose, 
  onJoin,
  isJoining
}) {
  const [activeTab, setActiveTab] = useState('about');

  // Fetch server channels for preview
  const { data: channels = [] } = useQuery({
    queryKey: ['previewChannels', server?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  // Fetch server members preview
  const { data: members = [] } = useQuery({
    queryKey: ['previewMembers', server?.id],
    queryFn: async () => {
      const allMembers = await base44.entities.ServerMember.filter({ server_id: server.id });
      return allMembers.slice(0, 20); // Only show first 20
    },
    enabled: !!server?.id && isOpen
  });

  // Fetch upcoming events
  const { data: events = [] } = useQuery({
    queryKey: ['previewEvents', server?.id],
    queryFn: () => base44.entities.Event.filter({ server_id: server.id, status: 'scheduled' }),
    enabled: !!server?.id && isOpen
  });

  if (!isOpen || !server) return null;

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Banner */}
        <div 
          className="h-40 relative flex-shrink-0"
          style={{
            background: server.banner_url 
              ? `url(${server.banner_url}) center/cover`
              : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Preview badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-white">Server Preview</span>
          </div>
        </div>

        {/* Server info */}
        <div className="px-6 -mt-12 relative z-10 flex-shrink-0">
          <div className="flex items-end gap-4">
            {/* Icon */}
            <div className="w-24 h-24 rounded-2xl border-4 border-[#121214] overflow-hidden bg-zinc-800 shadow-lg">
              {server.icon_url ? (
                <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {server.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Name & stats */}
            <div className="flex-1 pb-2">
              <h2 className="text-2xl font-bold text-white mb-1">{server.name}</h2>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {Math.floor(Math.random() * (server.member_count || 100))} online
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {server.member_count || 0} members
                </span>
                {server.is_public && (
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Globe className="w-4 h-4" />
                    Public
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex gap-4 border-b border-zinc-800 flex-shrink-0">
          {['about', 'channels', 'members', 'events'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-sm font-medium capitalize transition-colors relative",
                activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {server.description && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">About</h3>
                  <p className="text-zinc-300">{server.description}</p>
                </div>
              )}

              {/* Features */}
              {server.features?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {server.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-800/30 rounded-lg text-center">
                  <Hash className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xl font-semibold text-white">{textChannels.length}</p>
                  <p className="text-xs text-zinc-500">Text Channels</p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg text-center">
                  <Volume2 className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xl font-semibold text-white">{voiceChannels.length}</p>
                  <p className="text-xs text-zinc-500">Voice Channels</p>
                </div>
                <div className="p-4 bg-zinc-800/30 rounded-lg text-center">
                  <Calendar className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xl font-semibold text-white">{events.length}</p>
                  <p className="text-xs text-zinc-500">Upcoming Events</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="space-y-4">
              {textChannels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Text Channels</h3>
                  <div className="space-y-1">
                    {textChannels.slice(0, 10).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg"
                      >
                        <Hash className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300">{channel.name}</span>
                        {channel.is_private && <Lock className="w-3 h-3 text-zinc-600 ml-auto" />}
                      </div>
                    ))}
                    {textChannels.length > 10 && (
                      <p className="text-sm text-zinc-500 text-center py-2">
                        +{textChannels.length - 10} more channels
                      </p>
                    )}
                  </div>
                </div>
              )}

              {voiceChannels.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Voice Channels</h3>
                  <div className="space-y-1">
                    {voiceChannels.slice(0, 5).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg"
                      >
                        <Volume2 className="w-4 h-4 text-zinc-500" />
                        <span className="text-zinc-300">{channel.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="grid grid-cols-2 gap-2">
                {members.map((member, i) => (
                  <div
                    key={member.id || i}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                        {(member.nickname || member.user_email?.charAt(0))?.charAt(0)}
                      </div>
                    </div>
                    <span className="text-sm text-zinc-300 truncate">
                      {member.nickname || member.user_email?.split('@')[0]}
                    </span>
                  </div>
                ))}
              </div>
              {server.member_count > 20 && (
                <p className="text-sm text-zinc-500 text-center mt-4">
                  +{server.member_count - 20} more members
                </p>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-zinc-800/30 rounded-lg"
                    >
                      <h4 className="font-semibold text-white mb-1">{event.name}</h4>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Join button */}
        <div className="p-6 border-t border-zinc-800 flex-shrink-0">
          <Button
            onClick={onJoin}
            disabled={isJoining}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-lg font-semibold"
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Join Server
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}