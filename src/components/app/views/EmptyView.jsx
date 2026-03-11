import React from 'react';
import { Plus, LogIn } from 'lucide-react';

export default function EmptyView({ onCreateServer, onJoinServer }) {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'var(--accent-dim)' }}>
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>K</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to Kairo</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          A place to talk, collaborate, and build communities.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onCreateServer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            <Plus className="w-4 h-4" /> Create Server
          </button>
          <button onClick={onJoinServer}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <LogIn className="w-4 h-4" /> Join Server
          </button>
        </div>
      </div>
    </div>
  );
}