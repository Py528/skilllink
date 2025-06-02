import { cn } from "@/lib/utils";
import React from "react";

type BadgeVariant = "primary" | "secondary" | "outline" | "success" | "warning" | "error";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className,
}) => {
  const variantStyles = {
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
    secondary: "bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300",
    outline: "border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300",
    success: "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300",
    warning: "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300",
    error: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};