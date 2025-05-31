"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProjectsSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-white">
            Show, don&apos;t tell.
          </h2>
          <p className="text-xl text-gray-400">
            Prove what you&apos;ve learned through real-world projects that
            employers actually care about.
          </p>
        </motion.div>

        <motion.div
          className="p-8 bg-[#1a1a1a]/50 rounded-lg border border-gray-800/50"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-lg border border-gray-800/70">
            <Image
              src="/example_homepage.png"
              alt="Dashboard Platform Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h3 className="font-semibold mb-2 text-white">
            Dashboard Platform
          </h3>
          <p className="text-sm text-gray-400">
            Built with React, Node.js, and PostgreSQL
          </p>
        </motion.div>
      </div>
    </section>
  );
}
