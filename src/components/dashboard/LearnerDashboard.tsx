import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen,
  Clock,
  Award,
  Compass,
  PlayCircle,
  BadgeCheck,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Zap
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h1 className="text-2xl font-bold">{greeting}!</h1>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Your learning journey continues. You&apos;re on a {learningStreak}-day streak! 🔥
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 relative">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-full bg-secondary-100 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? "bg-primary-100 dark:bg-primary-900/20" : ""}
                  >
                    <Filter size={16} />
                  </Button>
                </div>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 p-3 bg-white dark:bg-secondary-900 rounded-lg shadow-lg z-10 w-48 border border-secondary-200 dark:border-secondary-700"
                    >
                      <div className="space-y-2">
                        <button 
                          className={`block w-full text-left px-2 py-1.5 text-sm rounded-md ${activeFilter === 'all' ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                          onClick={() => setActiveFilter('all')}
                        >
                          All Courses
                        </button>
                        <button 
                          className={`block w-full text-left px-2 py-1.5 text-sm rounded-md ${activeFilter === 'inProgress' ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                          onClick={() => setActiveFilter('inProgress')}
                        >
                          In Progress
                        </button>
                        <button 
                          className={`block w-full text-left px-2 py-1.5 text-sm rounded-md ${activeFilter === 'completed' ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                          onClick={() => setActiveFilter('completed')}
                        >
                          Completed
                        </button>
                        <button 
                          className={`block w-full text-left px-2 py-1.5 text-sm rounded-md ${activeFilter === 'notStarted' ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                          onClick={() => setActiveFilter('notStarted')}
                        >
                          Not Started
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Weekly Goal Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-800/30 mr-4">
                    <Zap className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Weekly Learning Goal</h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {weeklyProgress} of {weeklyGoalHours} hours completed this week
                    </p>
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{Math.round(weeklyProgressPercentage)}% Complete</span>
                    <span>{weeklyGoalHours - weeklyProgress}h remaining</span>
                  </div>
                  <Progress 
                    value={weeklyProgressPercentage} 
                    max={100}
                    size="lg" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Continue Learning Section */}
            {continuelearningCourse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/5 relative">
                      <div className="h-48 md:h-full relative">
                        <img
                          src={continuelearningCourse.coverImage}
                          alt={continuelearningCourse.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900/80 to-transparent" />
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="primary"
                            leftIcon={<PlayCircle size={16} />}
                            className="shadow-lg"
                          >
                            Resume Learning
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="p-6 md:w-3/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold mb-2">{continuelearningCourse.title}</h2>
                          <div className="flex items-center mb-4">
                            <img
                              src={continuelearningCourse.instructor.avatar}
                              alt={continuelearningCourse.instructor.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">
                              {continuelearningCourse.instructor.name}
                            </span>
                          </div>
                        </div>
                        <Badge variant={continuelearningCourse.progress > 75 ? "success" : "warning"}>
                          {continuelearningCourse.progress}% Complete
                        </Badge>
                      </div>
                      
                      <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
                        {continuelearningCourse.description}
                      </p>
                      
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Your progress</span>
                        <div className="flex items-center">
                          <span className="font-medium">{continuelearningCourse.progress}%</span>
                          {continuelearningCourse.prevProgress !== undefined && continuelearningCourse.progress > continuelearningCourse.prevProgress && (
                            <span className="ml-2 text-xs text-success-600 dark:text-success-400 flex items-center">
                              <TrendingUp size={12} className="mr-1" />
                              +{continuelearningCourse.progress - continuelearningCourse.prevProgress}%
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={continuelearningCourse.progress} 
                        max={100}
                        size="lg" 
                      />
                      
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm">
                          <Clock size={16} className="mr-1" />
                          <span>Last: Today</span>
                        </div>
                        <div className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm">
                          <BookOpen size={16} className="mr-1" />
                          <span>{continuelearningCourse.lessonsCompleted} / {continuelearningCourse.lessons} lessons</span>
                        </div>
                        <div className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm">
                          <Calendar size={16} className="mr-1" />
                          <span>Est. completion: 4 days</span>
                        </div>
                        <div className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm">
                          <Zap size={16} className="mr-1" />
                          <span>{continuelearningCourse.xp} XP earned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Learning Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="h-full overflow-hidden group">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 relative">
                    <motion.div 
                      className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 15 }}
                    >
                      <Clock className="h-6 w-6 text-primary-600 dark:text-primary-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-1 relative z-10">34h</h3>
                    <p className="text-secondary-600 dark:text-secondary-400 relative z-10">Total Learning Time</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="h-full overflow-hidden group">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 relative">
                    <motion.div 
                      className="p-3 rounded-full bg-success-100 dark:bg-success-900/20 mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 15 }}
                    >
                      <BadgeCheck className="h-6 w-6 text-success-600 dark:text-success-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-1 relative z-10">7</h3>
                    <p className="text-secondary-600 dark:text-secondary-400 relative z-10">Courses Completed</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="h-full overflow-hidden group">
                  <CardContent className="flex flex-col items-center justify-center text-center p-6 relative">
                    <motion.div 
                      className="p-3 rounded-full bg-warning-100 dark:bg-warning-900/20 mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 15 }}
                    >
                      <Award className="h-6 w-6 text-warning-600 dark:text-warning-500" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-1 relative z-10">12</h3>
                    <p className="text-secondary-600 dark:text-secondary-400 relative z-10">Certificates Earned</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Learning Path */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <Card>
                <CardHeader className="flex justify-between items-center border-b border-secondary-200 dark:border-secondary-800">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">Your Learning Path</h2>
                    {filteredCourses.length > 0 && (
                      <Badge variant="success" className="animate-pulse">Active</Badge>
                    )}
                  </div>
                  {filteredCourses.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      Edit Path
                    </Button>
                  )}
                </CardHeader>

                <CardContent className={filteredCourses.length > 0 ? "p-0 pb-4" : "p-8"}>
                  {filteredCourses.length > 0 ? (
                    <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                      {filteredCourses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`
                              relative flex-shrink-0 w-8 h-8 rounded-full 
                              ${course.progress === 100 
                                ? "bg-success-500" 
                                : course.progress > 0 
                                ? "bg-warning-500" 
                                : "bg-secondary-200 dark:bg-secondary-700"}
                              flex items-center justify-center
                            `}>
                              {course.progress === 100 ? (
                                <BadgeCheck className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-sm font-bold text-white">{index + 1}</span>
                              )}
                              {index !== filteredCourses.length - 1 && (
                                <div className="absolute top-full left-1/2 w-0.5 h-full -translate-x-1/2 bg-secondary-200 dark:bg-secondary-700" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-medium truncate pr-8">{course.title}</h3>
                                <Badge
                                  variant={
                                    course.progress === 100 ? "success" 
                                    : course.progress > 0 ? "warning" 
                                    : "secondary"
                                  }
                                  className="transition-transform group-hover:scale-110"
                                >
                                  {course.progress === 100 ? "Completed" 
                                   : course.progress > 0 ? `${course.progress}%` 
                                   : "Not Started"}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                                {course.description}
                              </p>
                              {course.progress > 0 && course.progress < 100 && (
                                <div className="mt-2 h-1 bg-secondary-100 dark:bg-secondary-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-800 mb-4">
                        <BookOpen className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Create Your Learning Path</h3>
                      <p className="text-secondary-600 dark:text-secondary-400 mb-6 max-w-md mx-auto">
                        Design a structured learning journey by selecting courses that align with your goals and interests.
                      </p>
                      <Button 
                        variant="outline"
                        className="hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Browse Learning Paths
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* My Courses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">My Courses</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  rightIcon={<BookOpen size={16} />}
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.slice(0, 4).map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                  >
                    <LearnerCourseCard course={course} />
                  </motion.div>
                ))}
              </div>
              
              {filteredCourses.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-secondary-50 dark:bg-secondary-800/50 rounded-lg p-8 text-center"
                >
                  <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-700/50">
                    <Search className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 mb-4">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>
            
            {/* Recommended Courses */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recommended For You</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  rightIcon={<Compass size={16} />}
                >
                  Explore
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};