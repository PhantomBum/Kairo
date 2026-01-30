import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Plus, Trash2, ExternalLink, Eye, EyeOff, CheckCircle,
  Music, Youtube, Twitch, Twitter, Github, Gamepad2, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const platforms = [
  { id: 'spotify', name: 'Spotify', icon: Music, color: '#1DB954', placeholder: 'Your Spotify username' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', placeholder: 'Channel name or URL' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, color: '#9146FF', placeholder: 'Your Twitch username' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: '#1DA1F2', placeholder: 'Your Twitter handle' },
  { id: 'github', name: 'GitHub', icon: Github, color: '#333', placeholder: 'Your GitHub username' },
  { id: 'steam', name: 'Steam', icon: Gamepad2, color: '#171a21', placeholder: 'Your Steam profile URL' },
  { id: 'playstation', name: 'PlayStation', icon: Gamepad2, color: '#003791', placeholder: 'Your PSN ID' },
  { id: 'xbox', name: 'Xbox', icon: Gamepad2, color: '#107C10', placeholder: 'Your Gamertag' },
  { id: 'reddit', name: 'Reddit', icon: Globe, color: '#FF4500', placeholder: 'Your Reddit username' },
  { id: 'tiktok', name: 'TikTok', icon: Globe, color: '#000', placeholder: 'Your TikTok username' }
];

function ConnectionCard({ connection, onToggleVisibility, onDelete }) {
  const platform = platforms.find(p => p.id === connection.platform);
  const Icon = platform?.icon || Globe;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${platform?.color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color: platform?.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{platform?.name}</h3>
          {connection.is_verified && (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <p className="text-sm text-zinc-400 truncate">{connection.platform_username}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleVisibility(connection)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title={connection.is_visible ? 'Hide from profile' : 'Show on profile'}
        >
          {connection.is_visible ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
        
        {connection.profile_url && (
          <a
            href={connection.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
        
        <button
          onClick={() => onDelete(connection)}
          className="p-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function AddConnectionModal({ isOpen, onClose, userId, existingPlatforms }) {
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const queryClient = useQueryClient();

  const availablePlatforms = platforms.filter(p => !existingPlatforms.includes(p.id));

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UserConnection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections', userId] });
      onClose();
      setPlatform('');
      setUsername('');
      setProfileUrl('');
    }
  });

  const selectedPlatform = platforms.find(p => p.id === platform);

  const handleAdd = () => {
    if (!platform || !username) return;

    // Auto-generate profile URL if not provided
    let url = profileUrl;
    if (!url) {
      switch (platform) {
        case 'twitter':
          url = `https://twitter.com/${username}`;
          break;
        case 'github':
          url = `https://github.com/${username}`;
          break;
        case 'twitch':
          url = `https://twitch.tv/${username}`;
          break;
        case 'youtube':
          url = username.startsWith('http') ? username : `https://youtube.com/@${username}`;
          break;
        case 'reddit':
          url = `https://reddit.com/user/${username}`;
          break;
        case 'tiktok':
          url = `https://tiktok.com/@${username}`;
          break;
      }
    }

    createMutation.mutate({
      user_id: userId,
      platform,
      platform_username: username,
      profile_url: url,
      is_visible: true,
      is_verified: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Platform</label>
            <div className="grid grid-cols-5 gap-2">
              {availablePlatforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all",
                    platform === p.id 
                      ? "border-indigo-500 bg-indigo-500/20" 
                      : "border-zinc-700 hover:border-zinc-600"
                  )}
                  title={p.name}
                >
                  <p.icon className="w-5 h-5" style={{ color: platform === p.id ? p.color : undefined }} />
                </button>
              ))}
            </div>
          </div>

          {platform && (
            <>
              {/* Username */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  {selectedPlatform?.name} Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedPlatform?.placeholder}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              {/* Profile URL (optional) */}
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">
                  Profile URL <span className="text-zinc-600">(optional)</span>
                </label>
                <Input
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <Button 
                onClick={handleAdd} 
                disabled={!username || createMutation.isPending}
                className="w-full bg-indigo-500 hover:bg-indigo-600"
              >
                Add Connection
              </Button>
            </>
          )}

          {availablePlatforms.length === 0 && (
            <p className="text-center text-zinc-500 py-4">
              You've connected all available platforms!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ConnectionsManager({ userId }) {
  const [showAdd, setShowAdd] = useState(false);

  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['userConnections', userId],
    queryFn: () => base44.entities.UserConnection.filter({ user_id: userId }),
    enabled: !!userId
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserConnection.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userConnections', userId] })
  });

  const deleteMutation = useMutation({
    mutationFn: (connection) => base44.entities.UserConnection.delete(connection.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userConnections', userId] })
  });

  const existingPlatforms = connections.map(c => c.platform);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Connections</h3>
          <p className="text-sm text-zinc-500">Link your other accounts</p>
        </div>
        <Button 
          onClick={() => setShowAdd(true)}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Connections List */}
      {connections.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {connections.map(connection => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onToggleVisibility={(c) => updateMutation.mutate({ 
                  id: c.id, 
                  data: { is_visible: !c.is_visible } 
                })}
                onDelete={(c) => {
                  if (confirm('Remove this connection?')) deleteMutation.mutate(c);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
          <Globe className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-3">No connections yet</p>
          <Button onClick={() => setShowAdd(true)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Connection
          </Button>
        </div>
      )}

      <AddConnectionModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        userId={userId}
        existingPlatforms={existingPlatforms}
      />
    </div>
  );
}