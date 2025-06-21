// components/navigation/NavLink.tsx
import Link from "next/link";
import { NavLinkProps,DropdownMenuProps,DropdownItemProps } from "@/types";

export const NavLink = ({
  href,
  children,
  hasDropdown,
  className,
  onClick,
}: NavLinkProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-gray-300 hover:text-[#0CF2A0] transition-colors duration-200 font-medium relative ${
        hasDropdown ? "pr-5" : ""
      } ${className || ""}`}
    >
      {children}
      {hasDropdown && (
        <svg
          className="w-3 h-3 absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
    </Link>
  );
};

// components/navigation/DropdownMenu.tsx
import { motion } from "framer-motion";

export const DropdownMenu = ({ isOpen, children }: DropdownMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-full left-0 mt-2 bg-[#181818] backdrop-blur-lg border border-gray-800 rounded-md shadow-xl py-2 min-w-[200px] z-40 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {children}
    </motion.div>
  );
};

// components/navigation/DropdownItem.tsx

export const DropdownItem = ({ href, icon, children }: DropdownItemProps) => {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-[#0CF2A0] hover:bg-gray-800/50"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );
};