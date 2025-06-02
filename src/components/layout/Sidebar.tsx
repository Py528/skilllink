import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Compass, 
  Home,
  Settings,
  Plus,
  Clock,
  Star,
  ChevronRight,
  Menu,
  Users,
  DollarSign,
  BarChart,
  MessageSquare,
  FileText,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../common/Button";
import { useUser } from "../../context/UserContext";
import { Badge } from "../common/Badge";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  count?: number;
  children?: NavItem[];
  collapsed?: boolean;
}

interface NavGroupProps {
  item: NavItem;
  onNavItemClick: (item: string) => void;
  depth?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onNavItemClick: (item: string) => void;
  activeNavItem: string;
}

// NavGroup component to handle collapsible navigation sections
const NavGroup: React.FC<NavGroupProps> = ({ item, onNavItemClick, depth = 0 }) => {
  const [isCollapsed, setIsCollapsed] = useState(item.collapsed || false);
  
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <div className="mb-1">
      <button
        className={cn(
          "flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-2xl transition-colors duration-150",
          item.active
            ? "bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-500"
            : "text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800",
          depth > 0 && "ml-6 text-xs"
        )}
        onClick={() => item.children ? toggleCollapse : onNavItemClick(item.href)}
      >
        <span className="flex items-center">
          {item.icon && <span className="mr-3">{item.icon}</span>}
          {item.label}
          {item.count && (
            <Badge variant="secondary" className="ml-2">
              {item.count}
            </Badge>
          )}
        </span>
        {item.children && (
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
      </button>
      
      {item.children && (
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pl-4">
                {item.children.map((child, idx) => (
                  <NavGroup
                    key={`${child.href}-${idx}`}
                    item={child}
                    onNavItemClick={onNavItemClick}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onNavItemClick,
  activeNavItem
}) => {
  const { user } = useUser();
  const [recentlyViewed, setRecentlyViewed] = useState<{title: string; href: string; icon: React.ReactNode}[]>([]);
  
  useEffect(() => {
    // In a real app, this would come from an API or local storage
    setRecentlyViewed([
      { title: "React Fundamentals", href: "course-123", icon: <BookOpen size={14} /> },
      { title: "Advanced CSS", href: "course-456", icon: <BookOpen size={14} /> },
      { title: "JavaScript Patterns", href: "course-789", icon: <BookOpen size={14} /> },
    ]);
  }, []);

  // Instructor navigation items
  const instructorNavItems: NavItem[] = [
    { 
      icon: <Home size={20} />, 
      label: "Dashboard", 
      href: "home",
      active: activeNavItem === "home"
    },
    { 
      icon: <BookOpen size={20} />, 
      label: "My Courses", 
      href: "courses",
      active: activeNavItem.startsWith("courses"),
      children: [
        { 
          icon: <Video size={16} />, 
          label: "Active Courses", 
          href: "courses/active",
          active: activeNavItem === "courses/active",
          count: 5
        },
        { 
          icon: <FileText size={16} />, 
          label: "Drafts", 
          href: "courses/drafts",
          active: activeNavItem === "courses/drafts",
          count: 2
        }
      ]
    },
    { 
      icon: <Users size={20} />, 
      label: "Students", 
      href: "students",
      active: activeNavItem === "students"
    },
    { 
      icon: <MessageSquare size={20} />, 
      label: "Discussions", 
      href: "discussions",
      active: activeNavItem === "discussions",
      count: 12
    },
    { 
      icon: <BarChart size={20} />, 
      label: "Analytics", 
      href: "analytics",
      active: activeNavItem === "analytics"
    },
    { 
      icon: <DollarSign size={20} />, 
      label: "Revenue", 
      href: "revenue",
      active: activeNavItem === "revenue"
    }
  ];

  // Learner navigation items
  const learnerNavItems: NavItem[] = [
    { 
      icon: <Home size={20} />, 
      label: "Home", 
      href: "home",
      active: activeNavItem === "home"
    },
    { 
      icon: <BookOpen size={20} />, 
      label: "My Learning", 
      href: "learning",
      active: activeNavItem.startsWith("learning"),
      count: 6,
      children: [
        { 
          icon: <Clock size={16} />, 
          label: "In Progress", 
          href: "learning/in-progress",
          active: activeNavItem === "learning/in-progress",
          count: 3
        },
        { 
          icon: <Star size={16} />, 
          label: "Completed", 
          href: "learning/completed",
          active: activeNavItem === "learning/completed",
          count: 3
        },
        { 
          icon: <BookOpen size={16} />, 
          label: "Saved", 
          href: "learning/saved",
          active: activeNavItem === "learning/saved",
          count: 5
        }
      ]
    },
    { 
      icon: <Compass size={20} />, 
      label: "Discover", 
      href: "discover",
      active: activeNavItem === "discover"
    }
  ];

  // Settings navigation item
  const settingsNavItem: NavItem = { 
    icon: <Settings size={20} />, 
    label: "Settings", 
    href: "settings",
    active: activeNavItem === "settings",
    children: [
      { 
        icon: null, 
        label: "Profile", 
        href: "settings/profile",
        active: activeNavItem === "settings/profile"
      },
      { 
        icon: null, 
        label: "Preferences", 
        href: "settings/preferences",
        active: activeNavItem === "settings/preferences"
      },
      { 
        icon: null, 
        label: "Notifications", 
        href: "settings/notifications",
        active: activeNavItem === "settings/notifications"
      }
    ],
    collapsed: true
  };

  // Select navigation items based on user role
  const navItems = user?.role === "instructor" ? instructorNavItems : learnerNavItems;

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    },
    closed: { 
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20 lg:hidden"
            onClick={() => onNavItemClick("toggle-menu")}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 z-30",
          "transform lg:translate-x-0 transition-transform duration-300 ease-in-out",
          !isOpen && "lg:relative"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Action Button */}
          <div className="p-4">
            {user?.role === "instructor" ? (
              <Button
                leftIcon={<Plus size={16} />}
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => onNavItemClick("create")}
              >
                Create New Course
              </Button>
            ) : (
              <Button
                leftIcon={<BookOpen size={16} />}
                className="w-full bg-primary-600 hover:bg-primary-700"
                onClick={() => onNavItemClick("resume")}
              >
                Resume Learning
              </Button>
            )}
          </div>
          
          {/* Main Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavGroup key={item.href} item={item} onNavItemClick={onNavItemClick} />
            ))}
          </nav>
          
          {/* Recently Viewed Section */}
          <div className="px-4 py-2">
            <h3 className="text-xs uppercase font-semibold text-secondary-500 mb-2 px-2">Recently Viewed</h3>
            <div className="space-y-1">
              {recentlyViewed.map((item) => (
                <motion.button
                  key={item.href}
                  className="flex items-center w-full px-2 py-1.5 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-md"
                  onClick={() => onNavItemClick(item.href)}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="truncate">{item.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Settings Navigation */}
          <div className="mt-auto px-2 py-4">
            <NavGroup item={settingsNavItem} onNavItemClick={onNavItemClick} />
          </div>
        </div>
      </motion.aside>
      
      {/* Mobile menu button */}
      <motion.button
        className="fixed bottom-4 right-4 z-30 p-3 rounded-full bg-primary-600 text-white shadow-lg lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavItemClick("toggle-menu")}
      >
        <Menu size={24} />
      </motion.button>
    </>
  );
};
