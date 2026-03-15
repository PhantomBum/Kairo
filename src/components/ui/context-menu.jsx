import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { colors, radius, shadows } from "@/components/app/design/tokens"

const MENU_Z = 900
const menuStyle = {
  background: colors.bg.float,
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: radius.md,
  boxShadow: shadows.floating,
  animationDuration: '120ms',
}

const ContextMenu = ContextMenuPrimitive.Root
const ContextMenuTrigger = ContextMenuPrimitive.Trigger
const ContextMenuGroup = ContextMenuPrimitive.Group
const ContextMenuPortal = ContextMenuPrimitive.Portal
const ContextMenuSub = ContextMenuPrimitive.Sub
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors focus:bg-[rgba(255,255,255,0.06)] data-[state=open]:bg-[rgba(255,255,255,0.06)]",
      inset && "pl-8",
      className
    )}
    style={{ color: colors.text.secondary }}
    {...props}>
    {children}
    <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "min-w-[10rem] overflow-hidden p-1.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      className
    )}
    style={{ ...menuStyle, zIndex: MENU_Z }}
    collisionPadding={16}
    sideOffset={2}
    {...props} />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "min-w-[10rem] overflow-hidden p-1.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      style={{ ...menuStyle, zIndex: MENU_Z }}
      collisionPadding={16}
      sideOffset={2}
      {...props} />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef(({ className, inset, danger, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium outline-none transition-colors duration-[120ms] ease-out focus:bg-[rgba(255,255,255,0.06)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "min-h-8 hover:bg-[rgba(255,255,255,0.06)] data-[highlighted]:bg-[rgba(255,255,255,0.06)] active:scale-[0.99]",
      inset && "pl-8",
      className
    )}
    style={{ color: danger ? colors.danger : colors.text.secondary }}
    {...props} />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-2 pl-8 pr-2.5 text-[13px] outline-none transition-colors focus:bg-[rgba(255,255,255,0.06)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    style={{ color: colors.text.secondary }}
    checked={checked}
    {...props}>
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-2 pl-8 pr-2.5 text-[13px] outline-none transition-colors focus:bg-[rgba(255,255,255,0.06)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    style={{ color: colors.text.secondary }}
    {...props}>
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn("px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider", inset && "pl-8", className)}
    style={{ color: colors.text.muted }}
    {...props} />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("mx-1 my-1 h-px", className)}
    style={{ background: colors.border.subtle }}
    {...props} />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({ className, ...props }) => (
  <span className={cn("ml-auto text-[11px] tracking-widest", className)} style={{ color: colors.text.muted }} {...props} />
)
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel,
  ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup,
  ContextMenuPortal, ContextMenuSub, ContextMenuSubContent,
  ContextMenuSubTrigger, ContextMenuRadioGroup,
}
