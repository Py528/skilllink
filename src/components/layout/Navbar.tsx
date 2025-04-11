"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="font-semibold text-xl">SkillLink</div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8">
          <a href="/landing" className="text-sm font-medium hover:text-primary">
            Home
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary">
            Courses
          </a>
          <a href="/dashboard" className="text-sm font-medium hover:text-primary">
            Dashboard
          </a>
        </div>

        {/* Auth Actions & Theme Toggle */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button size="sm">Sign up</Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};
