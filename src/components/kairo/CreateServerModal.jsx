import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Users, Gamepad2, Code, Lock, Sparkles, Calendar,
  ChevronRight, ChevronLeft, Check, ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const templates = [
  { id: 'blank', name: 'Create My Own', description: 'Start fresh with a blank server', icon: Sparkles, color: 'from-zinc-500 to-zinc-600' },
  { id: 'community', name: 'Community', description: 'Great for public communities', icon: Users, color: 'from-indigo-500 to-purple-600' },
  { id: 'gaming', name: 'Gaming', description: 'Perfect for gaming groups', icon: Gamepad2, color: 'from-emerald-500 to-teal-600' },
  { id: 'development', name: 'Development', description: 'For dev teams and projects', icon: Code, color: 'from-amber-500 to-orange-600' },
  { id: 'private', name: 'Friends', description: 'A private space for friends', icon: Lock, color: 'from-pink-500 to-rose-600' },
  { id: 'event', name: 'Events', description: 'Organize and host events', icon: Calendar, color: 'from-cyan-500 to-blue-600' },
];

const templateChannels = {
  blank: [],
  community: [
    { category: 'Information', channels: [{ name: 'welcome', type: 'text' }, { name: 'rules', type: 'text' }, { name: 'announcements', type: 'announcement' }] },
    { category: 'General', channels: [{ name: 'general', type: 'text' }, { name: 'media', type: 'media' }] },
    { category: 'Voice', channels: [{ name: 'General', type: 'voice' }, { name: 'Music', type: 'voice' }] }
  ],
  gaming: [
    { category: 'Info', channels: [{ name: 'rules', type: 'text' }, { name: 'game-updates', type: 'announcement' }] },
    { category: 'Chat', channels: [{ name: 'general', type: 'text' }, { name: 'looking-for-group', type: 'text' }, { name: 'clips', type: 'media' }] },
    { category: 'Voice', channels: [{ name: 'Lobby', type: 'voice' }, { name: 'Team 1', type: 'voice' }, { name: 'Team 2', type: 'voice' }] }
  ],
  development: [
    { category: 'Project', channels: [{ name: 'readme', type: 'text' }, { name: 'changelog', type: 'announcement' }] },
    { category: 'Discussion', channels: [{ name: 'general', type: 'text' }, { name: 'code-review', type: 'forum' }, { name: 'help', type: 'text' }] },
    { category: 'Voice', channels: [{ name: 'Standup', type: 'voice' }, { name: 'Pair Programming', type: 'voice' }] }
  ],
  private: [
    { category: null, channels: [{ name: 'general', type: 'text' }, { name: 'photos', type: 'media' }] },
    { category: 'Hangout', channels: [{ name: 'Lounge', type: 'voice' }] }
  ],
  event: [
    { category: 'Info', channels: [{ name: 'event-info', type: 'text' }, { name: 'schedule', type: 'text' }, { name: 'announcements', type: 'announcement' }] },
    { category: 'Discussion', channels: [{ name: 'general', type: 'text' }, { name: 'questions', type: 'forum' }] },
    { category: 'Live', channels: [{ name: 'Main Stage', type: 'stage' }, { name: 'Backstage', type: 'voice' }] }
  ]
};

export default function CreateServerModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!serverName.trim()) return;
    
    setIsCreating(true);
    try {
      let iconUrl = null;
      if (iconFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: iconFile });
        iconUrl = file_url;
      }

      await onCreate({
        name: serverName.trim(),
        description: serverDescription.trim(),
        icon_url: iconUrl,
        template: selectedTemplate?.id || 'blank',
        templateChannels: templateChannels[selectedTemplate?.id || 'blank']
      });

      // Reset state
      setStep(1);
      setSelectedTemplate(null);
      setServerName('');
      setServerDescription('');
      setIconFile(null);
      setIconPreview(null);
      onClose();
    } catch (error) {
      console.error('Failed to create server:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedTemplate(null);
    setServerName('');
    setServerDescription('');
    setIconFile(null);
    setIconPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={reset}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50"
      >
        {/* Close button */}
        <button
          onClick={reset}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Create a Space
              </h2>
              <p className="text-zinc-400 text-center text-sm mb-6">
                Your space is where you and your friends hang out. Make yours and start talking.
              </p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setStep(2);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-xl border border-zinc-800/50 transition-all",
                      "hover:bg-zinc-800/50 hover:border-zinc-700/50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                      template.color
                    )}>
                      <template.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-white">{template.name}</h3>
                      <p className="text-sm text-zinc-500">{template.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white mb-4 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Customize your space
              </h2>
              <p className="text-zinc-400 text-center text-sm mb-6">
                Give your new space a personality with a name and an icon. You can always change it later.
              </p>

              {/* Icon upload */}
              <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className={cn(
                    "w-24 h-24 rounded-2xl flex items-center justify-center transition-all",
                    "border-2 border-dashed border-zinc-700 group-hover:border-violet-500",
                    iconPreview && "border-solid border-transparent"
                  )}>
                    {iconPreview ? (
                      <img src={iconPreview} alt="" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-zinc-500 group-hover:text-violet-400">
                        <Upload className="w-8 h-8 mb-1" />
                        <span className="text-xs">Upload</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="hidden"
                  />
                  {iconPreview && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </label>
              </div>

              {/* Server name */}
              <div className="space-y-2 mb-4">
                <Label className="text-xs font-semibold uppercase text-zinc-400">
                  Space Name
                </Label>
                <Input
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder={`${selectedTemplate?.name || 'My'} Space`}
                  className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-violet-500 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 mb-6">
                <Label className="text-xs font-semibold uppercase text-zinc-400">
                  Description (Optional)
                </Label>
                <Textarea
                  value={serverDescription}
                  onChange={(e) => setServerDescription(e.target.value)}
                  placeholder="What's your space about?"
                  rows={2}
                  className="bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-500 focus:border-violet-500 resize-none rounded-xl"
                />
              </div>

              {/* Preview template channels */}
              {selectedTemplate && selectedTemplate.id !== 'blank' && (
                <div className="mb-6 p-3 bg-zinc-900/50 rounded-lg">
                  <h4 className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                    Channels included
                  </h4>
                  <div className="text-xs text-zinc-400 space-y-1">
                    {templateChannels[selectedTemplate.id]?.map((cat, i) => (
                      <div key={i}>
                        {cat.category && <span className="text-zinc-500">{cat.category}: </span>}
                        {cat.channels.map(c => `#${c.name}`).join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create button */}
              <Button
                onClick={handleCreate}
                disabled={!serverName.trim() || isCreating}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white rounded-xl"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Create Space
                  </div>
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center mt-4">
                By creating a space, you agree to Kairo's Community Guidelines.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}