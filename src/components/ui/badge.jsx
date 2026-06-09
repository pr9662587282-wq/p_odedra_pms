import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

function Badge({
  className = "",
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";

  const variants = {
    default: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-gray-800",
    destructive: "bg-red-100 text-red-600",
    outline: "border border-gray-300 text-gray-700",
    ghost: "hover:bg-gray-100",
    link: "text-blue-500 underline",
  };

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={`${variants[variant] || variants.default} ${className}`}
      {...props}
    />
  );
}

export { Badge };
