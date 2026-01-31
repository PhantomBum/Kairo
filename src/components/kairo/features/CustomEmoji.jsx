import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Image, Sparkles, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '@/components/kairo/v4/primitives/Modal';
import Button from '@/components/kairo/v4/primitives/Button';
import Input from '@/components/kairo/v4/primitives/Input';

// Upload emoji modal
export function UploadEmojiModal({ isOpen, onClose, serverId, currentUser }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !name.trim()) throw new Error('Name and image required');
      
      // Validate name (alphanumeric and underscores only)
      const validName = name.trim().replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      if (validName.length < 2) throw new Error('Name must be at least 2 characters');
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Check if name already exists
      const existing = await base44.entities.ServerEmoji.filter({
        server_id: serverId,
        name: validName,
      });
      if (existing.length > 0) throw new Error('Emoji with this name already exists');
      
      // Create emoji
      return base44.entities.ServerEmoji.create({
        server_id: serverId,
        name: validName,
        image_url: file_url,
        is_animated: file.type === 'image/gif',
        uploaded_by: currentUser.id,
        uploaded_by_name: currentUser.display_name || currentUser.full_name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverEmojis', serverId] });
      onClose();
      setName('');
      setFile(null);
      setPreview(null);
    },
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate size (256KB max)
      if (selectedFile.size > 256 * 1024) {
        alert('File size must be under 256KB');
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      // Auto-generate name from filename
      if (!name) {
        const baseName = selectedFile.name.split('.')[0];
        setName(baseName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Emoji"
      icon={<Sparkles className="w-5 h-5" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => uploadMutation.mutate()}
            loading={uploadMutation.isPending}
            disabled={!file || !name.trim()}
          >
            Upload
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-24 h-24 rounded-xl flex items-center justify-center cursor-pointer transition-all',
              'border-2 border-dashed',
              preview 
                ? 'border-indigo-500/50 bg-indigo-500/10' 
                : 'border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04]'
            )}
          >
            {preview ? (
              <img src={preview} alt="" className="w-16 h-16 object-contain" />
            ) : (
              <div className="text-center">
                <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-1" />
                <span className="text-xs text-zinc-500">Click to upload</span>
              </div>
            )}
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Emoji Name
          </label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">:</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, '_'))}
              placeholder="emoji_name"
              className="flex-1"
            />
            <span className="text-zinc-500">:</span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            Letters, numbers, and underscores only
          </p>
        </div>
        
        {uploadMutation.isError && (
          <p className="text-sm text-red-400">{uploadMutation.error?.message}</p>
        )}
        
        <div className="text-xs text-zinc-500">
          <p>• Image must be under 256KB</p>
          <p>• Recommended size: 128x128 pixels</p>
          <p>• GIF images will be animated</p>
        </div>
      </div>
    </Modal>
  );
}

// Emoji picker for server emojis
export function ServerEmojiPicker({ serverId, onSelect }) {
  const [search, setSearch] = useState('');
  
  const { data: emojis = [] } = useQuery({
    queryKey: ['serverEmojis', serverId],
    queryFn: () => base44.entities.ServerEmoji.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const filtered = emojis.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-64 p-3 bg-[#111113] border border-white/[0.08] rounded-lg">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded text-sm text-white placeholder:text-zinc-500"
        />
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center py-4 text-zinc-500 text-sm">
          No emojis found
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          {filtered.map((emoji) => (
            <button
              key={emoji.id}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 rounded hover:bg-white/[0.1] flex items-center justify-center"
              title={`:${emoji.name}:`}
            >
              <img 
                src={emoji.image_url} 
                alt={emoji.name} 
                className="w-6 h-6 object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Emoji management list
export function EmojiManagementList({ serverId, currentUserId }) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  
  const { data: emojis = [] } = useQuery({
    queryKey: ['serverEmojis', serverId],
    queryFn: () => base44.entities.ServerEmoji.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerEmoji.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverEmojis', serverId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">
          Server Emojis ({emojis.length})
        </h3>
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>
      
      {emojis.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No custom emojis yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {emojis.map((emoji) => (
            <div 
              key={emoji.id}
              className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg group"
            >
              <img src={emoji.image_url} alt="" className="w-8 h-8 object-contain" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">:{emoji.name}:</p>
                <p className="text-xs text-zinc-500">by {emoji.uploaded_by_name}</p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(emoji.id)}
                className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <UploadEmojiModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        serverId={serverId}
        currentUser={{ id: currentUserId }}
      />
    </div>
  );
}

// Parse custom emojis in text
export function parseEmojis(text, serverEmojis = []) {
  if (!text) return text;
  
  const emojiPattern = /:([a-zA-Z0-9_]+):/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = emojiPattern.exec(text)) !== null) {
    // Add text before emoji
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Find emoji
    const emojiName = match[1];
    const emoji = serverEmojis.find(e => e.name === emojiName);
    
    if (emoji) {
      parts.push(
        <img 
          key={match.index}
          src={emoji.image_url} 
          alt={`:${emojiName}:`}
          className="inline-block w-5 h-5 align-middle"
        />
      );
    } else {
      parts.push(match[0]); // Keep as text if not found
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}