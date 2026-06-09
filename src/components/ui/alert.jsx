import * as React from "react";
import { cn } from "../../lib/utils";

const alertVariants = {
  default: "bg-card text-card-foreground",
  destructive: "bg-card text-red-600",
};

function Alert({ className = "", variant = "default", ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={`${alertVariants[variant]} ${className}`}
      {...props}
    />
  );
}

function AlertTitle({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={`font-medium ${className}`}
      {...props}
    />
  );
}

function AlertDescription({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={`text-sm text-gray-600 ${className}`}
      {...props}
    />
  );
}

function AlertAction({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-action"
      className={`absolute top-2 right-2 ${className}`}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
