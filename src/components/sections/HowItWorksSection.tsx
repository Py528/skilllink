"use client";
import { motion } from "framer-motion";
import { steps } from "@/data/steps";

export default function HowItWorksSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-16">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 gap-12 px-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#1a1a1a] border border-gray-800/50 mb-4 text-[#0CF2A0]">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {step.title}
            </h3>
            <p className="text-gray-400">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}