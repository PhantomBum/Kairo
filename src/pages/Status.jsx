import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const SERVICES = [
  { name: 'API', check: () => fetch('https://api.base44.com/health') },
  { name: 'WebSocket', check: () => new Promise(res => {
    const ws = new WebSocket('wss://ws.base44.com');
    ws.onopen = () => { ws.close(); res({ ok: true }); };
    ws.onerror = () => res({ ok: false });
    setTimeout(() => res({ ok: false }), 3000);
  }) },
  { name: 'Database', check: () => fetch('https://db.base44.com/health') },
  { name: 'File Storage', check: () => fetch('https://files.base44.com/health') },
  { name: 'Voice Servers', check: () => fetch('https://voice.base44.com/health') },
];

function ServiceStatus({ service }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const runCheck = async () => {
      try {
        const res = await service.check();
        setStatus(res.ok ? 'operational' : 'outage');
      } catch {
        setStatus('outage');
      }
    };
    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, [service]);

  const color = status === 'operational' ? 'var(--accent-green)' : status === 'outage' ? 'var(--accent-red)' : 'var(--text-faint)';
  const Icon = status === 'operational' ? CheckCircle : status === 'outage' ? AlertCircle : Loader;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl glass">
      <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{service.name}</span>
      <div className="flex items-center gap-2 text-xs font-medium" style={{ color }}>
        <Icon className={`w-3.5 h-3.5 ${status === 'checking' && 'animate-spin'}`} />
        <span className="capitalize">{status}</span>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--accent-green)', color: '#000' }}>✓</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-cream)' }}>All systems operational</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          {SERVICES.map(s => <ServiceStatus key={s.name} service={s} />)}
        </div>
        <footer className="text-center mt-12 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          <a href="/kairo" className="underline">Back to Kairo</a>
        </footer>
      </div>
    </div>
  );
}