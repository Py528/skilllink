"use client";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { RotatingText } from "./RotatingText";
import { ParticleBackground } from "./ParticleBackground";


const bannerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2 } },
};

const headlineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.4 } },
};

const subHeadlineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.6 } },
};

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.8 } },
};

export const HeroSection = () => {
  return (
    <>
      <ParticleBackground />
      
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10 min-h-[90vh] mb-12 mt-12">
        <motion.div
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a] border border-gray-700 mb-8">
            <Sparkles size={16} className="text-[#0CF2A0]" />
            <span className="text-sm font-medium text-gray-400">
              Transform Your Career Journey
            </span>
          </div>
        </motion.div>

        <motion.h1
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mb-4"
        >
          Build Skills. Prove Mastery.{" "}
          <br />
          <span className="inline-block h-[1.2em] sm:h-[1.2em] lg:h-[1.2em] overflow-hidden align-bottom">
            <RotatingText
              texts={["Get Hired", "Excel", "Advance", "Succeed", "Grow"]}
              mainClassName="text-[#0CF2A0] mx-1"
              initial={{ y: "40%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-40%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 22,
                stiffness: 120,
                mass: 0.6,
                ease: "easeInOut",
                duration: 0.8,
              }}
              rotationInterval={2200}
            />
          </span>
        </motion.h1>

        <motion.p
          variants={subHeadlineVariants}
          initial="hidden"
          animate="visible"
          className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Master the skills employers demand. Join thousands of professionals
          who&apos;ve transformed their careers through practical,
          industry-relevant learning.
        </motion.p>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
        >
          <motion.button
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#0CF2A0] text-[#111111] hover:bg-[#0CF2A0]/90 font-medium transition-all duration-200"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Browse Courses
            <ArrowRight size={16} className="ml-2" />
          </motion.button>

          <motion.button
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-700 bg-[#1a1a1a] hover:bg-gray-800 font-medium text-gray-300 transition-all duration-200"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Become an Instructor
          </motion.button>
        </motion.div>
      </main>
    </>
  );
};