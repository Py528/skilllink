"use client";

import { Credentials } from "@/components/landing/Credentials";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Projects } from "@/components/landing/Projects";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturedCourses />
      <Projects />
      <Credentials />
      <Testimonials />
      <Footer />
    </div>
  );
}
