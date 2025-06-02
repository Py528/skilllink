import React from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  className,
  status,
}) => {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const statusColorMap = {
    online: "bg-success-500",
    offline: "bg-secondary-400",
    away: "bg-warning-500",
    busy: "bg-error-500",
  };

  const statusSizeMap = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          sizeMap[size],
          "rounded-full object-cover border-2 border-secondary-200 dark:border-secondary-700"
        )}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          // We'd normally create an element with initials here
        }}
      />
      
      {status && (
        <span
          className={cn(
            statusColorMap[status],
            statusSizeMap[size],
            "absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-secondary-800"
          )}
        />
      )}
    </div>
  );
};