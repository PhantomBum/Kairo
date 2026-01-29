import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InlineEditField({ 
  value, 
  onSave, 
  placeholder = "Click to edit",
  className,
  multiline = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={cn(
          "group relative cursor-pointer hover:bg-zinc-800/50 rounded px-2 py-1 transition-colors",
          className
        )}
      >
        <span className={cn(!value && "text-zinc-600")}>{value || placeholder}</span>
        <Edit className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {multiline ? (
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <button
        onClick={handleSave}
        className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        className="p-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}