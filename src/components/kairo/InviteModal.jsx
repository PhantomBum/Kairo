import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, RefreshCw, Clock, Users, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InviteModal({ isOpen, onClose, server, inviteCode }) {
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState('7d');
  const [maxUses, setMaxUses] = useState('unlimited');

  const inviteLink = `https://kairo.app/invite/${inviteCode || server?.invite_code || 'XXXXX'}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Invite friends to {server?.name}</h2>
                <p className="text-sm text-zinc-500">Share this link to invite people</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Invite link */}
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="flex-1 bg-zinc-900 border-zinc-800 text-white font-mono text-sm"
            />
            <Button
              onClick={handleCopy}
              className={cn(
                "min-w-[80px] transition-all",
                copied 
                  ? "bg-emerald-500 hover:bg-emerald-600" 
                  : "bg-indigo-500 hover:bg-indigo-600"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires After
              </label>
              <Select value={expiry} onValueChange={setExpiry}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="30m">30 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="6h">6 hours</SelectItem>
                  <SelectItem value="12h">12 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-zinc-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Max Uses
              </label>
              <Select value={maxUses} onValueChange={setMaxUses}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="unlimited">No limit</SelectItem>
                  <SelectItem value="1">1 use</SelectItem>
                  <SelectItem value="5">5 uses</SelectItem>
                  <SelectItem value="10">10 uses</SelectItem>
                  <SelectItem value="25">25 uses</SelectItem>
                  <SelectItem value="50">50 uses</SelectItem>
                  <SelectItem value="100">100 uses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate new link */}
          <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
            Generate a new link
          </button>
        </div>

        {/* Share options */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            Your invite link expires in 7 days
          </p>
        </div>
      </motion.div>
    </div>
  );
}