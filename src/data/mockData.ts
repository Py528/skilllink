// Mock data for instructor dashboard
export const mockInstructorStats = {
  totalStudents: 1248,
  activeCourses: 8,
  watchTime: "820 hrs",
  revenue: "$12,480",
  todoCount: 4,
  todos: [
    {
      task: "Review student submissions",
      priority: "high",
      dueDate: "Today",
    },
    {
      task: "Upload new lecture for React course",
      priority: "medium",
      dueDate: "Tomorrow",
    },
    {
      task: "Respond to course feedback",
      priority: "medium",
      dueDate: "May 20",
    },
    {
      task: "Plan new TypeScript masterclass",
      priority: "low",
      dueDate: "May 25",
    },
  ],
};

export const mockInstructorCourses = [
  {
    id: "course-1",
    title: "React Fundamentals for Beginners",
    description: "Learn the core concepts of React and build your first application from scratch.",
    thumbnail: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "John Doe",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    students: 534,
    duration: 12.5,
    lessons: 24,
    rating: 4.8,
    level: "beginner",
    category: "Web Development",
    revenue: 12480,
    status: "published",
  },
  {
    id: "course-2",
    title: "Advanced TypeScript Patterns",
    description: "Master advanced TypeScript features and design patterns for large-scale applications.",
    thumbnail: "https://images.pexels.com/photos/11035474/pexels-photo-11035474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "John Doe",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    students: 342,
    duration: 8.75,
    lessons: 18,
    rating: 4.9,
    level: "advanced",
    category: "TypeScript",
    revenue: 8550,
    status: "published",
  },
  {
    id: "course-3",
    title: "Next.js for Production",
    description: "Build production-ready applications with Next.js and deploy them to the cloud.",
    thumbnail: "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "John Doe",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    students: 201,
    duration: 10.25,
    lessons: 22,
    rating: 4.7,
    level: "intermediate",
    category: "Web Development",
    revenue: 5025,
    status: "draft",
  },
  {
    id: "course-4",
    title: "Modern CSS Techniques",
    description: "Learn the latest CSS features and techniques to create modern, responsive designs.",
    thumbnail: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "John Doe",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    students: 171,
    duration: 6.33,
    lessons: 14,
    rating: 4.6,
    level: "beginner",
    category: "CSS",
    revenue: 4275,
    status: "published",
  },
];

// Mock data for learner dashboard
export const mockLearnerCourses = [
  {
    id: "learn-1",
    title: "Full-Stack Web Development Bootcamp",
    description: "A comprehensive course covering both frontend and backend development with modern technologies.",
    coverImage: "https://images.pexels.com/photos/4709285/pexels-photo-4709285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Alex Johnson",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "48h 30m",
    progress: 68,
    rating: 4.9,
    lessons: 96,
    level: "intermediate",
    category: "Web Development",
  },
  {
    id: "learn-2",
    title: "Machine Learning Fundamentals",
    description: "Learn the core concepts of machine learning and implement your first ML models.",
    coverImage: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Sarah Miller",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "32h 15m",
    progress: 25,
    rating: 4.8,
    lessons: 64,
    level: "advanced",
    category: "Data Science",
  },
  {
    id: "learn-3",
    title: "UI/UX Design Principles",
    description: "Master the fundamentals of user interface and user experience design for modern applications.",
    coverImage: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Michael Chen",
      avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "24h 45m",
    progress: 100,
    rating: 4.7,
    lessons: 48,
    level: "beginner",
    category: "Design",
  },
  {
    id: "learn-4",
    title: "Mobile App Development with React Native",
    description: "Build cross-platform mobile applications using React Native and JavaScript.",
    coverImage: "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Emily Rodriguez",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "36h 20m",
    progress: 12,
    rating: 4.9,
    lessons: 72,
    level: "intermediate",
    category: "Mobile Development",
  },
];

export const mockRecommendedCourses = [
  {
    id: "rec-1",
    title: "Advanced JavaScript Patterns",
    description: "Dive deep into advanced JavaScript patterns and techniques used by professional developers.",
    coverImage: "https://images.pexels.com/photos/4709289/pexels-photo-4709289.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "David Lee",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "18h 45m",
    progress: 0,
    rating: 4.9,
    lessons: 42,
    level: "advanced",
    category: "JavaScript",
  },
  {
    id: "rec-2",
    title: "Data Visualization with D3.js",
    description: "Learn to create stunning data visualizations using D3.js and modern web technologies.",
    coverImage: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Rachel Green",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "14h 30m",
    progress: 0,
    rating: 4.7,
    lessons: 28,
    level: "intermediate",
    category: "Data Visualization",
  },
  {
    id: "rec-3",
    title: "GraphQL API Development",
    description: "Build efficient APIs with GraphQL and integrate them with your frontend applications.",
    coverImage: "https://images.pexels.com/photos/1181290/pexels-photo-1181290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Marcus Johnson",
      avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "16h 15m",
    progress: 0,
    rating: 4.8,
    lessons: 32,
    level: "intermediate",
    category: "Backend Development",
  },
  {
    id: "rec-4",
    title: "Cloud Architecture on AWS",
    description: "Master cloud architecture patterns and best practices using Amazon Web Services.",
    coverImage: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    instructor: {
      name: "Sophia Kim",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    duration: "28h 20m",
    progress: 0,
    rating: 4.9,
    lessons: 56,
    level: "advanced",
    category: "Cloud Computing",
  },
];