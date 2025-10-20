"use client"

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { 
  GitBranch, 
  AlertCircle, 
  Check, 
  Terminal, 
  BellRing, 
  Wifi,
  Cloud,
  CloudOff,
  Save,
  RefreshCw,
  GitCommit
} from 'lucide-react'

interface IDEStatusBarProps {
  setShowTerminal: (show: boolean) => void
  showTerminal: boolean
  isMinimized?: boolean
  setIsMinimized?: (minimized: boolean) => void
}

export function IDEStatusBar({ setShowTerminal, showTerminal, isMinimized, setIsMinimized }: IDEStatusBarProps) {
  const { theme } = useTheme()
  const [gitConnected, setGitConnected] = useState(false)
  const [s3Connected, setS3Connected] = useState(true)
  const [supabaseConnected, setSupabaseConnected] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [syncStatus, setSyncStatus] = useState('synced')
  
  return (
    <div className="h-6 bg-[var(--vscode-statusBar-background)] text-[var(--vscode-statusBar-foreground)] flex items-center justify-between px-2 text-xs border-t border-[var(--vscode-statusBar-border)]">
      <div className="flex items-center">
        <button 
          className="h-6 px-2 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-xs flex items-center gap-1"
          onClick={() => setShowTerminal(!showTerminal)}
        >
          <Terminal size={14} />
          {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
        </button>
        
        <div className="w-px h-4 bg-[var(--vscode-statusBar-border)] mx-2"></div>
        
        <button 
          className="h-6 px-2 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-xs flex items-center gap-1"
          onClick={() => setGitConnected(!gitConnected)}
        >
          <GitBranch size={14} />
          {gitConnected ? 'main' : 'No Git Repo'}
        </button>
        
        <button 
          className="h-6 px-2 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-xs flex items-center gap-1"
        >
          <Check size={14} />
          0 Problems
        </button>
      </div>
      
      <div className="flex items-center">
        {/* Connection Status */}
        <div className="flex items-center gap-1 mr-4">
          <div className="flex items-center gap-1">
            {supabaseConnected ? (
              <Cloud size={12} className="text-[var(--vscode-testing-iconPassed)]" />
            ) : (
              <CloudOff size={12} className="text-[var(--vscode-testing-iconFailed)]" />
            )}
            <span className="text-xs">Supabase</span>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {s3Connected ? (
              <Cloud size={12} className="text-[var(--vscode-testing-iconPassed)]" />
            ) : (
              <CloudOff size={12} className="text-[var(--vscode-testing-iconFailed)]" />
            )}
            <span className="text-xs">S3</span>
          </div>
        </div>
        
        {/* Sync Status */}
        <div className="flex items-center gap-1 mr-4">
          {autoSave && (
            <div className="flex items-center gap-1">
              <Save size={12} className="text-[var(--vscode-testing-iconPassed)]" />
              <span className="text-xs">Auto-save</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 ml-2">
            <RefreshCw size={12} className={syncStatus === 'synced' ? 'text-[var(--vscode-testing-iconPassed)]' : 'text-[var(--vscode-testing-iconQueued)]'} />
            <span className="text-xs">{syncStatus === 'synced' ? 'Synced' : 'Syncing...'}</span>
          </div>
        </div>
        
        <button 
          className="h-6 px-2 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-xs flex items-center gap-1"
        >
          <Wifi size={14} />
          Connected
        </button>
        
        <button 
          className="h-6 px-2 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-xs flex items-center gap-1"
        >
          <BellRing size={14} />
        </button>
        
        <div className="w-px h-4 bg-[var(--vscode-statusBar-border)] mx-2"></div>
        
        <span className="ml-2 text-[var(--vscode-statusBar-foreground)]">TypeScript</span>
        <span className="ml-2 text-[var(--vscode-statusBar-foreground)]">UTF-8</span>
        <span className="ml-2 text-[var(--vscode-statusBar-foreground)]">LF</span>
        <span className="ml-2 text-[var(--vscode-statusBar-foreground)]">{theme === 'dark' ? 'Dark' : 'Light'}</span>
      </div>
    </div>
  )
}