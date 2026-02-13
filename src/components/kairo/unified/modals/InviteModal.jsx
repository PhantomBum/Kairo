import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Link } from 'lucide-react';

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const link = `kairo.app/invite/${server.invite_code}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">Invite Friends</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-5">Share this invite to bring friends to <span className="text-white font-medium">{server.name}</span></p>
          
          {/* Invite code */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Link className="w-4 h-4 text-zinc-600 flex-shrink-0" />
              <span className="text-sm text-white font-mono tracking-wider flex-1">{server.invite_code}</span>
            </div>
            <button onClick={() => handleCopy(server.invite_code)}
              className="h-[50px] px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
              style={{ background: copied ? '#22c55e' : '#fff', color: copied ? '#fff' : '#000' }}>
              {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          
          <p className="text-[11px] text-zinc-600 mt-3">Or share the full link: <span className="text-zinc-400 font-mono">{link}</span></p>
        </div>
      </motion.div>
    </motion.div>
  );
}