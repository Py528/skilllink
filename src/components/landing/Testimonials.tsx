"use client";

const testimonials = [
  {
    quote: "SkillLink helped me transition from junior to senior developer in just 6 months.",
    author: "Alex Thompson",
    role: "Senior Frontend Developer",
  },
  {
    quote: "The project-based approach made all the difference in my learning journey.",
    author: "Maria Garcia",
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
              <div className="w-10 h-10 rounded-full bg-secondary" />
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
