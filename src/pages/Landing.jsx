import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Zap, Shield, Users, Sparkles, Check, 
  MessageCircle, Mic, Eye, Lock, Globe, ChevronRight,
  Key, Copy
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const features = [
  { icon: MessageCircle, title: 'Real-time Messaging', desc: 'Instant messaging with rich media support' },
  { icon: Mic, title: 'Voice & Video', desc: 'Crystal clear voice channels and video calls' },
  { icon: Users, title: 'Server Communities', desc: 'Create and manage custom servers' },
  { icon: Eye, title: 'Listen Mode', desc: 'Join voice channels invisibly' },
  { icon: Shield, title: 'Privacy First', desc: 'Ghost mode and focus mode' },
  { icon: Zap, title: 'Blazing Fast', desc: 'Optimized for performance' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('landing'); // 'landing' | 'getKey' | 'enterKey' | 'profile'
  const [generatedKey, setGeneratedKey] = useState('');
  const [enteredKey, setEnteredKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if user already has a key in localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('kairo_access_key');
    if (savedKey) {
      // Verify the key and redirect if valid
      verifyKeyAndRedirect(savedKey);
    }
  }, [navigate]);

  const verifyKeyAndRedirect = async (key) => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ username: key });
      if (profiles.length > 0) {
        localStorage.setItem('kairo_current_user', JSON.stringify(profiles[0]));
        navigate(createPageUrl('Kairo'));
      }
    } catch (error) {
      console.error('Key verification failed');
    }
  };

  const generateAccessKey = () => {
    const key = 'KAIRO-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
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
    
    // Check if key exists
    const profiles = await base44.entities.UserProfile.filter({ username: keyToUse });
    
    if (profiles.length > 0) {
      // Key exists, log in
      localStorage.setItem('kairo_access_key', keyToUse);
      localStorage.setItem('kairo_current_user', JSON.stringify(profiles[0]));
      navigate(createPageUrl('Kairo'));
    } else if (generatedKey) {
      // New key, go to profile setup
      setStep('profile');
    } else {
      alert('Invalid access key');
    }
  };

  const handleCreateProfile = async () => {
    try {
      const userId = 'user_' + Math.random().toString(36).substring(2);
      
      const profile = await base44.entities.UserProfile.create({
        user_id: userId,
        user_email: generatedKey + '@kairo.app',
        display_name: displayName,
        username: generatedKey,
        status: 'online',
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
    <div className="min-h-screen bg-[#0a0a0b] overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <span className="text-xl font-semibold text-white">Kairo</span>
          </div>
          
          {step === 'landing' && (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setStep('enterKey')}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                I have a key
              </button>
              <Button 
                onClick={generateAccessKey}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                Get Access Key
              </Button>
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
            <section className="relative z-10 px-6 pt-20 pb-32">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50"
                >
                  <span className="text-6xl font-bold text-white">K</span>
                </motion.div>

                <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Where communities
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    come alive
                  </span>
                </h1>
                
                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                  A new kind of communication platform. Built for communities, designed for connection. Free forever.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={generateAccessKey}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg"
                  >
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <button className="flex items-center gap-2 px-8 py-4 bg-zinc-800/50 hover:bg-zinc-800 text-white font-semibold rounded-xl border border-zinc-700 transition-all">
                    <Globe className="w-5 h-5" />
                    Explore Servers
                  </button>
                </div>
              </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 px-6 py-20">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-white mb-4">Everything you need</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto">
                    Functionally deeper and visually superior. Built from the ground up with features that matter.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-zinc-400">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-20">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center">
                  <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
                  <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                    Get your access key and join the next generation of communication.
                  </p>
                  <Button
                    onClick={generateAccessKey}
                    size="lg"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 h-auto rounded-xl"
                  >
                    Get Access Key <Key className="ml-2 w-5 h-5" />
                  </Button>
                </div>
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
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Key className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Your Access Key</h2>
                <p className="text-zinc-400 mb-8 text-center">
                  Save this key somewhere safe. You'll need it to log back in.
                </p>

                <div className="bg-zinc-800 rounded-xl p-4 mb-6 font-mono text-center">
                  <span className="text-lg text-indigo-400 font-bold">{generatedKey}</span>
                </div>

                <Button
                  onClick={copyKey}
                  variant="outline"
                  className="w-full mb-6 bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Key'}
                </Button>

                <Button
                  onClick={handleKeySubmit}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 rounded-xl"
                >
                  Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-xs text-zinc-500 text-center mt-6">
                  Make sure to save your key. You'll need it to access your account.
                </p>
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
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Key className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
                <p className="text-zinc-400 mb-8 text-center">
                  Enter your access key to continue
                </p>

                <Input
                  value={enteredKey}
                  onChange={(e) => setEnteredKey(e.target.value.toUpperCase())}
                  placeholder="KAIRO-XXXXXXXX-XXXXXXXX"
                  className="bg-zinc-800 border-zinc-700 text-white font-mono text-center mb-6"
                />

                <Button
                  onClick={handleKeySubmit}
                  disabled={!enteredKey}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 rounded-xl disabled:opacity-50"
                >
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <button
                  onClick={() => setStep('landing')}
                  className="w-full text-zinc-500 hover:text-zinc-400 text-sm mt-4"
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
            <div className="max-w-md mx-auto">
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Set Up Profile</h2>
                <p className="text-zinc-400 mb-8 text-center">
                  Let's personalize your Kairo experience
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Display Name
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateProfile}
                  disabled={!displayName}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 rounded-xl disabled:opacity-50"
                >
                  Complete Setup <Check className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">K</span>
            </div>
            <span className="text-sm text-zinc-500">© 2026 Kairo. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}