'use client'

import { motion } from 'framer-motion'

export default function Example() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <h1 className="text-2xl font-bold">Welcome to SkillLink 🚀</h1>
    </motion.div>
  )
}
