import { motion } from "framer-motion";

interface DropdownMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export const DropdownMenu = ({ isOpen, children }: DropdownMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-full left-0 mt-2 bg-[#181818] backdrop-blur-lg border border-gray-800 rounded-md shadow-xl py-2 min-w-[200px] z-40 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {children}
    </motion.div>
  );
};