import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Users, Gamepad2, Code, Sparkles, Music, Film, 
  BookOpen, Palette, Globe, TrendingUp, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'featured', name: 'Featured', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, color: 'from-emerald-500 to-teal-600' },
  { id: 'music', name: 'Music', icon: Music, color: 'from-pink-500 to-rose-600' },
  { id: 'entertainment', name: 'Entertainment', icon: Film, color: 'from-purple-500 to-violet-600' },
  { id: 'education', name: 'Education', icon: BookOpen, color: 'from-blue-500 to-cyan-600' },
  { id: 'science', name: 'Science & Tech', icon: Code, color: 'from-indigo-500 to-purple-600' },
  { id: 'art', name: 'Art & Design', icon: Palette, color: 'from-rose-500 to-pink-600' },
];

function ServerCard({ server, onJoin }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-zinc-800/30 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
    >
      {/* Banner */}
      <div 
        className="h-32 relative"
        style={{
          background: server.banner_url 
            ? `url(${server.banner_url}) center/cover`
            : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
        
        {/* Server icon */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-2xl border-4 border-[#121214] overflow-hidden bg-zinc-800 shadow-lg">
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                {server.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-10">
        <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-indigo-400 transition-colors">
          {server.name}
        </h3>
        <p className="text-sm text-zinc-500 line-clamp-2 mb-4 min-h-[40px]">
          {server.description || 'No description'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {Math.floor(Math.random() * 1000) + 100} online
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {server.member_count || 0} members
            </span>
          </div>
          
          <Button
            onClick={(e) => { e.stopPropagation(); onJoin?.(server); }}
            size="sm"
            className="bg-indigo-500 hover:bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Join
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DiscoverServers({ servers = [], onJoinServer, onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('featured');

  const filteredServers = servers.filter(s => 
    s.is_public && 
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f11] overflow-hidden">
      {/* Header */}
      <div className="relative">
        {/* Banner */}
        <div 
          className="h-48 relative"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>

        {/* Search overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/80 to-transparent">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Discover Servers</h1>
            <p className="text-zinc-400 mb-4">Find communities to join on Kairo</p>
            
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Explore servers"
                className="w-full h-12 pl-12 bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 text-lg backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories sidebar */}
        <div className="w-60 flex-shrink-0 border-r border-zinc-800/50 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  selectedCategory === category.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  category.color
                )}>
                  <category.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Server grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white capitalize flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                {selectedCategory} Servers
              </h2>
            </div>

            {/* Grid */}
            {filteredServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServers.map((server) => (
                  <ServerCard
                    key={server.id}
                    server={server}
                    onJoin={onJoinServer}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Globe className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-zinc-400 mb-2">No servers found</h3>
                <p className="text-sm">Try a different search or check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}