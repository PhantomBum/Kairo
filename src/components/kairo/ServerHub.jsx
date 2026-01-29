import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, TrendingUp, Clock, Users as UsersIcon,
  Zap, Target, Globe, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function ServerCard({ server, onJoin, onPreview }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer h-full flex flex-col">
        {/* Banner */}
        <div 
          className="h-36 relative overflow-hidden"
          style={{
            background: server.banner_url 
              ? `url(${server.banner_url}) center/cover`
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
          
          {/* Floating action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            className="absolute top-3 right-3"
          >
            <Button
              onClick={() => onPreview?.(server)}
              size="sm"
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-0"
            >
              Preview
            </Button>
          </motion.div>

          {/* Icon */}
          <div className="absolute -bottom-8 left-4">
            <div className="w-16 h-16 rounded-2xl border-4 border-zinc-900 overflow-hidden shadow-xl">
              {server.icon_url ? (
                <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {server.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 pt-10">
          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {server.name}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
            {server.description || 'No description available'}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {Math.floor(Math.random() * (server.member_count || 100) * 0.3)} online
            </span>
            <span className="flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5" />
              {server.member_count || 0} members
            </span>
          </div>

          {/* Join button */}
          <Button
            onClick={() => onJoin?.(server)}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
            size="sm"
          >
            Join Workspace
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServerHub({ servers = [], onJoinServer, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('members'); // 'members' | 'recent' | 'name'
  const [viewMode, setViewMode] = useState('featured'); // 'featured' | 'all'

  // Filter servers
  const filteredServers = servers
    .filter(s => 
      s.is_public && 
      (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'members') return (b.member_count || 0) - (a.member_count || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  const featuredServers = filteredServers.filter(s => s.member_count > 500);
  const displayServers = viewMode === 'featured' ? featuredServers : filteredServers;

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b] overflow-hidden">
      {/* Header */}
      <div className="relative border-b border-zinc-800/50">
        <div className="relative h-44" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
        }}>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          
          <div className="relative h-full flex flex-col justify-end p-6 pb-20">
            <h1 className="text-4xl font-bold text-white mb-2">Server Hub</h1>
            <p className="text-zinc-300">Discover and join active workspaces</p>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/95 to-transparent">
          <div className="flex items-center gap-3 max-w-6xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces by name or description..."
                className="w-full h-12 pl-12 bg-zinc-900/90 backdrop-blur-sm border-zinc-800 text-white placeholder-zinc-500"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-12 bg-zinc-900/90 backdrop-blur-sm border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setViewMode('featured')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'featured' 
                  ? "bg-indigo-500 text-white" 
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <Zap className="w-4 h-4" />
              Featured
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewMode === 'all' 
                  ? "bg-indigo-500 text-white" 
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <Globe className="w-4 h-4" />
              All Workspaces
            </button>
            <div className="flex-1" />
            <span className="text-sm text-zinc-500">
              {displayServers.length} workspace{displayServers.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grid */}
          {displayServers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onJoin={onJoinServer}
                  onPreview={onJoinServer}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Target className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">
                {searchQuery ? 'No workspaces found' : 'No public workspaces yet'}
              </h3>
              <p className="text-sm mb-6">
                {searchQuery ? 'Try a different search term' : 'Create your own to get started'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}