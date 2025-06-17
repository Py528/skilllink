import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, DollarSign, Award, Eye, 
  CheckCircle, MessageSquare, Star, Plus, TrendingUp,
  Bell, ChevronRight, Target, MoreVertical
} from "lucide-react";
import { CourseCard } from "./CourseCard";
import { Card, CardHeader, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { mockInstructorCourses, mockInstructorStats } from "../../data/mockData";
import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";
import { useRouter } from "next/navigation";

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
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export const InstructorDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [notifications] = useState([
    { id: 1, type: "review", message: "New review on React Course", time: "2h ago", rating: 5 },
    { id: 2, type: "enrollment", message: "15 new enrollments", time: "5h ago", count: 15 },
    { id: 3, type: "comment", message: "New question in Module 3", time: "1d ago" },
    { id: 4, type: "revenue", message: "Monthly revenue goal reached!", time: "1d ago", amount: 5000 }
  ]);

  const [todos, setTodos] = useState<Todo[]>(
    mockInstructorStats.todos.map(todo => ({
      ...todo,
      completed: false
    }))
  );
  const [newTodo, setNewTodo] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);

  const router = useRouter();

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

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
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
  };

  const toggleTodo = (index: number) => {
    const newTodos = [...todos];
    newTodos[index].completed = !newTodos[index].completed;
    setTodos(newTodos);
  };

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
                <Card className="overflow-hidden border border-secondary-200/50 dark:border-secondary-700/50">
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
                            className="dark:bg-primary-600 dark:hover:bg-primary-700"
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
                      {mockInstructorCourses.slice(0, 4).map((course) => (
                        <motion.div
                          key={course.id}
                          variants={itemVariants}
                          whileHover="hover"
                          custom={cardHoverVariants}
                        >
                          <CourseCard 
                            course={{
                              ...course,
                              level: course.level as "beginner" | "intermediate" | "advanced",
                              status: course.status as "published" | "draft" | "archived"
                            }} 
                          />
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
                  <Card className="border border-secondary-200/50 dark:border-secondary-700/50">
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
                  <Card className="border border-secondary-200/50 dark:border-secondary-700/50">
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