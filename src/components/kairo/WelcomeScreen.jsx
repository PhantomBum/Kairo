import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Compass, ShoppingBag, Sparkles, Zap, ArrowRight, Star, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    { icon: Users, label: 'Add Friend', description: 'Connect with people', onClick: onAddFriend, gradient: 'from-violet-500 to-purple-600' },
    { icon: Compass, label: 'Discover', description: 'Find communities', onClick: onDiscover, gradient: 'from-blue-500 to-cyan-500' },
    { icon: ShoppingBag, label: 'Shop', description: 'Get premium items', onClick: onShop, gradient: 'from-pink-500 to-rose-500' }
  ] : [
    { icon: Users, label: 'Invite', description: 'Bring your friends', onClick: onInvite, gradient: 'from-violet-500 to-purple-600' },
    { icon: Zap, label: 'Create', description: 'Start a new space', onClick: onCreateServer, gradient: 'from-emerald-500 to-teal-500' },
    { icon: ShoppingBag, label: 'Shop', description: 'Customize everything', onClick: onShop, gradient: 'from-pink-500 to-rose-500' }
  ];

  const features = [
    { icon: MessageCircle, label: 'Rich Chat', description: 'Threads, reactions, embeds', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Sparkles, label: 'AI Powered', description: 'Smart features built-in', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Shield, label: 'Secure', description: 'Privacy first always', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Palette, label: 'Customize', description: 'Make it yours', color: 'text-pink-400', bg: 'bg-pink-500/10' }
  ];

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0c0c0e] via-[#121214] to-[#0c0c0e] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-500/5 to-emerald-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 text-center max-w-2xl px-6"
      >
        {/* Logo with glow */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative inline-block mb-10"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl">
              <Zap className="w-12 h-12 text-white" />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-[2.5rem] blur-2xl -z-10" />
            {/* Floating particles */}
            <motion.div
              animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg"
            />
            <motion.div
              animate={{ y: [5, -5, 5], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full shadow-lg"
            />
          </div>
        </motion.div>

        {/* Title with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              {isDMs ? 'Your Space' : 'Welcome to Kairo'}
            </span>
          </h2>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-md mx-auto">
            {isDMs 
              ? 'Connect with friends, share moments, and build meaningful conversations.' 
              : 'Select a channel or create something amazing with your community.'}
          </p>
        </motion.div>

        {/* Quick Actions - Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className="w-full h-full group relative overflow-hidden"
              >
                {/* Card */}
                <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 group-hover:border-white/[0.15] group-hover:bg-white/[0.05]">
                  {/* Gradient overlay on hover */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl",
                    action.gradient
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 mx-auto shadow-lg transition-transform duration-300 group-hover:scale-110",
                    action.gradient
                  )}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Text */}
                  <h3 className="text-lg font-semibold text-white mb-1">{action.label}</h3>
                  <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{action.description}</p>
                  
                  {/* Arrow indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Feature badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02]",
                "hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-default"
              )}
            >
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", feature.bg)}>
                <feature.icon className={cn("w-3.5 h-3.5", feature.color)} />
              </div>
              <span className="text-sm text-zinc-400">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Subtle branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 flex items-center justify-center gap-2 text-zinc-600"
        >
          <Star className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Kairo v5.0 — The Everything Update</span>
          <Star className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>
    </div>
  );
}