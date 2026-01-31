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
    <div className="flex-1 flex items-center justify-center bg-[#111111] relative overflow-hidden">
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 text-center max-w-lg px-6"
      >
        {/* Simple logo */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto backdrop-blur-sm">
            <Zap className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-semibold text-white mb-3">
          {isDMs ? 'Your Space' : 'Welcome'}
        </h2>
        <p className="text-sm text-zinc-500 mb-10 max-w-sm mx-auto">
          {isDMs 
            ? 'Connect with friends and start conversations.' 
            : 'Select a channel to get started.'}
        </p>

        {/* Quick Actions - Glass cards */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={action.onClick}
              className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 group-hover:bg-white/[0.08] transition-colors">
                <action.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Minimal branding */}
        <div className="mt-12 text-[11px] text-zinc-600">
          Kairo
        </div>
      </motion.div>
    </div>
  );
}