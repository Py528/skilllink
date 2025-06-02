"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Book, 
  LogOut, 
  Menu, 
  Moon, 
  Sun, 
  X, 
  Bell, 
  Search,
  MessageSquare,
  ChevronDown
} from "lucide-react";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  toggleSidebar,
  isSidebarOpen
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [messages, setMessages] = useState(2);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulated notification update
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 2) - 0.7; // Bias slightly toward decrease
      setNotifications(prev => Math.max(0, Math.min(5, prev + change)));
      
      if (Math.random() > 0.7) {
        setMessages(prev => Math.max(0, Math.min(3, prev + Math.floor(Math.random() * 2) - 0.8)));
      }
    }, 45000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearchToggle = () => {
    if (isMobile) {
      setIsSearchOpen(!isSearchOpen);
    }
  };
  
  // Close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "shadow-md" : ""
    )}>
      <div className={cn(
        "bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md border-b transition-all duration-300",
        scrolled 
          ? "border-secondary-200 dark:border-secondary-800" 
          : "border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo and Menu Toggle */}
            <div className="flex items-center space-x-4">
              <motion.button 
                className={cn(
                  "p-1.5 rounded-md focus:outline-none",
                  "text-secondary-600 dark:text-secondary-400",
                  "hover:bg-secondary-200 dark:hover:bg-secondary-800",
                  "lg:hidden"
                )}
                onClick={toggleSidebar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isSidebarOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </motion.button>

              <motion.div 
                className="flex-shrink-0 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Book className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600 dark:text-primary-500" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-secondary-900 dark:text-white">
                  Skill<span className="text-primary-600 dark:text-primary-500">Learn</span>
                </span>
              </motion.div>
            </div>

            {/* Center Section: Search */}
            <div className="hidden md:flex flex-1 justify-center px-8 max-w-md mx-auto">
              <div className="relative w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className={cn(
                      "w-full bg-secondary-100 dark:bg-secondary-800 border-2 rounded-full",
                      "py-2 pl-4 pr-10 transition-all duration-300",
                      isSearchOpen 
                        ? "border-primary-500 opacity-100" 
                        : "border-transparent opacity-80",
                      "focus:outline-none focus:border-primary-500 focus:opacity-100",
                      "placeholder-secondary-500 dark:placeholder-secondary-400",
                      "text-secondary-900 dark:text-white"
                    )}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <div className="absolute right-3 top-2.5 text-secondary-500 dark:text-secondary-400">
                    <Search className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Actions and User */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Icon (Mobile) */}
              <motion.button
                className={cn(
                  "md:hidden p-2 rounded-full focus:outline-none",
                  "bg-secondary-100 dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-400",
                  "hover:bg-secondary-200 dark:hover:bg-secondary-700"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearchToggle}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                className={cn(
                  "relative p-2 rounded-full focus:outline-none",
                  "bg-secondary-100 dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-400",
                  "hover:bg-secondary-200 dark:hover:bg-secondary-700",
                  "hidden sm:flex"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge variant="error">{notifications}</Badge>
                  </motion.div>
                )}
              </motion.button>

              {/* Messages */}
              <motion.button
                className={cn(
                  "relative p-2 rounded-full focus:outline-none",
                  "bg-secondary-100 dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-400",
                  "hover:bg-secondary-200 dark:hover:bg-secondary-700",
                  "hidden sm:flex"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="h-5 w-5" />
                {messages > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge variant="primary">{messages}</Badge>
                  </motion.div>
                )}
              </motion.button>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={cn(
                  "p-2 rounded-full focus:outline-none",
                  "bg-secondary-100 dark:bg-secondary-800",
                  "text-secondary-600 dark:text-secondary-400",
                  "hover:bg-secondary-200 dark:hover:bg-secondary-700",
                  "hidden xs:flex"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* User Menu */}
              {user && (
                <div className="flex items-center">
                  <motion.div 
                    className="hidden sm:block text-right mr-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="text-sm font-medium text-secondary-900 dark:text-white truncate max-w-[120px] lg:max-w-[200px]">
                      {user.name}
                    </div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                      {user.role}
                    </div>
                  </motion.div>
                  
                  <div className="flex items-center">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Avatar src={user.avatar} alt={user.name} size="sm" status="online" />
                    </motion.div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-1.5 rounded-full ml-1 focus:outline-none",
                        "text-secondary-500 dark:text-secondary-400",
                        "hover:bg-secondary-200 dark:hover:bg-secondary-700",
                        "hidden sm:block"
                      )}
                      onClick={logout}
                      title="Log out"
                    >
                      <LogOut className="h-4 w-4" />
                    </motion.button>
                    
                    {/* Mobile Menu Trigger */}
                    <motion.button
                      className={cn(
                        "p-1.5 rounded-full ml-1 sm:hidden focus:outline-none",
                        "text-secondary-500 dark:text-secondary-400",
                        "hover:bg-secondary-200 dark:hover:bg-secondary-700"
                      )}
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronDown 
                        className={cn(
                          "h-4 w-4 transition-transform duration-300",
                          mobileMenuOpen ? "rotate-180" : "rotate-0"
                        )} 
                      />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Search */}
          <AnimatePresence>
            {isSearchOpen && isMobile && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pb-4 px-2"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className={cn(
                      "w-full bg-secondary-100 dark:bg-secondary-800 border-2 border-primary-500 rounded-full",
                      "py-2 pl-4 pr-10 transition-all duration-300",
                      "focus:outline-none",
                      "placeholder-secondary-500 dark:placeholder-secondary-400",
                      "text-secondary-900 dark:text-white",
                      "text-sm"
                    )}
                    autoFocus
                  />
                  <div className="absolute right-3 top-2.5 text-secondary-500 dark:text-secondary-400">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="sm:hidden py-2 pb-4 space-y-2 border-t border-secondary-200 dark:border-secondary-800"
              >
                {/* User Info (Mobile) */}
                <div className="px-4 py-2">
                  <div className="text-sm font-medium text-secondary-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                    {user?.role}
                  </div>
                </div>

                {/* Theme Toggle (Mobile) */}
                <div 
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={toggleTheme}
                >
                  <div className="flex items-center space-x-3">
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    )}
                    <span className="text-sm text-secondary-900 dark:text-white">
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    <span className="text-sm text-secondary-900 dark:text-white">Notifications</span>
                  </div>
                  {notifications > 0 && (
                    <Badge variant="error">{notifications}</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    <span className="text-sm text-secondary-900 dark:text-white">Messages</span>
                  </div>
                  {messages > 0 && (
                    <Badge variant="primary">{messages}</Badge>
                  )}
                </div>
                
                <div 
                  className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  onClick={logout}
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                    <span className="text-sm text-secondary-900 dark:text-white">Logout</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};