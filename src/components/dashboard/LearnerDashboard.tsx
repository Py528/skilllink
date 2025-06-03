import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, Clock, Compass, PlayCircle, BadgeCheck, 
  Search, Target, Flame, Brain, Trophy, ChevronRight, 
  BarChart2, Lightbulb, Zap, X, CheckCircle, Plus, Bookmark
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState(mockLearnerCourses);
  const [continuelearningCourse] = useState(mockLearnerCourses[0]);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

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

  useEffect(() => {
    const filtered = mockLearnerCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === "all") return matchesSearch;
      if (activeFilter === "inprogress") return matchesSearch && course.progress > 0 && course.progress < 100;
      if (activeFilter === "completed") return matchesSearch && course.progress === 100;
      if (activeFilter === "notstarted") return matchesSearch && course.progress === 0;
      return matchesSearch;
    });
    
    setFilteredCourses(filtered);
  }, [searchQuery, activeFilter]);

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
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-secondary-900/40 backdrop-blur-xl">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-secondary-800/5 dark:to-secondary-900/5" />
                <div className="absolute h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%)]" />
              </div>
              <div className="relative p-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                          className="w-12 h-12 rounded-full bg-primary-100 dark:bg-white/5 backdrop-blur-sm flex items-center justify-center"
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
                        <h1 className="text-xl font-semibold text-secondary-900 dark:text-white">
                          {greeting}, {user?.name || 'Learner'}
                        </h1>
                        <p className="text-secondary-600 dark:text-primary-100">
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
                        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-secondary-50 dark:hover:bg-white/10 transition-colors shadow-sm"
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
                              <Clock className="h-4 w-4 text-primary-600 dark:text-primary-200" />
                            </motion.div>
                            <span className="text-sm text-secondary-700 dark:text-primary-100">Today&apos;s Goal</span>
                          </div>
                          <Badge variant="success" className="bg-green-100 dark:bg-green-500/20">2/3h</Badge>
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
                        <p className="text-xs text-secondary-600 dark:text-primary-200">1 hour remaining to reach your daily goal</p>
                      </motion.div>

                      <motion.div 
                        className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 hover:bg-secondary-50 dark:hover:bg-white/10 transition-colors shadow-sm"
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
                              <Flame className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                            </motion.div>
                            <span className="text-sm text-secondary-700 dark:text-primary-100">Learning Streak</span>
                          </div>
                          <Badge variant="warning" className="bg-amber-100 dark:bg-amber-500/20">7 days</Badge>
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
                        <p className="text-xs text-secondary-600 dark:text-primary-200 mt-2">Keep it up! You&apos;re on a roll</p>
                      </motion.div>
                    </div>
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
                  <Badge variant="success" className="bg-green-100 dark:bg-green-500/20">+2 days</Badge>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">7 Days</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Learning Streak</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-success-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                    <Brain className="h-6 w-6 text-success-600 dark:text-success-400" />
                  </div>
                  <Badge variant="warning" className="bg-amber-100 dark:bg-amber-500/20">+2.5h</Badge>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">34h</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Total Learning Time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-warning-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                    <Trophy className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <Badge variant="success" className="bg-green-100 dark:bg-green-500/20">+2 new</Badge>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">12</h3>
                <p className="text-secondary-600 dark:text-secondary-400">Certificates Earned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-error-900/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-error-100 dark:bg-error-900/20 rounded-lg">
                    <Target className="h-6 w-6 text-error-600 dark:text-error-400" />
                  </div>
                  <Badge variant="error" className="bg-error-100 dark:bg-error-500/20">85%</Badge>
                </div>
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">4/5</h3>
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
                        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Learning Path</h2>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">Your personalized learning journey</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
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
                                <h3 className="text-base font-medium text-secondary-900 dark:text-white truncate">{course.title}</h3>
                                <Badge
                                  variant={
                                    course.progress === 100 ? "success" 
                                    : course.progress > 0 ? "warning" 
                                    : "secondary"
                                  }
                                  className={`ml-2 ${
                                    course.progress === 100 
                                      ? "bg-success-100 dark:bg-success-500/20" 
                                      : course.progress > 0 
                                      ? "bg-warning-100 dark:bg-warning-500/20"
                                      : "bg-secondary-100 dark:bg-secondary-700/50"
                                  }`}
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
                <Card className="overflow-hidden backdrop-blur-xl bg-white dark:bg-secondary-900/50 border border-secondary-200 dark:border-white/10">
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                        <Search className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Quick Search</h2>
                        <p className="text-sm text-secondary-600 dark:text-primary-200">Find your next learning adventure</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-secondary-400 dark:text-primary-400" />
                      </div>
                      <motion.div
                        initial={false}
                        whileFocus={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="text"
                          placeholder="Search courses, topics, instructors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 
                                   text-sm text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-primary-300 
                                   border border-secondary-200 dark:border-white/10
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                                   transition-all duration-200"
                        />
                      </motion.div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-3 flex items-center text-secondary-400 hover:text-secondary-600 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-secondary-700 dark:text-primary-200 mb-3">Quick Filters</h3>
                        <div className="space-y-2">
                          {[
                            { label: 'In Progress', icon: Clock, count: filteredCourses.filter(c => c.progress > 0 && c.progress < 100).length },
                            { label: 'Completed', icon: CheckCircle, count: filteredCourses.filter(c => c.progress === 100).length },
                            { label: 'Not Started', icon: Plus, count: filteredCourses.filter(c => c.progress === 0).length },
                            { label: 'Bookmarked', icon: Bookmark, count: 5 }
                          ].map((filter) => (
                            <motion.button
                              key={filter.label}
                              whileHover={{ x: 4 }}
                              className={`w-full flex items-center justify-between p-3 rounded-lg
                                        ${activeFilter === filter.label.toLowerCase().replace(' ', '') 
                                          ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-900 dark:text-white' 
                                          : 'text-secondary-700 dark:text-primary-100 hover:bg-secondary-50 dark:hover:bg-white/5'}
                                        transition-colors duration-200 group`}
                              onClick={() => setActiveFilter(filter.label.toLowerCase().replace(' ', ''))}
                            >
                              <div className="flex items-center space-x-3">
                                <filter.icon className={`h-4 w-4 
                                  ${activeFilter === filter.label.toLowerCase().replace(' ', '')
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-secondary-500 dark:text-primary-500/50 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} 
                                />
                                <span className="text-sm font-medium">{filter.label}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="secondary" 
                                  className={`${activeFilter === filter.label.toLowerCase().replace(' ', '')
                                    ? 'bg-primary-100 dark:bg-primary-500/30' 
                                    : 'bg-secondary-100 dark:bg-white/5'}`}
                                >
                                  {filter.count}
                                </Badge>
                                <ChevronRight className={`h-4 w-4 text-secondary-400 dark:text-primary-400/50 transform transition-transform duration-200
                                  ${activeFilter === filter.label.toLowerCase().replace(' ', '') ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}
                                  group-hover:translate-x-0 group-hover:opacity-100`} 
                                />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-secondary-700 dark:text-primary-200 mb-3">Recent Searches</h3>
                        <div className="space-y-2">
                          {['React Hooks', 'UI Design Basics', 'Python for ML'].map((search, index) => (
                            <motion.button
                              key={search}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="flex items-center space-x-2 text-sm text-secondary-600 hover:text-secondary-900 dark:text-primary-300 dark:hover:text-primary-200"
                              onClick={() => setSearchQuery(search)}
                            >
                              <Clock className="h-3.5 w-3.5" />
                              <span>{search}</span>
                            </motion.button>
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
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Recommended For You</h2>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Courses that match your interests and goals
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-secondary-200 text-secondary-700 hover:bg-secondary-50 dark:border-secondary-700 dark:text-secondary-400 dark:hover:bg-secondary-800/50"
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