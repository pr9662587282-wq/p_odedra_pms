import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from '@/lib/utils';

export function Checkbox({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}) {
  // onCheckedChange और onChange को अलग कर दिया गया है ताकि वे ...props (button) में न जाएँ

  const handleToggle = () => {
    const nextChecked = !checked;
    if (onCheckedChange) onCheckedChange(nextChecked);
    if (onChange) onChange(nextChecked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={handleToggle}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border border-gray-400 transition-colors",
        checked ? "bg-black text-white" : "bg-white",
        className,
      )}
      {...props}
    >
      {checked && <CheckIcon size={14} />}
    </button>
  );
}
