import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, DollarSign, Award, Eye, 
  CheckCircle, MessageSquare, Star, Plus, TrendingUp,
  Bell, ChevronRight, Target, MoreVertical,
  BarChart3, Settings
} from "lucide-react";
import { CourseCard } from "./CourseCard";
import { Card, CardHeader, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { Breadcrumb, QuickActions } from "../common/Breadcrumb";
import { mockInstructorCourses, mockInstructorStats } from "../../data/mockData";
import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { coursesService, CourseWithInstructor } from "../../services/coursesService";

// Optimized data fetching with caching
const courseCache = new Map<string, { data: CourseWithInstructor[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Preload critical data
const preloadData = () => {
  // Preload user data
  if (typeof window !== 'undefined') {
    // Preload course images
    const imagePreload = new Image();
    imagePreload.src = '/api/courses/preload-images';
  }
};

interface Todo {
  task: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

// Animation variants
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -5,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  }
};

// Skeleton animation variants
const skeletonVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

// Skeleton base component
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <motion.div
    variants={skeletonVariants}
    animate="animate"
    className={`bg-gray-200 dark:bg-secondary-700 rounded ${className}`}
  />
);

// Course card skeleton
const CourseCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
    <div className="aspect-video bg-gray-200 dark:bg-secondary-700 relative">
      <Skeleton className="absolute inset-0" />
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

// Todo item skeleton
const TodoItemSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-3 rounded-lg">
    <div className="flex items-center space-x-3">
      <Skeleton className="w-5 h-5 rounded" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-5 w-12" />
  </div>
);

// Activity feed item skeleton
const ActivityItemSkeleton: React.FC = () => (
  <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 last:border-b-0">
    <div className="flex items-start space-x-3">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <Skeleton className="w-4 h-4" />
    </div>
  </div>
);

// Header skeleton
const HeaderSkeleton: React.FC = () => (
  <div className="relative overflow-hidden rounded-2xl bg-secondary-900/40 backdrop-blur-xl dark:bg-secondary-900 p-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

// Course management section skeleton
const CourseManagementSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
    <div className="border-b border-secondary-200 dark:border-secondary-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, idx) => (
          <CourseCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  </div>
);

// Quick tasks skeleton
const QuickTasksSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
    <div className="border-b border-secondary-200 dark:border-secondary-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[...Array(4)].map((_, idx) => (
        <TodoItemSkeleton key={idx} />
      ))}
    </div>
  </div>
);

// Activity feed skeleton
const ActivityFeedSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden">
    <div className="border-b border-secondary-200 dark:border-secondary-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
    <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
      {[...Array(4)].map((_, idx) => (
        <ActivityItemSkeleton key={idx} />
      ))}
    </div>
  </div>
);

// Quick stats skeleton
const QuickStatsSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
    <div className="border-b border-secondary-200 dark:border-secondary-700 p-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
    <div className="p-4 space-y-4">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard skeleton wrapper
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8">
    <HeaderSkeleton />
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CourseManagementSkeleton />
      </div>
      <div className="space-y-6">
        <QuickTasksSkeleton />
        <ActivityFeedSkeleton />
        <QuickStatsSkeleton />
      </div>
    </div>
  </div>
);

export const InstructorDashboard: React.FC = () => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("home");
  // Memoized static data to prevent unnecessary re-renders
  const notifications = useMemo(() => [
    { id: 1, type: "review", message: "New review on React Course", time: "2h ago", rating: 5 },
    { id: 2, type: "enrollment", message: "15 new enrollments", time: "5h ago", count: 15 },
    { id: 3, type: "comment", message: "New question in Module 3", time: "1d ago" },
    { id: 4, type: "revenue", message: "Monthly revenue goal reached!", time: "1d ago", amount: 5000 }
  ], []);

  const [todos, setTodos] = useState<Todo[]>(
    mockInstructorStats.todos.map(todo => ({
      ...todo,
      completed: false
    }))
  );
  const [newTodo, setNewTodo] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);

  // Real instructor courses state
  const [realInstructorCourses, setRealInstructorCourses] = useState<CourseWithInstructor[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const router = useRouter();

  // Optimized course fetching with caching, faster routes, and lazy loading
  const fetchCoursesOptimized = useCallback(async () => {
    if (!user || user.role !== 'instructor') return;
    
    // Check cache first
    const cacheKey = `courses_${user.id}`;
    const cached = courseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRealInstructorCourses(cached.data);
      setIsLoadingCourses(false);
      return;
    }
    
    setIsLoadingCourses(true);
    setCoursesError(null);
    
    try {
      // Use faster timeout and parallel loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000) // Reduced timeout
      );
      
      // Parallel data fetching with faster routes
      const [coursesPromise] = await Promise.allSettled([
        Promise.race([
          coursesService.getCoursesByInstructor(user.id),
          timeoutPromise
        ])
      ]);
      
      if (coursesPromise.status === 'fulfilled') {
        const courses = coursesPromise.value as CourseWithInstructor[];
        
        // Cache the results
        courseCache.set(cacheKey, {
          data: courses,
          timestamp: Date.now()
        });
        
        setRealInstructorCourses(courses);
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCoursesError('Failed to load your courses');
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user]);

  // Preload data on mount
  React.useEffect(() => {
    preloadData();
  }, []);

  // Fetch courses with optimized loading
  React.useEffect(() => {
    fetchCoursesOptimized();
  }, [fetchCoursesOptimized]);

  // Memoized handlers to prevent unnecessary re-renders
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleNavItemClick = useCallback((item: string) => {
    if (item === "toggle-menu") {
      toggleSidebar();
    } else {
      setActiveNavItem(item);
    }
  }, [toggleSidebar]);

  const addTodo = useCallback(() => {
    if (newTodo.trim()) {
      setTodos(prev => [
        ...prev,
        {
          task: newTodo,
          dueDate: "Today",
          priority: "medium",
          completed: false
        }
      ]);
      setNewTodo("");
      setShowAddTodo(false);
    }
  }, [newTodo]);

  const toggleTodo = useCallback((index: number) => {
    setTodos(prev => {
      const newTodos = [...prev];
      newTodos[index].completed = !newTodos[index].completed;
      return newTodos;
    });
  }, []);

  // Memoize course data to prevent unnecessary re-renders
  const displayCourses = useMemo(() => {
    if (realInstructorCourses.length > 0) {
      return realInstructorCourses.slice(0, 4);
    }
    return mockInstructorCourses.slice(0, 4).map(course => ({
      ...course,
      duration: course.duration.toString(),
      difficulty_level: course.level as "beginner" | "intermediate" | "advanced",
      is_published: course.status === "published"
    }));
  }, [realInstructorCourses]);

  // Show skeleton loading while data is being fetched
  if (isLoadingCourses && realInstructorCourses.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-white dark:bg-secondary-900"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Sidebar 
          isOpen={isSidebarOpen}
          onNavItemClick={handleNavItemClick}
          activeNavItem={activeNavItem}
        />
        
        <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
          <div className="p-8">
            <DashboardSkeleton />
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-white dark:bg-secondary-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar 
        isOpen={isSidebarOpen}
        onNavItemClick={handleNavItemClick}
        activeNavItem={activeNavItem}
      />
      
      <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="p-8">
          {/* Breadcrumb Navigation */}
          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <Breadcrumb 
              items={[
                { label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> }
              ]} 
              className="text-gray-400"
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <QuickActions 
              actions={[
                {
                  label: 'Create Course',
                  href: '/courses/create',
                  icon: <Plus className="h-5 w-5 text-white" />,
                  description: 'Start a new course',
                  color: 'bg-[#0CF2A0]'
                },
                {
                  label: 'Analytics',
                  href: '/dashboard/analytics',
                  icon: <BarChart3 className="h-5 w-5 text-white" />,
                  description: 'View performance',
                  color: 'bg-blue-500'
                },
                {
                  label: 'Students',
                  href: '/dashboard/students',
                  icon: <Users className="h-5 w-5 text-white" />,
                  description: 'Manage learners',
                  color: 'bg-purple-500'
                },
                {
                  label: 'Settings',
                  href: '/dashboard/settings',
                  icon: <Settings className="h-5 w-5 text-white" />,
                  description: 'Account settings',
                  color: 'bg-gray-500'
                }
              ]}
            />
          </motion.div>

          <motion.div 
            className="space-y-8"
            variants={containerVariants}
          >
            {/* Header Section */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-secondary-900/40 backdrop-blur-xl dark:bg-secondary-900"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-secondary-200/5 dark:bg-secondary-800/5" />
                <motion.div 
                  className="absolute h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%)]"
                  animate={{
                    background: [
                      "radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%)",
                      "radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_40%)",
                      "radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%)"
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
              <div className="relative p-8">
                <motion.div
                  className="flex items-center justify-between"
                  variants={itemVariants}
                >
                  <div className="flex items-center space-x-4">
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
                    <div className="space-y-1">
                      <motion.h1 
                        className="text-2xl font-semibold text-white dark:text-white"
                        variants={itemVariants}
                      >
                        Welcome back, Instructor
                      </motion.h1>
                      <motion.p 
                        className="text-primary-100"
                        variants={itemVariants}
                      >
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </motion.p>
                    </div>
                  </div>
                  <motion.div 
                    className="hidden md:flex items-center space-x-4"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Star className="h-5 w-5 text-amber-400" />
                      <span className="text-white">4.9 Instructor Rating</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Users className="h-5 w-5 text-primary-400" />
                      <span className="text-white">2.1k Students</span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <motion.div 
              className="grid lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {/* Course Management */}
              <motion.div 
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="card-elevated overflow-hidden">
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-700/50">
                    <motion.div 
                      className="flex items-center justify-between"
                      variants={itemVariants}
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div 
                          className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg"
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </motion.div>
                        <div>
                          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Course Management</h2>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Manage and track your course performance
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center space-x-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="btn-primary dark:bg-primary-600 dark:hover:bg-primary-700 hover-lift"
                            onClick={() => router.push("/courses/create")}
                          >
                            Create New Course
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                            className="dark:border-secondary-700/50 dark:text-secondary-400 dark:hover:bg-secondary-800/50"
                        rightIcon={<ChevronRight size={16} />}
                      >
                        View All Courses
                      </Button>
                        </motion.div>
                    </div>
                    </motion.div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      variants={containerVariants}
                    >
                      {coursesError ? (
                        <div className="col-span-2 text-center text-red-500 dark:text-red-400 py-8">{coursesError}</div>
                      ) : displayCourses.map((course) => (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          whileHover="hover"
                          custom={cardHoverVariants}
                          className="relative group"
                        >
                          <div onClick={() => router.push(`/courses/${course.id}/edit`)} style={{ cursor: 'pointer' }}>
                            <CourseCard course={course} />
                          </div>
                          <button
                            className="absolute top-2 right-2 z-10 px-3 py-1 bg-primary-600 text-white text-xs rounded shadow hover:bg-primary-700 transition-opacity opacity-0 group-hover:opacity-100"
                            onClick={e => { e.stopPropagation(); router.push(`/courses/${course.id}/edit`); }}
                            title="Edit Course"
                          >
                            Edit
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Right Sidebar */}
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
              >
                {/* Quick Tasks */}
                <motion.div variants={itemVariants}>
                <Card className="card-elevated">
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-700/50">
                      <motion.div 
                        className="flex items-center justify-between"
                        variants={itemVariants}
                      >
                      <div className="flex items-center space-x-2">
                          <motion.div 
                            className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg"
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                          <Target className="h-5 w-5 text-success-600 dark:text-success-400" />
                          </motion.div>
                          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Quick Tasks</h2>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAddTodo(!showAddTodo)}
                        className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white"
                      >
                        <Plus size={16} />
                      </Button>
                        </motion.div>
                      </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                      <AnimatePresence>
                    {showAddTodo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2"
                          >
                        <input
                          type="text"
                          value={newTodo}
                          onChange={(e) => setNewTodo(e.target.value)}
                          placeholder="Add a new task..."
                          className="flex-1 px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700/50 bg-white dark:bg-secondary-800/50 text-secondary-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                        />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={addTodo}
                          className="dark:bg-primary-600 dark:hover:bg-primary-700"
                        >
                          Add
                        </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <motion.div 
                        className="space-y-2"
                        variants={containerVariants}
                      >
                      {todos.map((todo, index) => (
                        <motion.div
                          key={index}
                            variants={itemVariants}
                          className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex items-center space-x-3">
                              <motion.button
                              onClick={() => toggleTodo(index)}
                              className={`w-5 h-5 rounded border ${
                                todo.completed
                                  ? 'bg-success-500 border-success-500 dark:bg-success-600 dark:border-success-600'
                                  : 'border-secondary-300 dark:border-secondary-600'
                              } flex items-center justify-center transition-colors`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <AnimatePresence>
                              {todo.completed && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                    >
                                <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                              )}
                                </AnimatePresence>
                              </motion.button>
                            <span className={`text-sm ${
                              todo.completed
                                ? 'line-through text-secondary-500 dark:text-secondary-400'
                                : 'text-secondary-900 dark:text-white'
                            }`}>
                              {todo.task}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              todo.priority === 'high' ? 'error' 
                              : todo.priority === 'medium' ? 'warning' 
                              : 'success'
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity dark:bg-opacity-20"
                          >
                            {todo.dueDate}
                          </Badge>
                        </motion.div>
                      ))}
                      </motion.div>
                  </CardContent>
                </Card>
                </motion.div>
                      
                {/* Activity Feed */}
                <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-700/50">
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-700/50">
                      <motion.div 
                        className="flex items-center justify-between"
                        variants={itemVariants}
                      >
                      <div className="flex items-center space-x-2">
                          <motion.div 
                            className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg"
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                          <Bell className="h-5 w-5 text-warning-600 dark:text-warning-400" />
                          </motion.div>
                          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Activity Feed</h2>
                      </div>
                      <Badge variant="warning" className="dark:bg-warning-900/20">4 new</Badge>
                      </motion.div>
                  </CardHeader>
                  <CardContent className="p-0">
                      <motion.div 
                        className="divide-y divide-secondary-200 dark:divide-secondary-700/50"
                        variants={containerVariants}
                      >
                        {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                            variants={itemVariants}
                          className="p-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="flex items-start space-x-3">
                              <motion.div 
                                className={`p-2 rounded-lg 
                              ${notification.type === 'review' ? 'bg-warning-100 dark:bg-warning-900/20' : ''}
                              ${notification.type === 'enrollment' ? 'bg-success-100 dark:bg-success-900/20' : ''}
                              ${notification.type === 'comment' ? 'bg-info-100 dark:bg-info-900/20' : ''}
                              ${notification.type === 'revenue' ? 'bg-primary-100 dark:bg-primary-900/20' : ''}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                              {notification.type === 'review' && <Star className="h-4 w-4 text-warning-600 dark:text-warning-400" />}
                              {notification.type === 'enrollment' && <Users className="h-4 w-4 text-success-600 dark:text-success-400" />}
                              {notification.type === 'comment' && <MessageSquare className="h-4 w-4 text-info-600 dark:text-info-400" />}
                              {notification.type === 'revenue' && <DollarSign className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                              </motion.div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-secondary-900 dark:text-white">{notification.message}</p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-secondary-500 dark:text-secondary-400">{notification.time}</span>
                                {notification.rating && (
                                    <motion.div 
                                      className="flex items-center text-warning-500 dark:text-warning-400"
                                      whileHover={{ scale: 1.1 }}
                                    >
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs ml-1">{notification.rating}</span>
                                    </motion.div>
                                )}
                                {notification.count && (
                                  <Badge variant="success" className="text-xs dark:bg-success-900/20">
                                    +{notification.count} students
                                  </Badge>
                                )}
                                {notification.amount && (
                                  <Badge variant="primary" className="text-xs dark:bg-primary-900/20">
                                    ${notification.amount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                              <motion.button 
                                className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                              <MoreVertical size={16} />
                              </motion.button>
                          </div>
                        </motion.div>
                      ))}
                      </motion.div>
                  </CardContent>
                </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={itemVariants}>
                <Card className="card-elevated">
                  <CardHeader className="border-b border-secondary-200 dark:border-secondary-700/50">
                      <motion.div 
                        className="flex items-center space-x-2"
                        variants={itemVariants}
                      >
                        <motion.div 
                          className="p-2 bg-info-100 dark:bg-info-900/20 rounded-lg"
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                        <TrendingUp className="h-5 w-5 text-info-600 dark:text-info-400" />
                        </motion.div>
                      <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Quick Stats</h2>
                      </motion.div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                      <motion.div 
                        className="flex items-center justify-between py-2"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                        <span className="text-sm text-secondary-900 dark:text-white">Course Views</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-secondary-900 dark:text-white">1,245</span>
                        <Badge variant="success" className="text-xs dark:bg-success-900/20">+12%</Badge>
                      </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-between py-2"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-success-500 dark:text-success-400" />
                        <span className="text-sm text-secondary-900 dark:text-white">Course Completions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-secondary-900 dark:text-white">83</span>
                        <Badge variant="success" className="text-xs dark:bg-success-900/20">+8%</Badge>
                      </div>
                      </motion.div>
                      
                      <motion.div 
                        className="flex items-center justify-between py-2"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-warning-500 dark:text-warning-400" />
                        <span className="text-sm text-secondary-900 dark:text-white">Average Rating</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-secondary-900 dark:text-white">4.8</span>
                          <motion.div 
                            className="flex items-center"
                            whileHover={{ scale: 1.1 }}
                          >
                          {[1, 2, 3, 4, 5].map((star) => (
                              <motion.div
                                key={star}
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                            <Star 
                              size={12}
                              className={`${star <= 4 ? 'text-warning-500 dark:text-warning-400 fill-current' : 'text-warning-500/30 dark:text-warning-400/30'}`}
                            />
                              </motion.div>
                          ))}
                          </motion.div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="flex items-center justify-between py-2"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-info-500 dark:text-info-400" />
                        <span className="text-sm text-secondary-900 dark:text-white">Response Rate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-secondary-900 dark:text-white">98%</span>
                        <Badge variant="success" className="text-xs dark:bg-success-900/20">+2%</Badge>
                      </div>
                      </motion.div>
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
};