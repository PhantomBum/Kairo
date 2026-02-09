import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Key, Copy, Check, Users, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('landing');
  const [generatedKey, setGeneratedKey] = useState('');
  const [enteredKey, setEnteredKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ users: 0, servers: 0, messages: 0 });

  useEffect(() => {
    const savedKey = localStorage.getItem('kairo_access_key');
    if (savedKey) verifyKeyAndRedirect(savedKey);
    
    const fetchStats = async () => {
      const [users, servers, messages] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Server.list(),
        base44.entities.Message.list()
      ]);
      setStats({ users: users.length, servers: servers.length, messages: messages.length });
    };
    fetchStats();
  }, [navigate]);

  const verifyKeyAndRedirect = async (key) => {
    const profiles = await base44.entities.UserProfile.filter({ user_email: key + '@kairo.app' });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { status: 'online', is_online: true, last_seen: new Date().toISOString() });
      localStorage.setItem('kairo_current_user', JSON.stringify({ ...profiles[0], status: 'online' }));
      navigate(createPageUrl('Kairo'));
    }
  };

  const generateAccessKey = async () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timePart = Date.now().toString(36).toUpperCase();
    const key = `KAIRO-${randomPart}-${timePart}`;
    const existing = await base44.entities.UserProfile.filter({ username: key });
    if (existing.length > 0) { generateAccessKey(); return; }
    setGeneratedKey(key);
    setStep('getKey');
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeySubmit = async () => {
    const keyToUse = generatedKey || enteredKey;
    if (!keyToUse?.trim()) return;
    
    const profiles = await base44.entities.UserProfile.filter({ user_email: keyToUse + '@kairo.app' });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, { status: 'online', is_online: true, last_seen: new Date().toISOString() });
      localStorage.setItem('kairo_access_key', keyToUse);
      localStorage.setItem('kairo_current_user', JSON.stringify({ ...profiles[0], status: 'online' }));
      navigate(createPageUrl('Kairo'));
    } else if (generatedKey) {
      setStep('profile');
    } else {
      alert('Invalid access key.');
    }
  };

  const handleCreateProfile = async () => {
    const userId = 'user_' + Math.random().toString(36).substring(2);
    const cleanUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
    
    const profile = await base44.entities.UserProfile.create({
      user_id: userId, user_email: generatedKey + '@kairo.app', display_name: displayName,
      username: cleanUsername, status: 'online', is_online: true, last_seen: new Date().toISOString(),
      settings: { theme: 'dark', message_display: 'cozy' }
    });

    await base44.entities.UserSettings.create({
      user_id: userId, user_email: generatedKey + '@kairo.app',
      appearance: { theme: 'dark', message_display: 'cozy' },
      notifications: { desktop_enabled: true, sounds_enabled: true },
      privacy: { dm_privacy: 'everyone', read_receipts: true, typing_indicators: true },
      voice: { input_mode: 'voice_activity', noise_suppression: true },
      kairo_features: { focus_mode: false, ghost_mode: false }
    });

    await base44.entities.UserCredits.create({
      user_id: userId, user_email: generatedKey + '@kairo.app', balance: 1000, has_nitro: true
    });

    localStorage.setItem('kairo_access_key', generatedKey);
    localStorage.setItem('kairo_current_user', JSON.stringify(profile));
    navigate(createPageUrl('Kairo'));
  };

  const comparisons = [
    { label: 'Messages scanned for ads', others: true, kairo: false },
    { label: 'Data used to train AI', others: true, kairo: false },
    { label: 'Algorithm decides reach', others: true, kairo: false },
    { label: 'Premium tiers for basics', others: true, kairo: false },
    { label: 'You own your data', others: false, kairo: true },
    { label: 'Same features for everyone', others: false, kairo: true },
  ];

  const capabilities = [
    { title: 'Fast Chat', desc: 'Zero-lag messaging with reactions, threads, and rich formatting. No ads, no trackers.' },
    { title: 'Crystal Voice', desc: 'Low-latency audio for your squad. Stage events and screen sharing built in.' },
    { title: 'Pure Community', desc: 'Full control over roles, channels, and permissions. Your space, your rules.' },
    { title: 'No Personal Data', desc: 'Use an access key to own your identity. If we don\'t have it, we can\'t leak it.' },
  ];

  const principles = [
    { num: '01', title: 'Your work stays yours', desc: 'Nothing you share on Kairo trains AI models. Your unreleased tracks, your concept art, your designs.' },
    { num: '02', title: 'No algorithmic gatekeeping', desc: 'When you post, your community sees it. No engagement optimization, no shadowbans.' },
    { num: '03', title: 'Cryptographic identity', desc: 'Your account lives in an access key that only you possess. We can\'t reset it or hand it over.' },
    { num: '04', title: 'No paywalling', desc: 'No premium unlocks, no profile customization limits, no micro-transactions.' },
  ];

  return (
    <div className="min-h-screen bg-[#050506] overflow-x-hidden">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-zinc-800/10 to-transparent rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Kairo</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#philosophy" className="text-sm text-zinc-500 hover:text-white transition-colors">Philosophy</a>
            <a href="#features" className="text-sm text-zinc-500 hover:text-white transition-colors">Features</a>
            <a href="#faq" className="text-sm text-zinc-500 hover:text-white transition-colors">FAQ</a>
          </div>

          {step === 'landing' && (
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('enterKey')} className="text-sm text-zinc-500 hover:text-white transition-colors">
                Sign in
              </button>
              <button onClick={generateAccessKey} className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                Open Kairo
              </button>
            </div>
          )}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Hero - Kloak style */}
            <section className="relative z-10 px-6 pt-32 pb-20">
              <div className="max-w-4xl mx-auto text-center">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-zinc-600 mb-8">
                  Privacy-first communication
                </motion.p>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-[0.95] tracking-tight mb-8"
                >
                  Communication
                  <br />without
                  <br />compromise.
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-base text-zinc-500 mb-16 max-w-md mx-auto leading-relaxed"
                >
                  End-to-end encrypted messaging, voice, and community spaces. Built on infrastructure designed for privacy, not profit.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-6"
                >
                  <button onClick={generateAccessKey}
                    className="group flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-all"
                  >
                    Open Kairo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <a href="#philosophy" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Our Philosophy
                  </a>
                </motion.div>
              </div>
            </section>

            {/* Scroll indicator */}
            <div className="flex justify-center pb-16">
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <ChevronDown className="w-5 h-5 text-zinc-700" />
              </motion.div>
            </div>

            {/* What is Kairo */}
            <section id="philosophy" className="relative z-10 px-6 py-24 border-t border-white/[0.04]">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">What is Kairo</p>
                <h2 className="text-3xl md:text-5xl font-light text-white leading-tight mb-6">
                  A place to talk<br /><span className="text-zinc-600">without being watched.</span>
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-xl">
                  Kairo is a communication platform for communities, teams, and friends. Built from the ground up so your conversations stay yours.
                </p>
                <div className="flex gap-8 mt-8">
                  {['No ads', 'No micro-transactions', 'No algorithm to train'].map(item => (
                    <span key={item} className="text-sm text-zinc-500">{item}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Comparison table */}
            <section className="relative z-10 px-6 py-24">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">The Problem</p>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-12">
                  What they take.<br /><span className="text-zinc-600">What we don't.</span>
                </h2>

                <div className="border border-white/[0.06] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-3 text-xs uppercase tracking-wider text-zinc-600 p-4 border-b border-white/[0.04]">
                    <span>Reality</span>
                    <span className="text-center">Others</span>
                    <span className="text-center">Kairo</span>
                  </div>
                  {comparisons.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-4 border-b border-white/[0.03] last:border-0">
                      <span className="text-sm text-zinc-400">{item.label}</span>
                      <div className="flex justify-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.others ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                          {item.others ? <span className="text-red-400 text-xs">✕</span> : <Check className="w-3 h-3 text-emerald-400" />}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.kairo ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                          {item.kairo ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="text-red-400 text-xs">✕</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Capabilities */}
            <section id="features" className="relative z-10 px-6 py-24 border-t border-white/[0.04]">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Capabilities</p>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-16">
                  Everything you need.<br /><span className="text-zinc-600">Nothing you don't.</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {capabilities.map((cap, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="group p-6 rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                    >
                      <h3 className="text-lg font-medium text-white mb-2">{cap.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">{cap.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Principles */}
            <section className="relative z-10 px-6 py-24 border-t border-white/[0.04]">
              <div className="max-w-3xl mx-auto">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Our Principles</p>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-16">
                  Privacy isn't a feature.<br /><span className="text-zinc-600">It's the architecture.</span>
                </h2>

                <div className="space-y-12">
                  {principles.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                      className="flex gap-6"
                    >
                      <span className="text-sm text-zinc-700 font-mono">{p.num}</span>
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">{p.title}</h3>
                        <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-16">
              <div className="max-w-3xl mx-auto flex items-center justify-center gap-16 text-center">
                <div>
                  <div className="text-3xl font-light text-white mb-1">{stats.users.toLocaleString()}</div>
                  <div className="text-xs text-zinc-600 uppercase tracking-wider">Users</div>
                </div>
                <div className="w-px h-12 bg-white/[0.06]" />
                <div>
                  <div className="text-3xl font-light text-white mb-1">{stats.servers.toLocaleString()}</div>
                  <div className="text-xs text-zinc-600 uppercase tracking-wider">Servers</div>
                </div>
                <div className="w-px h-12 bg-white/[0.06]" />
                <div>
                  <div className="text-3xl font-light text-white mb-1">{stats.messages.toLocaleString()}</div>
                  <div className="text-xs text-zinc-600 uppercase tracking-wider">Messages</div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-24 border-t border-white/[0.04]">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 mb-4">Get Started</p>
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-4">
                  Your key.<br /><span className="text-zinc-600">Your community.</span>
                </h2>
                <p className="text-zinc-500 text-sm mb-8">
                  No signup forms. No email verification. Generate your access key and start building your space.
                </p>
                <button onClick={generateAccessKey}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-all"
                >
                  Generate Your Key
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {step === 'getKey' && (
          <motion.div key="getKey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.06]">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2 text-center">Your Access Key</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">Save this key. You'll need it to sign in.</p>
                <div className="bg-black/50 rounded-xl p-4 mb-4 font-mono text-center border border-white/[0.06]">
                  <span className="text-sm text-white">{generatedKey}</span>
                </div>
                <button onClick={copyKey} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm border border-white/[0.08] rounded-lg transition-all">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Key'}
                </button>
                <button onClick={handleKeySubmit} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'enterKey' && (
          <motion.div key="enterKey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.06]">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2 text-center">Welcome back</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">Enter your access key to continue</p>
                <input value={enteredKey} onChange={(e) => setEnteredKey(e.target.value.toUpperCase())}
                  placeholder="KAIRO-XXXXXXXX-XXXXXXXX"
                  className="w-full h-10 px-4 bg-black/50 border border-white/[0.08] rounded-lg text-white font-mono text-sm text-center placeholder:text-zinc-700 focus:outline-none focus:border-white/20 mb-4"
                />
                <button onClick={handleKeySubmit} disabled={!enteredKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => setStep('landing')} className="w-full text-zinc-600 hover:text-zinc-400 text-xs mt-4 transition-colors">← Back</button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.06]">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2 text-center">Create Profile</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">Choose a display name</p>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your name"
                  className="w-full h-10 px-4 bg-black/50 border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-white/20 mb-4"
                />
                <button onClick={handleCreateProfile} disabled={!displayName}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
                >
                  Complete <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/[0.04] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">K</span>
            </div>
            <span className="text-xs text-zinc-700">© 2026 Kairo</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-700">
            <a href="#" className="hover:text-white transition-colors">Philosophy</a>
            <a href="#" className="hover:text-white transition-colors">FAQ</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}