import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Upload, Trash2, Sticker, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';
import Input from '../primitives/Input';

// Upload sticker modal
export function UploadStickerModal({ isOpen, onClose, serverId, currentUser }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !name.trim()) throw new Error('Name and image required');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      
      // Validate size (512KB max)
      if (file.size > 512 * 1024) {
        throw new Error('File size must be under 512KB');
      }
      
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Create sticker
      return base44.entities.ServerSticker.create({
        server_id: serverId,
        name: name.trim(),
        description: description.trim(),
        image_url: file_url,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        uploaded_by: currentUser.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverStickers', serverId] });
      onClose();
      setName('');
      setDescription('');
      setTags('');
      setFile(null);
      setPreview(null);
    },
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      
      if (!name) {
        const baseName = selectedFile.name.split('.')[0];
        setName(baseName.replace(/[^a-zA-Z0-9 ]/g, ''));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Sticker"
      icon={<Sticker className="w-5 h-5" />}
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
              'w-32 h-32 rounded-xl flex items-center justify-center cursor-pointer transition-all',
              'border-2 border-dashed',
              preview 
                ? 'border-indigo-500/50 bg-indigo-500/10' 
                : 'border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04]'
            )}
          >
            {preview ? (
              <img src={preview} alt="" className="w-24 h-24 object-contain" />
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-1" />
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
            Sticker Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Sticker"
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Description (optional)
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your sticker"
          />
        </div>
        
        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Tags (comma separated)
          </label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="happy, excited, cool"
          />
        </div>
        
        {uploadMutation.isError && (
          <p className="text-sm text-red-400">{uploadMutation.error?.message}</p>
        )}
        
        <div className="text-xs text-zinc-500">
          <p>• Image must be under 512KB</p>
          <p>• Recommended size: 320x320 pixels</p>
          <p>• Transparent backgrounds work best</p>
        </div>
      </div>
    </Modal>
  );
}

// Sticker picker for server stickers
export function ServerStickerPicker({ serverId, onSelect }) {
  const [search, setSearch] = useState('');
  
  const { data: stickers = [] } = useQuery({
    queryKey: ['serverStickers', serverId],
    queryFn: () => base44.entities.ServerSticker.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const filtered = stickers.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-72 p-3 bg-[#111113] border border-white/[0.08] rounded-lg">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stickers..."
          className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded text-sm text-white placeholder:text-zinc-500"
        />
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center py-4 text-zinc-500 text-sm">
          No stickers found
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {filtered.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onSelect(sticker)}
              className="w-14 h-14 p-1 rounded hover:bg-white/[0.1] flex items-center justify-center"
              title={sticker.name}
            >
              <img 
                src={sticker.image_url} 
                alt={sticker.name} 
                className="max-w-full max-h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Sticker management list
export function StickerManagementList({ serverId, currentUserId }) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  
  const { data: stickers = [] } = useQuery({
    queryKey: ['serverStickers', serverId],
    queryFn: () => base44.entities.ServerSticker.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerSticker.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverStickers', serverId] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">
          Server Stickers ({stickers.length})
        </h3>
        <Button size="sm" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>
      
      {stickers.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <Sticker className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No stickers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {stickers.map((sticker) => (
            <div 
              key={sticker.id}
              className="p-3 bg-white/[0.02] rounded-lg group relative"
            >
              <img 
                src={sticker.image_url} 
                alt={sticker.name} 
                className="w-16 h-16 mx-auto object-contain"
              />
              <p className="text-xs text-white text-center mt-2 truncate">{sticker.name}</p>
              <button
                onClick={() => deleteMutation.mutate(sticker.id)}
                className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <UploadStickerModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        serverId={serverId}
        currentUser={{ id: currentUserId }}
      />
    </div>
  );
}