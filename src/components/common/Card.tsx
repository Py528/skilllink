import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  onClick,
}) => {
  const baseStyles = "bg-white dark:bg-secondary-800 rounded-2xl shadow-soft dark:shadow-none border border-secondary-200 dark:border-secondary-700 overflow-hidden";
  
  const hoverStyles = hoverable 
    ? "transition-all duration-200 hover:shadow-soft-lg dark:hover:bg-secondary-700 cursor-pointer" 
    : "";
  
  return (
    <motion.div
      className={cn(baseStyles, hoverStyles, className)}
      onClick={onClick}
      whileHover={hoverable ? { y: -5 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-b border-secondary-200 dark:border-secondary-700", className)}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
};

export const CardFooter: React.FC<{ 
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800", className)}>
      {children}
    </div>
  );
};