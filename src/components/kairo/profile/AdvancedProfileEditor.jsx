import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Upload, Sparkles, Palette, Image, Crown, Star, Music,
  Check, Eye, Wand2, Layers, Type, Link, Play, Pause,
  Gamepad2, Monitor, Headphones, Video, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Activity types with icons
const activityTypes = [
  { id: 'playing', label: 'Playing', icon: Gamepad2 },
  { id: 'listening', label: 'Listening to', icon: Headphones },
  { id: 'watching', label: 'Watching', icon: Monitor },
  { id: 'streaming', label: 'Streaming', icon: Video },
  { id: 'competing', label: 'Competing in', icon: Trophy },
];

// Profile effect animations
const profileEffects = [
  { id: 'none', name: 'None', preview: null },
  { id: 'sparkle', name: 'Sparkle', preview: '✨' },
  { id: 'fire', name: 'Fire', preview: '🔥' },
  { id: 'rainbow', name: 'Rainbow', preview: '🌈' },
  { id: 'snow', name: 'Snow', preview: '❄️' },
  { id: 'hearts', name: 'Hearts', preview: '💖' },
  { id: 'stars', name: 'Stars', preview: '⭐' },
  { id: 'cosmic', name: 'Cosmic', preview: '🌌' },
];

// Avatar frames
const avatarFrames = [
  { id: 'none', name: 'None' },
  { id: 'gold', name: 'Gold Ring', color: '#fbbf24' },
  { id: 'silver', name: 'Silver Ring', color: '#9ca3af' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'ruby', name: 'Ruby', color: '#ef4444' },
  { id: 'sapphire', name: 'Sapphire', color: '#3b82f6' },
  { id: 'amethyst', name: 'Amethyst', color: '#8b5cf6' },
  { id: 'rainbow', name: 'Rainbow', gradient: true },
];

// Nameplate styles
const nameplateStyles = [
  { id: 'none', name: 'Default' },
  { id: 'gradient-blue', name: 'Ocean Wave', from: '#0ea5e9', to: '#6366f1' },
  { id: 'gradient-fire', name: 'Fire', from: '#f97316', to: '#ef4444' },
  { id: 'gradient-forest', name: 'Forest', from: '#22c55e', to: '#14b8a6' },
  { id: 'gradient-sunset', name: 'Sunset', from: '#f59e0b', to: '#ec4899' },
  { id: 'gradient-cosmic', name: 'Cosmic', from: '#8b5cf6', to: '#ec4899' },
  { id: 'holographic', name: 'Holographic', special: true },
];

// Accent colors
const accentColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

// Social platforms
const socialPlatforms = [
  { id: 'twitter', name: 'Twitter / X', placeholder: 'https://twitter.com/username' },
  { id: 'github', name: 'GitHub', placeholder: 'https://github.com/username' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username' },
  { id: 'twitch', name: 'Twitch', placeholder: 'https://twitch.tv/username' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@username' },
  { id: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@username' },
  { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/user/...' },
  { id: 'website', name: 'Website', placeholder: 'https://yourwebsite.com' },
];

export default function AdvancedProfileEditor({ profile, inventory = [], onUpdateProfile, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    pronouns: profile?.pronouns || '',
    accent_color: profile?.accent_color || '#6366f1',
    avatar_url: profile?.avatar_url || '',
    banner_url: profile?.banner_url || '',
    avatar_frame: profile?.avatar_frame || 'none',
    profile_effect: profile?.profile_effect || 'none',
    nameplate_style: profile?.nameplate_style || 'none',
    custom_css: profile?.custom_css || '',
    social_links: profile?.social_links || {},
    rich_presence: profile?.rich_presence || {
      type: 'playing',
      name: '',
      details: '',
      state: '',
      large_image: '',
      small_image: ''
    },
    spotify_integration: profile?.spotify_integration || {
      enabled: false,
      show_on_profile: true
    },
    profile_music: profile?.profile_music || {
      enabled: false,
      url: '',
      autoplay: false,
      volume: 50
    }
  });

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newData = { ...formData, [type]: file_url };
      setFormData(newData);
      await onUpdateProfile?.({ [type]: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile?.(formData);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  // Live preview component
  const ProfilePreview = () => {
    const frame = avatarFrames.find(f => f.id === formData.avatar_frame);
    const nameplate = nameplateStyles.find(n => n.id === formData.nameplate_style);
    const effect = profileEffects.find(e => e.id === formData.profile_effect);

    return (
      <div className="w-80 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner */}
        <div 
          className="h-28 relative"
          style={{ 
            background: formData.banner_url 
              ? `url(${formData.banner_url}) center/cover`
              : `linear-gradient(135deg, ${formData.accent_color}40, ${formData.accent_color}20)`
          }}
        >
          {effect?.preview && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse opacity-50">
              {effect.preview}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-12">
          <div className="relative inline-block">
            <div 
              className={cn(
                "w-24 h-24 rounded-full border-4 border-zinc-900 overflow-hidden bg-zinc-800",
                frame?.gradient && "ring-2 ring-offset-2 ring-offset-zinc-900"
              )}
              style={frame?.color ? { 
                boxShadow: `0 0 0 3px ${frame.color}`,
              } : frame?.gradient ? {
                background: 'linear-gradient(45deg, #ef4444, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6, #ec4899)'
              } : {}}
            >
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                  {formData.display_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-zinc-900 bg-emerald-500" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pt-2">
          <div 
            className={cn(
              "inline-block px-2 py-0.5 rounded-lg",
              nameplate?.from && "text-white"
            )}
            style={nameplate?.from ? {
              background: `linear-gradient(90deg, ${nameplate.from}, ${nameplate.to})`
            } : {}}
          >
            <h3 className="text-xl font-bold text-white">
              {formData.display_name || 'Display Name'}
            </h3>
          </div>
          <p className="text-sm text-zinc-400">@{formData.username || 'username'}</p>

          {formData.pronouns && (
            <p className="text-xs text-zinc-500 mt-1">{formData.pronouns}</p>
          )}

          {formData.bio && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-sm text-zinc-300">{formData.bio}</p>
            </div>
          )}

          {/* Rich Presence Preview */}
          {formData.rich_presence?.name && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg">
                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                  {activityTypes.find(a => a.id === formData.rich_presence.type)?.icon && 
                    React.createElement(activityTypes.find(a => a.id === formData.rich_presence.type).icon, {
                      className: "w-6 h-6 text-zinc-400"
                    })
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500 uppercase">
                    {activityTypes.find(a => a.id === formData.rich_presence.type)?.label}
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {formData.rich_presence.name}
                  </p>
                  {formData.rich_presence.details && (
                    <p className="text-xs text-zinc-400 truncate">{formData.rich_presence.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Links Preview */}
          {Object.values(formData.social_links).some(v => v) && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase mb-2">Connections</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(formData.social_links).map(([platform, url]) => url && (
                  <div key={platform} className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Link className="w-4 h-4 text-zinc-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex w-full h-full"
      >
        {/* Editor Panel */}
        <div className="flex-1 bg-[#0a0a0b] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Customize Profile</h1>
              <p className="text-sm text-zinc-500 mt-1">Express yourself with advanced customization</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="px-6 py-2 bg-transparent border-b border-white/5 justify-start gap-1">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="socials">Socials</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="basic" className="m-0 space-y-6">
                {/* Avatar & Banner */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-zinc-400">Avatar</Label>
                    <label className="block aspect-square max-w-[180px] rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], 'avatar_url')}
                        className="hidden"
                      />
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                          <span className="text-sm text-zinc-500">Upload</span>
                          <span className="text-xs text-zinc-600">GIF supported</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-zinc-400">Banner</Label>
                    <label className="block aspect-[3/1] rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], 'banner_url')}
                        className="hidden"
                      />
                      {formData.banner_url ? (
                        <img src={formData.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Image className="w-8 h-8 text-zinc-500 mb-2" />
                          <span className="text-sm text-zinc-500">Upload banner</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Display Name</Label>
                    <Input
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Username</Label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Pronouns</Label>
                  <select
                    value={formData.pronouns}
                    onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-lg"
                  >
                    <option value="">Select pronouns</option>
                    <option value="he/him">he/him</option>
                    <option value="she/her">she/her</option>
                    <option value="they/them">they/them</option>
                    <option value="he/they">he/they</option>
                    <option value="she/they">she/they</option>
                    <option value="any">any pronouns</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">About Me</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell the world about yourself..."
                    rows={4}
                    className="bg-black/50 border-white/10 resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="m-0 space-y-6">
                {/* Accent Color */}
                <div className="space-y-3">
                  <Label className="text-zinc-400">Accent Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {accentColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, accent_color: color })}
                        className={cn(
                          "w-8 h-8 rounded-full transition-transform",
                          formData.accent_color === color && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Avatar Frame */}
                <div className="space-y-3">
                  <Label className="text-zinc-400">Avatar Frame</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {avatarFrames.map(frame => (
                      <button
                        key={frame.id}
                        onClick={() => setFormData({ ...formData, avatar_frame: frame.id })}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all",
                          formData.avatar_frame === frame.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div 
                          className="w-12 h-12 mx-auto rounded-full border-4"
                          style={frame.color ? { borderColor: frame.color } : frame.gradient ? {
                            borderImage: 'linear-gradient(45deg, #ef4444, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6, #ec4899) 1'
                          } : { borderColor: '#3f3f46' }}
                        />
                        <p className="text-xs text-center text-zinc-400 mt-2">{frame.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nameplate Style */}
                <div className="space-y-3">
                  <Label className="text-zinc-400">Nameplate Style</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {nameplateStyles.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({ ...formData, nameplate_style: style.id })}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all",
                          formData.nameplate_style === style.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div 
                          className="h-6 rounded-lg"
                          style={style.from ? {
                            background: `linear-gradient(90deg, ${style.from}, ${style.to})`
                          } : { background: '#27272a' }}
                        />
                        <p className="text-xs text-center text-zinc-400 mt-2">{style.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="m-0 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Rich Presence</h3>
                  <p className="text-sm text-zinc-500 mb-6">Show what you're doing on your profile</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Activity Type</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {activityTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setFormData({
                            ...formData,
                            rich_presence: { ...formData.rich_presence, type: type.id }
                          })}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                            formData.rich_presence.type === type.id
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-white/5 hover:border-white/10"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Activity Name</Label>
                  <Input
                    value={formData.rich_presence.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      rich_presence: { ...formData.rich_presence, name: e.target.value }
                    })}
                    placeholder="e.g., Minecraft, Spotify, YouTube"
                    className="bg-black/50 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Details</Label>
                  <Input
                    value={formData.rich_presence.details}
                    onChange={(e) => setFormData({
                      ...formData,
                      rich_presence: { ...formData.rich_presence, details: e.target.value }
                    })}
                    placeholder="e.g., In Main Menu, Episode 5"
                    className="bg-black/50 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">State</Label>
                  <Input
                    value={formData.rich_presence.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      rich_presence: { ...formData.rich_presence, state: e.target.value }
                    })}
                    placeholder="e.g., Level 42, Playing Solo"
                    className="bg-black/50 border-white/10"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={() => setFormData({
                    ...formData,
                    rich_presence: { type: 'playing', name: '', details: '', state: '', large_image: '', small_image: '' }
                  })}
                  className="w-full"
                >
                  Clear Activity
                </Button>
              </TabsContent>

              <TabsContent value="socials" className="m-0 space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">Social Links</h3>
                  <p className="text-sm text-zinc-500">Connect your profiles across the web</p>
                </div>

                {socialPlatforms.map(platform => (
                  <div key={platform.id} className="space-y-2">
                    <Label className="text-zinc-400">{platform.name}</Label>
                    <Input
                      value={formData.social_links[platform.id] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        social_links: { ...formData.social_links, [platform.id]: e.target.value }
                      })}
                      placeholder={platform.placeholder}
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="effects" className="m-0 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Profile Effects</h3>
                  <p className="text-sm text-zinc-500 mb-6">Add animated effects to your profile</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {profileEffects.map(effect => (
                    <button
                      key={effect.id}
                      onClick={() => setFormData({ ...formData, profile_effect: effect.id })}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        formData.profile_effect === effect.id
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="text-3xl mb-2">{effect.preview || '✖️'}</div>
                      <p className="text-sm text-white">{effect.name}</p>
                    </button>
                  ))}
                </div>

                {/* Profile Music */}
                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-emerald-400" />
                        Profile Music
                      </h3>
                      <p className="text-sm text-zinc-500">Play music when people view your profile</p>
                    </div>
                    <Switch
                      checked={formData.profile_music.enabled}
                      onCheckedChange={(v) => setFormData({
                        ...formData,
                        profile_music: { ...formData.profile_music, enabled: v }
                      })}
                    />
                  </div>

                  {formData.profile_music.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Music URL (MP3)</Label>
                        <Input
                          value={formData.profile_music.url}
                          onChange={(e) => setFormData({
                            ...formData,
                            profile_music: { ...formData.profile_music, url: e.target.value }
                          })}
                          placeholder="https://example.com/music.mp3"
                          className="bg-black/50 border-white/10"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400">Autoplay</Label>
                        <Switch
                          checked={formData.profile_music.autoplay}
                          onCheckedChange={(v) => setFormData({
                            ...formData,
                            profile_music: { ...formData.profile_music, autoplay: v }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-zinc-400">Volume: {formData.profile_music.volume}%</Label>
                        <Slider
                          value={[formData.profile_music.volume]}
                          onValueChange={([v]) => setFormData({
                            ...formData,
                            profile_music: { ...formData.profile_music, volume: v }
                          })}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="m-0 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Custom CSS</h3>
                  <p className="text-sm text-zinc-500 mb-4">Advanced: Add custom styling to your profile</p>
                  <Textarea
                    value={formData.custom_css}
                    onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
                    placeholder={`/* Custom CSS */\n.profile-card {\n  /* your styles */\n}`}
                    rows={10}
                    className="bg-black/50 border-white/10 font-mono text-sm resize-none"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="p-6 border-t border-white/5 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={uploading || saving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-[400px] bg-zinc-900/50 border-l border-white/5 flex items-center justify-center p-8">
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 text-center">
              Live Preview
            </h3>
            <ProfilePreview />
          </div>
        </div>
      </motion.div>
    </div>
  );
}