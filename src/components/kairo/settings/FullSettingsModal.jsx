import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, User, Shield, Bell, Palette, Volume2, Keyboard, Database, Server,
  LogOut, ChevronRight, Moon, Ghost, Eye, Upload, Trash2, Globe, Lock,
  MessageCircle, Users, Zap, Monitor, Mic, Headphones, Radio, Sliders,
  Activity, Clock, Key, Smartphone, Laptop, HardDrive, Download, RefreshCw, Youtube, Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const settingsSections = [
  { id: 'account', label: 'My Account', icon: User, category: 'User Settings' },
  { id: 'privacy', label: 'Privacy & Safety', icon: Shield, category: 'User Settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, category: 'User Settings' },
  { id: 'appearance', label: 'Appearance', icon: Palette, category: 'App Settings' },
  { id: 'voice', label: 'Voice & Audio', icon: Volume2, category: 'App Settings' },
  { id: 'keybinds', label: 'Keybinds', icon: Keyboard, category: 'App Settings' },
  { id: 'sessions', label: 'Data & Sessions', icon: Database, category: 'App Settings' },
  { id: 'servers', label: 'Server Preferences', icon: Server, category: 'App Settings' },
];

// Account Settings Component
function AccountSettings({ profile, settings, onUpdate }) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    pronouns: profile?.pronouns || '',
    accent_color: profile?.accent_color || '#5865f2',
    youtube_channel: profile?.youtube_channel || { url: '', show_icon: true },
    badges: profile?.badges || []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setFormData({
      display_name: profile?.display_name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      pronouns: profile?.pronouns || '',
      accent_color: profile?.accent_color || '#5865f2',
      youtube_channel: profile?.youtube_channel || { url: '', show_icon: true },
      badges: profile?.badges || []
    });
  }, [profile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onUpdate?.({ avatar_url: file_url });
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onUpdate?.({ banner_url: file_url });
    } catch (error) {
      console.error('Banner upload failed:', error);
      alert('Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate?.(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to save changes');
    }
  };

  const accentColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">My Account</h2>
        <p className="text-sm text-zinc-500">Manage your account settings and profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
        <div 
          className="h-24 relative"
          style={{ 
            background: profile?.banner_url 
              ? `url(${profile.banner_url}) center/cover`
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
            id="banner-upload"
          />
          <label htmlFor="banner-upload">
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 cursor-pointer"
              disabled={isUploading}
              asChild
            >
              <span>{isUploading ? 'Uploading...' : 'Change Banner'}</span>
            </Button>
          </label>
        </div>
        <div className="px-4 pb-4 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#121214] overflow-hidden bg-zinc-800">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                    {formData.display_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <button 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-600"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 text-white" />
                </button>
              </label>
            </div>
            <div className="flex-1 pt-10">
              <h3 className="text-lg font-semibold text-white">{formData.display_name || 'User'}</h3>
              <p className="text-sm text-zinc-400">@{formData.username || 'username'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Display Name</Label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-white"
              disabled
              title="Username cannot be changed"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">Pronouns</Label>
          <Input
            value={formData.pronouns}
            onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
            placeholder="e.g., they/them"
            className="bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-400">About Me</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={3}
            className="bg-zinc-900 border-zinc-800 text-white resize-none"
          />
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-2">
          <Label className="text-zinc-400">Accent Color</Label>
          <div className="flex flex-wrap gap-2">
            {accentColors.map((color, idx) => (
              <button
                key={`color-${color}-${idx}`}
                onClick={() => setFormData({ ...formData, accent_color: color })}
                className={cn(
                  "w-10 h-10 rounded-full transition-all",
                  formData.accent_color === color && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* YouTube Connection */}
        <div className="space-y-2 pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <Label className="text-zinc-400">YouTube Channel</Label>
            {formData.badges?.includes('youtube') && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 rounded-full">
                <Crown className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-400">Linked</span>
              </div>
            )}
          </div>
          <Input
            value={formData.youtube_channel?.url || ''}
            onChange={(e) => {
              const url = e.target.value;
              const newBadges = url ? [...new Set([...(formData.badges || []), 'youtube'])] : (formData.badges || []).filter(b => b !== 'youtube');
              setFormData({ 
                ...formData, 
                youtube_channel: { ...formData.youtube_channel, url },
                badges: newBadges
              });
            }}
            placeholder="https://youtube.com/@yourchannel"
            className="bg-zinc-900 border-zinc-800 text-white"
          />
          {formData.youtube_channel?.url && (
            <div className="flex items-center gap-2 p-3 bg-zinc-800/30 rounded-lg">
              <input
                type="checkbox"
                id="show-youtube-icon"
                checked={formData.youtube_channel?.show_icon !== false}
                onChange={(e) => setFormData({
                  ...formData,
                  youtube_channel: { ...formData.youtube_channel, show_icon: e.target.checked }
                })}
                className="w-4 h-4"
              />
              <label htmlFor="show-youtube-icon" className="text-sm text-zinc-400">
                Show YouTube icon next to my name in chat
              </label>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1 bg-indigo-500 hover:bg-indigo-600">
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFormData({
              display_name: profile?.display_name || '',
              username: profile?.username || '',
              bio: profile?.bio || '',
              pronouns: profile?.pronouns || '',
              accent_color: profile?.accent_color || '#5865f2',
              youtube_channel: profile?.youtube_channel || { url: '', show_icon: true },
              badges: profile?.badges || []
            })}
          >
            Cancel
          </Button>
        </div>
        </div>

      {/* Email section */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white mb-4">Email</h3>
        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <p className="text-white">{profile?.user_email}</p>
            <p className="text-xs text-zinc-500">Your email address</p>
          </div>
          <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Change</Button>
        </div>
      </div>

      {/* Password section */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white mb-4">Password</h3>
        <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">Change Password</Button>
      </div>

      {/* Danger zone */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="flex gap-3">
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            Disable Account
          </Button>
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettings({ settings, onUpdate }) {
  const privacy = settings?.privacy || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Privacy & Safety</h2>
        <p className="text-sm text-zinc-500">Manage how others can interact with you</p>
      </div>

      <div className="space-y-4">
        {/* DM Privacy */}
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
            value={privacy.dm_privacy || 'everyone'}
            onValueChange={(v) => onUpdate?.({ privacy: { ...privacy, dm_privacy: v } })}
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

        {/* Friend Requests */}
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
            value={privacy.friend_requests || 'everyone'}
            onValueChange={(v) => onUpdate?.({ privacy: { ...privacy, friend_requests: v } })}
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

        {/* Read Receipts */}
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
            checked={privacy.read_receipts !== false}
            onCheckedChange={(v) => onUpdate?.({ privacy: { ...privacy, read_receipts: v } })}
          />
        </div>

        {/* Typing Indicators */}
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
            checked={privacy.typing_indicators !== false}
            onCheckedChange={(v) => onUpdate?.({ privacy: { ...privacy, typing_indicators: v } })}
          />
        </div>

        {/* Activity Status */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">Show Activity Status</h4>
              <p className="text-sm text-zinc-500">Display your current activity</p>
            </div>
          </div>
          <Switch 
            checked={privacy.show_activity !== false}
            onCheckedChange={(v) => onUpdate?.({ privacy: { ...privacy, show_activity: v } })}
          />
        </div>
      </div>
    </div>
  );
}

// Voice Settings Component
function VoiceSettings({ settings, onUpdate }) {
  const voice = settings?.voice || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Voice & Audio</h2>
        <p className="text-sm text-zinc-500">Configure your voice and audio settings</p>
      </div>

      {/* Input Device */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Input Device</h3>
        <Select 
          value={voice.input_device || 'default'}
          onValueChange={(v) => onUpdate?.({ voice: { ...voice, input_device: v } })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="default">Default Microphone</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Input Volume</span>
            <span className="text-white">{voice.input_volume || 100}%</span>
          </div>
          <Slider
            value={[voice.input_volume || 100]}
            onValueChange={([v]) => onUpdate?.({ voice: { ...voice, input_volume: v } })}
            max={200}
            step={1}
          />
        </div>
      </div>

      {/* Output Device */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white">Output Device</h3>
        <Select 
          value={voice.output_device || 'default'}
          onValueChange={(v) => onUpdate?.({ voice: { ...voice, output_device: v } })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
            <SelectValue placeholder="Select speakers" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="default">Default Speakers</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Output Volume</span>
            <span className="text-white">{voice.output_volume || 100}%</span>
          </div>
          <Slider
            value={[voice.output_volume || 100]}
            onValueChange={([v]) => onUpdate?.({ voice: { ...voice, output_volume: v } })}
            max={200}
            step={1}
          />
        </div>
      </div>

      {/* Input Mode */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white">Input Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onUpdate?.({ voice: { ...voice, input_mode: 'voice_activity' } })}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              voice.input_mode !== 'push_to_talk'
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 hover:border-zinc-700"
            )}
          >
            <Radio className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="font-medium text-white">Voice Activity</h4>
            <p className="text-xs text-zinc-500">Automatically transmit when you speak</p>
          </button>
          <button
            onClick={() => onUpdate?.({ voice: { ...voice, input_mode: 'push_to_talk' } })}
            className={cn(
              "p-4 rounded-lg border-2 text-left transition-all",
              voice.input_mode === 'push_to_talk'
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 hover:border-zinc-700"
            )}
          >
            <Key className="w-5 h-5 text-indigo-400 mb-2" />
            <h4 className="font-medium text-white">Push to Talk</h4>
            <p className="text-xs text-zinc-500">Press a key to transmit</p>
          </button>
        </div>

        {voice.input_mode === 'push_to_talk' && (
          <div className="space-y-2">
            <Label className="text-zinc-400">Push to Talk Key</Label>
            <Input
              value={voice.push_to_talk_key || ''}
              placeholder="Press a key..."
              className="bg-zinc-900 border-zinc-800 text-white"
              readOnly
              onKeyDown={(e) => {
                e.preventDefault();
                onUpdate?.({ voice: { ...voice, push_to_talk_key: e.key } });
              }}
            />
          </div>
        )}

        {voice.input_mode !== 'push_to_talk' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Voice Activity Sensitivity</span>
              <span className="text-white">{voice.voice_activity_sensitivity || 50}%</span>
            </div>
            <Slider
              value={[voice.voice_activity_sensitivity || 50]}
              onValueChange={([v]) => onUpdate?.({ voice: { ...voice, voice_activity_sensitivity: v } })}
              max={100}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Voice Processing */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white">Voice Processing</h3>
        
        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Noise Suppression</h4>
            <p className="text-sm text-zinc-500">Reduce background noise</p>
          </div>
          <Switch 
            checked={voice.noise_suppression !== false}
            onCheckedChange={(v) => onUpdate?.({ voice: { ...voice, noise_suppression: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Echo Cancellation</h4>
            <p className="text-sm text-zinc-500">Prevent echo feedback</p>
          </div>
          <Switch 
            checked={voice.echo_cancellation !== false}
            onCheckedChange={(v) => onUpdate?.({ voice: { ...voice, echo_cancellation: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Automatic Gain Control</h4>
            <p className="text-sm text-zinc-500">Automatically adjust microphone volume</p>
          </div>
          <Switch 
            checked={voice.auto_gain_control !== false}
            onCheckedChange={(v) => onUpdate?.({ voice: { ...voice, auto_gain_control: v } })}
          />
        </div>
      </div>
    </div>
  );
}

// Appearance Settings Component
function AppearanceSettings({ settings, onUpdate }) {
  const appearance = settings?.appearance || {};
  const kairoFeatures = settings?.kairo_features || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Appearance</h2>
        <p className="text-sm text-zinc-500">Customize how Kairo looks</p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <Label className="text-zinc-400">Theme</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark', name: 'Dark', bg: 'bg-zinc-900' },
            { id: 'amoled', name: 'AMOLED', bg: 'bg-black' },
            { id: 'midnight', name: 'Midnight', bg: 'bg-[#0a0a15]' }
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdate?.({ appearance: { ...appearance, theme: theme.id } })}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                appearance.theme === theme.id 
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
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <Label className="text-zinc-400">Message Display</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'cozy', name: 'Cozy', desc: 'Larger spacing' },
            { id: 'compact', name: 'Compact', desc: 'More messages' }
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => onUpdate?.({ appearance: { ...appearance, message_display: style.id } })}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all",
                appearance.message_display === style.id 
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

      {/* Font Size */}
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex justify-between">
          <Label className="text-zinc-400">Font Size</Label>
          <span className="text-white">{appearance.font_size || 16}px</span>
        </div>
        <Slider
          value={[appearance.font_size || 16]}
          onValueChange={([v]) => onUpdate?.({ appearance: { ...appearance, font_size: v } })}
          min={12}
          max={24}
          step={1}
        />
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
              checked={kairoFeatures.focus_mode}
              onCheckedChange={(v) => onUpdate?.({ kairo_features: { ...kairoFeatures, focus_mode: v } })}
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
              checked={kairoFeatures.ghost_mode}
              onCheckedChange={(v) => onUpdate?.({ kairo_features: { ...kairoFeatures, ghost_mode: v } })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Invisible Voice Listen</h4>
                <p className="text-sm text-zinc-500">Join voice channels without being seen</p>
              </div>
            </div>
            <Switch 
              checked={kairoFeatures.invisible_voice_listen}
              onCheckedChange={(v) => onUpdate?.({ kairo_features: { ...kairoFeatures, invisible_voice_listen: v } })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Streamer Mode</h4>
                <p className="text-sm text-zinc-500">Hide sensitive info while streaming</p>
              </div>
            </div>
            <Switch 
              checked={kairoFeatures.streamer_mode}
              onCheckedChange={(v) => onUpdate?.({ kairo_features: { ...kairoFeatures, streamer_mode: v } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Notifications Settings
function NotificationSettings({ settings, onUpdate }) {
  const notifications = settings?.notifications || {};

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
          <Switch 
            checked={notifications.desktop_enabled !== false}
            onCheckedChange={(v) => onUpdate?.({ notifications: { ...notifications, desktop_enabled: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Message Sounds</h4>
            <p className="text-sm text-zinc-500">Play sound for new messages</p>
          </div>
          <Switch 
            checked={notifications.sounds_enabled !== false}
            onCheckedChange={(v) => onUpdate?.({ notifications: { ...notifications, sounds_enabled: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Flash Taskbar</h4>
            <p className="text-sm text-zinc-500">Flash when new message arrives</p>
          </div>
          <Switch 
            checked={notifications.flash_taskbar !== false}
            onCheckedChange={(v) => onUpdate?.({ notifications: { ...notifications, flash_taskbar: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
          <div>
            <h4 className="font-medium text-white">Push Notifications</h4>
            <p className="text-sm text-zinc-500">Receive notifications on mobile</p>
          </div>
          <Switch 
            checked={notifications.push_notifications !== false}
            onCheckedChange={(v) => onUpdate?.({ notifications: { ...notifications, push_notifications: v } })}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white mb-4">Default Notification Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <div>
              <h4 className="font-medium text-white">DM Notifications</h4>
            </div>
            <Select 
              value={notifications.dm_notifications || 'all'}
              onValueChange={(v) => onUpdate?.({ notifications: { ...notifications, dm_notifications: v } })}
            >
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="mentions">Only @mentions</SelectItem>
                <SelectItem value="none">Nothing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Server Notifications</h4>
            </div>
            <Select 
              value={notifications.server_notifications_default || 'mentions'}
              onValueChange={(v) => onUpdate?.({ notifications: { ...notifications, server_notifications_default: v } })}
            >
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="mentions">Only @mentions</SelectItem>
                <SelectItem value="none">Nothing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Keybinds Settings
function KeybindsSettings({ settings, onUpdate }) {
  const keybinds = settings?.keybinds || [];

  const defaultKeybinds = [
    { action: 'Toggle Mute', key: 'M', modifiers: ['Ctrl'] },
    { action: 'Toggle Deafen', key: 'D', modifiers: ['Ctrl', 'Shift'] },
    { action: 'Push to Talk', key: 'V', modifiers: [] },
    { action: 'Toggle Video', key: 'E', modifiers: ['Ctrl', 'Shift'] },
    { action: 'Share Screen', key: 'S', modifiers: ['Ctrl', 'Shift'] },
    { action: 'Focus Mode', key: 'F', modifiers: ['Ctrl', 'Shift'] },
    { action: 'Ghost Mode', key: 'G', modifiers: ['Ctrl', 'Shift'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Keybinds</h2>
        <p className="text-sm text-zinc-500">Customize your keyboard shortcuts</p>
      </div>

      <div className="space-y-2">
        {defaultKeybinds.map((keybind, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <span className="text-white">{keybind.action}</span>
            <div className="flex items-center gap-1">
              {keybind.modifiers.map((mod, idx) => (
                <span key={`mod-${mod}-${idx}`} className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-300">
                  {mod}
                </span>
              ))}
              <span className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-300">
                {keybind.key}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700">
        Add Keybind
      </Button>
    </div>
  );
}

// Sessions Settings
function SessionsSettings({ settings }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Data & Sessions</h2>
        <p className="text-sm text-zinc-500">Manage your data and active sessions</p>
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="font-semibold text-white mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Laptop className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">This Device</h4>
                <p className="text-xs text-zinc-500">Chrome on Windows • Active now</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400">Current</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="pt-4 border-t border-zinc-800">
        <h3 className="font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
            <Download className="w-4 h-4 mr-2" />
            Request Data Export
          </Button>
          <Button variant="secondary" className="w-full justify-start bg-zinc-800 hover:bg-zinc-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Settings
          </Button>
          <Button variant="outline" className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Local Data
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Settings Modal
export default function FullSettingsModal({ isOpen, onClose, profile, userSettings, onUpdateProfile, onUpdateSettings, onLogout }) {
  const [activeSection, setActiveSection] = useState('account');

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings profile={profile} settings={userSettings} onUpdate={onUpdateProfile} />;
      case 'privacy':
        return <PrivacySettings settings={userSettings} onUpdate={onUpdateSettings} />;
      case 'notifications':
        return <NotificationSettings settings={userSettings} onUpdate={onUpdateSettings} />;
      case 'appearance':
        return <AppearanceSettings settings={userSettings} onUpdate={onUpdateSettings} />;
      case 'voice':
        return <VoiceSettings settings={userSettings} onUpdate={onUpdateSettings} />;
      case 'keybinds':
        return <KeybindsSettings settings={userSettings} onUpdate={onUpdateSettings} />;
      case 'sessions':
        return <SessionsSettings settings={userSettings} />;
      default:
        return <div className="flex items-center justify-center h-full text-zinc-500">Coming soon...</div>;
    }
  };

  // Group sections by category
  const groupedSections = settingsSections.reduce((acc, section) => {
    if (!acc[section.category]) acc[section.category] = [];
    acc[section.category].push(section);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex w-full h-full"
      >
        {/* Sidebar */}
        <div className="w-56 bg-[#121214] flex flex-col">
          <div className="flex-1 overflow-y-auto py-6 px-3">
            {Object.entries(groupedSections).map(([category, sections]) => (
              <div key={category} className="mb-4">
                <h3 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {category}
                </h3>
                <nav className="space-y-0.5">
                  {sections.map((section) => (
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
              </div>
            ))}

            <div className="my-4 h-px bg-zinc-800" />

            <button
              onClick={() => {
                localStorage.removeItem('kairo_access_key');
                localStorage.removeItem('kairo_current_user');
                window.location.href = '/';
              }}
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