import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '@/components/kairo/v4/primitives/Avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hook to track read receipts
export function useReadReceipts(channelId, conversationId, currentUserId) {
  const queryClient = useQueryClient();

  // Mark messages as read when viewing
  const markReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const targetId = channelId || conversationId;
      const targetType = channelId ? 'channel' : 'conversation';
      
      // Check if already read
      const existing = await base44.entities.ReadReceipt?.filter({
        user_id: currentUserId,
        message_id: messageId,
      });
      
      if (existing?.length > 0) return;
      
      return base44.entities.ReadReceipt?.create({
        user_id: currentUserId,
        message_id: messageId,
        [`${targetType}_id`]: targetId,
        read_at: new Date().toISOString(),
      });
    },
  });

  // Get read receipts for messages
  const { data: receipts = [] } = useQuery({
    queryKey: ['readReceipts', channelId || conversationId],
    queryFn: async () => {
      const targetId = channelId || conversationId;
      const targetType = channelId ? 'channel_id' : 'conversation_id';
      return base44.entities.ReadReceipt?.filter({ [targetType]: targetId }) || [];
    },
    enabled: !!(channelId || conversationId),
    staleTime: 30000,
  });

  const markAsRead = (messageId) => {
    if (messageId && currentUserId) {
      markReadMutation.mutate(messageId);
    }
  };

  const getReaders = (messageId) => {
    return receipts.filter(r => r.message_id === messageId);
  };

  return { markAsRead, getReaders, receipts };
}

// Read receipt indicator for DMs
export function ReadReceiptIndicator({ message, readers, isOwn }) {
  if (!isOwn) return null;
  
  const otherReaders = readers.filter(r => r.user_id !== message.author_id);
  const isRead = otherReaders.length > 0;
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn(
            'ml-1',
            isRead ? 'text-indigo-400' : 'text-zinc-500'
          )}>
            {isRead ? (
              <CheckCheck className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#111113] border-white/[0.08]">
          <span className="text-xs">
            {isRead ? 'Read' : 'Delivered'}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Multiple readers indicator (for group DMs)
export function ReadersAvatars({ readers, maxDisplay = 3 }) {
  if (readers.length === 0) return null;
  
  const displayReaders = readers.slice(0, maxDisplay);
  const remaining = readers.length - maxDisplay;
  
  return (
    <div className="flex items-center -space-x-1">
      {displayReaders.map((reader, i) => (
        <Avatar
          key={reader.user_id || i}
          src={reader.user_avatar}
          name={reader.user_name}
          size="xs"
          className="border border-[#09090b]"
        />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-zinc-500 ml-1">+{remaining}</span>
      )}
    </div>
  );
}

// Component to mark message as read on visibility
export function MarkAsReadOnView({ messageId, onMarkRead }) {
  useEffect(() => {
    // Use IntersectionObserver to mark as read when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onMarkRead?.(messageId);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [messageId, onMarkRead]);

  return null;
}