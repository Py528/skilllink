"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="container pt-32 pb-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Build Skills. Prove Mastery. Get Hired.
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Micro-courses + real-world projects = career-ready skills.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="gap-2">
            Browse Courses <ArrowRight size={16} />
          </Button>
          <Button size="lg" variant="outline">
            Become an Instructor
          </Button>
        </div>
      </div>
    </section>
  );
};
