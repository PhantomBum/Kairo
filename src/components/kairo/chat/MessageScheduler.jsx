import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Calendar, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format, addHours, addDays } from 'date-fns';

const quickOptions = [
  { label: 'In 1 hour', getValue: () => addHours(new Date(), 1) },
  { label: 'In 3 hours', getValue: () => addHours(new Date(), 3) },
  { label: 'Tomorrow morning', getValue: () => {
    const d = addDays(new Date(), 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }},
  { label: 'Tomorrow evening', getValue: () => {
    const d = addDays(new Date(), 1);
    d.setHours(18, 0, 0, 0);
    return d;
  }},
];

export default function MessageScheduler({ 
  isOpen, 
  onClose, 
  onSchedule,
  initialContent = ''
}) {
  const [content, setContent] = useState(initialContent);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!content.trim() || !scheduledTime) return;

    setIsScheduling(true);
    try {
      await onSchedule?.({
        content: content.trim(),
        scheduled_for: new Date(scheduledTime).toISOString()
      });
      onClose();
    } finally {
      setIsScheduling(false);
    }
  };

  const handleQuickOption = (getValue) => {
    const date = getValue();
    setScheduledTime(format(date, "yyyy-MM-dd'T'HH:mm"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Schedule Message</h2>
                <p className="text-sm text-zinc-500">Send this message later</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Message content */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Message</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="bg-zinc-900 border-zinc-800 text-white resize-none"
              />
            </div>

            {/* Quick options */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Quick Schedule</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleQuickOption(option.getValue)}
                    className="px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 transition-colors text-left"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom time */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Or select a custom time</Label>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            {/* Preview */}
            {scheduledTime && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <p className="text-sm text-indigo-300">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Scheduled for {format(new Date(scheduledTime), 'PPP p')}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!content.trim() || !scheduledTime || isScheduling}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              {isScheduling ? (
                'Scheduling...'
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}