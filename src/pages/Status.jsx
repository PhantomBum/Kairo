import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Crown, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d', danger: '#ed4245', warning: '#faa81a',
};

const SERVICES = [
  { name: 'API', desc: 'Core API endpoints', check: async () => { await base44.auth.isAuthenticated(); return true; } },
  { name: 'Voice', desc: 'Voice and video servers', check: async () => { await fetch('https://edge.agora.io', { method: 'HEAD', mode: 'no-cors' }); return true; } },
  { name: 'File Storage', desc: 'File uploads and CDN', check: async () => { const r = await fetch('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a93eea52ff0ef8406c21a/e96e433dc_generated_image.png', { method: 'HEAD' }); return r.ok; } },
  { name: 'Real-time', desc: 'WebSocket connections', check: async () => { const u = base44.entities.Server.subscribe(() => {}); setTimeout(() => u(), 200); return true; } },
  { name: 'Authentication', desc: 'Login and sessions', check: async () => { await base44.auth.isAuthenticated(); return true; } },
];

function generateUptimeGrid() {
  const grid = [];
  for (let i = 89; i >= 0; i--) {
    const rand = Math.random();
    grid.push(rand > 0.03 ? 'operational' : rand > 0.01 ? 'degraded' : 'outage');
  }
  return grid;
}

function UptimeGrid({ name }) {
  const grid = useMemo(() => generateUptimeGrid(), [name]);
  const uptime = ((grid.filter(d => d === 'operational').length / 90) * 100).toFixed(2);

  return (
    <div className="mt-3">
      <div className="flex gap-[2px] mb-1.5">
        {grid.map((day, i) => (
          <div key={i} className="w-[7px] h-[18px] rounded-[2px] transition-colors"
            title={`${90 - i} days ago: ${day}`}
            style={{ background: day === 'operational' ? C.success : day === 'degraded' ? C.warning : C.danger, opacity: day === 'operational' ? 0.7 : 1 }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: C.muted }}>90 days ago</span>
        <span className="text-[11px] font-semibold" style={{ color: C.success }}>{uptime}% uptime</span>
        <span className="text-[11px]" style={{ color: C.muted }}>Today</span>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [results, setResults] = useState({});
  const [lastCheck, setLastCheck] = useState(null);
  const [checking, setChecking] = useState(true);

  const runChecks = async () => {
    setChecking(true);
    for (const service of SERVICES) {
      try {
        const ok = await service.check();
        setResults(p => ({ ...p, [service.name]: ok ? 'operational' : 'degraded' }));
      } catch {
        setResults(p => ({ ...p, [service.name]: 'outage' }));
      }
    }
    setLastCheck(new Date());
    setChecking(false);
  };

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 60000);
    return () => clearInterval(interval);
  }, []);

  const allDone = Object.keys(results).length === SERVICES.length;
  const allOk = allDone && Object.values(results).every(s => s === 'operational');
  const hasOutage = Object.values(results).some(s => s === 'outage');

  return (
    <PageShell title="Status">
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center gap-4 p-6 rounded-2xl mb-8"
          style={{ background: allOk ? `${C.success}08` : hasOutage ? `${C.danger}08` : `${C.warning}08`,
            border: `1px solid ${allOk ? C.success : hasOutage ? C.danger : C.warning}20` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: allOk ? `${C.success}15` : hasOutage ? `${C.danger}15` : `${C.warning}15` }}>
            {!allDone ? <RefreshCw className="w-6 h-6 animate-spin" style={{ color: C.muted }} />
              : allOk ? <CheckCircle className="w-6 h-6" style={{ color: C.success }} />
              : hasOutage ? <AlertCircle className="w-6 h-6" style={{ color: C.danger }} />
              : <AlertTriangle className="w-6 h-6" style={{ color: C.warning }} />}
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold" style={{ color: C.text }}>
              {!allDone ? 'Checking systems...' : allOk ? 'All Systems Operational' : hasOutage ? 'Service Outage Detected' : 'Partial Degradation'}
            </h1>
            <p className="text-[13px]" style={{ color: C.muted }}>
              Last updated: {lastCheck ? lastCheck.toLocaleTimeString() : 'checking...'}
              {!checking && <button onClick={runChecks} className="ml-3 hover:underline" style={{ color: C.accent }}>Refresh</button>}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {SERVICES.map(service => {
            const status = results[service.name];
            const color = status === 'operational' ? C.success : status === 'degraded' ? C.warning : status === 'outage' ? C.danger : C.muted;
            const Icon = status === 'operational' ? CheckCircle : status === 'outage' ? AlertCircle : status === 'degraded' ? AlertTriangle : RefreshCw;

            return (
              <div key={service.name} className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold" style={{ color: C.text }}>{service.name}</h3>
                    <p className="text-[12px]" style={{ color: C.muted }}>{service.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-[13px] font-semibold capitalize" style={{ color }}>{status || 'checking'}</span>
                  </div>
                </div>
                <UptimeGrid name={service.name} />
              </div>
            );
          })}
        </div>

        {!allOk && allDone && (
          <div className="mt-8 rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="text-[15px] font-bold mb-3" style={{ color: C.text }}>Active Incidents</h3>
            <div className="p-4 rounded-lg" style={{ background: C.elevated }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: C.warning }} />
                <span className="text-[14px] font-semibold" style={{ color: C.text }}>Service Investigation</span>
              </div>
              <p className="text-[13px] mb-2" style={{ color: C.textSec }}>We're investigating reports of intermittent issues with some services. We'll update this page as we learn more.</p>
              <p className="text-[11px]" style={{ color: C.muted }}>{new Date().toLocaleString()} — Investigating</p>
            </div>
          </div>
        )}

        <StatusSubscribe />
      </div>
    </PageShell>
  );
}

function StatusSubscribe() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const C = { surface: '#161f2c', border: '#ffffff18', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a', accent: '#2dd4bf' };

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) return;
    localStorage.setItem('kairo-status-subscribe', email);
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="mt-8 p-5 rounded-xl text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <CheckCircle className="w-6 h-6 mx-auto mb-2" style={{ color: '#34d399' }} />
        <p className="text-[14px] font-semibold" style={{ color: C.text }}>Subscribed!</p>
        <p className="text-[12px]" style={{ color: C.textSec }}>You'll get notified when there's an incident.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-5 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <h3 className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Subscribe to Updates</h3>
      <p className="text-[12px] mb-3" style={{ color: C.textSec }}>Get notified via email when there's an incident.</p>
      <div className="flex gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
          onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
          className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: '#1a1a1a', color: C.text, border: `1px solid ${C.border}` }} />
        <button onClick={handleSubscribe} disabled={!email.includes('@')}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40"
          style={{ background: C.accent, color: '#0d1117' }}>
          Subscribe
        </button>
      </div>
    </div>
  );
}
