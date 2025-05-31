// data/courses.ts
import { Course,FAQ,Step,Testimonial } from "../types/index";

export const courses: Course[] = [
  {
    title: "Advanced React Patterns",
    level: "Intermediate",
    instructor: "Sarah Chen",
  },
  {
    title: "System Design Fundamentals",
    level: "Advanced",
    instructor: "Michael Ross",
  },
  {
    title: "API Development with Node.js",
    level: "Intermediate",
    instructor: "David Kim",
  },
];


// data/steps.ts
export const steps: Step[] = [
  {
    icon: "BookOpen",
    title: "Learn",
    description: "Master concepts through micro-courses",
  },
  {
    icon: "Code",
    title: "Build",
    description: "Apply skills in real-world projects",
  },
  {
    icon: "Award",
    title: "Earn",
    description: "Get verified credentials",
  },
];


// data/testimonials.ts

export const testimonials: Testimonial[] = [
  {
    quote: "SkillLink helped me transition from junior to senior developer in just 6 months.",
    author: "Alini Grace",
    role: "Senior Frontend Developer",
  },
  {
    quote: "The project-based approach made all the difference in my learning journey.",
    author: "Mark Batterby",
    role: "Full Stack Engineer",
  },
];

// data/faqs.ts

export const faqs: FAQ[] = [
  {
    q: "How is SkillLink different from other platforms?",
    a: "SkillLink focuses on practical, project-based learning that directly maps to employer needs. Our verified credentials and real-world projects make your skills immediately demonstrable to potential employers.",
  },
  {
    q: "Do I need prior experience to start?",
    a: "Not at all! We have learning paths for complete beginners as well as advanced professionals. Our system helps you identify the right starting point based on your current skill level.",
  },
  {
    q: "Are the credentials recognized by employers?",
    a: "Yes. Our credentials are blockchain-verified and recognized by over 500+ companies worldwide. We regularly update our curriculum based on industry needs and feedback.",
  },
  {
    q: "How much time do I need to commit?",
    a: "Our micro-courses are designed to fit into busy schedules. Most learners dedicate 5-10 hours per week and see significant progress within 2-3 months.",
  },
  {
    q: "Can I get a refund if I'm not satisfied?",
    a: "Absolutely. We offer a 14-day money-back guarantee for all our paid plans. No questions asked.",
  },
];