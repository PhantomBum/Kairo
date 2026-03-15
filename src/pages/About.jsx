import React from 'react';
import { Heart, Crown, ExternalLink, Copy, Check, Shield, Eye, Lock, DollarSign, Users } from 'lucide-react';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d', danger: '#ed4245',
};

export default function About() {
  const [copied, setCopied] = React.useState(false);
  const cashTag = '$PHXNTOM711';

  return (
    <PageShell title="About">
      <div className="max-w-[680px] mx-auto">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: C.accent, boxShadow: `0 0 60px ${C.accent}30` }}>
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[40px] md:text-[52px] font-extrabold tracking-tight mb-4" style={{ color: C.text }}>
            About Kairo
          </h1>
          <p className="text-[18px] leading-relaxed" style={{ color: C.muted }}>
            A better, private, free alternative to Discord.<br />Built by one person.
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 mb-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h2 className="text-[20px] font-bold mb-4" style={{ color: C.text }}>Hey there.</h2>
          <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: C.textSec }}>
            <p>
              I'm the solo developer behind Kairo.
            </p>
            <p>
              Kairo is completely free to use. Paid options are Lite at $0.99/month and Elite at $2.99/month — and honestly even those exist more as a way for people to support the project than anything else.
            </p>
            <p>
              Elite is not a paywall. Free Kairo is genuinely great and always will be. We also give out Elite for free regularly because the goal was never to make money — it was to build something people actually love.
            </p>
            <p>
              No ads, no data selling, no corporate nonsense.
            </p>
            <p>
              Just a platform that respects you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { icon: Shield, title: 'Privacy First', desc: 'Your data is yours. We never sell it, never will. Secret Key accounts store zero personal information.' },
            { icon: Eye, title: 'Transparency', desc: 'No hidden agendas. No dark patterns. What you see is what you get. We tell you exactly what we collect and why.' },
            { icon: Users, title: 'Community', desc: 'Kairo exists because of its community. Every feature is built because real users asked for it.' },
            { icon: DollarSign, title: 'No Ads. Ever.', desc: 'We will never serve ads. We will never track you for advertisers. That\'s a permanent promise.' },
          ].map((v, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <v.icon className="w-5 h-5 mb-3" style={{ color: C.accent }} />
              <h3 className="text-[15px] font-bold mb-1" style={{ color: C.text }}>{v.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 md:p-8 mb-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h2 className="text-[18px] font-bold mb-4" style={{ color: C.text }}>Support the Project</h2>
          <p className="text-[14px] mb-5" style={{ color: C.muted }}>
            Kairo runs on passion and the generosity of its community. If you want to help keep the lights on:
          </p>
          <div className="space-y-3">
            <a href="https://buymeacoffee.com/kairo" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <span className="flex items-center gap-3 text-[14px] font-medium" style={{ color: C.text }}>
                <span className="text-lg">☕</span> Buy Me a Coffee
              </span>
              <ExternalLink className="w-4 h-4" style={{ color: C.muted }} />
            </a>
            <button onClick={() => { navigator.clipboard.writeText(cashTag); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <span className="flex items-center gap-3 text-[14px] font-medium" style={{ color: C.text }}>
                <span className="text-lg">💚</span> Cash App
                <code className="text-[12px] px-2 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: C.muted }}>{cashTag}</code>
              </span>
              {copied ? <Check className="w-4 h-4" style={{ color: C.success }} /> : <Copy className="w-4 h-4" style={{ color: C.muted }} />}
            </button>
          </div>
        </div>

        <div className="text-center p-8 rounded-2xl" style={{ background: `${C.accent}08`, border: `1px solid ${C.accent}20` }}>
          <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: C.accent }} />
          <h3 className="text-[18px] font-bold mb-2" style={{ color: C.text }}>Join the Official Server</h3>
          <p className="text-[14px] mb-5" style={{ color: C.muted }}>
            Meet the community, get help, and stay updated.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent, color: '#0d1117' }}>
            Open Kairo
          </a>
        </div>
      </div>
    </PageShell>
  );
}
