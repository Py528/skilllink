import { FaBook, FaCode, FaAward } from "react-icons/fa";
import { Step } from "../types";

export const steps: Step[] = [
  {
    icon: <FaBook />,
    title: "Learn",
    description: "Master concepts through micro-courses",
  },
  {
    icon: <FaCode />,
    title: "Build",
    description: "Apply skills in real-world projects",
  },
  {
    icon: <FaAward />,
    title: "Earn",
    description: "Get verified credentials",
  },
];
