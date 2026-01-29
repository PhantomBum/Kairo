import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Search, Star, Download, Code, Zap, Shield, Plus,
  ExternalLink, Settings, Trash2, Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AppCard({ app, isInstalled, onInstall, onConfigure, currentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-indigo-500 transition-all"
    >
      <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative">
        {app.banner_url && (
          <img src={app.banner_url} alt="" className="w-full h-full object-cover" />
        )}
        {app.is_verified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            {app.icon_url ? (
              <img src={app.icon_url} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Code className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{app.name}</h3>
            <p className="text-xs text-zinc-500">by {app.developer_name}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{app.description}</p>

        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span>{app.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>{app.install_count?.toLocaleString() || 0} installs</span>
          </div>
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs">{app.category}</span>
        </div>

        {isInstalled ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" onClick={onConfigure}>
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            <Button size="sm" variant="outline" className="text-green-500 border-green-500/50" disabled>
              <Shield className="w-4 h-4 mr-1" />
              Installed
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={onInstall} className="w-full bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-1" />
            Add to Server
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function AppMarketplace({ server, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: apps = [] } = useQuery({
    queryKey: ['kairoApps'],
    queryFn: () => base44.entities.KairoApp.filter({ is_published: true })
  });

  const { data: installations = [] } = useQuery({
    queryKey: ['appInstallations', server?.id],
    queryFn: () => base44.entities.AppInstallation.filter({ server_id: server?.id }),
    enabled: !!server?.id
  });

  const installMutation = useMutation({
    mutationFn: (app) => base44.entities.AppInstallation.create({
      server_id: server.id,
      app_id: app.id,
      app_name: app.name,
      installed_by: currentUser.id,
      permissions: app.permissions || []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appInstallations'] });
    }
  });

  const categories = ['all', 'utility', 'moderation', 'fun', 'music', 'productivity'];
  
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] bg-zinc-900 border-zinc-800 p-0">
        <DialogHeader className="p-6 border-b border-zinc-800">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Code className="w-6 h-6 text-indigo-400" />
            App Marketplace
            {server && <span className="text-sm text-zinc-500 font-normal">for {server.name}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Search and Filters */}
          <div className="space-y-4">
            <Input
              placeholder="Search apps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    selectedCategory === cat
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  )}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isInstalled={installations.some(i => i.app_id === app.id)}
                onInstall={() => installMutation.mutate(app)}
                onConfigure={() => {}}
                currentUser={currentUser}
              />
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-16">
              <Code className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No apps found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}