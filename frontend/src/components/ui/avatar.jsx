import * as React from "react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Avatar({ className = "", size = "default", ...props }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "relative flex rounded-full overflow-hidden",
        size === "sm" && "size-6",
        size === "default" && "size-8",
        size === "lg" && "size-10",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Image
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({ className = "", ...props }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex items-center justify-center bg-gray-200 text-sm",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className = "", ...props }) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 rounded-full bg-blue-500 text-white",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className = "", ...props }) {
  return <div className={cn("flex -space-x-2", className)} {...props} />;
}

function AvatarGroupCount({ className = "", ...props }) {
  return (
    <div
      className={cn("flex items-center justify-center bg-gray-300", className)}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
