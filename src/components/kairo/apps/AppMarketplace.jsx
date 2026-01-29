import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Search, Star, Download, Zap, Shield, TrendingUp, 
  Plus, Code, Bot, Webhook, Puzzle, X, Check, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All Apps', icon: Puzzle },
  { id: 'utility', label: 'Utility', icon: Zap },
  { id: 'moderation', label: 'Moderation', icon: Shield },
  { id: 'fun', label: 'Fun', icon: Star },
  { id: 'music', label: 'Music', icon: TrendingUp },
  { id: 'productivity', label: 'Productivity', icon: Settings },
];

function AppCard({ app, isInstalled, onInstall, onManage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all"
    >
      {app.banner_url && (
        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
          <img src={app.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            {app.icon_url ? (
              <img src={app.icon_url} alt="" className="w-full h-full rounded-xl" />
            ) : (
              <Bot className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{app.name}</h3>
              {app.is_verified && (
                <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-zinc-500">by {app.developer_name}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{app.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {app.install_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {app.rating || 0}
            </div>
          </div>

          {isInstalled ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onManage(app)}
              className="bg-zinc-800 border-zinc-700"
            >
              Manage
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onInstall(app)}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Install
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AppMarketplace({ serverId, onClose, onCreateApp }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: apps = [] } = useQuery({
    queryKey: ['kairoApps'],
    queryFn: () => base44.entities.KairoApp.filter({ is_published: true })
  });

  const { data: installations = [] } = useQuery({
    queryKey: ['appInstallations', serverId],
    queryFn: () => base44.entities.AppInstallation.filter({ server_id: serverId }),
    enabled: !!serverId
  });

  const installMutation = useMutation({
    mutationFn: async (app) => {
      await base44.entities.AppInstallation.create({
        server_id: serverId,
        app_id: app.id,
        app_name: app.name,
        installed_by: 'current_user',
        permissions: app.permissions || []
      });
      await base44.entities.KairoApp.update(app.id, {
        install_count: (app.install_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appInstallations'] });
      queryClient.invalidateQueries({ queryKey: ['kairoApps'] });
    }
  });

  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const installedAppIds = new Set(installations.map(i => i.app_id));

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0b] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-zinc-800 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Kairo Apps</h1>
              <p className="text-sm text-zinc-500">Enhance your server with powerful apps</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onCreateApp} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Create App
              </Button>
              <button onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2",
                selectedCategory === cat.id
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isInstalled={installedAppIds.has(app.id)}
              onInstall={(app) => installMutation.mutate(app)}
              onManage={(app) => {}}
            />
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <Bot className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No apps found</p>
          </div>
        )}
      </div>
    </div>
  );
}