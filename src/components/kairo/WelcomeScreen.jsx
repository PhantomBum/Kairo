import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Compass, ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WelcomeScreen({ 
  view, 
  onAddFriend, 
  onInvite, 
  onDiscover, 
  onShop, 
  onCreateServer 
}) {
  const isDMs = view === 'dms';

  const quickActions = isDMs ? [
    { icon: Users, label: 'Add Friend', description: 'Connect with people', onClick: onAddFriend },
    { icon: Compass, label: 'Discover', description: 'Find communities', onClick: onDiscover },
    { icon: ShoppingBag, label: 'Shop', description: 'Get premium items', onClick: onShop }
  ] : [
    { icon: Users, label: 'Invite', description: 'Bring your friends', onClick: onInvite },
    { icon: Zap, label: 'Create', description: 'Start a new space', onClick: onCreateServer },
    { icon: ShoppingBag, label: 'Shop', description: 'Customize everything', onClick: onShop }
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 text-center max-w-md px-6"
      >
        {/* Simple icon */}
        <div className="mb-6">
          <div className="w-14 h-14 rounded-xl bg-[#111113] border border-white/[0.06] flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 text-zinc-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-medium text-white mb-2">
          {isDMs ? 'Your Space' : 'Welcome'}
        </h2>
        <p className="text-sm text-zinc-600 mb-8 max-w-xs mx-auto">
          {isDMs 
            ? 'Connect with friends and start conversations.' 
            : 'Select a channel to get started.'}
        </p>

        {/* Quick Actions - Matte black cards */}
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              onClick={action.onClick}
              className="group p-3 rounded-lg bg-[#111113] border border-white/[0.04] hover:border-white/[0.08] hover:bg-[#141416] transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.03] flex items-center justify-center mx-auto mb-2 group-hover:bg-white/[0.06] transition-colors">
                <action.icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>
              <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Minimal branding */}
        <div className="mt-10 text-[10px] text-zinc-700 tracking-wide">
          KAIRO
        </div>
      </motion.div>
    </div>
  );
}