import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Zap, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BotAnalytics({ bot }) {
  const [installations, setInstallations] = useState([]);

  useEffect(() => {
    const load = async () => {
      const installs = await base44.entities.BotInstallation.filter({ bot_id: bot.id });
      setInstallations(installs);
    };
    load();
  }, [bot.id]);

  const stats = [
    { icon: Users, label: 'Servers', value: bot.server_count || 0, color: 'var(--accent-blue)' },
    { icon: Zap, label: 'Total Uses', value: bot.usage_count || 0, color: 'var(--accent-green)' },
    { icon: BarChart3, label: 'Commands', value: bot.commands?.length || 0, color: 'var(--accent-amber)' },
    { icon: AlertCircle, label: 'Avg Rating', value: bot.avg_rating?.toFixed(1) || '—', color: 'var(--accent-purple)' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Bot Analytics</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-bold" style={{ color: 'var(--text-cream)' }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Command usage breakdown */}
      {bot.commands?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Commands</h4>
          <div className="space-y-2">
            {bot.commands.map(cmd => (
              <div key={cmd.id} className="flex items-center justify-between py-1.5">
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-primary)' }}>/{cmd.name || 'unnamed'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: cmd.enabled ? 'rgba(123,201,164,0.1)' : 'rgba(201,123,123,0.1)', color: cmd.enabled ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {cmd.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Server installations */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Installations ({installations.length})</h4>
        {installations.length === 0 ? (
          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>No servers have installed this bot yet.</p>
        ) : (
          <div className="space-y-2">
            {installations.map(inst => (
              <div key={inst.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>Server {inst.server_id}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{new Date(inst.installed_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {bot.reviews?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Reviews</h4>
          <div className="space-y-3">
            {bot.reviews.map((r, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-glass-strong)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-cream)' }}>{r.user_name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--accent-amber)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}