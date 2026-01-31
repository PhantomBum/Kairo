import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Users, Mic, Video, Shield, Zap, 
  ChevronRight, Sparkles, Globe, Lock, Eye
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Real-time Messaging',
    description: 'Instant messages with rich media, reactions, threads, and full message history.',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    icon: Mic,
    title: 'Crystal Clear Voice',
    description: 'Low-latency voice channels with screen sharing and video support.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: Users,
    title: 'Server Communities',
    description: 'Create custom servers with channels, roles, and powerful moderation tools.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    icon: Eye,
    title: 'Listen Mode',
    description: 'Unique to Kairo: Join voice channels invisibly to listen without being seen.',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Ghost mode, focus mode, and granular privacy controls for complete control.',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Optimized for performance with instant load times and smooth interactions.',
    color: 'from-violet-500 to-purple-600'
  }
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <feature.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('KairoV4'));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <span className="text-xl font-semibold text-white">Kairo</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to={createPageUrl('Kairo')}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
            >
              Open Kairo
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Next-generation communication platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Where communities
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              come alive
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Kairo is a free, real-time communication platform designed for communities of all sizes. 
            Clean, minimal, and incredibly powerful.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to={createPageUrl('Kairo')}
              className="group flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
            >
              Launch Kairo
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 bg-zinc-800/50 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-700 transition-all">
              <Globe className="w-5 h-5" />
              Explore Servers
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent to-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Kairo is built from the ground up with features that matter, designed to be 
              functionally deeper and visually superior.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Kairo Exclusive</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Features you won't find anywhere else
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Voice Listen Mode</h3>
                    <p className="text-zinc-400 text-sm">Join voice channels invisibly to listen without being seen. Perfect for moderators or just checking in.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Ghost Mode</h3>
                    <p className="text-zinc-400 text-sm">Go completely invisible across all servers. Full privacy when you need it.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Focus Mode</h3>
                    <p className="text-zinc-400 text-sm">Dim the UI and suppress non-urgent notifications. Stay focused on what matters.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800 p-8 flex items-center justify-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/25">
                  <span className="text-6xl font-bold text-white">K</span>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to experience Kairo?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Join the next generation of communication. It's free, it's fast, and it's waiting for you.
            </p>
            <Link
              to={createPageUrl('Kairo')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-sm text-zinc-500">© 2024 Kairo. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}