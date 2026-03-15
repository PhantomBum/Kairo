import { useToast } from "@/components/ui/use-toast";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastViewport>
      {toasts.map(({ id, title, description, variant, action, open, ...props }) => {
        if (!open) return null;
        return (
          <Toast key={id} variant={variant || 'info'} onDismiss={() => dismiss(id)} {...props}>
            <div>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
          </Toast>
        );
      })}
    </ToastViewport>
  );
}
