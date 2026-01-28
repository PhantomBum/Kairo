import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Shield, Bell, Palette, Volume2, Keyboard, Database,
  Monitor, LogOut, ChevronRight, Moon, Ghost, Eye, EyeOff,
  Upload, Trash2, Globe, Lock, MessageCircle, Users, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const settingsSections = [
  { id: 'account', label: 'My Account', icon: User },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard },
  { id: 'advanced', label: 'Advanced', icon: Database },
];

function AccountSettings({ profile, onUpdate }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">My Account</h2>
        <p className="text-sm text-zinc-500">Manage your account settings and profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
        {/* Banner */}
        <div 
          className="h-24 relative"
          style={{ 
            background: profile?.banner_url 
              ? `url(${profile.banner_url}) center/cover`
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
          >
            Change Banner
          </Button>
        </div>

        {/* Avatar and info */}
        <div className="px-4 pb-4 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#121214] overflow-hidden bg-zinc-800">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                    {displayName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <Upload className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 pt-10">
              <h3 className="text-lg font-semibold text-white">{displayName || 'User'}</h3>
              <p className="text-sm text-zinc-400">@{username || 'username'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Pronouns</Label>
          <Input
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g., they/them"
            className="bg-zinc-900 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">About Me</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            className="bg-zinc-900 border-zinc-800 text-white resize-none"
          />
        </div>

        <Button 
          onClick={() => onUpdate?.({ display_name: displayName, username, bio, pronouns })}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function PrivacySettings({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Privacy & Safety</h2>
        <p className="text-sm text-zinc-500">Manage how others can interact with you</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Direct Messages</h4>
              <p className="text-sm text-zinc-500">Who can send you DMs</p>
            </div>
          </div>
          <Select 
            value={settings?.dm_privacy || 'everyone'}
            onValueChange={(v) => onUpdate?.({ dm_privacy: v })}
          >
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="servers">Server Members</SelectItem>
              <SelectItem value="none">No One</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Friend Requests</h4>
              <p className="text-sm text-zinc-500">Who can add you as a friend</p>
            </div>
          </div>
          <Select 
            value={settings?.friend_requests || 'everyone'}
            onValueChange={(v) => onUpdate?.({ friend_requests: v })}
          >
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="friends_of_friends">Friends of Friends</SelectItem>
              <SelectItem value="none">No One</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Read Receipts</h4>
              <p className="text-sm text-zinc-500">Show when you've read messages</p>
            </div>
          </div>
          <Switch 
            checked={settings?.read_receipts !== false}
            onCheckedChange={(v) => onUpdate?.({ read_receipts: v })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Typing Indicators</h4>
              <p className="text-sm text-zinc-500">Show when you're typing</p>
            </div>
          </div>
          <Switch 
            checked={settings?.typing_indicators !== false}
            onCheckedChange={(v) => onUpdate?.({ typing_indicators: v })}
          />
        </div>
      </div>
    </div>
  );
}

function AppearanceSettings({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Appearance</h2>
        <p className="text-sm text-zinc-500">Customize how Kairo looks</p>
      </div>

      <div className="space-y-4">
        {/* Theme */}
        <div>
          <Label className="text-zinc-400 mb-3 block">Theme</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', name: 'Dark', bg: 'bg-zinc-900' },
              { id: 'amoled', name: 'AMOLED', bg: 'bg-black' },
              { id: 'midnight', name: 'Midnight', bg: 'bg-[#0a0a15]' }
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => onUpdate?.({ theme: theme.id })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  settings?.theme === theme.id 
                    ? "border-indigo-500" 
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <div className={cn("w-full h-12 rounded-md mb-2", theme.bg)} />
                <span className="text-sm text-white">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Display */}
        <div>
          <Label className="text-zinc-400 mb-3 block">Message Display</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'cozy', name: 'Cozy', desc: 'Larger spacing' },
              { id: 'compact', name: 'Compact', desc: 'More messages' }
            ].map((style) => (
              <button
                key={style.id}
                onClick={() => onUpdate?.({ message_display: style.id })}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  settings?.message_display === style.id 
                    ? "border-indigo-500" 
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <span className="text-sm text-white block">{style.name}</span>
                <span className="text-xs text-zinc-500">{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Kairo Exclusive Modes */}
        <div className="pt-4 border-t border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Kairo Exclusive
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Focus Mode</h4>
                  <p className="text-sm text-zinc-500">Dim UI, suppress non-urgent pings</p>
                </div>
              </div>
              <Switch 
                checked={settings?.focus_mode}
                onCheckedChange={(v) => onUpdate?.({ focus_mode: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Ghost className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Ghost Mode</h4>
                  <p className="text-sm text-zinc-500">Full invisibility across all servers</p>
                </div>
              </div>
              <Switch 
                checked={settings?.ghost_mode}
                onCheckedChange={(v) => onUpdate?.({ ghost_mode: v })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Notifications</h2>
        <p className="text-sm text-zinc-500">Configure how you receive notifications</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Desktop Notifications</h4>
            <p className="text-sm text-zinc-500">Show desktop alerts</p>
          </div>
          <Switch checked={true} />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Message Sounds</h4>
            <p className="text-sm text-zinc-500">Play sound for new messages</p>
          </div>
          <Switch checked={true} />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Flash Taskbar</h4>
            <p className="text-sm text-zinc-500">Flash when new message arrives</p>
          </div>
          <Switch checked={true} />
        </div>
      </div>
    </div>
  );
}

export default function SettingsModal({ isOpen, onClose, profile, onUpdateProfile, onLogout }) {
  const [activeSection, setActiveSection] = useState('account');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings profile={profile} onUpdate={onUpdateProfile} />;
      case 'privacy':
        return <PrivacySettings settings={profile?.settings} onUpdate={(s) => onUpdateProfile?.({ settings: { ...profile?.settings, ...s } })} />;
      case 'notifications':
        return <NotificationSettings settings={profile?.settings} onUpdate={(s) => onUpdateProfile?.({ settings: { ...profile?.settings, ...s } })} />;
      case 'appearance':
        return <AppearanceSettings settings={profile?.settings} onUpdate={(s) => onUpdateProfile?.({ settings: { ...profile?.settings, ...s } })} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex w-full h-full"
      >
        {/* Sidebar */}
        <div className="w-56 bg-[#121214] flex flex-col">
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              User Settings
            </h3>
            <nav className="space-y-0.5">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    activeSection === section.id 
                      ? "bg-zinc-700/50 text-white" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div className="my-4 h-px bg-zinc-800" />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#0f0f11] overflow-y-auto">
          <div className="max-w-2xl mx-auto py-10 px-8">
            {renderContent()}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}