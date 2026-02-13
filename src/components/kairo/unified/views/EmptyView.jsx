import React from 'react';
import { Plus, Compass, Sparkles, ArrowRight } from 'lucide-react';

export default function EmptyView({ onCreateServer, onJoinServer }) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#0e0e0e' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 relative"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <span className="text-4xl font-black text-white">K</span>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome to Kairo</h2>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">Select a conversation or join a server to start chatting with your friends.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onCreateServer}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Plus className="w-4 h-4" /> Create Server
          </button>
          <button onClick={onJoinServer}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:shadow-lg"
            style={{ background: '#fff' }}>
            <Compass className="w-4 h-4" /> Join Server <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}