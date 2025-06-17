import React from 'react';
import Image from 'next/image';
import { cn } from "../../lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  status?: "online" | "offline" | "away" | "busy";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  status,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const statusColorMap = {
    online: "bg-success-500",
    offline: "bg-secondary-400",
    away: "bg-warning-500",
    busy: "bg-error-500",
  };

  const statusSizeMap = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`(max-width: 768px) ${size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}`}
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