import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "../common/Card";
import { cn } from "../../utils/cn";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon,
  change,
  className,
}) => {
  const trendColorMap = {
    up: "text-success-600",
    down: "text-error-600",
    neutral: "text-secondary-500",
  };

  const iconContainerColorMap = {
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-500",
    secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400",
    accent: "bg-accent-100 text-accent-600 dark:bg-accent-900/20 dark:text-accent-500",
    success: "bg-success-100 text-success-600 dark:bg-success-900/20 dark:text-success-500",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/20 dark:text-warning-500",
    error: "bg-error-100 text-error-600 dark:bg-error-900/20 dark:text-error-500",
  };
  
  // Randomly select a color for demo purposes
  const randomColor = Object.keys(iconContainerColorMap)[
    Math.floor(Math.random() * Object.keys(iconContainerColorMap).length)
  ] as keyof typeof iconContainerColorMap;

  return (
    <Card className={cn("overflow-visible", className)}>
      <div className="p-6">
        <div className="flex items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "p-3 rounded-2xl mr-4",
              iconContainerColorMap[randomColor]
            )}
          >
            {icon}
          </motion.div>
          
          <div>
            <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              {title}
            </h3>
            <div className="mt-1 flex items-baseline">
              <motion.p 
                className="text-xl font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {value}
              </motion.p>
              
              {change && (
                <div className={cn("ml-2 flex items-center text-xs", trendColorMap[change.trend])}>
                  {change.trend === "up" ? (
                    <TrendingUp size={16} className="mr-1" />
                  ) : change.trend === "down" ? (
                    <TrendingDown size={16} className="mr-1" />
                  ) : null}
                  <span>{change.value}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
