import React, { useState } from "react";
import { 
  Users, 
  BookOpen, 
  Clock, 
  DollarSign,
  Award,
  Eye,
  CheckCircle,
  MessageSquare,
  Star,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { StatisticsCard } from "./StatisticsCard";
import { InstructorCourseCard } from "./CourseCard";
import { Card, CardHeader, CardContent } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { mockInstructorCourses, mockInstructorStats } from "../../data/mockData";
import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";

interface Todo {
  task: string;
  priority: string;
  dueDate: string;
  completed: boolean;
}

export const InstructorDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [notifications] = useState([
    { id: 1, type: "review", message: "New review on React Course", time: "2h ago" },
    { id: 2, type: "enrollment", message: "15 new enrollments", time: "5h ago" },
    { id: 3, type: "comment", message: "New question in Module 3", time: "1d ago" }
  ]);

  const [todos, setTodos] = useState<Todo[]>(
    mockInstructorStats.todos.map(todo => ({
      ...todo,
      completed: false
    }))
  );
  const [newTodo, setNewTodo] = useState("");
  const [showAddTodo, setShowAddTodo] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-xl font-bold">Instructor Dashboard</h1>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Welcome back! Here&apos;s what&apos;s happening with your courses today.
                </p>
              </div>
              <Button
                variant="primary"
                leftIcon={<BookOpen size={16} />}
              >
                Create New Course
              </Button>
            </div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <StatisticsCard
                  title="Total Students"
                  value={mockInstructorStats.totalStudents}
                  icon={<Users size={20} />}
                  change={{ value: 12, trend: "up" }}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatisticsCard
                  title="Active Courses"
                  value={mockInstructorStats.activeCourses}
                  icon={<BookOpen size={20} />}
                  change={{ value: 5, trend: "up" }}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatisticsCard
                  title="Watch Time"
                  value={mockInstructorStats.watchTime}
                  icon={<Clock size={20} />}
                  change={{ value: 18, trend: "up" }}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <StatisticsCard
                  title="Revenue"
                  value={mockInstructorStats.revenue}
                  icon={<DollarSign size={20} />}
                  change={{ value: 8, trend: "up" }}
                />
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div 
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Your Courses</h2>
                    <Button variant="outline" size="sm">View All</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockInstructorCourses.slice(0, 4).map((course) => (
                        <motion.div 
                          key={course.id}
                          whileHover={{ y: -4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <InstructorCourseCard course={course} />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>  
                  <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <Badge variant="primary">New</Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[200px] overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {notification.type === "review" && <Star size={14} className="text-warning-500" />}
                          {notification.type === "enrollment" && <Users size={14} className="text-primary-500" />}
                          {notification.type === "comment" && <MessageSquare size={14} className="text-info-500" />}
                          <span className="text-sm">{notification.message}</span>
                        </div>
                        <span className="text-xs text-secondary-500 ml-6">{notification.time}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Performance</h2>
                    <Badge variant="secondary">This Week</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Eye size={16} className="text-primary-500 mr-2" />
                        <span className="text-sm">Course Views</span>
                      </div>
                      <span className="font-medium text-sm">1,245</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Award size={16} className="text-success-500 mr-2" />
                        <span className="text-sm">Completions</span>
                      </div>
                      <span className="font-medium text-sm">83</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Star size={16} className="text-warning-500 mr-2" />
                        <span className="text-sm">Avg. Rating</span>
                      </div>
                      <span className="font-medium text-sm">4.8/5</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">To-Do List</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowAddTodo(!showAddTodo)}
                    >
                      <Plus size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {showAddTodo && (
                      <div className="flex space-x-2 mb-4">
                        <input
                          type="text"
                          value={newTodo}
                          onChange={(e) => setNewTodo(e.target.value)}
                          className="flex-1 px-3 py-1 text-sm border rounded-md"
                          placeholder="Add new task..."
                          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                        />
                        <Button size="sm" onClick={addTodo}>Add</Button>
                      </div>
                    )}
                    
                    {todos.map((todo, index) => (
                      <div 
                        key={index}
                        className="flex items-center space-x-2 p-2 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg"
                      >
                        <button
                          onClick={() => toggleTodo(index)}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            todo.completed ? 'bg-success-500 border-success-500' : 'border-secondary-300'
                          }`}
                        >
                          {todo.completed && <CheckCircle size={12} className="text-white" />}
                        </button>
                        <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-secondary-400' : ''}`}>
                          {todo.task}
                        </span>
                        <Badge 
                          variant={todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'success'}
                        >
                          {todo.dueDate}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};