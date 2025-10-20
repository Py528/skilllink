"use client"

import { motion } from 'framer-motion'
import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  PackageOpen, 
  Settings, 
  User 
} from 'lucide-react'

interface IDEActivityBarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function IDEActivityBar({ activeView, setActiveView }: IDEActivityBarProps) {
  const activities = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'source-control', icon: GitBranch, label: 'Source Control' },
    { id: 'run', icon: Play, label: 'Run and Debug' },
    { id: 'extensions', icon: PackageOpen, label: 'Extensions' },
  ]
  
  return (
    <div className="h-full w-12 bg-[var(--vscode-activityBar-background)] flex flex-col items-center py-2 border-r border-[var(--vscode-activityBar-border)]">
      <div className="flex flex-col items-center gap-2">
        {activities.map((activity) => (
          <div key={activity.id} className="relative">
            <button
              className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors ${
                activeView === activity.id
                  ? 'bg-[var(--vscode-activityBar-activeBackground)] text-[var(--vscode-activityBar-activeForeground)]'
                  : 'text-[var(--vscode-activityBar-inactiveForeground)] hover:text-[var(--vscode-activityBar-activeForeground)] hover:bg-[var(--vscode-activityBar-hoverBackground)]'
              }`}
              onClick={() => setActiveView(activity.id)}
              title={activity.label}
            >
              <activity.icon size={22} />
              {activeView === activity.id && (
                <motion.div
                  className="absolute left-0 w-0.5 h-5 bg-[var(--vscode-activityBar-activeBorder)] rounded-full"
                  layoutId="activity-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-auto flex flex-col items-center gap-2">
        <button
          className="h-10 w-10 rounded-md text-[var(--vscode-activityBar-inactiveForeground)] hover:text-[var(--vscode-activityBar-activeForeground)] hover:bg-[var(--vscode-activityBar-hoverBackground)] flex items-center justify-center"
          title="Account"
        >
          <User size={22} />
        </button>
        
        <button
          className="h-10 w-10 rounded-md text-[var(--vscode-activityBar-inactiveForeground)] hover:text-[var(--vscode-activityBar-activeForeground)] hover:bg-[var(--vscode-activityBar-hoverBackground)] flex items-center justify-center"
          title="Settings"
        >
          <Settings size={22} />
        </button>
      </div>
    </div>
  )
}