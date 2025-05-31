import { Metadata } from "next";
import { HeroSection } from "@/components/hero/HeroSection";
import { Header } from "@/components/layout/Header";
import FeaturedCoursesSection from "@/components/sections/FeaturedCoursesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import CredentialsSection from "@/components/sections/CredentialsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import CTASection from "@/components/sections/CTASection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import Footer from "@/components/layout/Footer";


export const metadata: Metadata = {
  title: "SkillLink - Learn by Building",
  description: "Build real-world projects and gain skills that matter.",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header isScrolled={false} />
      
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <FeaturedCoursesSection />
        <CredentialsSection />
        <ProjectsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <NewsletterSection />
      </main>

      <Footer />
    </div>
  );
}
