import React from 'react';
import { Plus, Compass, Bot, Crown, HelpCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function EmptyView({ onCreateServer, onJoinServer }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl glass mx-auto mb-6 flex items-center justify-center" style={{ boxShadow: 'var(--shadow-glow)' }}>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-faint)', fontFamily: 'monospace' }}>K</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Welcome to Kairo</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Select a conversation or server to get started.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onCreateServer} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
            <Plus className="w-4 h-4" /> Create Server
          </button>
          <button onClick={onJoinServer} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all glass hover:bg-[var(--bg-glass-hover)]"
            style={{ color: 'var(--text-secondary)' }}>
            <Compass className="w-4 h-4" /> Join Server
          </button>
        </div>
        <div className="flex gap-3 justify-center mt-4">
          <a href={createPageUrl('BotMarketplace')} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg glass hover:bg-[var(--bg-glass-hover)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Bot className="w-3.5 h-3.5" /> Bots
          </a>
          <a href={createPageUrl('Elite')} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg glass hover:bg-[var(--bg-glass-hover)] transition-colors" style={{ color: 'var(--accent-amber)' }}>
            <Crown className="w-3.5 h-3.5" /> Elite
          </a>
          <a href={createPageUrl('FAQ')} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg glass hover:bg-[var(--bg-glass-hover)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <HelpCircle className="w-3.5 h-3.5" /> Help
          </a>
        </div>
      </div>
    </div>
  );
}