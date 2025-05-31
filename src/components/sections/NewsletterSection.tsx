"use client";
import { motion } from "framer-motion";

export default function NewsletterSection() {
  return (
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
  );
}