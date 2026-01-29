import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Link2, Copy, Check, Settings, Users, Shield,
  Clock, Infinity, RefreshCw, X, ExternalLink, QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Generate invite link modal
export function CreateInviteModal({ server, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState(`kairo.app/invite/${server?.invite_code}`);
  const [expiry, setExpiry] = useState('never');
  const [maxUses, setMaxUses] = useState('unlimited');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [grantedRole, setGrantedRole] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', server?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  const generateNewCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteLink(`kairo.app/invite/${code}`);
    // In production, save this to the server entity
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !server) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Invite People</h2>
                <p className="text-sm text-zinc-500">{server.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Invite link */}
          <div className="mb-4">
            <Label className="text-zinc-400 mb-2 block">Invite Link</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center px-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                <span className="text-zinc-300 truncate">{inviteLink}</span>
              </div>
              <Button
                onClick={handleCopy}
                className={cn(
                  "px-4 transition-colors",
                  copied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-indigo-500 hover:bg-indigo-600"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Quick share */}
          <div className="flex gap-2 mb-6">
            <Button
              variant="secondary"
              className="flex-1 bg-zinc-800 hover:bg-zinc-700"
              onClick={generateNewCode}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Link
            </Button>
            <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced settings toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-4"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>

          {/* Advanced settings */}
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-zinc-800 pt-4"
            >
              {/* Expiry */}
              <div>
                <Label className="text-zinc-400 mb-2 block">Link Expires After</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="30min">30 minutes</SelectItem>
                    <SelectItem value="1hr">1 hour</SelectItem>
                    <SelectItem value="6hr">6 hours</SelectItem>
                    <SelectItem value="12hr">12 hours</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max uses */}
              <div>
                <Label className="text-zinc-400 mb-2 block">Max Number of Uses</Label>
                <Select value={maxUses} onValueChange={setMaxUses}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="1">1 use</SelectItem>
                    <SelectItem value="5">5 uses</SelectItem>
                    <SelectItem value="10">10 uses</SelectItem>
                    <SelectItem value="25">25 uses</SelectItem>
                    <SelectItem value="50">50 uses</SelectItem>
                    <SelectItem value="100">100 uses</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Granted role */}
              <div>
                <Label className="text-zinc-400 mb-2 block">Grant Role on Join</Label>
                <Select value={grantedRole || ''} onValueChange={setGrantedRole}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="No role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value={null}>No role</SelectItem>
                    {roles.filter(r => !r.is_default).map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <span style={{ color: role.color }}>{role.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* Summary */}
          <div className="mt-4 p-3 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {expiry === 'never' ? 'Never expires' : `Expires in ${expiry}`}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {maxUses === 'unlimited' ? 'Unlimited uses' : `${maxUses} uses`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Join server by invite modal
export function JoinByInviteModal({ isOpen, onClose, onJoin, isJoining }) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);
  const [serverPreview, setServerPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const extractCode = (input) => {
    // Handle full URLs or just codes - more flexible matching
    const urlMatch = input.match(/kairo\.app\/invite\/([A-Z0-9]+)/i);
    if (urlMatch) return urlMatch[1].toUpperCase();
    // Just return the cleaned input as a code
    return input.trim().toUpperCase();
  };

  const previewServer = async () => {
    const code = extractCode(inviteCode);
    if (!code || code.length < 2) {
      setError('Please enter a valid invite code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const servers = await base44.entities.Server.filter({ invite_code: code });
      
      if (servers.length === 0) {
        setError('Invalid invite code or server not found');
        setServerPreview(null);
      } else {
        setServerPreview(servers[0]);
        setError(null);
      }
    } catch (err) {
      setError('Failed to lookup server');
      setServerPreview(null);
    }
    setIsLoading(false);
  };

  const handleJoin = () => {
    if (serverPreview) {
      onJoin?.(serverPreview.invite_code);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (serverPreview) {
        handleJoin();
      } else {
        previewServer();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Join a Server</h2>
                <p className="text-sm text-zinc-500">Enter an invite link or code</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-zinc-400 mb-2 block">Invite Link or Code</Label>
              <Input
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setServerPreview(null);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="https://kairo.app/invite/ABC123 or ABC123"
                className="bg-zinc-900 border-zinc-800 text-white"
              />
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
            </div>

            {/* Server preview */}
            {serverPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-zinc-800/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-700">
                    {serverPreview.icon_url ? (
                      <img src={serverPreview.icon_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold">
                        {serverPreview.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{serverPreview.name}</h3>
                    <p className="text-sm text-zinc-400">
                      {serverPreview.member_count || 0} members
                    </p>
                  </div>
                </div>
                {serverPreview.description && (
                  <p className="text-sm text-zinc-400 mt-3">{serverPreview.description}</p>
                )}
              </motion.div>
            )}

            <div className="flex gap-2">
              {!serverPreview ? (
                <Button
                  onClick={previewServer}
                  disabled={!inviteCode.trim() || isLoading}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                >
                  {isLoading ? 'Looking up...' : 'Preview Server'}
                </Button>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {isJoining ? 'Joining...' : 'Join Server'}
                </Button>
              )}
            </div>

            <p className="text-xs text-zinc-500 text-center">
              Invites look like: <span className="text-zinc-400">kairo.app/invite/ABC123</span> or just <span className="text-zinc-400">ABC123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}