import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Users, Gamepad2, Code, Lock, Video, ArrowLeft, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const templates = [
  { id: 'blank', name: 'Start Fresh', icon: Plus, description: 'Create a blank server', color: 'bg-zinc-600' },
  { id: 'community', name: 'Community', icon: Users, description: 'For communities & groups', color: 'bg-blue-600' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, description: 'For gaming groups', color: 'bg-emerald-600' },
  { id: 'development', name: 'Development', icon: Code, description: 'For dev teams', color: 'bg-violet-600' },
  { id: 'creator', name: 'Creator', icon: Video, description: 'For content creators', color: 'bg-pink-600' },
  { id: 'private', name: 'Private', icon: Lock, description: 'Friends only', color: 'bg-amber-600' },
];

export default function CreateServerModal({ isOpen, onClose, onCreate, currentUser }) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [serverName, setServerName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!serverName.trim()) return;
    
    setCreating(true);
    try {
      let iconUrl = null;
      
      if (iconFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: iconFile });
        iconUrl = file_url;
      }
      
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      const server = await base44.entities.Server.create({
        name: serverName.trim(),
        icon_url: iconUrl,
        owner_id: currentUser?.user_id || currentUser?.id,
        template: template?.id || 'blank',
        invite_code: inviteCode,
        member_count: 1,
        is_public: false,
      });
      
      const category = await base44.entities.Category.create({
        server_id: server.id,
        name: 'Text Channels',
        position: 0,
      });
      
      await base44.entities.Channel.create({
        server_id: server.id,
        category_id: category.id,
        name: 'general',
        type: 'text',
        position: 0,
      });
      
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_id: currentUser?.user_id || currentUser?.id,
        user_email: currentUser?.user_email || currentUser?.email,
        role_ids: [],
        joined_at: new Date().toISOString(),
      });
      
      onCreate?.(server);
      handleClose();
    } catch (err) {
      console.error('Failed to create server:', err);
    }
    setCreating(false);
  };

  const handleClose = () => {
    setStep(1);
    setTemplate(null);
    setServerName('');
    setIconFile(null);
    setIconPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg mx-4 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white">Create Your Server</h2>
                <p className="text-sm text-zinc-500 mt-1">Choose a template to get started</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplate(t);
                      setServerName(t.id === 'blank' ? '' : `My ${t.name} Server`);
                      setStep(2);
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all text-left"
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', t.color)}>
                      <t.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white">Customize Your Server</h2>
                <p className="text-sm text-zinc-500 mt-1">Give your server a name and icon</p>
              </div>
              
              {/* Icon upload */}
              <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/[0.06] border-2 border-dashed border-white/[0.12] group-hover:border-indigo-500/50 transition-colors overflow-hidden">
                    {iconPreview ? (
                      <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                  {iconPreview && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIconFile(null);
                        setIconPreview(null);
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </label>
              </div>
              
              {/* Server name */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                  Server Name
                </label>
                <input
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="My Awesome Server"
                  autoFocus
                  className="w-full h-11 px-4 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              
              {/* Create button */}
              <button
                onClick={handleCreate}
                disabled={!serverName.trim() || creating}
                className="w-full h-11 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Server
              </button>
              
              <p className="text-xs text-zinc-600 text-center mt-4">
                By creating a server, you agree to Kairo's Community Guidelines
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}