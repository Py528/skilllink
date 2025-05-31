"use client";
import { motion } from "framer-motion";

export default function CredentialsSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          className="p-8 border-2 border-gray-800 rounded-lg bg-[#1a1a1a]/30"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="font-semibold text-white">
                Advanced React Development
              </h4>
              <p className="text-sm text-gray-400">Issued to John Lawrence</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
              JL
            </div>
          </div>
          <div className="text-xs font-mono text-gray-500 break-all">
            hash:0x7d8f3e2a1c5b9d6f4...
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6 text-white">
            Earn verifiable, sharable credentials
          </h2>
          <p className="text-xl text-gray-400">
            Blockchain-verified certificates that prove your expertise to
            employers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}