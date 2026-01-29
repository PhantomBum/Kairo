import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Shield, Users, Sparkles, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('landing'); // 'landing' | 'auth' | 'profile'
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated and has seen landing
    const hasSeenLanding = localStorage.getItem('kairo_has_seen_landing');
    
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth && hasSeenLanding === 'true') {
        navigate(createPageUrl('Kairo'));
      } else {
        setIsLoading(false);
      }
    });
  }, [navigate]);

  const handleGetStarted = async () => {
    localStorage.setItem('kairo_has_seen_landing', 'true');
    setStep('auth');
  };

  const handleAuth = async () => {
    try {
      // Try to get current user
      const user = await base44.auth.me();
      
      // Check if profile exists
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      
      if (profiles.length > 0) {
        // Profile exists, go to app
        navigate(createPageUrl('Kairo'));
      } else {
        // No profile, continue to profile setup
        setStep('profile');
      }
    } catch (error) {
      // User not authenticated, redirect to login
      base44.auth.redirectToLogin(createPageUrl('Landing'));
    }
  };

  const handleCreateProfile = async () => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserProfile.create({
        user_id: user.id,
        user_email: user.email,
        display_name: displayName || user.full_name || 'User',
        username: username || user.email?.split('@')[0],
        status: 'online',
        settings: { theme: 'dark', message_display: 'cozy' }
      });

      // Initialize user settings
      await base44.entities.UserSettings.create({
        user_id: user.id,
        user_email: user.email,
        appearance: { theme: 'dark', message_display: 'cozy' },
        notifications: { desktop_enabled: true, sounds_enabled: true },
        privacy: { dm_privacy: 'everyone', read_receipts: true, typing_indicators: true },
        voice: { input_mode: 'voice_activity', noise_suppression: true },
        kairo_features: { focus_mode: false, ghost_mode: false }
      });

      // Initialize credits
      await base44.entities.UserCredits.create({
        user_id: user.id,
        user_email: user.email,
        balance: 1000,
        has_nitro: true
      });

      navigate(createPageUrl('Kairo'));
    } catch (error) {
      console.error('Profile creation failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0b] overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50"
              >
                <span className="text-6xl font-bold text-white">K</span>
              </motion.div>

              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                Welcome to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kairo</span>
              </h1>
              
              <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
                A new kind of communication platform. Built for communities, designed for connection.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                {[
                  { icon: Zap, title: 'Lightning Fast', desc: 'Real-time messaging with zero lag' },
                  { icon: Shield, title: 'Secure & Private', desc: 'Your data, your control' },
                  { icon: Users, title: 'Build Communities', desc: 'Create spaces that matter' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 mx-auto">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-indigo-500/25"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full"
            >
              <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-zinc-800 shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Sign In</h2>
                <p className="text-zinc-400 mb-8 text-center">
                  Click below to authenticate with your account
                </p>

                <Button
                  onClick={handleAuth}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 rounded-xl"
                >
                  Continue with Base44
                </Button>

                <p className="text-xs text-zinc-500 text-center mt-6">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          )}

          {step === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full"
            >
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

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Username
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Lowercase letters, numbers, and underscores only</p>
                  </div>
                </div>

                <Button
                  onClick={handleCreateProfile}
                  disabled={!displayName || !username}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 rounded-xl disabled:opacity-50"
                >
                  Complete Setup <Check className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}