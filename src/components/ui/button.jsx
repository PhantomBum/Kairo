import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Loader2 } from "lucide-react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-[120ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)] text-[#0d1117] shadow hover:opacity-90",
        destructive:
          "bg-[var(--color-danger)] text-white shadow-sm hover:opacity-90",
        outline:
          "border border-[var(--border-medium)] bg-transparent hover:bg-[rgba(255,255,255,0.06)]",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.06)]",
        ghost: "hover:bg-[rgba(255,255,255,0.06)]",
        link: "text-[var(--accent-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-6 py-2.5",
        icon: "h-9 w-9 active:scale-[0.93]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const isDisabled = disabled || loading
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
