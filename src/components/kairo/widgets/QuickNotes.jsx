import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, Trash2, Pin, X, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-200' },
  { id: 'pink', bg: 'bg-pink-500/20', border: 'border-pink-500/50', text: 'text-pink-200' },
  { id: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-200' },
  { id: 'green', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-200' },
  { id: 'purple', bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-200' },
  { id: 'orange', bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-200' },
];

export default function QuickNotes({ isOpen, onClose }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('kairo-quick-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem('kairo-quick-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      color: 'yellow',
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setEditingId(newNote.id);
  };

  const updateNote = (id, updates) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const togglePin = (id) => {
    updateNote(id, { pinned: !notes.find(n => n.id === id)?.pinned });
  };

  // Sort: pinned first, then by date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 w-80 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-white">Quick Notes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={addNote}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {sortedNotes.map((note) => {
            const colorScheme = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
            const isEditing = editingId === note.id;

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all",
                  colorScheme.bg,
                  colorScheme.border
                )}
              >
                {note.pinned && (
                  <Pin className="absolute top-2 right-2 w-3 h-3 text-yellow-400 fill-yellow-400" />
                )}

                {isEditing ? (
                  <textarea
                    autoFocus
                    value={note.content}
                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    placeholder="Write a note..."
                    className={cn(
                      "w-full bg-transparent resize-none outline-none text-sm",
                      colorScheme.text
                    )}
                    rows={3}
                  />
                ) : (
                  <p
                    onClick={() => setEditingId(note.id)}
                    className={cn(
                      "text-sm cursor-text min-h-[60px]",
                      colorScheme.text,
                      !note.content && "opacity-50 italic"
                    )}
                  >
                    {note.content || "Click to edit..."}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  {/* Color picker */}
                  <div className="flex gap-1">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => updateNote(note.id, { color: color.id })}
                        className={cn(
                          "w-4 h-4 rounded-full transition-transform",
                          color.bg.replace('/20', ''),
                          note.color === color.id && "ring-2 ring-white ring-offset-1 ring-offset-zinc-900"
                        )}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePin(note.id)}
                      className={cn(
                        "p-1 rounded hover:bg-white/10 transition-colors",
                        note.pinned ? "text-yellow-400" : "text-zinc-500"
                      )}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notes.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <button
              onClick={addNote}
              className="mt-2 text-violet-400 hover:text-violet-300 text-sm"
            >
              Create your first note
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}