import * as React from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const P = {
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  success: '#34d399', danger: '#f87171', accent: '#2dd4bf', warning: '#fbbf24',
};

const variantConfig = {
  success: { color: P.success, icon: CheckCircle },
  error: { color: P.danger, icon: AlertCircle },
  info: { color: P.accent, icon: Info },
  warning: { color: P.warning, icon: AlertTriangle },
};

const ToastProvider = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref}
    className="fixed bottom-0 right-0 z-[200] flex flex-col gap-2 p-4 max-w-[420px] w-full pointer-events-none"
    {...props} />
));
ToastProvider.displayName = "ToastProvider";

const ToastViewport = React.forwardRef(({ ...props }, ref) => (
  <div ref={ref}
    className="fixed bottom-0 right-0 z-[200] flex flex-col gap-2 p-4 max-w-[420px] w-full pointer-events-none"
    {...props} />
));
ToastViewport.displayName = "ToastViewport";

const Toast = React.forwardRef(({ className, variant = 'info', children, onDismiss, duration = 4000, ...props }, ref) => {
  const cfg = variantConfig[variant] || variantConfig.info;
  const Icon = cfg.icon;
  const [progress, setProgress] = React.useState(100);
  const [visible, setVisible] = React.useState(false);
  const startRef = React.useRef(Date.now());

  React.useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setVisible(false);
        setTimeout(() => onDismiss?.(), 200);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [duration, onDismiss]);

  return (
    <div ref={ref}
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-xl cursor-pointer transition-all",
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        className
      )}
      style={{
        background: P.floating, border: `1px solid ${P.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        borderLeft: `3px solid ${cfg.color}`,
        transitionDuration: visible ? '300ms' : '200ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={() => { setVisible(false); setTimeout(() => onDismiss?.(), 200); }}
      {...props}>
      <div className="flex items-start gap-3 p-3.5">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">{children}</div>
        <button className="w-5 h-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 flex-shrink-0 transition-opacity" onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(() => onDismiss?.(), 200); }}>
          <X className="w-3.5 h-3.5" style={{ color: P.muted }} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] w-full" style={{ background: `${cfg.color}15` }}>
        <div className="h-full transition-all duration-100 ease-linear" style={{ width: `${progress}%`, background: cfg.color, opacity: 0.5 }} />
      </div>
    </div>
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref}
    className={cn("inline-flex h-7 shrink-0 items-center justify-center rounded-md px-2.5 text-[12px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.08)]", className)}
    style={{ color: P.accent }}
    {...props} />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref}
    className={cn("absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100", className)}
    style={{ color: P.muted }}
    {...props}>
    <X className="h-3.5 w-3.5" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[13px] font-semibold", className)} style={{ color: P.textPrimary }} {...props} />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[12px] mt-0.5", className)} style={{ color: P.textSecondary }} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
