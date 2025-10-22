"use client"

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { 
  GitBranch, 
  Check, 
  Terminal, 
  BellRing, 
  Wifi,
  Cloud,
  CloudOff,
  Save,
  RefreshCw,
  FolderOpen,
  Folder,
  ChevronUp,
  ChevronDown,
  Square,
  Maximize2
} from 'lucide-react'

interface IDEStatusBarProps {
  setShowTerminal: (show: boolean) => void
  showTerminal: boolean
  isMinimized?: boolean
  setIsMinimized?: (minimized: boolean) => void
  showSidebar?: boolean
  setShowSidebar?: (show: boolean) => void
  isFullscreen?: boolean
  setIsFullscreen?: (fullscreen: boolean) => void
}

export function IDEStatusBar({ 
  setShowTerminal, 
  showTerminal, 
  isMinimized, 
  setIsMinimized,
  showSidebar,
  setShowSidebar,
  isFullscreen,
  setIsFullscreen
}: IDEStatusBarProps) {
  const { theme } = useTheme()
  const [gitConnected, setGitConnected] = useState(false)
  const [s3Connected] = useState(true)
  const [supabaseConnected] = useState(true)
  const [autoSave] = useState(true)
  const [syncStatus] = useState<'synced' | 'syncing'>('synced')
  
  return (
    <div className="h-6 bg-[var(--vscode-statusBar-background)] text-[var(--vscode-statusBar-foreground)] flex items-center justify-between px-1 text-[10px] border-t border-[var(--vscode-statusBar-border)] transition-all duration-200">
      {/* Left Section - Controls */}
      <div className="flex items-center gap-0.5 overflow-hidden">
        <button 
          className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
          onClick={() => setShowTerminal(!showTerminal)}
          title="Toggle Terminal (Ctrl+`)"
        >
          <Terminal size={10} />
          <span className="hidden sm:inline truncate max-w-[60px]">
            {showTerminal ? 'Hide' : 'Show'}
          </span>
        </button>
        
        {setShowSidebar && (
          <button 
            className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Toggle Sidebar (Ctrl+B)"
          >
            {showSidebar ? <FolderOpen size={8} /> : <Folder size={8} />}
            <span className="hidden sm:inline truncate max-w-[60px]">
              {showSidebar ? 'Hide' : 'Show'}
            </span>
          </button>
        )}
        
        {setIsMinimized && (
          <button 
            className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
            onClick={() => setIsMinimized(!isMinimized)}
            title="Minimize IDE (Ctrl+J)"
          >
            {isMinimized ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            <span className="hidden sm:inline truncate max-w-[60px]">
              {isMinimized ? 'Expand' : 'Min'}
            </span>
          </button>
        )}
        
        {setIsFullscreen && (
          <button 
            className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Square size={8} /> : <Maximize2 size={8} />}
            <span className="hidden sm:inline truncate max-w-[60px]">
              {isFullscreen ? 'Exit' : 'Full'}
            </span>
          </button>
        )}
        
        <div className="w-px h-3 bg-[var(--vscode-statusBar-border)] mx-1"></div>
        
        <button 
          className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
          onClick={() => setGitConnected(!gitConnected)}
          title="Git Status"
        >
          <GitBranch size={10} />
          <span className="hidden md:inline truncate max-w-[80px]">
            {gitConnected ? 'main' : 'No Git'}
          </span>
        </button>
        
        <button 
          className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
          title="Problems"
        >
          <Check size={10} />
          <span className="hidden lg:inline">0</span>
        </button>
      </div>
      
      {/* Right Section - Status Info */}
      <div className="flex items-center gap-0.5 overflow-hidden">
        {/* Connection Status - Hidden on small screens */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {supabaseConnected ? (
              <Cloud size={8} className="text-[var(--vscode-testing-iconPassed)]" />
            ) : (
              <CloudOff size={8} className="text-[var(--vscode-testing-iconFailed)]" />
            )}
            <span className="text-[10px] hidden lg:inline">Supabase</span>
          </div>
          
          <div className="flex items-center gap-0.5">
            {s3Connected ? (
              <Cloud size={8} className="text-[var(--vscode-testing-iconPassed)]" />
            ) : (
              <CloudOff size={8} className="text-[var(--vscode-testing-iconFailed)]" />
            )}
            <span className="text-[10px] hidden lg:inline">S3</span>
          </div>
        </div>
        
        {/* Sync Status - Hidden on small screens */}
        <div className="hidden sm:flex items-center gap-1">
          {autoSave && (
            <div className="flex items-center gap-0.5">
              <Save size={8} className="text-[var(--vscode-testing-iconPassed)]" />
              <span className="text-[10px] hidden lg:inline">Auto-save</span>
            </div>
          )}
          
          <div className="flex items-center gap-0.5">
            <RefreshCw size={8} className={syncStatus === 'synced' ? 'text-[var(--vscode-testing-iconPassed)]' : 'text-[var(--vscode-testing-iconQueued)]'} />
            <span className="text-[10px] hidden lg:inline">
              {syncStatus === 'synced' ? 'Synced' : 'Syncing...'}
            </span>
          </div>
        </div>
        
        <button 
          className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
          title="Connection Status"
        >
          <Wifi size={10} />
          <span className="hidden lg:inline">Connected</span>
        </button>
        
        <button 
          className="h-6 px-1.5 text-[var(--vscode-statusBar-foreground)] hover:text-[var(--vscode-statusBar-hoverForeground)] text-[10px] flex items-center gap-0.5 transition-colors duration-150"
          title="Notifications"
        >
          <BellRing size={10} />
        </button>
        
        <div className="w-px h-3 bg-[var(--vscode-statusBar-border)] mx-1"></div>
        
        {/* File Info - Responsive */}
        <span className="text-[10px] text-[var(--vscode-statusBar-foreground)] hidden sm:inline truncate max-w-[60px]">TypeScript</span>
        <span className="text-[10px] text-[var(--vscode-statusBar-foreground)] hidden md:inline truncate max-w-[40px]">UTF-8</span>
        <span className="text-[10px] text-[var(--vscode-statusBar-foreground)] hidden lg:inline">LF</span>
        <span className="text-[10px] text-[var(--vscode-statusBar-foreground)] hidden xl:inline truncate max-w-[40px]">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </div>
    </div>
  )
}