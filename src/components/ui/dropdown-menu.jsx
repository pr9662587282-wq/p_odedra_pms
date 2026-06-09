import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "../../lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

export function DropdownMenuGroup(props) {
  return <DropdownMenuPrimitive.Group {...props} />;
}
export function DropdownMenu(props) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export function DropdownMenuPortal(props) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export function DropdownMenuTrigger(props) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-32 rounded-lg bg-popover p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({ children, checked, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem checked={checked} {...props}>
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuSeparator(props) {
  return (
    <DropdownMenuPrimitive.Separator
      className="h-px bg-border my-1"
      {...props}
    />
  );
}

export function DropdownMenuLabel(props) {
  return (
    <DropdownMenuPrimitive.Label
      className="px-2 py-1 text-xs text-muted-foreground"
      {...props}
    />
  );
}

export function DropdownMenuShortcut(props) {
  return <span className="ml-auto text-xs text-muted-foreground" {...props} />;
}

export function DropdownMenuSub(props) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export function DropdownMenuSubTrigger({ children, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger {...props}>
      {children}
      <ChevronRightIcon className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent(props) {
  return (
    <DropdownMenuPrimitive.SubContent
      className="rounded-md bg-popover p-1 shadow-lg"
      {...props}
    />
  );
}
