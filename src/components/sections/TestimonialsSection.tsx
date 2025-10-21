"use client";
import { motion } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { TrendingUp, Building2 } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">
          Success Stories That Speak Volumes
        </h2>
        <p className="text-gray-400 text-lg">
          Real developers, real results, real salary increases
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, i) => (
          <motion.div
            key={i}
            className="space-y-6 p-8 rounded-xl bg-[#1a1a1a]/50 border border-gray-800/50 hover:border-[#0CF2A0]/30 transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <p className="text-lg font-medium text-white leading-relaxed">
              &quot;{testimonial.quote}&quot;
            </p>
            
            {/* Salary Increase Highlight */}
            {testimonial.salaryIncrease && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0CF2A0]/10 border border-[#0CF2A0]/30">
                <TrendingUp className="h-5 w-5 text-[#0CF2A0]" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Salary Increase:</span>
                  <span className="text-lg font-bold text-[#0CF2A0]">
                    {testimonial.salaryIncrease}
                  </span>
                </div>
              </div>
            )}
            
            {/* Before/After Salary */}
            {testimonial.beforeAfter && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Before</p>
                  <p className="text-sm font-medium text-gray-300">
                    {testimonial.beforeAfter.before}
                  </p>
                </div>
                <div className="text-[#0CF2A0] font-bold">→</div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">After</p>
                  <p className="text-sm font-bold text-[#0CF2A0]">
                    {testimonial.beforeAfter.after}
                  </p>
                </div>
              </div>
            )}
            
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0CF2A0] to-[#00D4AA] flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.avatar || testimonial.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  {testimonial.company && (
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3 text-gray-500" />
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Call to Action */}
      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <p className="text-gray-400 mb-4">
          Ready to join these success stories?
        </p>
        <motion.button
          className="px-8 py-3 bg-[#0CF2A0] text-[#111111] font-semibold rounded-lg hover:bg-[#0CF2A0]/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your Success Story
        </motion.button>
      </motion.div>
    </section>
  );
}