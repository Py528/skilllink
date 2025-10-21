'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)} aria-label="Breadcrumb">
      <Link 
        href="/dashboard" 
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-500" />
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </Link>
          ) : (
            <span className="flex items-center text-white font-medium">
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Quick Actions Component
interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, className }) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {actions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className="group p-4 rounded-lg border border-gray-700 hover:border-[#0CF2A0]/50 bg-[#1a1a1a]/50 hover:bg-[#1a1a1a]/80 transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${action.color}`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white group-hover:text-[#0CF2A0] transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

