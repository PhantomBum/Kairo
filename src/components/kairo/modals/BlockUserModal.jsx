import React from 'react';
import { motion } from 'framer-motion';
import { X, Ban, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlockUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onBlock,
  isBlocking
}) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Ban className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Block {user.name || user.friend_name}?</h2>
              <p className="text-sm text-zinc-500">This action can be undone</p>
            </div>
          </div>

          <div className="p-4 bg-zinc-800/30 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-zinc-400">
                <p className="mb-2">Blocking {user.name || user.friend_name} will:</p>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Remove them from your friends list</li>
                  <li>Prevent them from sending you messages</li>
                  <li>Prevent them from adding you as a friend</li>
                  <li>Hide their messages in shared servers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => onBlock?.(user)}
              disabled={isBlocking}
              className="bg-red-500 hover:bg-red-600"
            >
              {isBlocking ? 'Blocking...' : 'Block User'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}