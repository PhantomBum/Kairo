import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Compass, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    { icon: Users, label: 'Add Friend', onClick: onAddFriend, color: 'indigo' },
    { icon: Compass, label: 'Discover Servers', onClick: onDiscover, color: 'purple' },
    { icon: ShoppingBag, label: 'Browse Shop', onClick: onShop, color: 'pink' }
  ] : [
    { icon: Users, label: 'Invite People', onClick: onInvite, color: 'indigo' },
    { icon: Zap, label: 'Create Server', onClick: onCreateServer, color: 'purple' },
    { icon: ShoppingBag, label: 'Browse Shop', onClick: onShop, color: 'pink' }
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-[#121214]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg px-6"
      >
        {/* Logo */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
            <span className="text-5xl font-bold text-white">K</span>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-3">
          {isDMs ? 'Your Messages' : 'Welcome to Kairo'}
        </h2>

        {/* Description */}
        <p className="text-zinc-400 mb-8 leading-relaxed">
          {isDMs 
            ? 'Connect with friends, start conversations, and build your community. Add a friend to get started.' 
            : 'Select a channel to start chatting, or create a new server to begin building your community.'}
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Button
                onClick={action.onClick}
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-500 uppercase font-semibold mb-4">Why Kairo?</p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Rich Messaging</p>
                <p className="text-xs text-zinc-500">Polls, embeds, reactions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Customize</p>
                <p className="text-xs text-zinc-500">Themes, effects, badges</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}