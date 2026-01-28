import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link2, Check, AlertCircle, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JoinServerModal({ isOpen, onClose, onJoin, onDiscover }) {
  const [inviteLink, setInviteLink] = useState('');
  const [status, setStatus] = useState(null); // null | 'joining' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteLink.trim()) return;

    // Extract invite code from link
    const code = inviteLink.includes('kairo.app/invite/') 
      ? inviteLink.split('kairo.app/invite/')[1]?.split(/[?#]/)[0]
      : inviteLink.trim();

    setStatus('joining');
    setError('');

    try {
      await onJoin?.(code);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setInviteLink('');
        setStatus(null);
      }, 1500);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Invalid invite link');
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
            <Link2 className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Join a Server</h2>
          <p className="text-sm text-zinc-500">
            Enter an invite below to join an existing server
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
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">
                Invite Link
              </label>
              <Input
                value={inviteLink}
                onChange={(e) => {
                  setInviteLink(e.target.value);
                  setStatus(null);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="https://kairo.app/invite/abc123"
                className={cn(
                  "w-full h-12 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600",
                  status === 'success' && "border-emerald-500",
                  status === 'error' && "border-red-500"
                )}
              />
            </div>

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

            <div className="text-xs text-zinc-500">
              <p className="font-medium mb-1">Invites should look like:</p>
              <code className="text-zinc-400">https://kairo.app/invite/abc123</code><br />
              <code className="text-zinc-400">abc123</code>
            </div>

            <Button
              onClick={handleJoin}
              disabled={!inviteLink.trim() || status === 'joining'}
              className={cn(
                "w-full h-11",
                status === 'success' 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-indigo-500 hover:bg-indigo-600"
              )}
            >
              {status === 'joining' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </div>
              ) : status === 'success' ? (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Joined!
                </div>
              ) : (
                'Join Server'
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
          <button
            onClick={() => { onClose(); onDiscover?.(); }}
            className="w-full flex items-center justify-center gap-2 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Don't have an invite? Explore public servers</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}