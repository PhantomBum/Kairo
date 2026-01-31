import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Users, Compass, Gamepad2, Music, Code, Palette, Film, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'development', label: 'Development', icon: Code },
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
];

function ServerCard({ server, onJoin, joining }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors">
      {/* Banner */}
      <div 
        className="h-24"
        style={{ 
          background: server.banner_url 
            ? `url(${server.banner_url}) center/cover`
            : `linear-gradient(135deg, ${server.banner_color || '#6366f1'} 0%, #8b5cf6 100%)`
        }}
      />
      
      <div className="p-4 pt-0 -mt-6">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-[#0c0c0e] p-0.5 mb-3">
          <div className="w-full h-full rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">{server.name?.charAt(0)}</span>
            )}
          </div>
        </div>
        
        {/* Info */}
        <h3 className="font-semibold text-white truncate">{server.name}</h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{server.description || 'No description'}</p>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Users className="w-3.5 h-3.5" />
            <span>{server.member_count?.toLocaleString() || 0} members</span>
          </div>
          
          <button
            onClick={() => onJoin(server)}
            disabled={joining}
            className="px-3 h-7 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverServersModal({ isOpen, onClose, currentUser, onJoinServer }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [joining, setJoining] = useState(null);
  const queryClient = useQueryClient();

  const { data: publicServers = [] } = useQuery({
    queryKey: ['publicServers'],
    queryFn: async () => {
      const servers = await base44.entities.Server.filter({ is_public: true });
      return servers;
    },
    enabled: isOpen,
  });

  const handleJoin = async (server) => {
    setJoining(server.id);
    try {
      // Check if already a member
      const existing = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: currentUser?.id,
      });
      
      if (existing.length === 0) {
        await base44.entities.ServerMember.create({
          server_id: server.id,
          user_id: currentUser?.id,
          user_email: currentUser?.email,
          joined_at: new Date().toISOString(),
        });
        
        await base44.entities.Server.update(server.id, {
          member_count: (server.member_count || 1) + 1,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      onJoinServer?.(server);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setJoining(null);
  };

  const filteredServers = publicServers.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || s.template === category;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl max-h-[80vh] mx-4 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Discover Servers</h2>
              <p className="text-sm text-zinc-500">Find communities to join</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search servers..."
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          
          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                  category === cat.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                )}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredServers.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No servers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onJoin={handleJoin}
                  joining={joining === server.id}
                />
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}