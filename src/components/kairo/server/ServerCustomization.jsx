import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Palette, Image, Type, Sparkles, Upload, Check, X, 
  Layout, Globe, Link2, Eye, Wand2, Crown, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Server Theme Presets
const themePresets = [
  { id: 'midnight', name: 'Midnight', primary: '#6366f1', secondary: '#1e1b4b', accent: '#818cf8' },
  { id: 'ocean', name: 'Ocean', primary: '#0ea5e9', secondary: '#0c4a6e', accent: '#38bdf8' },
  { id: 'forest', name: 'Forest', primary: '#22c55e', secondary: '#14532d', accent: '#4ade80' },
  { id: 'sunset', name: 'Sunset', primary: '#f97316', secondary: '#7c2d12', accent: '#fb923c' },
  { id: 'rose', name: 'Rose', primary: '#ec4899', secondary: '#831843', accent: '#f472b6' },
  { id: 'lavender', name: 'Lavender', primary: '#a855f7', secondary: '#581c87', accent: '#c084fc' },
  { id: 'crimson', name: 'Crimson', primary: '#ef4444', secondary: '#7f1d1d', accent: '#f87171' },
  { id: 'gold', name: 'Gold', primary: '#eab308', secondary: '#713f12', accent: '#facc15' },
];

// Welcome Screen Templates
const welcomeTemplates = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple welcome message' },
  { id: 'community', name: 'Community', description: 'Rules, channels guide, and intro' },
  { id: 'gaming', name: 'Gaming', description: 'Game channels and voice info' },
  { id: 'professional', name: 'Professional', description: 'Business-focused onboarding' },
];

export default function ServerCustomization({ server, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('appearance');
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState({
    // Appearance
    theme_preset: server?.theme_preset || 'midnight',
    primary_color: server?.primary_color || '#6366f1',
    secondary_color: server?.secondary_color || '#1e1b4b',
    accent_color: server?.accent_color || '#818cf8',
    banner_url: server?.banner_url || '',
    icon_url: server?.icon_url || '',
    splash_url: server?.splash_url || '',
    
    // Welcome
    welcome_enabled: server?.welcome_enabled ?? true,
    welcome_template: server?.welcome_template || 'minimal',
    welcome_title: server?.welcome_title || `Welcome to ${server?.name}!`,
    welcome_message: server?.welcome_message || 'We\'re glad you\'re here. Check out our channels and say hi!',
    welcome_channel_id: server?.welcome_channel_id || '',
    
    // Vanity & Discovery
    vanity_url: server?.vanity_url || '',
    is_public: server?.is_public ?? false,
    discovery_description: server?.discovery_description || '',
    tags: server?.tags || [],
    
    // Features
    enable_boost_perks: server?.enable_boost_perks ?? true,
    enable_server_subscriptions: server?.enable_server_subscriptions ?? false,
    
    // Onboarding
    onboarding_enabled: server?.onboarding_enabled ?? false,
    onboarding_steps: server?.onboarding_steps || []
  });

  const [newTag, setNewTag] = useState('');

  const updateServerMutation = useMutation({
    mutationFn: (data) => base44.entities.Server.update(server.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberServers'] });
      queryClient.invalidateQueries({ queryKey: ['publicServers'] });
    }
  });

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings(prev => ({ ...prev, [type]: file_url }));
      await updateServerMutation.mutateAsync({ [type]: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const applyThemePreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      theme_preset: preset.id,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      accent_color: preset.accent
    }));
  };

  const addTag = () => {
    if (newTag && !settings.tags.includes(newTag) && settings.tags.length < 5) {
      setSettings(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setSettings(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSave = async () => {
    await updateServerMutation.mutateAsync(settings);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f0f11] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Server Customization
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Make {server?.name} uniquely yours</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex">
            <TabsList className="flex-col h-full w-48 bg-black/30 border-r border-white/5 justify-start gap-1 p-3 rounded-none">
              <TabsTrigger value="appearance" className="w-full justify-start gap-2">
                <Palette className="w-4 h-4" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="branding" className="w-full justify-start gap-2">
                <Image className="w-4 h-4" /> Branding
              </TabsTrigger>
              <TabsTrigger value="welcome" className="w-full justify-start gap-2">
                <Layout className="w-4 h-4" /> Welcome
              </TabsTrigger>
              <TabsTrigger value="discovery" className="w-full justify-start gap-2">
                <Globe className="w-4 h-4" /> Discovery
              </TabsTrigger>
              <TabsTrigger value="features" className="w-full justify-start gap-2">
                <Crown className="w-4 h-4" /> Features
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="appearance" className="m-0 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Theme Presets</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {themePresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyThemePreset(preset)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          settings.theme_preset === preset.id
                            ? "border-white/30 bg-white/5"
                            : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex gap-1 mb-2">
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                          <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <p className="text-sm text-white font-medium">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Custom Colors</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Primary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={settings.primary_color}
                          onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                          className="bg-black/50 border-white/10 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Secondary</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                          className="bg-black/50 border-white/10 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Accent</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.accent_color}
                          onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0"
                        />
                        <Input
                          value={settings.accent_color}
                          onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                          className="bg-black/50 border-white/10 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="branding" className="m-0 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-zinc-400">Server Icon</Label>
                    <label className="block aspect-square max-w-[200px] rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], 'icon_url')}
                        className="hidden"
                      />
                      {settings.icon_url ? (
                        <img src={settings.icon_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Upload className="w-8 h-8 text-zinc-500 mb-2" />
                          <span className="text-sm text-zinc-500">Upload icon</span>
                          <span className="text-xs text-zinc-600">512x512 recommended</span>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-zinc-400">Server Banner</Label>
                    <label className="block aspect-[3/1] rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                      <input
                        type="file"
                        accept="image/*,.gif"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], 'banner_url')}
                        className="hidden"
                      />
                      {settings.banner_url ? (
                        <img src={settings.banner_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Image className="w-8 h-8 text-zinc-500 mb-2" />
                          <span className="text-sm text-zinc-500">Upload banner</span>
                          <span className="text-xs text-zinc-600">1500x500 recommended</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-zinc-400">Invite Splash</Label>
                  <label className="block aspect-[16/9] max-w-md rounded-2xl bg-zinc-900/50 border-2 border-dashed border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], 'splash_url')}
                      className="hidden"
                    />
                    {settings.splash_url ? (
                      <img src={settings.splash_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Wand2 className="w-8 h-8 text-zinc-500 mb-2" />
                        <span className="text-sm text-zinc-500">Upload splash image</span>
                        <span className="text-xs text-zinc-600">Shown on invite links</span>
                      </div>
                    )}
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="welcome" className="m-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Welcome Screen</h3>
                    <p className="text-sm text-zinc-500">Greet new members with a custom welcome</p>
                  </div>
                  <Switch
                    checked={settings.welcome_enabled}
                    onCheckedChange={(v) => setSettings({ ...settings, welcome_enabled: v })}
                  />
                </div>

                {settings.welcome_enabled && (
                  <>
                    <div>
                      <Label className="text-zinc-400 mb-3 block">Template</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {welcomeTemplates.map(template => (
                          <button
                            key={template.id}
                            onClick={() => setSettings({ ...settings, welcome_template: template.id })}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              settings.welcome_template === template.id
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : "border-white/5 hover:border-white/10"
                            )}
                          >
                            <p className="text-white font-medium">{template.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">{template.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-zinc-400">Welcome Title</Label>
                      <Input
                        value={settings.welcome_title}
                        onChange={(e) => setSettings({ ...settings, welcome_title: e.target.value })}
                        className="bg-black/50 border-white/10"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-zinc-400">Welcome Message</Label>
                      <Textarea
                        value={settings.welcome_message}
                        onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                        rows={4}
                        className="bg-black/50 border-white/10 resize-none"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="discovery" className="m-0 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Public Server</h3>
                    <p className="text-sm text-zinc-500">Allow anyone to discover and join</p>
                  </div>
                  <Switch
                    checked={settings.is_public}
                    onCheckedChange={(v) => setSettings({ ...settings, is_public: v })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-zinc-400">Vanity URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">kairo.app/</span>
                    <Input
                      value={settings.vanity_url}
                      onChange={(e) => setSettings({ ...settings, vanity_url: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="your-server"
                      className="bg-black/50 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-zinc-400">Discovery Description</Label>
                  <Textarea
                    value={settings.discovery_description}
                    onChange={(e) => setSettings({ ...settings, discovery_description: e.target.value })}
                    placeholder="Describe your server for potential members..."
                    rows={3}
                    className="bg-black/50 border-white/10 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-zinc-400">Tags (up to 5)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {settings.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-white flex items-center gap-2">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="bg-black/50 border-white/10"
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} variant="outline" disabled={settings.tags.length >= 5}>
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="m-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Star className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Server Boosts</p>
                        <p className="text-sm text-zinc-500">Enable boost perks for supporters</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.enable_boost_perks}
                      onCheckedChange={(v) => setSettings({ ...settings, enable_boost_perks: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Crown className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Subscriptions</p>
                        <p className="text-sm text-zinc-500">Offer paid tiers to members</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.enable_server_subscriptions}
                      onCheckedChange={(v) => setSettings({ ...settings, enable_server_subscriptions: v })}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={updateServerMutation.isPending || uploading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {updateServerMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}