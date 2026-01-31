import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Check, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function PollDisplay({ poll, currentUserId, onVote }) {
  const [showVoters, setShowVoters] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  const totalVotes = useMemo(() => {
    return poll.options.reduce((sum, opt) => sum + (opt.count || opt.votes?.length || 0), 0);
  }, [poll.options]);

  const hasVoted = useMemo(() => {
    return poll.options.some(opt => opt.votes?.includes(currentUserId));
  }, [poll.options, currentUserId]);

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  const handleVote = (optionIndex) => {
    if (hasVoted || isExpired) return;
    
    if (poll.settings?.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(optionIndex) 
          ? prev.filter(i => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      onVote([optionIndex]);
    }
  };

  const submitMultipleVotes = () => {
    if (selectedOptions.length > 0) {
      onVote(selectedOptions);
      setSelectedOptions([]);
    }
  };

  const getPercentage = (option) => {
    const votes = option.count || option.votes?.length || 0;
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  const getUserVote = (option) => {
    return option.votes?.includes(currentUserId);
  };

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden max-w-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{poll.question}</p>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </span>
            {poll.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {isExpired ? 'Ended' : `Ends ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option);
          const isSelected = selectedOptions.includes(index);
          const userVoted = getUserVote(option);
          const showResults = hasVoted || isExpired;

          return (
            <motion.button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted || isExpired}
              className={cn(
                "w-full relative rounded-lg overflow-hidden transition-all",
                "border",
                isSelected ? "border-indigo-500" : "border-white/[0.06]",
                !hasVoted && !isExpired && "hover:border-white/20 cursor-pointer",
                (hasVoted || isExpired) && "cursor-default"
              )}
              whileTap={!hasVoted && !isExpired ? { scale: 0.98 } : {}}
            >
              {/* Background progress bar */}
              {showResults && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-y-0 left-0",
                    userVoted ? "bg-indigo-500/20" : "bg-white/5"
                  )}
                />
              )}

              <div className="relative flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  {/* Checkbox/Radio indicator */}
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                    poll.settings?.allowMultiple ? "rounded" : "rounded-full",
                    isSelected || userVoted 
                      ? "bg-indigo-500 border-indigo-500" 
                      : "border-white/20 bg-white/5"
                  )}>
                    {(isSelected || userVoted) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm",
                    userVoted ? "text-white font-medium" : "text-zinc-300"
                  )}>
                    {option.text}
                  </span>
                </div>

                {showResults && (
                  <span className={cn(
                    "text-sm font-medium",
                    userVoted ? "text-indigo-400" : "text-zinc-500"
                  )}>
                    {percentage}%
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit button for multiple votes */}
      {poll.settings?.allowMultiple && !hasVoted && !isExpired && selectedOptions.length > 0 && (
        <div className="px-3 pb-3">
          <button
            onClick={submitMultipleVotes}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Submit Votes ({selectedOptions.length})
          </button>
        </div>
      )}

      {/* Voters list toggle */}
      {!poll.settings?.anonymous && totalVotes > 0 && (
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setShowVoters(!showVoters)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <span>View voters</span>
            {showVoters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showVoters && (
            <div className="px-4 pb-3 space-y-2">
              {poll.options.map((option, index) => (
                option.votes?.length > 0 && (
                  <div key={index} className="text-xs">
                    <span className="text-zinc-400">{option.text}:</span>
                    <span className="text-zinc-500 ml-2">
                      {option.voter_names?.join(', ') || `${option.votes.length} voters`}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}