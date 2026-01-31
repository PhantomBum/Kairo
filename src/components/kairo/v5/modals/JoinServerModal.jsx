import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check, AlertCircle, Compass, Loader2, X } from 'lucide-react';

export default function JoinServerModal({ isOpen, onClose, onJoin, onDiscover }) {
  const [inviteCode, setInviteCode] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    let code = inviteCode.trim();
    if (code.includes('kairo.app/invite/')) {
      code = code.split('kairo.app/invite/')[1]?.split(/[?#]/)[0] || code;
    }
    if (code.includes('/')) {
      code = code.split('/').pop() || code;
    }

    setStatus('joining');
    setError('');

    try {
      await onJoin(code);
      setStatus('success');
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Invalid invite code');
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setStatus(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md mx-4 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 pb-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Join a Server</h2>
          <p className="text-sm text-zinc-500 mt-1">Enter an invite link or code</p>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
              Invite Link
            </label>
            <input
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value);
                setStatus(null);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="https://kairo.app/invite/abc123"
              autoFocus
              className="w-full h-11 px-4 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {status === 'error' && error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          <div className="text-xs text-zinc-600">
            <p className="font-medium mb-1">Invites should look like:</p>
            <code className="text-zinc-500">https://kairo.app/invite/abc123</code>
            <span className="mx-2">or</span>
            <code className="text-zinc-500">abc123</code>
          </div>

          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 h-10 text-sm text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!inviteCode.trim() || status === 'joining'}
              className="flex-1 h-10 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'joining' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  Joined!
                </>
              ) : (
                'Join Server'
              )}
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.06]">
            <button
              onClick={() => { handleClose(); onDiscover?.(); }}
              className="w-full flex items-center justify-center gap-2 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span className="text-sm font-medium">Explore public servers</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}