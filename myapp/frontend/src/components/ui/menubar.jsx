import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";

import { cn } from '@/lib/utils';
import { CheckIcon, ChevronRightIcon } from "lucide-react";

export function Menubar({ className, ...props }) {
  return (
    <MenubarPrimitive.Root
      className={cn(
        "flex h-8 items-center gap-1 rounded-md border p-1",
        className,
      )}
      {...props}
    />
  );
}

export function MenubarMenu(props) {
  return <MenubarPrimitive.Menu {...props} />;
}

export function MenubarTrigger({ className, ...props }) {
  return (
    <MenubarPrimitive.Trigger
      className={cn("px-2 py-1 text-sm hover:bg-muted rounded", className)}
      {...props}
    />
  );
}

export function MenubarContent({ className, ...props }) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        className={cn(
          "min-w-40 rounded-md bg-popover p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
}

export function MenubarItem({ className, ...props }) {
  return (
    <MenubarPrimitive.Item
      className={cn("px-2 py-1 text-sm rounded hover:bg-accent", className)}
      {...props}
    />
  );
}

export function MenubarCheckboxItem({ children, checked, ...props }) {
  return (
    <MenubarPrimitive.CheckboxItem checked={checked} {...props}>
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon />
      </MenubarPrimitive.ItemIndicator>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

export function MenubarRadioItem({ children, ...props }) {
  return (
    <MenubarPrimitive.RadioItem {...props}>
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon />
      </MenubarPrimitive.ItemIndicator>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

export function MenubarSeparator(props) {
  return (
    <MenubarPrimitive.Separator className="h-px bg-border my-1" {...props} />
  );
}

export function MenubarLabel(props) {
  return (
    <MenubarPrimitive.Label
      className="px-2 py-1 text-xs text-muted-foreground"
      {...props}
    />
  );
}

export function MenubarShortcut(props) {
  return <span className="ml-auto text-xs text-muted-foreground" {...props} />;
}

export function MenubarSub(props) {
  return <MenubarPrimitive.Sub {...props} />;
}

export function MenubarSubTrigger({ children, ...props }) {
  return (
    <MenubarPrimitive.SubTrigger {...props}>
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

export function MenubarSubContent(props) {
  return (
    <MenubarPrimitive.SubContent
      className="rounded-md bg-popover p-1 shadow-lg"
      {...props}
    />
  );
}
