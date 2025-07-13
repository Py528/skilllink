import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a utility function for class names

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  isLoading,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = "rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:focus:ring-offset-secondary-900";
  
  const variants = {
    primary: "bg-primary-600 text-secondary-900 hover:bg-primary-700 active:bg-primary-800",
    secondary: "bg-secondary-200 text-secondary-900 hover:bg-secondary-300 active:bg-secondary-400 dark:bg-secondary-700 dark:text-white dark:hover:bg-secondary-600",
    outline: "border border-secondary-300 dark:border-secondary-700 bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800",
    ghost: "bg-transparent hover:bg-secondary-100 dark:hover:bg-secondary-800",
    link: "bg-transparent underline-offset-4 hover:underline text-primary-600 dark:text-primary-500 p-0 h-auto",
    danger: "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
  };
  
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3",
    icon: "p-2",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  const buttonClasses = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    (disabled || isLoading) && disabledStyles,
    className
  );

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
            <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </div>
      )}
    </motion.button>
  );
};