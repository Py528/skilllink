"use client";

import { motion } from "framer-motion";
import { faqs } from "@/data/faqs";

export default function FAQSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-16">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto">
        {faqs.map((item, i) => (
          <motion.div
            key={i}
            className="mb-6 p-6 rounded-lg bg-[#1a1a1a]/50 border border-gray-800/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-3 text-white">
              {item.question}
            </h3>
            <p className="text-gray-400">{item.answer}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}