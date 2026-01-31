import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { 
  Reply, MoreHorizontal, Smile, Pin, Pencil, Trash2, 
  Copy, Forward, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserBadges from './UserBadges';
import CrossAppIndicator from './crossapp/CrossAppIndicator';
import EditMessageModal from './chat/EditMessageModal';
import UserProfilePopup from './chat/UserProfilePopup';

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '💯'];

function formatMessageDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function DateDivider({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';
  else label = format(d, 'EEEE, MMMM d');

  return (
    <div className="flex items-center gap-4 py-4 px-4">
      <div className="flex-1 h-px bg-white/[0.04]" />
      <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

function MessageActions({ message, onReply, onEditClick, onDelete, onReact, onPin, isOwn }) {
  return (
    <div className="absolute -top-2 right-4 opacity-0 group-hover:opacity-100 transition-all">
      <div className="flex items-center bg-[#111113] border border-white/[0.06] rounded shadow-xl p-0.5 gap-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors">
              <Smile className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1.5 bg-[#111113] border-white/[0.06] rounded-lg" align="end">
            <div className="flex gap-0.5">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-sm transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <button 
          onClick={() => onReply?.(message)}
          className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        {isOwn && (
          <button 
            onClick={() => onEditClick?.(message)}
            className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1 bg-[#111113] border-white/[0.06] rounded-lg" align="end">
            <button 
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 rounded transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-500" />
              Copy Text
            </button>
            <button 
              onClick={() => onPin?.(message)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 rounded transition-colors"
            >
              <Pin className="w-3.5 h-3.5 text-zinc-500" />
              {message.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            {isOwn && (
              <button 
                onClick={() => onDelete?.(message.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// Parse mentions in content
function renderContentWithMentions(content, onMentionClick) {
  if (!content) return null;
  
  // Regex to find @mentions
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    
    // Add mention as clickable span
    const mentionName = match[1];
    parts.push(
      <span
        key={match.index}
        onClick={(e) => { e.stopPropagation(); onMentionClick?.(mentionName); }}
        className="text-violet-400 bg-violet-500/20 px-1 rounded cursor-pointer hover:bg-violet-500/30 transition-colors"
      >
        @{mentionName}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : content;
}

function MessageItem({ message, showHeader, onReply, onEditClick, onDelete, onReact, onPin, onThread, onForward, currentUserId, onAvatarClick, onMentionClick }) {
  const isOwn = message.author_id === currentUserId;
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group relative px-4 py-1 hover:bg-white/[0.02] transition-all",
            showHeader && "mt-3 pt-2",
            message.is_pinned && "bg-amber-500/5 border-l-2 border-amber-500/50"
          )}
        >
          {/* Reply reference */}
          {message.reply_preview && (
            <div className="flex items-center gap-2 mb-2.5 pl-14">
              <div className="w-5 h-5 border-l-2 border-t-2 border-zinc-700/50 rounded-tl-xl" />
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/40 rounded-xl text-sm border border-zinc-800/30">
                <span className="text-violet-400 font-semibold">@{message.reply_preview.author_name}</span>
                <span className="text-zinc-500 truncate max-w-[200px]">{message.reply_preview.content?.slice(0, 50)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {/* Avatar */}
            {showHeader ? (
              <div 
                onClick={() => onAvatarClick?.(message)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 overflow-hidden flex-shrink-0 cursor-pointer"
              >
                {message.author_avatar ? (
                  <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {message.author_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-9 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {format(new Date(message.created_date), 'h:mm')}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {showHeader && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span 
                    onClick={() => onAvatarClick?.(message)}
                    className="font-medium text-white hover:underline cursor-pointer text-sm"
                  >
                    {message.author_name || 'Unknown'}
                  </span>
                  <UserBadges 
                    badges={message.author_badges} 
                    size="xs"
                    showYoutube={message.author_youtube_show_icon}
                    youtubeUrl={message.author_youtube_url}
                  />
                  <span className="text-[10px] text-zinc-600">
                    {formatMessageDate(message.created_date)}
                  </span>
                  {message.is_edited && (
                    <span className="text-[10px] text-zinc-600">(edited)</span>
                  )}
                  {message.is_pinned && (
                    <Pin className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              )}
              
              <div className="text-zinc-300 break-words whitespace-pre-wrap text-sm leading-relaxed">
                {renderContentWithMentions(message.content, onMentionClick)}
              </div>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachments.map((attachment, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl overflow-hidden max-w-md"
                    >
                      {attachment.content_type?.startsWith('image/') ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="max-h-80 rounded-2xl border border-zinc-800/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        />
                      ) : (
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-zinc-800/40 rounded-2xl hover:bg-zinc-800/60 transition-all border border-zinc-800/30 group/attachment"
                        >
                          <div className="w-11 h-11 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover/attachment:bg-violet-500/30 transition-colors">
                            📄
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{attachment.filename}</div>
                            <div className="text-xs text-zinc-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reactions - Kloak style */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((reaction, i) => (
                    <button
                      key={i}
                      onClick={() => onReact?.(message.id, reaction.emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all",
                        reaction.users?.includes(currentUserId)
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="font-medium">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MessageActions
            message={message}
            onReply={onReply}
            onEditClick={onEditClick}
            onDelete={onDelete}
            onReact={onReact}
            onPin={onPin}
            isOwn={isOwn}
          />
        </div>
        </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.06] rounded-lg p-1">
        <ContextMenuItem 
          onClick={() => onReply?.(message)}
          className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
        >
          <Reply className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onThread?.(message)}
          className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          Create Thread
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(message.content)}
          className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
        >
          <Copy className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          Copy Text
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onPin?.(message)}
          className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
        >
          <Pin className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          {message.is_pinned ? 'Unpin Message' : 'Pin Message'}
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onForward?.(message)}
          className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
        >
          <Forward className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          Forward
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-white/[0.04] my-1" />
            <ContextMenuItem 
              onClick={() => onEditClick?.(message)}
              className="text-zinc-400 focus:bg-white/[0.04] focus:text-white rounded px-3 py-1.5 text-xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-2 text-zinc-600" />
              Edit
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => onDelete?.(message.id)}
              className="text-red-400 focus:bg-red-500/10 rounded px-3 py-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function MessageList({ 
  messages = [], 
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onThread,
  onForward,
  isLoading,
  members = [],
  onStartDM,
  onAddFriend,
  sharedServers = [],
  roles = []
}) {
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  const shouldShowHeader = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (prevMessage.author_id !== message.author_id) return true;
    const timeDiff = new Date(message.created_date) - new Date(prevMessage.created_date);
    if (timeDiff > 5 * 60 * 1000) return true;
    return false;
  };

  const shouldShowDateDivider = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return !isSameDay(new Date(message.created_date), new Date(prevMessage.created_date));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-zinc-600" />
            </div>
            <p className="text-lg font-medium text-zinc-400 mb-1">No messages yet</p>
            <p className="text-sm text-zinc-600">Be the first to start the conversation</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {shouldShowDateDivider(message, index) && (
                  <DateDivider date={message.created_date} />
                )}
                <MessageItem
                  message={message}
                  showHeader={shouldShowHeader(message, index)}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEditClick={setEditingMessage}
                  onDelete={onDelete}
                  onReact={onReact}
                  onPin={onPin}
                  onThread={onThread}
                  onForward={onForward}
                  onAvatarClick={(msg) => {
                    // Find member info for the author
                    const member = members.find(m => 
                      m.user_id === msg.author_id || m.id === msg.author_id
                    );
                    setProfileUser(member || {
                      user_id: msg.author_id,
                      display_name: msg.author_name,
                      avatar_url: msg.author_avatar,
                      badges: msg.author_badges,
                      created_date: msg.created_date
                    });
                  }}
                  onMentionClick={(name) => {
                    const member = members.find(m => 
                      (m.display_name || m.user_name || m.nickname || '').toLowerCase() === name.toLowerCase()
                    );
                    if (member) {
                      setProfileUser(member);
                    }
                  }}
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
          )}
          </div>

          <EditMessageModal
            isOpen={!!editingMessage}
            onClose={() => setEditingMessage(null)}
            message={editingMessage}
            onSave={onEdit}
          />

          <UserProfilePopup
            user={profileUser}
            isOpen={!!profileUser}
            onClose={() => setProfileUser(null)}
            onMessage={onStartDM}
            onAddFriend={onAddFriend}
            sharedServers={sharedServers}
            roles={roles.filter(r => profileUser?.role_ids?.includes(r.id))}
            currentUserId={currentUserId}
          />
          </div>
          );
          }