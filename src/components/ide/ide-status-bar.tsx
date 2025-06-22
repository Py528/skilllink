"use client"

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  AlertCircle, 
  Check, 
  Terminal, 
  BellRing, 
  Wifi 
} from 'lucide-react'

interface IDEStatusBarProps {
  setShowTerminal: (show: boolean) => void
  showTerminal: boolean
  isMinimized?: boolean
  setIsMinimized?: (minimized: boolean) => void
}

export function IDEStatusBar({ setShowTerminal, showTerminal, isMinimized, setIsMinimized }: IDEStatusBarProps) {
  const { theme } = useTheme()
  
  return (
    <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-2 text-xs">
      <div className="flex items-center">
        <Button 
          variant="link" 
          size="sm" 
          className="h-6 px-2 text-primary-foreground hover:text-primary-foreground/80 text-xs"
          onClick={() => setShowTerminal(!showTerminal)}
        >
          <Terminal size={14} className="mr-1" />
          {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
        </Button>
        
        <span className="mx-2">|</span>
        
        <Button 
          variant="link" 
          size="sm" 
          className="h-6 px-2 text-primary-foreground hover:text-primary-foreground/80 text-xs"
        >
          <GitBranch size={14} className="mr-1" />
          main
        </Button>
        
        <Button 
          variant="link" 
          size="sm" 
          className="h-6 px-2 text-primary-foreground hover:text-primary-foreground/80 text-xs"
        >
          <Check size={14} className="mr-1" />
          0 Problems
        </Button>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="link" 
          size="sm" 
          className="h-6 px-2 text-primary-foreground hover:text-primary-foreground/80 text-xs"
        >
          <Wifi size={14} className="mr-1" />
          Connected
        </Button>
        
        <Button 
          variant="link" 
          size="sm" 
          className="h-6 px-2 text-primary-foreground hover:text-primary-foreground/80 text-xs"
        >
          <BellRing size={14} />
        </Button>
        
        <span className="ml-2">TypeScript</span>
        <span className="ml-2">UTF-8</span>
        <span className="ml-2">LF</span>
        <span className="ml-2">{theme === 'dark' ? 'Dark' : 'Light'}</span>
      </div>
    </div>
  )
}