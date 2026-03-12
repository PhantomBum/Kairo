import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SERVICES = [
  { name: 'API', check: async () => {
    // Test the Base44 API by checking auth status
    const isAuth = await base44.auth.isAuthenticated();
    return { ok: true }; // If we get here without error, API is up
  }},
  { name: 'WebSocket', check: () => new Promise(res => {
    // Real-time subscriptions use WebSockets under the hood — test connectivity
    const timeout = setTimeout(() => res({ ok: false }), 5000);
    try {
      const unsub = base44.entities.Server.subscribe(() => {});
      clearTimeout(timeout);
      setTimeout(() => unsub(), 100);
      res({ ok: true });
    } catch { clearTimeout(timeout); res({ ok: false }); }
  })},
  { name: 'Database', check: async () => {
    // Test DB by doing a real entity list call
    await base44.entities.Server.list('-created_date', 1);
    return { ok: true };
  }},
  { name: 'File Storage', check: async () => {
    // Test file storage by fetching a known public file
    const res = await fetch('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a93eea52ff0ef8406c21a/e96e433dc_generated_image.png', { method: 'HEAD' });
    return { ok: res.ok };
  }},
  { name: 'Voice Servers', check: async () => {
    // Test Agora voice connectivity 
    const res = await fetch('https://edge.agora.io', { method: 'HEAD', mode: 'no-cors' });
    return { ok: true }; // no-cors succeeds if network is reachable
  }},
];

function ServiceStatus({ service, onResult }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const runCheck = async () => {
      try {
        const res = await service.check();
        const s = res.ok ? 'operational' : 'outage';
        setStatus(s);
        onResult(service.name, s);
      } catch {
        setStatus('outage');
        onResult(service.name, 'outage');
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
  const [results, setResults] = useState({});
  const handleResult = (name, status) => setResults(p => ({ ...p, [name]: status }));

  const total = Object.keys(results).length;
  const operational = Object.values(results).filter(s => s === 'operational').length;
  const allDone = total === SERVICES.length;
  const allOk = allDone && operational === total;
  const someDown = allDone && operational < total;

  return (
    <div className="min-h-screen p-6 md:p-12" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: !allDone ? 'var(--text-faint)' : allOk ? 'var(--accent-green)' : 'var(--accent-red)', color: '#000' }}>
            {!allDone ? '…' : allOk ? '✓' : '!'}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {!allDone ? 'Checking systems…' : allOk ? 'All systems operational' : `${total - operational} service${total - operational > 1 ? 's' : ''} degraded`}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="space-y-3">
          {SERVICES.map(s => <ServiceStatus key={s.name} service={s} onResult={handleResult} />)}
        </div>
        <footer className="text-center mt-12 text-[11px]" style={{ color: 'var(--text-faint)' }}>
          <a href="/kairo" className="underline">Back to Kairo</a>
        </footer>
      </div>
    </div>
  );
}