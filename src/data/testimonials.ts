export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  salaryIncrease?: string;
  beforeAfter?: {
    before: string;
    after: string;
  };
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "SkillLink helped me transition from junior to senior developer in just 6 months. The hands-on projects gave me the confidence to tackle complex challenges.",
    author: "Sarah Chen",
    role: "Senior Frontend Developer",
    company: "Google",
    salaryIncrease: "+$45K",
    beforeAfter: {
      before: "$75K",
      after: "$120K"
    },
    avatar: "SC"
  },
  {
    quote: "The project-based approach made all the difference. I went from unemployed to a $130K job at Microsoft in 4 months.",
    author: "Marcus Johnson",
    role: "Full Stack Engineer",
    company: "Microsoft",
    salaryIncrease: "+$130K",
    beforeAfter: {
      before: "Unemployed",
      after: "$130K"
    },
    avatar: "MJ"
  },
  {
    quote: "I was stuck in a dead-end job making $60K. SkillLink's courses helped me land a $95K position at a startup.",
    author: "Emily Rodriguez",
    role: "React Developer",
    company: "Stripe",
    salaryIncrease: "+$35K",
    beforeAfter: {
      before: "$60K",
      after: "$95K"
    },
    avatar: "ER"
  },
  {
    quote: "The real-world projects and portfolio building were game-changers. I got 3 job offers within 2 weeks of completing the program.",
    author: "David Kim",
    role: "Software Engineer",
    company: "Netflix",
    salaryIncrease: "+$80K",
    beforeAfter: {
      before: "$70K",
      after: "$150K"
    },
    avatar: "DK"
  },
];