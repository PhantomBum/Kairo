import React, { useState, useEffect } from 'react';
import { Bug, Lightbulb, Mail, BookOpen, Shield, FileText, Upload, CheckCircle, AlertTriangle, Activity, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d', overlay: '#2e2e37',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d', danger: '#ed4245', warning: '#faa81a',
};

const TABS = [
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'contact', label: 'Contact Support', icon: Mail },
  { id: 'guidelines', label: 'Community Guidelines', icon: BookOpen },
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'status', label: 'System Status', icon: Activity },
];

function Input({ label, value, onChange, placeholder, area, type = 'text' }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>{label}</label>
      {area ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none resize-none transition-colors"
          style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-colors"
          style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }} />
      )}
    </div>
  );
}

function StatusCheck() {
  const [services, setServices] = useState({});

  useEffect(() => {
    const checks = [
      { name: 'API', fn: async () => { await base44.auth.isAuthenticated(); return true; } },
      { name: 'Real-time', fn: async () => { const u = base44.entities.Server.subscribe(() => {}); setTimeout(() => u(), 100); return true; } },
      { name: 'Database', fn: async () => { await base44.entities.Server.list('-created_date', 1); return true; } },
      { name: 'File Storage', fn: async () => { const r = await fetch('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a93eea52ff0ef8406c21a/e96e433dc_generated_image.png', { method: 'HEAD' }); return r.ok; } },
      { name: 'Authentication', fn: async () => { await base44.auth.isAuthenticated(); return true; } },
    ];
    checks.forEach(async (s) => {
      try { const ok = await s.fn(); setServices(p => ({ ...p, [s.name]: ok ? 'operational' : 'degraded' })); }
      catch { setServices(p => ({ ...p, [s.name]: 'outage' })); }
    });
  }, []);

  const allOk = Object.values(services).length > 0 && Object.values(services).every(s => s === 'operational');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ background: allOk ? `${C.success}10` : `${C.warning}10`, border: `1px solid ${allOk ? C.success : C.warning}25` }}>
        <div className="w-3 h-3 rounded-full" style={{ background: allOk ? C.success : C.warning }} />
        <span className="text-[14px] font-semibold" style={{ color: allOk ? C.success : C.warning }}>
          {Object.keys(services).length === 0 ? 'Checking systems...' : allOk ? 'All Systems Operational' : 'Some services may be experiencing issues'}
        </span>
      </div>
      <div className="space-y-2">
        {['API', 'Real-time', 'Database', 'File Storage', 'Authentication'].map(name => {
          const s = services[name];
          const color = s === 'operational' ? C.success : s === 'outage' ? C.danger : s === 'degraded' ? C.warning : C.muted;
          return (
            <div key={name} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
              <span className="text-[13px] font-medium" style={{ color: C.text }}>{name}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[12px] font-medium capitalize" style={{ color }}>{s || 'checking...'}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] mt-4 text-center" style={{ color: C.muted }}>Last checked: {new Date().toLocaleTimeString()}</p>
      <div className="text-center mt-4">
        <a href="/Status" className="inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline" style={{ color: C.accent }}>
          View full status page <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function Support() {
  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get('tab') || 'bug');
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bugForm, setBugForm] = useState({ title: '', description: '', steps: '', severity: 'medium' });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', use_case: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    (async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const me = await base44.auth.me();
        setUser(me);
        setContactForm(p => ({ ...p, name: me.full_name || '', email: me.email || '' }));
      }
    })();
  }, []);

  const submit = async (entityType, data) => {
    setLoading(true);
    try {
      await base44.entities[entityType].create({ ...data, reporter_id: user?.id, reporter_email: user?.email || contactForm.email, created_at: new Date().toISOString() });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error('Submit failed:', err);
    }
    setLoading(false);
  };

  return (
    <PageShell title="Support">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-3" style={{ color: C.text }}>Support Center</h1>
          <p className="text-[16px]" style={{ color: C.muted }}>Get help, report issues, or request features</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSubmitted(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: tab === t.id ? C.accent : C.elevated, color: tab === t.id ? '#fff' : C.muted }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-2" style={{ background: `${C.success}10`, border: `1px solid ${C.success}25` }}>
            <CheckCircle className="w-5 h-5" style={{ color: C.success }} />
            <span className="text-[14px] font-medium" style={{ color: C.success }}>Submitted successfully! Thank you for your feedback.</span>
          </div>
        )}

        <div className="rounded-2xl p-6 md:p-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          {tab === 'bug' && (
            <div className="space-y-5">
              <h3 className="text-[18px] font-bold" style={{ color: C.text }}>Submit a Bug Report</h3>
              <Input label="Title" value={bugForm.title} onChange={v => setBugForm(p => ({ ...p, title: v }))} placeholder="Brief description of the issue" />
              <Input label="Description" value={bugForm.description} onChange={v => setBugForm(p => ({ ...p, description: v }))} placeholder="What happened? What did you expect?" area />
              <Input label="Steps to Reproduce" value={bugForm.steps} onChange={v => setBugForm(p => ({ ...p, steps: v }))} placeholder="1. Go to...&#10;2. Click on...&#10;3. See error" area />
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.muted }}>Severity</label>
                <select value={bugForm.severity} onChange={e => setBugForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
                  style={{ background: C.bg, color: C.text, border: `1px solid ${C.border}` }}>
                  <option value="low">Low — Minor annoyance</option>
                  <option value="medium">Medium — Broken but workaround exists</option>
                  <option value="high">High — Major feature broken</option>
                  <option value="critical">Critical — App unusable</option>
                </select>
              </div>
              <button onClick={() => { submit('BugReport', bugForm); setBugForm({ title: '', description: '', steps: '', severity: 'medium' }); }}
                disabled={!bugForm.title || !bugForm.description || loading}
                className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
                style={{ background: C.accent, color: '#0d1117' }}>
                {loading ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </div>
          )}

          {tab === 'feature' && (
            <div className="space-y-5">
              <h3 className="text-[18px] font-bold" style={{ color: C.text }}>Request a Feature</h3>
              <Input label="Title" value={featureForm.title} onChange={v => setFeatureForm(p => ({ ...p, title: v }))} placeholder="Feature name" />
              <Input label="Description" value={featureForm.description} onChange={v => setFeatureForm(p => ({ ...p, description: v }))} placeholder="What should this feature do?" area />
              <Input label="Use Case" value={featureForm.use_case} onChange={v => setFeatureForm(p => ({ ...p, use_case: v }))} placeholder="Why would this be useful? How would you use it?" area />
              <button onClick={() => { submit('FeatureRequest', featureForm); setFeatureForm({ title: '', description: '', use_case: '' }); }}
                disabled={!featureForm.title || !featureForm.description || loading}
                className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
                style={{ background: C.accent, color: '#0d1117' }}>
                {loading ? 'Submitting...' : 'Submit Feature Request'}
              </button>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-5">
              <h3 className="text-[18px] font-bold" style={{ color: C.text }}>Contact Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" value={contactForm.name} onChange={v => setContactForm(p => ({ ...p, name: v }))} placeholder="Your name" />
                <Input label="Email" value={contactForm.email} onChange={v => setContactForm(p => ({ ...p, email: v }))} placeholder="you@example.com" type="email" />
              </div>
              <Input label="Subject" value={contactForm.subject} onChange={v => setContactForm(p => ({ ...p, subject: v }))} placeholder="What do you need help with?" />
              <Input label="Message" value={contactForm.message} onChange={v => setContactForm(p => ({ ...p, message: v }))} placeholder="Describe your issue in detail..." area />
              <button onClick={() => { submit('SupportTicket', contactForm); setContactForm(p => ({ ...p, subject: '', message: '' })); }}
                disabled={!contactForm.subject || !contactForm.message || loading}
                className="px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-30 hover:brightness-110"
                style={{ background: C.accent, color: '#0d1117' }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}

          {tab === 'guidelines' && (
            <div>
              <h3 className="text-[22px] font-bold mb-6" style={{ color: C.text }}>Community Guidelines</h3>
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: C.textSec }}>
                Kairo is built to be a safe, welcoming space for everyone. These guidelines help keep it that way.
              </p>
              {[
                { t: 'Be Respectful', d: 'Treat everyone with kindness. Harassment, hate speech, discrimination, and bullying have zero tolerance here. We\'re all humans behind screens.' },
                { t: 'No Spam or Self-Promotion', d: 'Don\'t flood channels with repetitive messages or unsolicited ads. Share your stuff when it\'s relevant and welcome — not everywhere all the time.' },
                { t: 'Keep Content Appropriate', d: 'NSFW content belongs only in designated, age-gated channels. Illegal content is prohibited everywhere, period.' },
                { t: 'Protect Privacy', d: 'Don\'t share other people\'s personal information without their consent. That includes real names, photos, addresses, and contact info.' },
                { t: 'Follow Server Rules', d: 'Each server can set its own rules on top of these. Respect them — the server owner knows their community best.' },
                { t: 'Report Problems', d: 'See something wrong? Report it. Use the moderation tools in-app or submit a report through this Support page. We take every report seriously.' },
              ].map((g, i) => (
                <div key={i} className="mb-5 p-4 rounded-xl" style={{ background: C.elevated }}>
                  <h4 className="text-[15px] font-bold mb-1.5" style={{ color: C.text }}>{i + 1}. {g.t}</h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>{g.d}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'terms' && (
            <div>
              <h3 className="text-[22px] font-bold mb-6" style={{ color: C.text }}>Terms of Service</h3>
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: C.textSec }}>Last updated: March 2025. By using Kairo, you agree to these terms.</p>
              {[
                { t: 'Using Kairo', d: 'By creating an account or using the service, you agree to follow these terms and our Community Guidelines. You must be at least 13 years old.' },
                { t: 'Your Account', d: 'You\'re responsible for keeping your account secure. If you use a Secret Key, that key is your only way in — we can\'t recover it for you.' },
                { t: 'What You Can Do', d: 'Use Kairo for communicating, building communities, and having fun. Don\'t use it for anything illegal, harmful, or that violates someone else\'s rights.' },
                { t: 'Your Content', d: 'You own what you create. By posting on Kairo, you give us permission to display and distribute your content within the platform. You can delete your content anytime.' },
                { t: 'Elite Subscriptions', d: 'Elite is billed monthly at $2.99. Lite is $0.99/month. You can cancel anytime. Benefits remain until the end of your billing period. Refunds are handled case-by-case through support.' },
                { t: 'Account Suspension', d: 'We may suspend or terminate accounts that violate these terms or our guidelines. We\'ll try to warn you first unless the violation is severe.' },
                { t: 'Limitation of Liability', d: 'Kairo is provided "as is." We do our best to keep everything running, but we can\'t guarantee 100% uptime or that the service will always meet your expectations.' },
              ].map((t, i) => (
                <div key={i} className="mb-5">
                  <h4 className="text-[15px] font-bold mb-1.5" style={{ color: C.text }}>{t.t}</h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>{t.d}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              <h3 className="text-[22px] font-bold mb-6" style={{ color: C.text }}>Privacy Policy</h3>
              <p className="text-[14px] leading-relaxed mb-6" style={{ color: C.textSec }}>
                This is written in plain language because you deserve to actually understand it.
              </p>
              {[
                { t: 'The Short Version', d: 'We collect the minimum amount of data needed to make Kairo work. We never sell it. We never will. If you use a Secret Key account, we don\'t even know who you are.' },
                { t: 'What We Collect', d: 'If you sign up with email: your email and display name. If you use Secret Key: nothing identifiable at all. We also store messages you send (so they show up in chat) and basic usage info to keep the servers running.' },
                { t: 'What We Don\'t Do', d: 'We don\'t sell your data. We don\'t serve ads. We don\'t track you across the internet. We don\'t build advertising profiles. We don\'t share your information with third parties for marketing.' },
                { t: 'Payments', d: 'If you subscribe to Elite, payment is processed by Stripe. We never see or store your card number. Stripe handles all payment data under their own privacy policy.' },
                { t: 'Secret Chats', d: 'Messages in Secret Chats are end-to-end encrypted. We cannot read them. They\'re not stored on our servers after the session ends.' },
                { t: 'Your Control', d: 'You can download your data, edit your profile, delete messages, or delete your entire account at any time. When you delete your account, your data is permanently removed.' },
                { t: 'Cookies', d: 'We use essential cookies for login sessions. That\'s it. No tracking cookies, no analytics cookies, no third-party cookies.' },
                { t: 'Changes', d: 'If we ever change this policy, we\'ll let you know with an in-app notification before the changes take effect.' },
              ].map((p, i) => (
                <div key={i} className="mb-5">
                  <h4 className="text-[15px] font-bold mb-1.5" style={{ color: C.text }}>{p.t}</h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>{p.d}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'status' && <StatusCheck />}
        </div>
      </div>
    </PageShell>
  );
}
