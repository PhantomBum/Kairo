import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Search, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddFriendModal({ isOpen, onClose, onSendRequest }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!username.trim()) return;

    setStatus('sending');
    setError('');

    try {
      await onSendRequest?.(username.trim());
      setStatus('success');
      setTimeout(() => {
        setUsername('');
        setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Could not send friend request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Add Friend</h2>
          <p className="text-sm text-zinc-500">
            You can add friends with their Kairo username.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setStatus(null);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Enter a username"
                className={cn(
                  "w-full h-12 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 pr-24",
                  status === 'success' && "border-emerald-500 focus:ring-emerald-500",
                  status === 'error' && "border-red-500 focus:ring-red-500"
                )}
              />
              <Button
                onClick={handleSend}
                disabled={!username.trim() || status === 'sending'}
                className={cn(
                  "absolute right-1.5 top-1.5 h-9",
                  status === 'success' 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-indigo-500 hover:bg-indigo-600"
                )}
              >
                {status === 'sending' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : status === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-400 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Friend request sent to {username}
              </motion.p>
            )}

            {status === 'error' && error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            💡 Tip: You can also right-click on a user to add them as a friend
          </p>
        </div>
      </motion.div>
    </div>
  );
}