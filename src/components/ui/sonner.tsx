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
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--card-foreground))',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--card))",
          "--normal-text": "hsl(var(--card-foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--success-50))",
          "--success-text": "hsl(var(--success-900))",
          "--success-border": "hsl(var(--success-200))",
          "--error-bg": "hsl(var(--error-50))",
          "--error-text": "hsl(var(--error-900))",
          "--error-border": "hsl(var(--error-200))",
          "--warning-bg": "hsl(var(--warning-50))",
          "--warning-text": "hsl(var(--warning-900))",
          "--warning-border": "hsl(var(--warning-200))",
          "--info-bg": "hsl(var(--info-50))",
          "--info-text": "hsl(var(--info-900))",
          "--info-border": "hsl(var(--info-200))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster, toast }
