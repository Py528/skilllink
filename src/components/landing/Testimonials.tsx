"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "SkillLink helped me transition from junior to senior developer in just 6 months.",
    author: "Alini Grace",
    role: "Senior Frontend Developer",
  },
  {
    quote: "The project-based approach made all the difference in my learning journey.",
    author: "Mark Batterby",
    role: "Full Stack Engineer",
  },
];

export const Testimonials = () => {
  return (
    <section className="container py-20 border-t">
      <h2 className="text-3xl font-bold text-center mb-16">What Learners Say</h2>
      <div className="grid md:grid-cols-2 gap-12">
        {testimonials.map((testimonial, i) => (
          <div key={i} className="space-y-4">
            <p className="text-lg font-medium">&quot;{testimonial.quote}&quot;</p>
            <div className="flex items-center">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${testimonial.author}`}
                  alt={testimonial.author}
                />
                <AvatarFallback>
                  {testimonial.author.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
