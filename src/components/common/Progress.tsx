import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent" | "success";
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  showLabel = false,
  size = "md",
  color = "primary",
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const heightMap = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };
  
  const colorMap = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    accent: "bg-accent-600",
    success: "bg-success-600",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
        <motion.div
          className={cn(colorMap[color], heightMap[size], "rounded-full")}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-secondary-600 dark:text-secondary-400">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};