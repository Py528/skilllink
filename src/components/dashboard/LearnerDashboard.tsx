import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Compass, PlayCircle, BadgeCheck, 
  Search, Target, Flame, Brain, Trophy, ChevronRight, 
  BarChart2, Lightbulb, Zap
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Progress } from "../common/Progress";
import { Badge } from "../common/Badge";
import { LearnerCourseCard } from "./CourseCard";
import { mockLearnerCourses as rawMockLearnerCourses, mockRecommendedCourses as rawMockRecommendedCourses } from "../../data/mockData";
import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";
import { useUser } from "../../context/UserContext";

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  instructor: {
    name: string;
    avatar: string;
  };
  duration: string;
  progress: number;
  prevProgress?: number;
  rating: number;
  lessons: number;
  lessonsCompleted?: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  xp?: number;
}

// Transform mock data to match our Course interface
const mockLearnerCourses: Course[] = rawMockLearnerCourses.map(course => ({
  ...course,
  level: course.level.toLowerCase() as "beginner" | "intermediate" | "advanced",
  lessonsCompleted: Math.floor(course.progress * course.lessons / 100),
  prevProgress: course.progress - Math.floor(Math.random() * 10),
  xp: Math.floor(Math.random() * 1000)
}));

const mockRecommendedCourses: Course[] = rawMockRecommendedCourses.map(course => ({
  ...course,
  level: course.level.toLowerCase() as "beginner" | "intermediate" | "advanced",
  lessonsCompleted: Math.floor(course.progress * course.lessons / 100),
  prevProgress: course.progress - Math.floor(Math.random() * 10),
  xp: Math.floor(Math.random() * 1000)
}));

export const LearnerDashboard: React.FC = () => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [greeting, setGreeting] = useState<string>("Welcome back");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockLearnerCourses);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavItemClick = (item: string) => {
    if (item === "toggle-menu") {
      toggleSidebar();
    } else {
      setActiveNavItem(item);
    }
  };

  // Use user role for sidebar display
  useEffect(() => {
    if (user?.role !== "learner") {
      // Redirect or show error if not a learner
      console.warn("Non-learner user accessing learner dashboard");
    }
  }, [user?.role]);

  // Get current time for greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Filter courses based on search query
  useEffect(() => {
    const filtered = mockLearnerCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "all" || 
                           (activeFilter === "inProgress" && course.progress > 0 && course.progress < 100) ||
                           (activeFilter === "completed" && course.progress === 100) ||
                           (activeFilter === "notStarted" && course.progress === 0);
      
      return matchesSearch && matchesFilter;
    });
    setFilteredCourses(filtered);
  }, [searchQuery, activeFilter]);

  // Get the course with the highest progress that's not complete
  const continuelearningCourse = filteredCourses
    .filter(course => course.progress > 0 && course.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];
  
  // Calculate learning streak
  const learningStreak = 7; // This would come from user data in a real app
  
  // Calculate weekly goal progress
  const weeklyGoalHours = 5;
  const weeklyProgress = 3.5;
  const weeklyProgressPercentage = (weeklyProgress / weeklyGoalHours) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar 
        isOpen={isSidebarOpen}
        onNavItemClick={handleNavItemClick}
        activeNavItem={activeNavItem}
      />
      
      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="p-8">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-secondary-900/40 backdrop-blur-xl dark:bg-secondary-900">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-secondary-200/5 dark:bg-secondary-800/5" />
                <div className="absolute h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%)]" />
              </div>
              <div className="relative p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Greeting and Stats */}
                  <div className="md:col-span-2">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-4 mb-6"
                    >
                      <motion.div 
                        className="flex-shrink-0"
                        animate={{ 
                          rotate: [0, 15, -15, 15, 0],
                          transition: {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <motion.div 
                          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-2xl">👋</span>
                        </motion.div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="text-xl font-semibold text-white">
                          {greeting}, {user?.name || 'Learner'}
                        </h1>
                        <p className="text-primary-100">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </motion.div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                transition: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                            >
                              <Clock className="h-4 w-4 text-primary-200" />
                            </motion.div>
                            <span className="text-sm text-primary-100">Today&apos;s Goal</span>
                          </div>
                          <Badge variant="success" className="bg-green-500/20">2/3h</Badge>
                        </div>
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "66%" }}
                          transition={{ delay: 0.5, duration: 1 }}
                        >
                          <Progress 
                            value={66} 
                            max={100}
                            className="h-1.5 mb-2"
                          />
                        </motion.div>
                        <p className="text-xs text-primary-200">1 hour remaining to reach your daily goal</p>
                      </motion.div>

                      <motion.div 
                        className="bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0],
                                transition: {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }
                              }}
                            >
                              <Flame className="h-4 w-4 text-amber-400" />
                            </motion.div>
                            <span className="text-sm text-primary-100">Learning Streak</span>
                          </div>
                          <Badge variant="warning" className="bg-amber-500/20">7 days</Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <motion.div
                              key={day}
                              className="flex-1 h-1.5 rounded-full bg-amber-400"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.4 + (day * 0.1) }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-primary-200 mt-2">Keep it up! You&apos;re on a roll</p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        leftIcon={<PlayCircle size={18} />}
                      >
                        Resume Latest Course
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        leftIcon={<BookOpen size={18} />}
                      >
                        Continue Assignment
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        variant="secondary"
                        className="w-full bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        leftIcon={<Compass size={18} />}
                      >
                        Browse New Courses
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-secondary-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Flame className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <Badge variant="success">+2 days</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">7 Days</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Learning Streak</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-success-100 dark:bg-success-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                    <Brain className="h-6 w-6 text-success-600 dark:text-success-400" />
                  </div>
                  <Badge variant="warning">+2.5h</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">34h</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Total Learning Time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-warning-100 dark:bg-warning-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <Badge variant="success">+2 new</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">12</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Certificates Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-error-100 dark:bg-error-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-error-100 dark:bg-error-900/20 rounded-lg">
                    <Target className="h-6 w-6 text-error-600 dark:text-error-400" />
                  </div>
                  <Badge variant="error">85%</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">4/5</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Weekly Goals</p>
              </motion.div>
            </div>

            {/* Active Course */}
            {continuelearningCourse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-primary-50 dark:from-secondary-800 dark:to-primary-900/20">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                          <BarChart2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-lg font-semibold">Currently Learning</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/20"
                      >
                        View All Courses
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="flex items-start space-x-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={continuelearningCourse.coverImage}
                              alt={continuelearningCourse.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{continuelearningCourse.title}</h3>
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={continuelearningCourse.instructor.avatar}
                                  alt={continuelearningCourse.instructor.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                                  {continuelearningCourse.instructor.name}
                                </span>
                              </div>
                              <Badge variant="outline">
                                {continuelearningCourse.category}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {continuelearningCourse.duration}
                              </div>
                              <div className="flex items-center">
                                <BookOpen size={14} className="mr-1" />
                                {continuelearningCourse.lessonsCompleted} / {continuelearningCourse.lessons} lessons
                              </div>
                              <div className="flex items-center">
                                <Zap size={14} className="mr-1" />
                                {continuelearningCourse.xp} XP
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">Course Progress</span>
                            <span className="text-sm font-medium">{continuelearningCourse.progress}%</span>
                          </div>
                          <Progress 
                            value={continuelearningCourse.progress} 
                            max={100}
                            size="lg"
                            className="h-3"
                          />
                        </div>
                        <Button
                          variant="primary"
                          className="w-full"
                          leftIcon={<PlayCircle size={18} />}
                        >
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Learning Path and Search */}
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader className="flex justify-between items-center border-b border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Learning Path</h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Your personalized learning journey</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600"
                      rightIcon={<ChevronRight size={16} />}
                    >
                      View All
                    </Button>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                      {filteredCourses.slice(0, 4).map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`
                              relative flex-shrink-0 w-10 h-10 rounded-lg 
                              ${course.progress === 100 
                                ? "bg-success-500" 
                                : course.progress > 0 
                                ? "bg-warning-500" 
                                : "bg-secondary-200 dark:bg-secondary-700"}
                              flex items-center justify-center
                            `}>
                              {course.progress === 100 ? (
                                <BadgeCheck className="w-6 h-6 text-white" />
                              ) : (
                                <span className="text-lg font-bold text-white">{index + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-base font-medium truncate">{course.title}</h3>
                                <Badge
                                  variant={
                                    course.progress === 100 ? "success" 
                                    : course.progress > 0 ? "warning" 
                                    : "secondary"
                                  }
                                  className="ml-2"
                                >
                                  {course.progress}%
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                                <Clock size={14} className="mr-1" />
                                {course.duration}
                                <span className="mx-2">•</span>
                                <BookOpen size={14} className="mr-1" />
                                {course.lessons} lessons
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                        <Search className="h-5 w-5 text-success-600 dark:text-success-400" />
                      </div>
                      <h2 className="text-lg font-semibold">Quick Search</h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Popular Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {['Web Development', 'Design', 'Business', 'Marketing'].map((category) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Quick Filters</h3>
                        <div className="space-y-1">
                          {[
                            { label: 'In Progress', count: filteredCourses.filter(c => c.progress > 0 && c.progress < 100).length },
                            { label: 'Completed', count: filteredCourses.filter(c => c.progress === 100).length },
                            { label: 'Not Started', count: filteredCourses.filter(c => c.progress === 0).length }
                          ].map((filter) => (
                            <button
                              key={filter.label}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-left"
                              onClick={() => setActiveFilter(filter.label.toLowerCase().replace(' ', ''))}
                            >
                              <span className="text-sm">{filter.label}</span>
                              <Badge variant="secondary">{filter.count}</Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recommended Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Compass className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Recommended For You</h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Courses that match your interests and goals
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  rightIcon={<ChevronRight size={16} />}
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockRecommendedCourses.slice(0, 4).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <LearnerCourseCard course={course} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};