import * as React from "react";
import { cn } from '@/lib/utils';

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
