import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Sparkles, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UpdateLogsModal({ isOpen, onClose }) {
  const { data: updates = [] } = useQuery({
    queryKey: ['updateLogs'],
    queryFn: () => base44.entities.UpdateLog.list('-release_date', 20)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Update Logs</h2>
                <p className="text-sm text-zinc-500">See what's new in Kairo</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {updates.map((update, i) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "p-6 rounded-xl border-2 transition-all",
                update.is_major 
                  ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/50" 
                  : "bg-zinc-800/50 border-zinc-800"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">{update.title}</h3>
                    {update.is_major && (
                      <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded">
                        MAJOR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    v{update.version} • {new Date(update.release_date).toLocaleDateString()}
                  </p>
                </div>
                {update.is_major && (
                  <Star className="w-6 h-6 text-yellow-500" />
                )}
              </div>

              <p className="text-sm text-zinc-300 mb-4">{update.description}</p>

              {update.changes?.length > 0 && (
                <div className="space-y-2">
                  {update.changes.map((change, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                      <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {updates.length === 0 && (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No updates yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}