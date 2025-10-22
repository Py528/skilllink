"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { toast } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        className: 'toast-enhanced',
        style: {
          background: theme === 'dark' ? 'hsl(0 0% 20%)' : 'hsl(0 0% 100%)',
          border: theme === 'dark' ? '1px solid hsl(0 0% 30%)' : '1px solid hsl(0 0% 90%)',
          color: theme === 'dark' ? 'hsl(0 0% 98%)' : 'hsl(0 0% 15%)',
          borderRadius: '0.75rem',
          boxShadow: theme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          opacity: '1',
          backdropFilter: 'none',
        },
      }}
      style={
        {
          "--normal-bg": theme === 'dark' ? 'hsl(0 0% 20%)' : 'hsl(0 0% 100%)',
          "--normal-text": theme === 'dark' ? 'hsl(0 0% 98%)' : 'hsl(0 0% 15%)',
          "--normal-border": theme === 'dark' ? 'hsl(0 0% 30%)' : 'hsl(0 0% 90%)',
          "--success-bg": theme === 'dark' ? '#1a4d1a' : '#e6f9e6',
          "--success-text": theme === 'dark' ? '#90ee90' : '#004d00',
          "--success-border": theme === 'dark' ? '#2d5a2d' : '#99e699',
          "--error-bg": theme === 'dark' ? '#4d1a1a' : '#fee6e6',
          "--error-text": theme === 'dark' ? '#ff9999' : '#c40000',
          "--error-border": theme === 'dark' ? '#5a2d2d' : '#fb9999',
          "--warning-bg": theme === 'dark' ? '#4d3d1a' : '#fff9e6',
          "--warning-text": theme === 'dark' ? '#ffcc66' : '#997500',
          "--warning-border": theme === 'dark' ? '#5a4d2d' : '#ffe799',
          "--info-bg": theme === 'dark' ? '#1a3d4d' : '#e6f3ff',
          "--info-text": theme === 'dark' ? '#66b3ff' : '#0066cc',
          "--info-border": theme === 'dark' ? '#2d4d5a' : '#99ccff',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster, toast }
