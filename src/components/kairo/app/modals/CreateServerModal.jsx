import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Users, Gamepad2, Code, Lock, Video, ArrowLeft, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const templates = [
  { id: 'blank', name: 'Start Fresh', icon: Plus, description: 'Create a blank server', color: 'bg-zinc-600' },
  { id: 'community', name: 'Community', icon: Users, description: 'For communities & groups', color: 'bg-blue-600' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, description: 'For gaming groups', color: 'bg-emerald-600' },
  { id: 'development', name: 'Development', icon: Code, description: 'For dev teams', color: 'bg-violet-600' },
  { id: 'creator', name: 'Creator', icon: Video, description: 'For content creators', color: 'bg-pink-600' },
  { id: 'private', name: 'Private', icon: Lock, description: 'Friends only', color: 'bg-amber-600' },
];

export default function CreateServerModal({ isOpen, onClose, onCreate, isCreating }) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [serverName, setServerName] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!serverName.trim()) return;
    await onCreate({
      name: serverName.trim(),
      icon: iconFile,
      template: template?.id,
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTemplate(null);
    setServerName('');
    setIconFile(null);
    setIconPreview(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" showClose={true}>
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
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
            
            <div className="mb-6">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                Server Name
              </label>
              <Input
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="My Awesome Server"
                autoFocus
              />
            </div>
            
            <Button
              onClick={handleCreate}
              disabled={!serverName.trim() || isCreating}
              loading={isCreating}
              className="w-full"
            >
              Create Server
            </Button>
            
            <p className="text-xs text-zinc-600 text-center mt-4">
              By creating a server, you agree to Kairo's Community Guidelines
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}