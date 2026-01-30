import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Search, X, Hash, Users, MessageSquare, AtSign,
  Clock, ArrowRight, Filter, Calendar, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const searchFilters = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'channels', label: 'Channels', icon: Hash },
];

function SearchResult({ result, onClick }) {
  const icons = {
    message: MessageSquare,
    user: User,
    channel: Hash,
    server: Users
  };
  const Icon = icons[result.type] || Search;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(result)}
      className="w-full flex items-start gap-3 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
        result.type === 'message' && "bg-indigo-500/20 text-indigo-400",
        result.type === 'user' && "bg-purple-500/20 text-purple-400",
        result.type === 'channel' && "bg-emerald-500/20 text-emerald-400"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {result.type === 'message' ? result.author_name : result.content}
        </p>
        {result.type === 'message' && (
          <p className="text-sm text-zinc-400 line-clamp-2">{result.content}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {result.metadata?.channel_name && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {result.metadata.channel_name}
            </span>
          )}
          {result.metadata?.date && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(result.metadata.date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-2" />
    </motion.button>
  );
}

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  serverId,
  onResultClick 
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [fromUser, setFromUser] = useState('');
  const [inChannel, setInChannel] = useState('');
  const [dateRange, setDateRange] = useState('any');
  const [showFilters, setShowFilters] = useState(false);
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search messages
  const { data: messageResults = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['searchMessages', serverId, query, fromUser, inChannel, dateRange],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      // Build filter
      const filters = { server_id: serverId, is_deleted: false };
      if (fromUser) filters.author_name = { $regex: fromUser, $options: 'i' };
      if (inChannel) filters.channel_id = inChannel;
      
      const messages = await base44.entities.Message.filter(filters, '-created_date', 50);
      
      // Client-side content search
      return messages
        .filter(m => m.content?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20)
        .map(m => ({
          type: 'message',
          reference_id: m.id,
          content: m.content,
          author_id: m.author_id,
          author_name: m.author_name,
          channel_id: m.channel_id,
          metadata: {
            date: m.created_date
          }
        }));
    },
    enabled: !!query && query.length >= 2 && (filter === 'all' || filter === 'messages')
  });

  // Search users
  const { data: userResults = [] } = useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const profiles = await base44.entities.UserProfile.list('-created_date', 100);
      return profiles
        .filter(p => 
          p.display_name?.toLowerCase().includes(query.toLowerCase()) ||
          p.username?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(p => ({
          type: 'user',
          reference_id: p.id,
          content: p.display_name || p.username,
          metadata: {
            avatar: p.avatar_url,
            username: p.username
          }
        }));
    },
    enabled: !!query && query.length >= 2 && (filter === 'all' || filter === 'users')
  });

  // Search channels
  const { data: channelResults = [] } = useQuery({
    queryKey: ['searchChannels', serverId, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const channels = await base44.entities.Channel.filter({ server_id: serverId });
      return channels
        .filter(c => c.name?.toLowerCase().includes(query.toLowerCase()))
        .map(c => ({
          type: 'channel',
          reference_id: c.id,
          content: c.name,
          metadata: {
            type: c.type
          }
        }));
    },
    enabled: !!query && query.length >= 2 && (filter === 'all' || filter === 'channels')
  });

  // Combine results
  const allResults = [
    ...(filter === 'all' || filter === 'messages' ? messageResults : []),
    ...(filter === 'all' || filter === 'users' ? userResults : []),
    ...(filter === 'all' || filter === 'channels' ? channelResults : [])
  ];

  const recentSearches = ['from:admin', 'has:image', 'in:general'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-[10vh]">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Search Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages, users, channels..."
              className="pl-10 pr-10 h-12 text-lg bg-zinc-800 border-zinc-700 text-white"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-3">
            {searchFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                  filter === f.id 
                    ? "bg-indigo-500/20 text-indigo-400" 
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                )}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
                showFilters ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-zinc-800">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">From User</label>
                    <Input
                      value={fromUser}
                      onChange={(e) => setFromUser(e.target.value)}
                      placeholder="Username"
                      className="h-8 text-sm bg-zinc-800 border-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Date Range</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="day">Past 24 hours</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Has</label>
                    <Select>
                      <SelectTrigger className="h-8 text-sm bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Anything" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="any">Anything</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="embed">Embed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!query ? (
            <div className="p-4">
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-3">Recent Searches</p>
              <div className="space-y-1">
                {recentSearches.map((search, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(search)}
                    className="flex items-center gap-2 w-full p-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    {search}
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-3 mt-6">Search Tips</p>
              <div className="space-y-2 text-sm text-zinc-400">
                <p><code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">from:user</code> - Search by author</p>
                <p><code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">in:channel</code> - Search in channel</p>
                <p><code className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs">has:image</code> - Messages with images</p>
              </div>
            </div>
          ) : allResults.length > 0 ? (
            <div className="space-y-1">
              {allResults.map((result, i) => (
                <SearchResult
                  key={`${result.type}-${result.reference_id}-${i}`}
                  result={result}
                  onClick={(r) => {
                    onResultClick?.(r);
                    onClose();
                  }}
                />
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">No results found for "{query}"</p>
              <p className="text-sm text-zinc-600 mt-1">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500">Type at least 2 characters to search</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">Enter</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">Esc</kbd> Close
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}