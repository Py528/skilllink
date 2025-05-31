"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "../navigation/NavLink";
import { DropdownMenu } from "../navigation/DropdownMenu";
import { DropdownItem } from "../navigation/DropdownItem";
import { MobileMenu } from "./MobileMenu";
import { MenuIcon } from "../icons/MenuIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { ExternalLinkIcon } from "../icons/ExternalLinkIcon";

interface HeaderProps {
  isScrolled: boolean;
}

const headerVariants = {
  top: { height: 70, backgroundColor: "rgba(17, 17, 17, 0.3)" },
  scrolled: { height: 70, backgroundColor: "rgba(17, 17, 17, 0.8)" },
};

export const Header = ({ isScrolled }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<null | "tracks" | "resources">(null);

  return (
    <motion.header
      variants={headerVariants}
      initial="top"
      animate={isScrolled ? "scrolled" : "top"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed px-6 w-full md:px-10 lg:px-16 top-0 z-50 backdrop-blur-md border-b border-gray-800/50"
    >
      <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
        <div className="flex items-center flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="#0CF2A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="#0CF2A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="#0CF2A0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold text-white ml-2">SkillLink</span>
        </div>

        <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8 px-4">
          <NavLink href="#">Courses</NavLink>
          <NavLink href="#">Projects</NavLink>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("tracks")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <NavLink href="#" hasDropdown>
              Learning Tracks
            </NavLink>
            <DropdownMenu isOpen={openDropdown === "tracks"}>
              <DropdownItem href="#">Web Development</DropdownItem>
              <DropdownItem href="#">Data Science</DropdownItem>
              <DropdownItem href="#">Cloud Engineering</DropdownItem>
              <DropdownItem href="#">Machine Learning</DropdownItem>
              <DropdownItem href="#">Mobile Development</DropdownItem>
            </DropdownMenu>
          </div>

          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown("resources")}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <NavLink href="#" hasDropdown>
              Resources
            </NavLink>
            <DropdownMenu isOpen={openDropdown === "resources"}>
              <DropdownItem href="#" icon={<ExternalLinkIcon />}>
                Blog
              </DropdownItem>
              <DropdownItem href="#">Community</DropdownItem>
              <DropdownItem href="#">Help Center</DropdownItem>
              <DropdownItem href="#">For Instructors</DropdownItem>
            </DropdownMenu>
          </div>

          <NavLink href="#">Pricing</NavLink>
        </div>

        <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
          <NavLink href="#" className="hidden md:inline-block">
            Sign in
          </NavLink>

          <motion.a
            href="#"
            className="bg-[#0CF2A0] text-[#111111] px-4 py-[6px] rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Get Started
          </motion.a>

          <motion.button
            className="md:hidden text-gray-300 hover:text-white z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </motion.button>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </motion.header>
  );
};