import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Radio, Megaphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PollMessage({ poll, onVote }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h4 className="font-semibold text-white">{poll.question}</h4>
      </div>
      <div className="space-y-2">
        {poll.options?.map((option, i) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === i;
          
          return (
            <button
              key={i}
              onClick={() => {
                setSelectedOption(i);
                onVote?.(i);
              }}
              className={cn(
                "w-full relative overflow-hidden rounded-lg border-2 transition-all",
                isSelected ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div 
                className="absolute inset-0 bg-indigo-500/20 transition-all"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative px-4 py-3 flex items-center justify-between">
                <span className="font-medium text-white">{option.text}</span>
                <span className="text-sm text-zinc-400">{percentage.toFixed(0)}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 mt-3">{totalVotes} votes • {poll.endsAt ? 'Ends ' + new Date(poll.endsAt).toLocaleDateString() : 'No end date'}</p>
    </div>
  );
}

export function AnnouncementMessage({ announcement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 rounded-r-xl p-4 my-2"
    >
      <div className="flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{announcement.title}</h4>
          <p className="text-sm text-zinc-300">{announcement.content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SystemPrompt({ prompt, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900/50 border border-amber-500/50 rounded-xl p-4 my-2"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white mb-3">{prompt.message}</p>
          <div className="flex gap-2">
            {prompt.actions?.map((action, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => onAction?.(action.id)}
                variant={action.primary ? "default" : "outline"}
                className={action.primary ? "bg-indigo-500 hover:bg-indigo-600" : ""}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}