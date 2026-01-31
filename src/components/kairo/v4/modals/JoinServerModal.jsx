import React, { useState } from 'react';
import { Link2, Check, AlertCircle, Compass, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';
import Input from '../primitives/Input';

export default function JoinServerModal({ isOpen, onClose, onJoin, onDiscover }) {
  const [inviteCode, setInviteCode] = useState('');
  const [status, setStatus] = useState(null); // null | 'joining' | 'success' | 'error'
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;

    // Extract invite code from URL if needed
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
      setTimeout(() => {
        handleClose();
      }, 1500);
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

  const handleDiscover = () => {
    handleClose();
    onDiscover?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join a Server"
      description="Enter an invite link or code"
      icon={<Link2 className="w-5 h-5" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={!inviteCode.trim() || status === 'joining'}
            loading={status === 'joining'}
          >
            {status === 'success' ? (
              <>
                <Check className="w-4 h-4 mr-1.5" />
                Joined!
              </>
            ) : (
              'Join Server'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            Invite Link
          </label>
          <Input
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
              setStatus(null);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="https://kairo.app/invite/abc123"
            error={!!error}
            autoFocus
          />
        </div>

        {/* Error message */}
        {status === 'error' && error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        {/* Examples */}
        <div className="text-xs text-zinc-600">
          <p className="font-medium mb-1">Invites should look like:</p>
          <code className="text-zinc-500">https://kairo.app/invite/abc123</code>
          <br />
          <code className="text-zinc-500">abc123</code>
        </div>

        {/* Discover link */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={handleDiscover}
            className="w-full flex items-center justify-center gap-2 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Explore public servers</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}