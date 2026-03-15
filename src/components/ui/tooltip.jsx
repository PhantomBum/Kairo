"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { colors, radius, shadows } from "@/components/app/design/tokens"

const TOOLTIP_Z = 950

const TooltipProvider = ({ children, ...props }) => (
  <TooltipPrimitive.Provider delayDuration={400} skipDelayDuration={100} {...props}>
    {children}
  </TooltipPrimitive.Provider>
)

const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "max-w-[220px] whitespace-normal break-words overflow-hidden rounded-md px-2 py-1.5 text-[12px] font-medium",
        "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
        "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
        className
      )}
      style={{
        background: colors.bg.elevated,
        color: colors.text.primary,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: radius.sm,
        boxShadow: shadows.floating,
        zIndex: TOOLTIP_Z,
        animationDuration: '100ms',
      }}
      collisionPadding={12}
      {...props} />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
