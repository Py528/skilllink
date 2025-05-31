// types/index.ts
export interface Course {
  title: string;
  level: string;
  instructor: string;
}

export interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: { x: number; y: number };
}

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface DropdownMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export interface DropdownItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export interface RotatingTextProps {
  texts: string[];
  mainClassName: string;
  initial?: { y: string; opacity: number };
  animate?: { y: number; opacity: number };
  exit?: { y: string; opacity: number };
  transition?: object;
  rotationInterval?: number;
}