// Adapter: maps shadcn-style toast API to Sonner
import { toast as sonnerToast } from 'sonner';

function toast({ title, description, variant = 'default', ...rest }) {
  const opts = description ? { description, ...rest } : rest;
  switch (variant) {
    case 'success': return sonnerToast.success(title || 'Success', opts);
    case 'error': return sonnerToast.error(title || 'Error', opts);
    case 'warning': return sonnerToast.warning(title || 'Warning', opts);
    case 'info': return sonnerToast(title || 'Info', opts);
    default: return sonnerToast(title || 'Notification', opts);
  }
}

function useToast() {
  return {
    toasts: [],
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
