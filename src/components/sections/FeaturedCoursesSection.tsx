"use client";
import { motion } from "framer-motion";
import { courses } from "@/data/courses";

export default function FeaturedCoursesSection() {
  return (
    <section className="container mx-auto py-20 border-t border-gray-800/50 px-4">
      <h2 className="text-3xl font-bold text-center text-white mb-16">
        Featured Courses
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800/50 hover:border-[#0CF2A0]/30 hover:shadow-lg transition-all"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(12, 242, 160, 0.1)",
            }}
          >
            <h3 className="text-lg font-semibold mb-2 text-white">
              {course.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4">{course.level}</p>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium">
                {course.instructor
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <span className="ml-3 text-sm text-gray-300">
                {course.instructor}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}