import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, Pin, Tag, Eye, Clock, 
  ThumbsUp, MessageCircle, ChevronRight, Search, Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Button from '@/components/kairo/v4/primitives/Button';
import Input from '@/components/kairo/v4/primitives/Input';
import Avatar from '@/components/kairo/v4/primitives/Avatar';
import Modal from '@/components/kairo/v4/primitives/Modal';

// Create forum post modal
export function CreatePostModal({ isOpen, onClose, channelId, serverId, currentUser, tags = [] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create thread for the post
      const thread = await base44.entities.Thread.create({
        channel_id: channelId,
        server_id: serverId,
        name: title,
        created_by: currentUser.id,
        is_forum_post: true,
        tags: selectedTags,
        message_count: 1,
        last_message_at: new Date().toISOString(),
      });
      
      // Create initial message
      await base44.entities.Message.create({
        channel_id: channelId,
        server_id: serverId,
        thread_id: thread.id,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        content,
        type: 'thread_starter',
      });
      
      return thread;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts', channelId] });
      onClose();
      setTitle('');
      setContent('');
      setSelectedTags([]);
    },
  });

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Post"
      icon={<MessageSquare className="w-5 h-5" />}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            disabled={!title.trim() || !content.trim()}
          >
            Post
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
          />
        </div>
        
        {tags.length > 0 && (
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
              Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    selectedTags.includes(tag)
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                      : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.06]'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            className="w-full h-48 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

// Forum post card
function PostCard({ post, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-lg text-left transition-all group"
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={post.author_avatar}
          name={post.author_name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-indigo-400">
              {post.name}
            </h3>
            {post.is_pinned && <Pin className="w-3 h-3 text-amber-400" />}
          </div>
          
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 bg-white/[0.04] text-[10px] text-zinc-400 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.message_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.last_message_at || post.created_date), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
      </div>
    </button>
  );
}

// Forum channel view
export function ForumChannelView({ channel, serverId, currentUser, onPostSelect }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, top
  const [showCreate, setShowCreate] = useState(false);
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forumPosts', channel.id],
    queryFn: () => base44.entities.Thread.filter({
      channel_id: channel.id,
      is_forum_post: true,
    }),
    enabled: !!channel.id,
  });

  const filteredPosts = posts
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date);
      }
      return (b.message_count || 0) - (a.message_count || 0);
    });

  // Pinned posts first
  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{channel.name}</h2>
            {channel.description && (
              <p className="text-sm text-zinc-500">{channel.description}</p>
            )}
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Post
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm"
          >
            <option value="latest">Latest Activity</option>
            <option value="top">Most Replies</option>
          </select>
        </div>
      </div>
      
      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-sm text-zinc-500 mb-4">Be the first to start a discussion!</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {pinnedPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => onPostSelect(post)} />
            ))}
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => onPostSelect(post)} />
            ))}
          </div>
        )}
      </div>
      
      <CreatePostModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        channelId={channel.id}
        serverId={serverId}
        currentUser={currentUser}
        tags={channel.available_tags || []}
      />
    </div>
  );
}