import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { StickyNote, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hook for user notes
export function useUserNotes(currentUserId, targetUserId) {
  const queryClient = useQueryClient();

  const { data: note } = useQuery({
    queryKey: ['userNote', currentUserId, targetUserId],
    queryFn: async () => {
      // Store notes in localStorage for simplicity
      const notes = JSON.parse(localStorage.getItem('kairo_user_notes') || '{}');
      return notes[`${currentUserId}_${targetUserId}`] || '';
    },
    enabled: !!(currentUserId && targetUserId),
  });

  const saveMutation = useMutation({
    mutationFn: async (noteText) => {
      const notes = JSON.parse(localStorage.getItem('kairo_user_notes') || '{}');
      notes[`${currentUserId}_${targetUserId}`] = noteText;
      localStorage.setItem('kairo_user_notes', JSON.stringify(notes));
      return noteText;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNote', currentUserId, targetUserId] });
    },
  });

  return {
    note: note || '',
    saveNote: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}

// User note editor component
export function UserNoteEditor({ currentUserId, targetUserId, className }) {
  const { note, saveNote, isSaving } = useUserNotes(currentUserId, targetUserId);
  const [localNote, setLocalNote] = useState(note);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const handleChange = (e) => {
    setLocalNote(e.target.value);
    setHasChanges(e.target.value !== note);
  };

  const handleSave = () => {
    saveNote(localNote);
    setHasChanges(false);
  };

  const handleBlur = () => {
    if (hasChanges) {
      handleSave();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <StickyNote className="w-3.5 h-3.5" />
          <span>Note</span>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        )}
      </div>
      <textarea
        value={localNote}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Click to add a note about this user"
        className={cn(
          'w-full h-20 px-3 py-2 rounded-lg text-sm resize-none',
          'bg-white/[0.02] border border-white/[0.06]',
          'text-zinc-300 placeholder:text-zinc-600',
          'focus:outline-none focus:border-white/[0.12]'
        )}
      />
    </div>
  );
}

// Compact note display for profile cards
export function UserNotePreview({ currentUserId, targetUserId }) {
  const { note } = useUserNotes(currentUserId, targetUserId);
  
  if (!note) return null;
  
  return (
    <div className="mt-2 p-2 bg-white/[0.02] rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        <StickyNote className="w-3 h-3 text-zinc-500" />
        <span className="text-[10px] text-zinc-500 uppercase">Note</span>
      </div>
      <p className="text-xs text-zinc-400 line-clamp-2">{note}</p>
    </div>
  );
}