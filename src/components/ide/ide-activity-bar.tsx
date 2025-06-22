"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
    <div className="h-full w-12 bg-muted flex flex-col items-center py-2 border-r">
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-col items-center gap-2">
          {activities.map((activity) => (
            <Tooltip key={activity.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-md ${
                    activeView === activity.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveView(activity.id)}
                >
                  <activity.icon size={22} />
                  {activeView === activity.id && (
                    <motion.div
                      className="absolute left-0 w-0.5 h-5 bg-primary rounded-full"
                      layoutId="activity-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{activity.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <div className="mt-auto flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <User size={22} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Account</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <Settings size={22} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}