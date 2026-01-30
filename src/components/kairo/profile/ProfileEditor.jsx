import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Upload, Sparkles, Palette, Image, Crown, Star, 
  Check, Eye, Wand2, Layers, Type, Badge
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

        {/* Bio */}
        {profile?.bio && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <p className="text-sm text-zinc-300">{profile.bio}</p>
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
    banner_url: profile?.banner_url || ''
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