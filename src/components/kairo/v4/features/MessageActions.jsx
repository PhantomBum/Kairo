import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';

// Edit message inline
export function EditMessageInline({ message, onSave, onCancel }) {
  const [content, setContent] = useState(message.content || '');

  const handleSave = () => {
    if (content.trim() && content !== message.content) {
      onSave(content);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-end gap-2 p-2 bg-white/[0.04] border border-amber-500/40 rounded-lg">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white text-sm resize-none focus:outline-none max-h-40"
          rows={1}
          autoFocus
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
          }}
        />
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 rounded text-white"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-white/[0.06] rounded text-zinc-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-1 px-2">
        Escape to cancel • Enter to save
      </p>
    </div>
  );
}

// Delete message confirmation
export function DeleteMessageModal({ isOpen, onClose, message, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Message"
      icon={<Trash2 className="w-5 h-5 text-red-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-zinc-400">
          Are you sure you want to delete this message?
        </p>
        
        {message?.content && (
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <p className="text-sm text-zinc-300 line-clamp-3">
              {message.content}
            </p>
          </div>
        )}
        
        <p className="text-xs text-zinc-600">
          This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}

// Message edit history viewer
export function EditHistoryModal({ isOpen, onClose, messageId }) {
  // Would fetch edit history from a separate entity
  // For now, just show the edited indicator
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit History"
      size="sm"
    >
      <div className="text-center py-8 text-zinc-500">
        <Edit2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Edit history not available</p>
      </div>
    </Modal>
  );
}