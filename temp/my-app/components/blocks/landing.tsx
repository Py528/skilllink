"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Code, Award } from "lucide-react";
import { Github, Mail, ExternalLink, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
const currentYear = new Date().getFullYear();
// Navigation components from Nexus theme
const NavLink = ({
  href,
  children,
  hasDropdown,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) => {
  return (
    <a
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
    </a>
  );
};

const DropdownMenu = ({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) => {
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

const DropdownItem = ({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <a
      href={href}
      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-[#0CF2A0] hover:bg-gray-800/50"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </a>
  );
};

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M4 6h16M4 12h16M4 18h16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Rotating text component from Nexus
const RotatingText = ({
  texts,
  mainClassName,
  initial,
  animate,
  exit,
  transition,
  rotationInterval,
}: {
  texts: string[];
  mainClassName: string;
  initial?: { y: string; opacity: number };
  animate?: { y: number; opacity: number };
  exit?: { y: string; opacity: number };
  transition?: object;
  rotationInterval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval || 2200); // Use rotationInterval if provided
    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentIndex].split("");

  return (
    <motion.span
      key={currentIndex}
      initial={initial || { opacity: 0, y: 20 }} // Default values if not passed
      animate={animate || { opacity: 1, y: 0 }}
      exit={exit || { opacity: 0, y: -20 }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      }}
      transition={transition || { type: "spring", damping: 18, stiffness: 250 }} // Default transition
      className={`inline-flex ${mainClassName}`}
    >
      {currentText.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            delay: i * 0.03,
            type: "spring",
            stiffness: 250,
            damping: 18,
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Main component
export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const canvasRef = useRef(null);

  // Animation variants
  const headerVariants = {
    top: { height: 70, backgroundColor: "rgba(17, 17, 17, 0.3)" },
    scrolled: { height: 70, backgroundColor: "rgba(17, 17, 17, 0.8)" },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: { opacity: 1, height: "auto", y: 0 },
    exit: { opacity: 0, height: 0, y: -20 },
  };

  const bannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
  };

  const headlineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.4 } },
  };

  const subHeadlineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.6 } },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.8 } },
  };

  // Effect for scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for canvas animation (particle effect from Nexus)
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return; // Early exit if ref is not set

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Early exit if context is not available

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Configure particles
    type Particle = {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
    };
    const particles: Particle[] = [];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: "#0CF2A0",
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        },
      });
    }

    // Function to draw particles
    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 0.2;
        ctx.fill();

        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x = -particle.velocity.x;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y = -particle.velocity.y;
        }
      });

      // Connect particles with lines if they're close enough
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = "#0CF2A0";
            ctx.globalAlpha = 0.05;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }

    drawParticles();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Course data from SkillLink
  const courses = [
    {
      title: "Advanced React Patterns",
      level: "Intermediate",
      instructor: "Sarah Chen",
    },
    {
      title: "System Design Fundamentals",
      level: "Advanced",
      instructor: "Michael Ross",
    },
    {
      title: "API Development with Node.js",
      level: "Intermediate",
      instructor: "David Kim",
    },
  ];

  // Steps data from SkillLink
  const steps = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Learn",
      description: "Master concepts through micro-courses",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Build",
      description: "Apply skills in real-world projects",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Earn",
      description: "Get verified credentials",
    },
  ];

  // Testimonials data from SkillLink
  const testimonials = [
    {
      quote:
        "SkillLink helped me transition from junior to senior developer in just 6 months.",
      author: "Alini Grace",
      role: "Senior Frontend Developer",
    },
    {
      quote:
        "The project-based approach made all the difference in my learning journey.",
      author: "Mark Batterby",
      role: "Full Stack Engineer",
    },
  ];

  // Render
  return (
    <div className="relative bg-[#111111] text-gray-300 min-h-screen flex flex-col overflow-x-hidden">
      {/* Canvas and enhanced gradient overlay for hero section */}
<div className="absolute inset-0 z-0 pointer-events-none" style={{ height: "100vh" }}>
  <canvas
    ref={canvasRef}
    className="absolute inset-0 z-0 pointer-events-none opacity-90"
  />
  <div
    className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
    style={{
      background: `
        linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 90%)
      `,
    }}
  ></div>
</div>


      {/* Header (Nexus style) */}
      <motion.header
        variants={headerVariants}
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="px-6 w-full md:px-10 lg:px-16 sticky top-0 z-30 backdrop-blur-md border-b border-gray-800/50"
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

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
            >
              <div className="flex flex-col items-center space-y-4 px-6">
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Courses
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Projects
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Learning Tracks
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Resources
                </NavLink>
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Pricing
                </NavLink>
                <hr className="w-full border-t border-gray-700/50 my-2" />
                <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign in
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section (Nexus style with SkillLink content) */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10 min-h-[90vh]">
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-gray-700 mb-8">
            <Sparkles size={16} className="text-[#0CF2A0]" />
            <span className="text-sm font-medium text-gray-400">
              Transform Your Career Journey
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mb-4"
        >
          Build Skills. Prove Mastery.{" "}
          <span className="inline-block h-[1.2em] sm:h-[1.2em] lg:h-[1.2em] overflow-hidden align-bottom">
            <RotatingText
              texts={["Get Hired", "Excel", "Advance", "Succeed", "Grow"]}
              mainClassName="text-[#0CF2A0] mx-1"
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 250 }}
              rotationInterval={2200}
            />

          </span>
        </motion.h1>
        <motion.p
          variants={subHeadlineVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Master the skills employers demand. Join thousands of professionals
          who&apos;ve transformed their careers through practical,
          industry-relevant learning.
        </motion.p>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
        >
          <motion.button
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#0CF2A0] text-[#111111] hover:bg-[#0CF2A0]/90 font-medium transition-all duration-200"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Browse Courses
            <ArrowRight size={16} className="ml-2" />
          </motion.button>

          <motion.button
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-700 bg-[#1a1a1a] hover:bg-gray-800 font-medium text-gray-300 transition-all duration-200"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Become an Instructor
          </motion.button>
        </motion.div>
      </main>

      {/* How It Works Section - NO GRADIENT */}
      <section className="container mx-auto py-20 border-t border-gray-800/50">
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-12 px-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#1a1a1a] border border-gray-800/50 mb-4 text-[#0CF2A0]">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          Featured Courses
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={i}
              className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800/50 hover:border-[#0CF2A0]/30 hover:shadow-lg transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(12, 242, 160, 0.1)",
              }}
            >
              <h3 className="text-lg font-semibold mb-2 text-white">
                {course.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{course.level}</p>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium">
                  {course.instructor
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span className="ml-3 text-sm text-gray-300">
                  {course.instructor}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects Section */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">
              Show, don&apos;t tell.
            </h2>
            <p className="text-xl text-gray-400">
              Prove what you&apos;ve learned through real-world projects that
              employers actually care about.
            </p>
          </motion.div>

          <motion.div
            className="p-8 bg-[#1a1a1a]/50 rounded-lg border border-gray-800/50"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-lg border border-gray-800/70">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg text-gray-300 font-mono">
                  Dashboard Platform Preview
                </span>
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-white">
              Dashboard Platform
            </h3>
            <p className="text-sm text-gray-400">
              Built with React, Node.js, and PostgreSQL
            </p>
          </motion.div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="p-8 border-2 border-gray-800 rounded-lg bg-[#1a1a1a]/30"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h4 className="font-semibold text-white">
                  Advanced React Development
                </h4>
                <p className="text-sm text-gray-400">Issued to John Lawrence</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
                JL
              </div>
            </div>
            <div className="text-xs font-mono text-gray-500 break-all">
              hash:0x7d8f3e2a1c5b9d6f4...
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">
              Earn verifiable, sharable credentials
            </h2>
            <p className="text-xl text-gray-400">
              Blockchain-verified certificates that prove your expertise to
              employers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          What Learners Say
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="space-y-4 p-6 rounded-lg bg-[#1a1a1a]/50 border border-gray-800/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-lg font-medium text-white">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium">
                  {testimonial.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section (Call to Action) */}
      <section className="relative py-24 bg-gradient-to-br from-[#111111] to-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
            >
              Ready to Start Your Learning Journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-gray-400 mb-10"
            >
              Join over 100,000 learners who have advanced their careers with
              SkillLink.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <motion.button
                className="inline-flex items-center justify-center px-8 py-3 rounded-md bg-[#0CF2A0] text-[#111111] hover:bg-[#0CF2A0]/90 font-medium transition-all duration-200"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                Start Free Trial
              </motion.button>
              <motion.button
                className="inline-flex items-center justify-center px-8 py-3 rounded-md border border-gray-700 bg-[#1a1a1a] hover:bg-gray-800 font-medium text-gray-300 transition-all duration-200"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                View Pricing
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-16">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          {[
            {
              q: "How is SkillLink different from other platforms?",
              a: "SkillLink focuses on practical, project-based learning that directly maps to employer needs. Our verified credentials and real-world projects make your skills immediately demonstrable to potential employers.",
            },
            {
              q: "Do I need prior experience to start?",
              a: "Not at all! We have learning paths for complete beginners as well as advanced professionals. Our system helps you identify the right starting point based on your current skill level.",
            },
            {
              q: "Are the credentials recognized by employers?",
              a: "Yes. Our credentials are blockchain-verified and recognized by over 500+ companies worldwide. We regularly update our curriculum based on industry needs and feedback.",
            },
            {
              q: "How much time do I need to commit?",
              a: "Our micro-courses are designed to fit into busy schedules. Most learners dedicate 5-10 hours per week and see significant progress within 2-3 months.",
            },
            {
              q: "Can I get a refund if I'm not satisfied?",
              a: "Absolutely. We offer a 14-day money-back guarantee for all our paid plans. No questions asked.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="mb-6 p-6 rounded-lg bg-[#1a1a1a]/50 border border-gray-800/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-3 text-white">
                {item.q}
              </h3>
              <p className="text-gray-400">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6 text-white"
          >
            Stay Updated
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-400 mb-8"
          >
            Join our newsletter for the latest courses, industry insights, and
            special offers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-md bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:border-[#0CF2A0]"
            />
            <motion.button
              className="px-6 py-3 rounded-md bg-[#0CF2A0] text-[#111111] font-medium hover:bg-[#0CF2A0]/90 transition-colors duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              Subscribe
            </motion.button>
          </motion.div>
          <p className="mt-4 text-sm text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-secondary/60 backdrop-blur-md text-muted-foreground border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                SkillLink
              </h2>
              <p className="text-sm max-w-sm leading-relaxed font-medium">
                Empowering professionals with skills for today&apos;s dynamic
                workplace.
              </p>
            </div>

            {/* Resources Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                Resources
              </h3>
              <div className="flex flex-col space-y-2 text-sm">
                {[
                  { name: "Privacy Policy", href: "#" },
                  { name: "Terms of Service", href: "#" },
                  { name: "Help Center", href: "#" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="footer-link hover:text-primary inline-flex items-center group transition-all duration-200 ease-in-out"
                  >
                    {link.name}
                    <ExternalLink
                      size={14}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                Connect
              </h3>
              <div className="flex flex-col space-y-2 text-sm">
                <a
                  href="mailto:contact@skilllink.dev"
                  className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
                >
                  <Mail size={16} className="mr-2" />
                  contact@skilllink.dev
                </a>
                <a
                  href="https://github.com/skilllink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
                >
                  <Github size={16} className="mr-2" />
                  GitHub
                </a>
                <a
                  href="https://twitter.com/skilllink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
                >
                  <Twitter size={16} className="mr-2" />
                  Twitter
                </a>
              </div>
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="text-center text-xs text-muted-foreground/80">
            <p className="font-medium">
              © {currentYear} SkillLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
