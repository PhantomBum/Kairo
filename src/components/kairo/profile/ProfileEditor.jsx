import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Upload, Sparkles, Palette, Image, Crown, Star, 
  Check, Eye, Wand2, Layers, Type, Badge, Link, 
  Twitter, Github, Linkedin, Instagram, Twitch, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import icons for ProfilePreview
const Twitter = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);
const Linkedin = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const Instagram = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const Twitch = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);
const Globe = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// Profile Preview Component
function ProfilePreview({ profile, equipped }) {
  return (
    <div className="w-80 bg-zinc-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Banner */}
      <div 
        className="h-24 relative"
        style={{ 
          background: equipped?.banner 
            ? `url(${equipped.banner.asset_url}) center/cover`
            : profile?.banner_url 
            ? `url(${profile.banner_url}) center/cover`
            : `linear-gradient(135deg, ${profile?.accent_color || '#6366f1'}40, ${profile?.accent_color || '#6366f1'}20)`
        }}
      >
        {/* Profile effect overlay */}
        {equipped?.profile_effect && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${equipped.profile_effect.asset_url})`,
              backgroundSize: 'cover',
              mixBlendMode: 'screen'
            }}
          />
        )}
      </div>

      {/* Avatar */}
      <div className="px-4 -mt-10">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full border-4 border-zinc-900 overflow-hidden bg-zinc-800">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl font-bold">
                {profile?.display_name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          {/* Avatar decoration */}
          {equipped?.profile_decoration && (
            <img 
              src={equipped.profile_decoration.asset_url}
              alt=""
              className="absolute -inset-2 w-24 h-24 pointer-events-none"
            />
          )}

          {/* Status */}
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-zinc-900 bg-emerald-500" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-2">
        {/* Name with nameplate */}
        <div className={cn(
          "inline-block px-2 py-0.5 rounded",
          equipped?.nameplate && "bg-gradient-to-r",
          equipped?.nameplate?.asset_url
        )}>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {profile?.display_name || 'User'}
            {equipped?.badge && (
              <img src={equipped.badge.asset_url} alt="" className="w-5 h-5" />
            )}
          </h3>
        </div>
        <p className="text-sm text-zinc-400">@{profile?.username || 'username'}</p>

        {/* Custom status */}
        {profile?.custom_status?.text && (
          <p className="text-sm text-zinc-300 mt-2 flex items-center gap-2">
            {profile.custom_status.emoji && <span>{profile.custom_status.emoji}</span>}
            {profile.custom_status.text}
          </p>
        )}

        {/* Pronouns */}
        {profile?.pronouns && profile.pronouns !== 'custom' && (
          <p className="text-xs text-zinc-500 mt-1">{profile.pronouns}</p>
        )}

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-sm text-zinc-300">{profile.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {profile?.social_links && Object.values(profile.social_links).some(v => v) && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase mb-2">Connections</p>
            <div className="flex gap-2 flex-wrap">
              {profile.social_links.twitter && (
                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" 
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Twitter className="w-4 h-4 text-sky-400" />
                </a>
              )}
              {profile.social_links.github && (
                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Github className="w-4 h-4 text-zinc-300" />
                </a>
              )}
              {profile.social_links.linkedin && (
                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Linkedin className="w-4 h-4 text-blue-500" />
                </a>
              )}
              {profile.social_links.instagram && (
                <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Instagram className="w-4 h-4 text-pink-500" />
                </a>
              )}
              {profile.social_links.twitch && (
                <a href={profile.social_links.twitch} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Twitch className="w-4 h-4 text-purple-500" />
                </a>
              )}
              {profile.social_links.website && (
                <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer"
                   className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Decoration Selector
function DecorationSelector({ items = [], equipped, onSelect, type }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* None option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "aspect-square rounded-xl border-2 flex items-center justify-center transition-all",
          !equipped 
            ? "border-indigo-500 bg-indigo-500/10" 
            : "border-zinc-800 hover:border-zinc-700"
        )}
      >
        <X className="w-6 h-6 text-zinc-500" />
      </button>

      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={cn(
            "aspect-square rounded-xl border-2 overflow-hidden transition-all relative group",
            equipped?.id === item.id 
              ? "border-indigo-500" 
              : "border-zinc-800 hover:border-zinc-700"
          )}
        >
          {item.preview_url ? (
            <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
          )}

          {/* Equipped indicator */}
          {equipped?.id === item.id && (
            <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Hover info */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs text-white truncate">{item.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function ProfileEditor({ profile, inventory = [], onUpdateProfile, onClose }) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    pronouns: profile?.pronouns || '',
    accent_color: profile?.accent_color || '#6366f1',
    avatar_url: profile?.avatar_url || '',
    banner_url: profile?.banner_url || '',
    social_links: profile?.social_links || {
      twitter: '',
      github: '',
      linkedin: '',
      instagram: '',
      twitch: '',
      website: ''
    }
  });

  const [richPresence, setRichPresence] = useState(profile?.rich_presence || {
    type: 'playing',
    name: '',
    details: '',
    state: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (type === 'avatar') {
        setFormData({ ...formData, avatar_url: file_url });
        setAvatarFile(null);
      } else {
        setFormData({ ...formData, banner_url: file_url });
        setBannerFile(null);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const [equipped, setEquipped] = useState({
    profile_decoration: inventory.find(i => i.item_type === 'profile_decoration' && i.is_equipped),
    profile_effect: inventory.find(i => i.item_type === 'profile_effect' && i.is_equipped),
    banner: inventory.find(i => i.item_type === 'banner' && i.is_equipped),
    nameplate: inventory.find(i => i.item_type === 'nameplate' && i.is_equipped),
    badge: inventory.find(i => i.item_type === 'badge' && i.is_equipped)
  });

  const decorations = inventory.filter(i => i.item_type === 'profile_decoration');
  const effects = inventory.filter(i => i.item_type === 'profile_effect');
  const banners = inventory.filter(i => i.item_type === 'banner');
  const nameplates = inventory.filter(i => i.item_type === 'nameplate');
  const badges = inventory.filter(i => i.item_type === 'badge');

  const handleEquip = async (type, item) => {
    setEquipped({ ...equipped, [type]: item });

    // Update inventory items
    const itemsOfType = inventory.filter(i => i.item_type === type);
    for (const invItem of itemsOfType) {
      await base44.entities.UserInventory.update(invItem.id, {
        is_equipped: invItem.id === item?.id
      });
    }

    queryClient.invalidateQueries({ queryKey: ['userInventory'] });
  };

  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile?.({ 
        ...formData, 
        rich_presence: richPresence.name ? richPresence : null 
      });
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];

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
        {/* Editor */}
        <div className="flex-1 bg-[#0f0f11] overflow-y-auto">
          <div className="max-w-2xl mx-auto py-10 px-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
              <button onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-zinc-800/50">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="socials">Socials</TabsTrigger>
                <TabsTrigger value="presence">Rich Presence</TabsTrigger>
                <TabsTrigger value="decorations">Decorations</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {/* Avatar & Banner upload */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Avatar</Label>
                    <label className="block h-32 rounded-xl bg-zinc-800/50 border-2 border-dashed border-zinc-700 cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'avatar');
                        }}
                        className="hidden"
                      />
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                            <span className="text-sm text-zinc-500">Upload avatar</span>
                            <p className="text-xs text-zinc-600 mt-1">JPG, PNG, GIF</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Banner</Label>
                    <label className="block h-32 rounded-xl bg-zinc-800/50 border-2 border-dashed border-zinc-700 cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'banner');
                        }}
                        className="hidden"
                      />
                      {formData.banner_url ? (
                        <img src={formData.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Image className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                            <span className="text-sm text-zinc-500">Upload banner</span>
                            <p className="text-xs text-zinc-600 mt-1">JPG, PNG, GIF</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Form fields */}
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Pronouns</Label>
                  <select
                    value={formData.pronouns}
                    onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select pronouns</option>
                    <option value="he/him">he/him</option>
                    <option value="she/her">she/her</option>
                    <option value="they/them">they/them</option>
                    <option value="he/they">he/they</option>
                    <option value="she/they">she/they</option>
                    <option value="any">any pronouns</option>
                    <option value="ask">ask me</option>
                    <option value="custom">custom</option>
                  </select>
                  {formData.pronouns === 'custom' && (
                    <Input
                      value={formData.custom_pronouns || ''}
                      onChange={(e) => setFormData({ ...formData, custom_pronouns: e.target.value, pronouns: e.target.value || 'custom' })}
                      placeholder="Enter custom pronouns"
                      className="bg-zinc-900 border-zinc-800 text-white mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">About Me</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell the world about yourself..."
                    rows={4}
                    className="bg-zinc-900 border-zinc-800 text-white resize-none"
                  />
                </div>

                {/* Accent color */}
                <div className="space-y-3">
                  <Label className="text-zinc-400">Accent Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
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
              </TabsContent>

              <TabsContent value="socials" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Social Links</h3>
                  <p className="text-sm text-zinc-400 mb-6">Connect your social media profiles</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-sky-400" />
                      Twitter / X
                    </Label>
                    <Input
                      value={formData.social_links?.twitter || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, twitter: e.target.value }
                      })}
                      placeholder="https://twitter.com/username"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Github className="w-4 h-4 text-zinc-300" />
                      GitHub
                    </Label>
                    <Input
                      value={formData.social_links?.github || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, github: e.target.value }
                      })}
                      placeholder="https://github.com/username"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-500" />
                      LinkedIn
                    </Label>
                    <Input
                      value={formData.social_links?.linkedin || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, linkedin: e.target.value }
                      })}
                      placeholder="https://linkedin.com/in/username"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      value={formData.social_links?.instagram || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, instagram: e.target.value }
                      })}
                      placeholder="https://instagram.com/username"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Twitch className="w-4 h-4 text-purple-500" />
                      Twitch
                    </Label>
                    <Input
                      value={formData.social_links?.twitch || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, twitch: e.target.value }
                      })}
                      placeholder="https://twitch.tv/username"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Website
                    </Label>
                    <Input
                      value={formData.social_links?.website || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        social_links: { ...formData.social_links, website: e.target.value }
                      })}
                      placeholder="https://yourwebsite.com"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
                  <p className="text-xs text-zinc-500">
                    Your social links will be visible on your profile. Leave empty to hide.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="presence" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Rich Presence</h3>
                    <p className="text-sm text-zinc-400 mb-4">Show what you're doing on your profile</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400">Activity Type</Label>
                    <select
                      value={richPresence.type}
                      onChange={(e) => setRichPresence({ ...richPresence, type: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="playing">Playing</option>
                      <option value="listening">Listening to</option>
                      <option value="watching">Watching</option>
                      <option value="streaming">Streaming</option>
                      <option value="competing">Competing in</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400">Activity Name</Label>
                    <Input
                      value={richPresence.name}
                      onChange={(e) => setRichPresence({ ...richPresence, name: e.target.value })}
                      placeholder="e.g., Minecraft, Spotify, YouTube"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400">Details (Optional)</Label>
                    <Input
                      value={richPresence.details}
                      onChange={(e) => setRichPresence({ ...richPresence, details: e.target.value })}
                      placeholder="e.g., In Main Menu, Episode 5"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400">State (Optional)</Label>
                    <Input
                      value={richPresence.state}
                      onChange={(e) => setRichPresence({ ...richPresence, state: e.target.value })}
                      placeholder="e.g., Level 42, Season 3"
                      className="bg-zinc-900 border-zinc-800 text-white"
                    />
                  </div>

                  {richPresence.name && (
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl">
                      <p className="text-xs text-zinc-500 uppercase mb-2">Preview</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-zinc-500" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            {richPresence.type === 'playing' && 'Playing '}
                            {richPresence.type === 'listening' && 'Listening to '}
                            {richPresence.type === 'watching' && 'Watching '}
                            {richPresence.type === 'streaming' && 'Streaming '}
                            {richPresence.type === 'competing' && 'Competing in '}
                            <span className="font-bold">{richPresence.name}</span>
                          </p>
                          {richPresence.details && (
                            <p className="text-xs text-zinc-400">{richPresence.details}</p>
                          )}
                          {richPresence.state && (
                            <p className="text-xs text-zinc-400">{richPresence.state}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setRichPresence({ type: 'playing', name: '', details: '', state: '' })}
                    className="w-full"
                  >
                    Clear Rich Presence
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="decorations" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-white">Avatar Decorations</h3>
                  </div>
                  <DecorationSelector
                    items={decorations}
                    equipped={equipped.profile_decoration}
                    onSelect={(item) => handleEquip('profile_decoration', item)}
                    type="profile_decoration"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white">Badges</h3>
                  </div>
                  <DecorationSelector
                    items={badges}
                    equipped={equipped.badge}
                    onSelect={(item) => handleEquip('badge', item)}
                    type="badge"
                  />
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">Profile Effects</h3>
                  </div>
                  <DecorationSelector
                    items={effects}
                    equipped={equipped.profile_effect}
                    onSelect={(item) => handleEquip('profile_effect', item)}
                    type="profile_effect"
                  />
                </div>
              </TabsContent>

              <TabsContent value="themes" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5 text-pink-400" />
                    <h3 className="font-semibold text-white">Profile Banners</h3>
                  </div>
                  <DecorationSelector
                    items={banners}
                    equipped={equipped.banner}
                    onSelect={(item) => handleEquip('banner', item)}
                    type="banner"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Nameplates</h3>
                  </div>
                  <DecorationSelector
                    items={nameplates}
                    equipped={equipped.nameplate}
                    onSelect={(item) => handleEquip('nameplate', item)}
                    type="nameplate"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-zinc-800">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={uploading || saving}
                className="bg-violet-500 hover:bg-violet-600 disabled:opacity-50 rounded-xl"
              >
                {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-96 bg-zinc-900/50 border-l border-zinc-800 flex items-center justify-center p-8">
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 text-center">
              Preview
            </h3>
            <ProfilePreview profile={{ ...profile, ...formData }} equipped={equipped} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}