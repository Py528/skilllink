'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  onChange?: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
}

export const FileInput: React.FC<FileInputProps> = ({ 
  label, 
  error, 
  helperText, 
  placeholder = "Choose a file...",
  className = '', 
  onChange,
  accept,
  disabled = false,
  ...props 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onChange?.(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getDisplayText = () => {
    if (selectedFile) {
      return selectedFile.name;
    }
    return placeholder;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          {...props}
        />
        
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={`w-full px-3 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-200 text-left ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
          <div className="flex items-center justify-between">
            <span className={`truncate ${selectedFile ? 'text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'}`}>
              {getDisplayText()}
            </span>
            <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
              Browse
            </span>
          </div>
        </button>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{helperText}</p>
      )}
    </div>
  );
}; 