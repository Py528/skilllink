"use client";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
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
  );
}