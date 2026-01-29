import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Download, Upload, Save, Copy, FileJson, Check,
  Server, Hash, Volume2, Users, Shield, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Server Blueprint System - Export, Import, and Version server configurations
export function ExportBlueprintModal({ server, isOpen, onClose }) {
  const [includeRoles, setIncludeRoles] = useState(true);
  const [includeChannels, setIncludeChannels] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includePermissions, setIncludePermissions] = useState(true);
  const [copied, setCopied] = useState(false);
  const [blueprint, setBlueprint] = useState(null);

  const { data: channels = [] } = useQuery({
    queryKey: ['channels', server?.id],
    queryFn: () => base44.entities.Channel.filter({ server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', server?.id],
    queryFn: () => base44.entities.Category.filter({ server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', server?.id],
    queryFn: () => base44.entities.Role.filter({ server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  const generateBlueprint = () => {
    const bp = {
      version: '2.0.0',
      name: server.name,
      description: server.description,
      template: server.template,
      generated_at: new Date().toISOString(),
      categories: includeCategories ? categories.map(c => ({
        name: c.name,
        position: c.position
      })) : [],
      channels: includeChannels ? channels.map(ch => ({
        name: ch.name,
        type: ch.type,
        topic: ch.topic,
        position: ch.position,
        category_name: categories.find(c => c.id === ch.category_id)?.name || null,
        is_private: ch.is_private,
        slowmode_seconds: ch.slowmode_seconds,
        permission_overwrites: includePermissions ? ch.permission_overwrites : []
      })) : [],
      roles: includeRoles ? roles.filter(r => !r.is_default).map(r => ({
        name: r.name,
        color: r.color,
        gradient_end: r.gradient_end,
        position: r.position,
        permissions: includePermissions ? r.permissions : [],
        is_hoisted: r.is_hoisted,
        is_mentionable: r.is_mentionable
      })) : [],
      settings: {
        default_notifications: server.settings?.default_notifications,
        verification_level: server.settings?.verification_level,
        content_filter: server.settings?.content_filter
      }
    };
    setBlueprint(bp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${server.name.toLowerCase().replace(/\s+/g, '-')}-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Export Blueprint</h2>
                <p className="text-sm text-zinc-500">{server?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase">Include in Blueprint</h3>
            
            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-zinc-400" />
                <span className="text-white">Channels ({channels.length})</span>
              </div>
              <Switch checked={includeChannels} onCheckedChange={setIncludeChannels} />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-zinc-400" />
                <span className="text-white">Categories ({categories.length})</span>
              </div>
              <Switch checked={includeCategories} onCheckedChange={setIncludeCategories} />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-zinc-400" />
                <span className="text-white">Roles ({roles.length})</span>
              </div>
              <Switch checked={includeRoles} onCheckedChange={setIncludeRoles} />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-zinc-400" />
                <span className="text-white">Permissions</span>
              </div>
              <Switch checked={includePermissions} onCheckedChange={setIncludePermissions} />
            </div>

            {!blueprint ? (
              <Button onClick={generateBlueprint} className="w-full bg-indigo-500 hover:bg-indigo-600">
                <FileJson className="w-4 h-4 mr-2" />
                Generate Blueprint
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-900 rounded-lg">
                  <pre className="text-xs text-zinc-400 overflow-auto max-h-40">
                    {JSON.stringify(blueprint, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="secondary" className="flex-1 bg-zinc-800 hover:bg-zinc-700">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button onClick={handleDownload} className="flex-1 bg-indigo-500 hover:bg-indigo-600">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ImportBlueprintModal({ isOpen, onClose, onImport }) {
  const [blueprintJson, setBlueprintJson] = useState('');
  const [parsedBlueprint, setParsedBlueprint] = useState(null);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleParse = () => {
    try {
      const bp = JSON.parse(blueprintJson);
      if (!bp.version || !bp.name) {
        throw new Error('Invalid blueprint format');
      }
      setParsedBlueprint(bp);
      setError(null);
    } catch (e) {
      setError('Invalid JSON or blueprint format');
      setParsedBlueprint(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBlueprintJson(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedBlueprint) return;
    
    setImporting(true);
    try {
      await onImport?.(parsedBlueprint);
      onClose();
    } catch (e) {
      setError('Failed to import blueprint');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Import Blueprint</h2>
                <p className="text-sm text-zinc-500">Create server from blueprint</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <Label className="text-zinc-400">Upload Blueprint File</Label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mt-2 w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
            />
          </div>

          <div className="text-center text-zinc-500 text-sm">or paste JSON</div>

          <Textarea
            value={blueprintJson}
            onChange={(e) => setBlueprintJson(e.target.value)}
            placeholder='{"version": "2.0.0", "name": "...", ...}'
            rows={6}
            className="bg-zinc-900 border-zinc-800 text-white font-mono text-sm"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {!parsedBlueprint ? (
            <Button onClick={handleParse} className="w-full bg-zinc-800 hover:bg-zinc-700">
              Parse Blueprint
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-800/30 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{parsedBlueprint.name}</h3>
                <p className="text-sm text-zinc-400 mb-3">{parsedBlueprint.description || 'No description'}</p>
                <div className="flex gap-4 text-sm text-zinc-500">
                  <span>{parsedBlueprint.channels?.length || 0} channels</span>
                  <span>{parsedBlueprint.roles?.length || 0} roles</span>
                  <span>{parsedBlueprint.categories?.length || 0} categories</span>
                </div>
              </div>
              <Button 
                onClick={handleImport} 
                disabled={importing}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {importing ? 'Creating Server...' : 'Create Server from Blueprint'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Hook for applying blueprint to a server
export function useApplyBlueprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serverId, blueprint, currentUserId }) => {
      // Create categories
      const categoryMap = {};
      for (const cat of blueprint.categories || []) {
        const created = await base44.entities.Category.create({
          server_id: serverId,
          name: cat.name,
          position: cat.position
        });
        categoryMap[cat.name] = created.id;
      }

      // Create channels
      for (const ch of blueprint.channels || []) {
        await base44.entities.Channel.create({
          server_id: serverId,
          category_id: ch.category_name ? categoryMap[ch.category_name] : null,
          name: ch.name,
          type: ch.type,
          topic: ch.topic,
          position: ch.position,
          is_private: ch.is_private,
          slowmode_seconds: ch.slowmode_seconds,
          permission_overwrites: ch.permission_overwrites
        });
      }

      // Create roles
      for (const role of blueprint.roles || []) {
        await base44.entities.Role.create({
          server_id: serverId,
          name: role.name,
          color: role.color,
          gradient_end: role.gradient_end,
          position: role.position,
          permissions: role.permissions,
          is_hoisted: role.is_hoisted,
          is_mentionable: role.is_mentionable
        });
      }

      return { success: true };
    },
    onSuccess: (_, { serverId }) => {
      queryClient.invalidateQueries({ queryKey: ['channels', serverId] });
      queryClient.invalidateQueries({ queryKey: ['categories', serverId] });
      queryClient.invalidateQueries({ queryKey: ['roles', serverId] });
    }
  });
}