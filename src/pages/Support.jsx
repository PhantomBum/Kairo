import React, { useState, useEffect } from 'react';
import { Bug, Lightbulb, Mail, Activity, BookOpen, Shield, FileText, Upload, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/app/shared/PageShell';

const SECTIONS = [
  { id: 'bug', label: 'Bug Report', icon: Bug },
  { id: 'feature', label: 'Feature Request', icon: Lightbulb },
  { id: 'contact', label: 'Contact Support', icon: Mail },
  { id: 'guidelines', label: 'Community Guidelines', icon: BookOpen },
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
];

export default function Support() {
  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get('tab') || 'bug');
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [bugForm, setBugForm] = useState({ title: '', description: '', steps_to_reproduce: '', severity: 'medium', screenshot_url: '' });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', use_case: '' });
  const [contactForm, setContactForm] = useState({ subject: '', category: 'technical', message: '' });
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) setUser(await base44.auth.me());
      const feats = await base44.entities.FeatureRequest.list('-upvotes', 20);
      setFeatures(feats);
    };
    init();
  }, []);

  const submitBug = async () => {
    await base44.entities.BugReport.create({ ...bugForm, reporter_id: user?.id, reporter_email: user?.email, reporter_name: user?.full_name });
    setSubmitted(true); setBugForm({ title: '', description: '', steps_to_reproduce: '', severity: 'medium', screenshot_url: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const submitFeature = async () => {
    await base44.entities.FeatureRequest.create({ ...featureForm, requester_id: user?.id, requester_email: user?.email, requester_name: user?.full_name, upvotes: 1, upvoters: [user?.id] });
    setSubmitted(true); setFeatureForm({ title: '', description: '', use_case: '' });
    const feats = await base44.entities.FeatureRequest.list('-upvotes', 20);
    setFeatures(feats);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const submitContact = async () => {
    await base44.entities.SupportTicket.create({ ...contactForm, reporter_id: user?.id, reporter_email: user?.email, reporter_name: user?.full_name });
    setSubmitted(true); setContactForm({ subject: '', category: 'technical', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const upvoteFeature = async (feat) => {
    if (!user) return;
    if (feat.upvoters?.includes(user.id)) return;
    await base44.entities.FeatureRequest.update(feat.id, { upvotes: (feat.upvotes || 0) + 1, upvoters: [...(feat.upvoters || []), user.id] });
    const feats = await base44.entities.FeatureRequest.list('-upvotes', 20);
    setFeatures(feats);
  };

  const handleScreenshot = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); setBugForm(p => ({ ...p, screenshot_url: file_url })); };
    input.click();
  };

  const Input = ({ label, value, onChange, placeholder, area }) => (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{label}</label>
      {area ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />}
    </div>
  );

  return (
    <PageShell title="Support">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Support & Community Hub</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Get help, report issues, or request features</p>
          <a href={createPageUrl('Status')} className="inline-flex items-center gap-1.5 mt-3 text-[11px] px-3 py-1.5 rounded-full" style={{ background: 'rgba(123,201,164,0.08)', color: 'var(--accent-green)', border: '1px solid rgba(123,201,164,0.15)' }}>
            <Activity className="w-3 h-3" /> System Status
          </a>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setTab(s.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-colors"
              style={{ background: tab === s.id ? 'var(--text-cream)' : 'var(--bg-glass)', color: tab === s.id ? 'var(--bg-deep)' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              <s.icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          ))}
        </div>

        {submitted && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-2" style={{ background: 'rgba(123,201,164,0.08)', border: '1px solid rgba(123,201,164,0.15)' }}>
            <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
            <span className="text-sm" style={{ color: 'var(--accent-green)' }}>Submitted successfully! Thank you.</span>
          </div>
        )}

        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          {tab === 'bug' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Submit a Bug Report</h3>
              <Input label="Title" value={bugForm.title} onChange={v => setBugForm(p => ({ ...p, title: v }))} placeholder="Brief description of the issue" />
              <Input label="Description" value={bugForm.description} onChange={v => setBugForm(p => ({ ...p, description: v }))} placeholder="What happened?" area />
              <Input label="Steps to Reproduce" value={bugForm.steps_to_reproduce} onChange={v => setBugForm(p => ({ ...p, steps_to_reproduce: v }))} placeholder="1. Go to...\n2. Click on..." area />
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Severity</label>
                <select value={bugForm.severity} onChange={e => setBugForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
              <button onClick={handleScreenshot} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ border: '1px dashed var(--border-light)', color: 'var(--text-secondary)' }}>
                <Upload className="w-3.5 h-3.5" /> {bugForm.screenshot_url ? 'Screenshot uploaded ✓' : 'Upload Screenshot (optional)'}
              </button>
              <button onClick={submitBug} disabled={!bugForm.title || !bugForm.description}
                className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
                style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Submit Bug Report</button>
            </div>
          )}

          {tab === 'feature' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Request a Feature</h3>
              <Input label="Title" value={featureForm.title} onChange={v => setFeatureForm(p => ({ ...p, title: v }))} placeholder="Feature name" />
              <Input label="Description" value={featureForm.description} onChange={v => setFeatureForm(p => ({ ...p, description: v }))} placeholder="What should this feature do?" area />
              <Input label="Use Case" value={featureForm.use_case} onChange={v => setFeatureForm(p => ({ ...p, use_case: v }))} placeholder="Why would this be useful?" area />
              <button onClick={submitFeature} disabled={!featureForm.title || !featureForm.description}
                className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
                style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Submit Feature Request</button>
              {features.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Popular Requests</h4>
                  {features.map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-glass-strong)' }}>
                      <button onClick={() => upvoteFeature(f)} className="flex flex-col items-center p-1 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                        style={{ color: f.upvoters?.includes(user?.id) ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                        <ChevronUp className="w-4 h-4" />
                        <span className="text-[10px] font-mono">{f.upvotes || 0}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{f.title}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{f.description}</p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>{f.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Contact Support</h3>
              <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(88,101,242,0.06)', border: '1px solid rgba(88,101,242,0.15)' }}>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>You can also reach us directly via email:</p>
                <a href="mailto:ilikebagels1612@gmail.com" className="text-[14px] font-semibold hover:underline" style={{ color: 'var(--accent-blue)' }}>ilikebagels1612@gmail.com</a>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>For support, questions, or to apply as a <span style={{ color: '#a78bfa' }}>Developer</span> or <span style={{ color: '#3ba55c' }}>Tester</span> for Kairo.</p>
              </div>
              <Input label="Subject" value={contactForm.subject} onChange={v => setContactForm(p => ({ ...p, subject: v }))} placeholder="What do you need help with?" />
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Category</label>
                <select value={contactForm.category} onChange={e => setContactForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <option value="billing">Billing</option><option value="account_recovery">Account Recovery</option><option value="technical">Technical Issue</option><option value="other">Other</option>
                </select>
              </div>
              <Input label="Message" value={contactForm.message} onChange={v => setContactForm(p => ({ ...p, message: v }))} placeholder="Describe your issue in detail..." area />
              <button onClick={submitContact} disabled={!contactForm.subject || !contactForm.message}
                className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
                style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Send Message</button>
            </div>
          )}

          {tab === 'guidelines' && (
            <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-secondary)' }}>
              <h3 style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Community Guidelines</h3>
              <p className="text-[13px] leading-relaxed">Welcome to Kairo. To keep our community safe and welcoming, please follow these guidelines:</p>
              {[
                { t: 'Be Respectful', d: 'Treat everyone with kindness and empathy. Harassment, hate speech, discrimination, and bullying are not tolerated.' },
                { t: 'No Spam or Self-Promotion', d: 'Don\'t flood channels with repetitive messages, unsolicited advertisements, or promotional content without permission.' },
                { t: 'Keep Content Appropriate', d: 'NSFW content is only allowed in designated age-restricted channels. Illegal content is prohibited everywhere.' },
                { t: 'Protect Privacy', d: 'Don\'t share others\' personal information without consent. This includes real names, addresses, photos, and contact info.' },
                { t: 'Follow Server Rules', d: 'Each server may have its own rules. Respect them in addition to these global guidelines.' },
                { t: 'Report Issues', d: 'If you see someone breaking these guidelines, report them using the moderation tools or contact support.' },
              ].map((g, i) => (
                <div key={i} className="mb-4">
                  <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-cream)' }}>{i + 1}. {g.t}</h4>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{g.d}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'terms' && (
            <div style={{ color: 'var(--text-secondary)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Terms of Service</h3>
              {[
                { t: 'Acceptance', d: 'By using Kairo, you agree to these Terms of Service and our Privacy Policy.' },
                { t: 'Account Responsibility', d: 'You\'re responsible for maintaining the security of your account. Don\'t share your credentials.' },
                { t: 'Acceptable Use', d: 'You agree not to use Kairo for illegal activities, harassment, spam, or any activity that violates our Community Guidelines.' },
                { t: 'Content Ownership', d: 'You retain ownership of content you create. By posting, you grant Kairo a license to display and distribute that content within the platform.' },
                { t: 'Subscriptions', d: 'Elite subscriptions are billed monthly. Refunds are handled on a case-by-case basis through support.' },
                { t: 'Termination', d: 'We reserve the right to suspend or terminate accounts that violate these terms.' },
              ].map((t, i) => (
                <div key={i} className="mb-4">
                  <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-cream)' }}>{t.t}</h4>
                  <p className="text-[12px] leading-relaxed">{t.d}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'privacy' && (
            <div style={{ color: 'var(--text-secondary)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Privacy Policy</h3>
              {[
                { t: 'Data We Collect', d: 'We collect your email, display name, and messages sent through the platform. We also collect usage analytics to improve the service.' },
                { t: 'How We Use Your Data', d: 'Your data is used to provide the service, personalize your experience, and communicate important updates.' },
                { t: 'Data Security', d: 'All data is transmitted over TLS encryption. We implement industry-standard security measures to protect your information.' },
                { t: 'Third Parties', d: 'We use Stripe for payment processing. We do not sell your personal data to third parties.' },
                { t: 'Your Rights', d: 'You can request a copy of your data, correction of inaccuracies, or deletion of your account by contacting support.' },
                { t: 'Cookies', d: 'We use essential cookies for authentication and optional analytics cookies to improve the platform.' },
              ].map((p, i) => (
                <div key={i} className="mb-4">
                  <h4 className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-cream)' }}>{p.t}</h4>
                  <p className="text-[12px] leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}