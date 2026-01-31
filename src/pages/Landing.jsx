import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Zap, Shield, Users, Check, 
  MessageCircle, Mic, Eye, Globe,
  Key, Copy, ChevronRight, Hexagon
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const features = [
  { icon: MessageCircle, title: 'Messaging', desc: 'Real-time with rich media' },
  { icon: Mic, title: 'Voice & Video', desc: 'Crystal clear channels' },
  { icon: Users, title: 'Communities', desc: 'Create custom servers' },
  { icon: Eye, title: 'Listen Mode', desc: 'Join invisibly' },
  { icon: Shield, title: 'Privacy', desc: 'Ghost & focus modes' },
  { icon: Zap, title: 'Fast', desc: 'Optimized performance' },
];

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
    if (savedKey) {
      verifyKeyAndRedirect(savedKey);
    }
    
    // Fetch real stats
    const fetchStats = async () => {
      const [users, servers, messages] = await Promise.all([
        base44.entities.UserProfile.list(),
        base44.entities.Server.list(),
        base44.entities.Message.list()
      ]);
      setStats({
        users: users.length,
        servers: servers.length,
        messages: messages.length
      });
    };
    fetchStats();
  }, [navigate]);

  const verifyKeyAndRedirect = async (key) => {
    try {
      // Check both the access key stored and by matching the email pattern
      const profiles = await base44.entities.UserProfile.filter({ user_email: key + '@kairo.app' });
      if (profiles.length > 0) {
        // Update status to online
        await base44.entities.UserProfile.update(profiles[0].id, { 
          status: 'online',
          is_online: true,
          last_seen: new Date().toISOString()
        });
        localStorage.setItem('kairo_current_user', JSON.stringify({ ...profiles[0], status: 'online' }));
        navigate(createPageUrl('Kairo'));
      }
    } catch (error) {
      console.error('Key verification failed');
    }
  };

  const generateAccessKey = async () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timePart = Date.now().toString(36).toUpperCase();
    const key = `KAIRO-${randomPart}-${timePart}`;
    
    const existing = await base44.entities.UserProfile.filter({ username: key });
    if (existing.length > 0) {
      generateAccessKey();
      return;
    }
    
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
    
    if (!keyToUse || keyToUse.trim() === '') {
      alert('Please enter your access key');
      return;
    }
    
    try {
      // Look up by the email pattern (key@kairo.app)
      const profiles = await base44.entities.UserProfile.filter({ user_email: keyToUse + '@kairo.app' });
      
      if (profiles.length > 0) {
        // Update status to online
        await base44.entities.UserProfile.update(profiles[0].id, { 
          status: 'online',
          is_online: true,
          last_seen: new Date().toISOString()
        });
        localStorage.setItem('kairo_access_key', keyToUse);
        localStorage.setItem('kairo_current_user', JSON.stringify({ ...profiles[0], status: 'online' }));
        navigate(createPageUrl('Kairo'));
      } else if (generatedKey) {
        setStep('profile');
      } else {
        alert('Invalid access key. Please check and try again.');
      }
    } catch (error) {
      console.error('Key validation error:', error);
      alert('Failed to validate key. Please try again.');
    }
  };

  const handleCreateProfile = async () => {
    try {
      const userId = 'user_' + Math.random().toString(36).substring(2);
      // Create a clean username from the display name
      const cleanUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
      
      const profile = await base44.entities.UserProfile.create({
        user_id: userId,
        user_email: generatedKey + '@kairo.app',
        display_name: displayName,
        username: cleanUsername, // Use clean username for @mentions
        status: 'online',
        is_online: true,
        last_seen: new Date().toISOString(),
        settings: { theme: 'dark', message_display: 'cozy' }
      });

      await base44.entities.UserSettings.create({
        user_id: userId,
        user_email: generatedKey + '@kairo.app',
        appearance: { theme: 'dark', message_display: 'cozy' },
        notifications: { desktop_enabled: true, sounds_enabled: true },
        privacy: { dm_privacy: 'everyone', read_receipts: true, typing_indicators: true },
        voice: { input_mode: 'voice_activity', noise_suppression: true },
        kairo_features: { focus_mode: false, ghost_mode: false }
      });

      await base44.entities.UserCredits.create({
        user_id: userId,
        user_email: generatedKey + '@kairo.app',
        balance: 1000,
        has_nitro: true
      });

      localStorage.setItem('kairo_access_key', generatedKey);
      localStorage.setItem('kairo_current_user', JSON.stringify(profile));
      navigate(createPageUrl('Kairo'));
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] overflow-x-hidden">
      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />
      
      {/* Minimal gradient accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-800/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <span className="text-lg font-medium text-white/90">Kairo</span>
          </div>
          
          {step === 'landing' && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStep('enterKey')}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Sign in
              </button>
              <button 
                onClick={generateAccessKey}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Hero */}
            <section className="relative z-10 px-6 pt-24 pb-32">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 mb-8">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Now in public beta
                  </div>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl md:text-6xl font-semibold text-white mb-6 leading-[1.1] tracking-tight"
                >
                  Communication
                  <br />
                  <span className="text-zinc-500">reimagined.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg text-zinc-500 mb-12 max-w-lg mx-auto leading-relaxed"
                >
                  A platform built for communities. Minimal, fast, and designed with privacy in mind.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <button
                    onClick={generateAccessKey}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-all"
                  >
                    Get Access Key
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 text-zinc-400 hover:text-white transition-colors">
                    <Globe className="w-4 h-4" />
                    Explore Servers
                  </button>
                </motion.div>
              </div>
            </section>

            {/* Features */}
            <section className="relative z-10 px-6 py-20 border-t border-white/5">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
                  {features.map((feature, i) => (
                    <motion.div
                      key={`feature-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="bg-[#050506] p-6 hover:bg-white/[0.02] transition-colors"
                    >
                      <feature.icon className="w-5 h-5 text-zinc-600 mb-4" />
                      <h3 className="text-sm font-medium text-white mb-1">{feature.title}</h3>
                      <p className="text-xs text-zinc-600">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-20">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-16 text-center">
                  <div>
                    <div className="text-3xl font-semibold text-white mb-1">{stats.users.toLocaleString()}</div>
                    <div className="text-xs text-zinc-600 uppercase tracking-wider">Users</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    <div className="text-3xl font-semibold text-white mb-1">{stats.servers.toLocaleString()}</div>
                    <div className="text-xs text-zinc-600 uppercase tracking-wider">Servers</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div>
                    <div className="text-3xl font-semibold text-white mb-1">{stats.messages.toLocaleString()}</div>
                    <div className="text-xs text-zinc-600 uppercase tracking-wider">Messages</div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-20">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-medium text-white mb-4">Ready to start?</h2>
                <p className="text-zinc-500 mb-8 text-sm">
                  Get your access key and join thousands of communities.
                </p>
                <button
                  onClick={generateAccessKey}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 rounded-lg transition-all"
                >
                  <Key className="w-4 h-4" />
                  Get Access Key
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {step === 'getKey' && (
          <motion.div
            key="getKey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/5">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>

                <h2 className="text-xl font-medium text-white mb-2 text-center">Your Access Key</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">
                  Save this key. You'll need it to sign in.
                </p>

                <div className="bg-black/50 rounded-xl p-4 mb-4 font-mono text-center border border-white/5">
                  <span className="text-sm text-white">{generatedKey}</span>
                </div>

                <button
                  onClick={copyKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Key'}
                </button>

                <button
                  onClick={handleKeySubmit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'enterKey' && (
          <motion.div
            key="enterKey"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/5">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>

                <h2 className="text-xl font-medium text-white mb-2 text-center">Welcome back</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">
                  Enter your access key to continue
                </p>

                <Input
                  value={enteredKey}
                  onChange={(e) => setEnteredKey(e.target.value.toUpperCase())}
                  placeholder="KAIRO-XXXXXXXX-XXXXXXXX"
                  className="bg-black/50 border-white/10 text-white font-mono text-sm text-center mb-4 placeholder:text-zinc-600"
                />

                <button
                  onClick={handleKeySubmit}
                  disabled={!enteredKey}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setStep('landing')}
                  className="w-full text-zinc-600 hover:text-zinc-400 text-xs mt-4 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-6 py-32"
          >
            <div className="max-w-sm mx-auto">
              <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/5">
                <div className="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>

                <h2 className="text-xl font-medium text-white mb-2 text-center">Create Profile</h2>
                <p className="text-sm text-zinc-500 mb-6 text-center">
                  Set up your display name
                </p>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-2">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-black/50 border-white/10 text-white text-sm placeholder:text-zinc-600"
                  />
                </div>

                <button
                  onClick={handleCreateProfile}
                  disabled={!displayName}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
              <span className="text-xs font-bold text-white">K</span>
            </div>
            <span className="text-xs text-zinc-600">© 2026 Kairo</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}