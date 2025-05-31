"use client";
import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";

export default function TestimonialsSection() {
  return (
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
  );
}