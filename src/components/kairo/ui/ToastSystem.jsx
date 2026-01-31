import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, AlertCircle, Info, X, 
  Bell, MessageCircle, UserPlus, Server 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

const TOAST_DURATION = 5000;

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  notification: Bell,
  message: MessageCircle,
  friend: UserPlus,
  server: Server
};

const toastColors = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  notification: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  message: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  friend: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  server: 'bg-violet-500/10 border-violet-500/20 text-violet-400'
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  notification: 'text-indigo-400',
  message: 'text-indigo-400',
  friend: 'text-emerald-400',
  server: 'text-violet-400'
};

function Toast({ toast, onDismiss }) {
  const Icon = toastIcons[toast.type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg",
        "bg-[#111113]/95 border-white/[0.08]",
        "min-w-[320px] max-w-[400px]"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        toastColors[toast.type]
      )}>
        <Icon className={cn("w-4 h-4", iconColors[toast.type])} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && (
          <p className="text-sm font-medium text-white mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-zinc-400">{toast.message}</p>
        
        {/* Action button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {!toast.persistent && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-0.5 bg-white/10 rounded-full"
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now().toString();
    const toast = {
      id,
      type: 'info',
      duration: TOAST_DURATION,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto dismiss
    if (!toast.persistent) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = {
    success: (message, options) => addToast({ type: 'success', message, ...options }),
    error: (message, options) => addToast({ type: 'error', message, ...options }),
    warning: (message, options) => addToast({ type: 'warning', message, ...options }),
    info: (message, options) => addToast({ type: 'info', message, ...options }),
    notification: (message, options) => addToast({ type: 'notification', message, ...options }),
    message: (title, message, options) => addToast({ type: 'message', title, message, ...options }),
    friend: (message, options) => addToast({ type: 'friend', message, ...options }),
    server: (message, options) => addToast({ type: 'server', message, ...options }),
    custom: addToast,
    dismiss: dismissToast,
    dismissAll
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Standalone toast function for use outside React components
let globalToast = null;
export const setGlobalToast = (toastFn) => {
  globalToast = toastFn;
};

export const showToast = (type, message, options) => {
  if (globalToast) {
    return globalToast[type]?.(message, options) || globalToast.custom({ type, message, ...options });
  }
  console.warn('Toast system not initialized');
};