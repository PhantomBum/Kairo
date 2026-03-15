import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, User, Bell, Shield, Palette, Volume2, Keyboard, 
  Globe, LogOut, Sparkles, Moon, Sun, Monitor, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input, { Textarea } from '../ui/Input';

const tabs = [
  { id: 'account', label: 'My Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'voice', label: 'Voice & Video', icon: Volume2 },
];

function AccountTab({ profile, onUpdate }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate?.({ display_name: displayName, username, bio });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">My Account</h3>
      
      {/* Profile preview */}
      <div className="relative rounded-xl overflow-hidden">
        <div 
          className="h-24"
          style={{ background: profile?.accent_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        />
        <div className="bg-[#111113] p-4 pt-12 relative">
          <div className="absolute -top-10 left-4">
            <div className="w-20 h-20 rounded-full bg-[#111113] p-1">
              <Avatar src={profile?.avatar_url} name={profile?.display_name} size="xl" />
            </div>
          </div>
          <div className="ml-24">
            <h4 className="font-semibold text-white">{profile?.display_name}</h4>
            <p className="text-sm text-zinc-500">@{profile?.username}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            Display Name
          </label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            Username
          </label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
            About Me
          </label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState('dark');
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Appearance</h3>
      
      <div>
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 block">
          Theme
        </label>
        <div className="flex gap-3">
          {[
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                theme === t.id 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              )}
            >
              <t.icon className={cn('w-5 h-5', theme === t.id ? 'text-indigo-400' : 'text-zinc-500')} />
              <span className={cn('text-sm', theme === t.id ? 'text-indigo-400' : 'text-zinc-400')}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, profile, onUpdateProfile, onLogout }) {
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex w-full max-w-4xl mx-auto my-8"
      >
        {/* Sidebar */}
        <div className="w-56 bg-[#0a0a0c] rounded-l-xl p-3 flex flex-col">
          <div className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                  activeTab === tab.id 
                    ? 'bg-white/[0.08] text-white' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="pt-3 border-t border-white/[0.06] space-y-1">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 bg-[#0f0f10] rounded-r-xl p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'account' && <AccountTab profile={profile} onUpdate={onUpdateProfile} />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {!['account', 'appearance'].includes(activeTab) && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No additional settings for this section.</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}