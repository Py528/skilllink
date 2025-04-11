"use client";

import { BookOpen, Code, Award } from "lucide-react";

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

export const HowItWorks = () => {
  return (
    <section className="container py-20 border-t">
      <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-12">
        {steps.map((step, i) => (
          <div key={i} className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
