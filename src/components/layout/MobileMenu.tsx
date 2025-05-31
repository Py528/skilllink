import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "../navigation/NavLink";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0, y: -20 },
  visible: { opacity: 1, height: "auto", y: 0 },
  exit: { opacity: 0, height: 0, y: -20 },
};

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50"
        >
          <div className="flex flex-col items-center space-y-4 px-6">
            <NavLink href="#" onClick={onClose}>
              Courses
            </NavLink>
            <NavLink href="#" onClick={onClose}>
              Projects
            </NavLink>
            <NavLink href="#" onClick={onClose}>
              Learning Tracks
            </NavLink>
            <NavLink href="#" onClick={onClose}>
              Resources
            </NavLink>
            <NavLink href="#" onClick={onClose}>
              Pricing
            </NavLink>
            <hr className="w-full border-t border-gray-700/50 my-2" />
            <NavLink href="#" onClick={onClose}>
              Sign in
            </NavLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};