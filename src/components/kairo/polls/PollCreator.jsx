import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, BarChart3, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PollCreator({ isOpen, onClose, onCreatePoll }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [settings, setSettings] = useState({
    allowMultiple: false,
    anonymous: false,
    duration: '24h',
    showResults: 'always'
  });

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;
    
    onCreatePoll({
      question: question.trim(),
      options: options.filter(o => o.trim()).map(text => ({ text, votes: [], count: 0 })),
      settings,
      created_at: new Date().toISOString(),
      expires_at: calculateExpiry(settings.duration)
    });
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    onClose();
  };

  const calculateExpiry = (duration) => {
    const now = new Date();
    const durations = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      'never': null
    };
    return durations[duration] ? new Date(now.getTime() + durations[duration]).toISOString() : null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Create Poll</h2>
                <p className="text-xs text-zinc-500">Ask your community a question</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Question */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Question</Label>
              <Input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="What do you want to ask?"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                maxLength={300}
              />
              <p className="text-xs text-zinc-600 text-right">{question.length}/300</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-zinc-500">
                      {index + 1}
                    </div>
                    <Input
                      value={option}
                      onChange={e => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 10 && (
                <button
                  onClick={addOption}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">Allow multiple votes</span>
                </div>
                <Switch
                  checked={settings.allowMultiple}
                  onCheckedChange={v => setSettings({...settings, allowMultiple: v})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">Anonymous voting</span>
                </div>
                <Switch
                  checked={settings.anonymous}
                  onCheckedChange={v => setSettings({...settings, anonymous: v})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-300">Duration</span>
                </div>
                <Select value={settings.duration} onValueChange={v => setSettings({...settings, duration: v})}>
                  <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1c] border-white/10">
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="12h">12 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="3d">3 days</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="never">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-white/[0.06] bg-white/[0.02]">
            <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Create Poll
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}