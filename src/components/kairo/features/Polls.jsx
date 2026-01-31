import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart3, Plus, X, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/kairo/v4/primitives/Modal';
import Button from '@/components/kairo/v4/primitives/Button';
import Input from '@/components/kairo/v4/primitives/Input';

// Create poll modal
export function CreatePollModal({ isOpen, onClose, channelId, serverId, currentUser }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [duration, setDuration] = useState(24); // hours
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) throw new Error('Need at least 2 options');
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + duration);
      
      // Create poll as a special message type
      return base44.entities.Message.create({
        channel_id: channelId,
        server_id: serverId,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        content: question,
        type: 'poll',
        embeds: [{
          type: 'poll',
          question,
          options: validOptions.map((text, i) => ({
            id: i,
            text,
            votes: [],
          })),
          allow_multiple: allowMultiple,
          expires_at: expiresAt.toISOString(),
          total_votes: 0,
        }],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
      onClose();
      setQuestion('');
      setOptions(['', '']);
    },
  });

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Poll"
      icon={<BarChart3 className="w-5 h-5" />}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
          >
            Create Poll
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Question
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Options
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-zinc-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addOption}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.1]"
            />
            <span className="text-sm text-zinc-300">Allow multiple votes</span>
          </label>
          
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm"
          >
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>1 day</option>
            <option value={72}>3 days</option>
            <option value={168}>1 week</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// Poll display in message
export function PollEmbed({ poll, messageId, currentUserId, onVote }) {
  const isExpired = new Date(poll.expires_at) < new Date();
  const hasVoted = poll.options.some(o => o.votes?.includes(currentUserId));
  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes?.length || 0), 0);

  const handleVote = async (optionId) => {
    if (isExpired) return;
    
    // Toggle vote
    const option = poll.options[optionId];
    const hasVotedThis = option.votes?.includes(currentUserId);
    
    const newOptions = poll.options.map((o, i) => {
      if (i === optionId) {
        return {
          ...o,
          votes: hasVotedThis
            ? o.votes.filter(v => v !== currentUserId)
            : [...(o.votes || []), currentUserId],
        };
      }
      // Remove from other options if not allowing multiple
      if (!poll.allow_multiple && !hasVotedThis) {
        return {
          ...o,
          votes: (o.votes || []).filter(v => v !== currentUserId),
        };
      }
      return o;
    });

    onVote?.(messageId, { ...poll, options: newOptions });
  };

  return (
    <div className="mt-2 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-white">{poll.question}</span>
      </div>
      
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const voteCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          const hasVotedThis = option.votes?.includes(currentUserId);
          
          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={isExpired}
              className={cn(
                'relative w-full text-left p-3 rounded-lg overflow-hidden transition-all',
                hasVotedThis 
                  ? 'bg-indigo-500/20 border border-indigo-500/40' 
                  : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06]',
                isExpired && 'cursor-default'
              )}
            >
              {/* Progress bar */}
              {(hasVoted || isExpired) && (
                <div 
                  className="absolute inset-y-0 left-0 bg-indigo-500/10 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {hasVotedThis && <Check className="w-4 h-4 text-indigo-400" />}
                  <span className="text-sm text-white">{option.text}</span>
                </div>
                {(hasVoted || isExpired) && (
                  <span className="text-xs text-zinc-400">
                    {voteCount} ({Math.round(percentage)}%)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
        <span className="text-xs text-zinc-500">{totalVotes} votes</span>
        {isExpired ? (
          <span className="text-xs text-zinc-500">Poll ended</span>
        ) : (
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ends {new Date(poll.expires_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}