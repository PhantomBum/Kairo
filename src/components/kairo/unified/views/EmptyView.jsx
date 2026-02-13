import React from 'react';
import { Plus, Compass } from 'lucide-react';

export default function EmptyView({ onCreateServer, onJoinServer }) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#0e0e0e' }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ background: '#1a1a1a' }}>
          <span className="text-3xl font-bold text-white">K</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Welcome to Kairo</h2>
        <p className="text-sm text-zinc-500 mb-6">Select a conversation or join a server to get started.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onCreateServer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            style={{ background: '#1a1a1a' }}>
            <Plus className="w-4 h-4" /> Create Server
          </button>
          <button onClick={onJoinServer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-black transition-colors"
            style={{ background: '#fff' }}>
            <Compass className="w-4 h-4" /> Join Server
          </button>
        </div>
      </div>
    </div>
  );
}