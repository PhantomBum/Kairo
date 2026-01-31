import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Calendar, User, Hash, 
  FileText, Image, Video, Link, X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';
import Input from '../primitives/Input';
import Avatar from '../primitives/Avatar';

export function AdvancedSearchModal({ isOpen, onClose, serverId, onResultClick }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    from: '',
    in: '',
    has: '',
    during: '',
    before: '',
    after: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Search with filters
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['advancedSearch', serverId, query, filters],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const messages = await base44.entities.Message.filter({ 
        server_id: serverId,
        is_deleted: false,
      });
      
      return messages.filter(msg => {
        // Text search
        const matchesQuery = msg.content?.toLowerCase().includes(query.toLowerCase());
        if (!matchesQuery) return false;
        
        // From user filter
        if (filters.from && !msg.author_name?.toLowerCase().includes(filters.from.toLowerCase())) {
          return false;
        }
        
        // In channel filter
        if (filters.in) {
          // Would need to fetch channel and compare names
        }
        
        // Has attachment filter
        if (filters.has) {
          if (filters.has === 'file' && !msg.attachments?.length) return false;
          if (filters.has === 'image' && !msg.attachments?.some(a => a.content_type?.startsWith('image'))) return false;
          if (filters.has === 'video' && !msg.attachments?.some(a => a.content_type?.startsWith('video'))) return false;
          if (filters.has === 'link' && !msg.content?.includes('http')) return false;
        }
        
        // Date filters
        const msgDate = new Date(msg.created_date);
        if (filters.before && msgDate > new Date(filters.before)) return false;
        if (filters.after && msgDate < new Date(filters.after)) return false;
        
        return true;
      }).slice(0, 50);
    },
    enabled: query.trim().length > 0,
  });

  const clearFilter = (key) => {
    setFilters({ ...filters, [key]: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Search"
      icon={<Search className="w-5 h-5" />}
      size="lg"
    >
      <div className="space-y-4">
        {/* Main search */}
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus
          />
          <Button
            variant={showFilters ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Active filters */}
        {Object.entries(filters).some(([_, v]) => v) && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span 
                  key={key}
                  className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full"
                >
                  {key}: {value}
                  <button onClick={() => clearFilter(key)} className="hover:text-indigo-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    placeholder="from: username"
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    value={filters.in}
                    onChange={(e) => setFilters({ ...filters, in: e.target.value })}
                    placeholder="in: channel"
                    leftIcon={<Hash className="w-4 h-4" />}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="date"
                    value={filters.before}
                    onChange={(e) => setFilters({ ...filters, before: e.target.value })}
                    placeholder="Before date"
                  />
                  <Input
                    type="date"
                    value={filters.after}
                    onChange={(e) => setFilters({ ...filters, after: e.target.value })}
                    placeholder="After date"
                  />
                  <select
                    value={filters.has}
                    onChange={(e) => setFilters({ ...filters, has: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm"
                  >
                    <option value="">Has: Any</option>
                    <option value="file">File</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="link">Link</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              {query ? 'No results found' : 'Enter a search query'}
            </div>
          ) : (
            results.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  onResultClick?.(msg);
                  onClose();
                }}
                className="w-full flex items-start gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg text-left transition-colors"
              >
                <Avatar
                  src={msg.author_avatar}
                  name={msg.author_name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">
                      {msg.author_name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-2">
                    {msg.content}
                  </p>
                  {msg.attachments?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <FileText className="w-3 h-3 text-zinc-500" />
                      <span className="text-xs text-zinc-500">
                        {msg.attachments.length} attachment(s)
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

// Search operators helper
export const SEARCH_OPERATORS = [
  { op: 'from:', desc: 'Search messages from a user', example: 'from:username' },
  { op: 'in:', desc: 'Search in a specific channel', example: 'in:general' },
  { op: 'has:', desc: 'Messages with attachments', example: 'has:image' },
  { op: 'before:', desc: 'Before a date', example: 'before:2024-01-01' },
  { op: 'after:', desc: 'After a date', example: 'after:2024-01-01' },
  { op: 'mentions:', desc: 'Mentions a user', example: 'mentions:username' },
  { op: 'pinned:', desc: 'Only pinned messages', example: 'pinned:true' },
];