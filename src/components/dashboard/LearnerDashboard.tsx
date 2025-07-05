import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Compass, Flame, ChevronRight } from "lucide-react";
import { Button } from "../common/Button";
import { Progress } from "../common/Progress";
import { Badge } from "../common/Badge";
import { CourseCard } from "./CourseCard";

import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";
import { useUser } from "../../context/UserContext";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  instructor: {
    name: string;
    avatar: string;
  };
  estimated_duration?: number;
  total_enrollments?: number;
  level: string;
  category: string;
  price?: number;
  rating?: number;
  lessons?: number;
}

export const LearnerDashboard: React.FC = () => {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      try {
        // Fetch published courses with instructor info
        const response = await fetch(`${supabaseUrl}/rest/v1/courses?is_published=eq.true&select=id,title,description,thumbnail_url,estimated_duration,total_enrollments,difficulty_level,category,price,rating,instructor_id&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Map to CourseCard format
        const mappedCourses: Course[] = (data || []).map((course: {
          id: string;
          title: string;
          description: string;
          thumbnail_url?: string;
          estimated_duration?: number;
          total_enrollments?: number;
          difficulty_level?: string;
          category?: string;
          price?: number;
          rating?: number;
          instructor_id?: string;
          total_lessons?: number;
        }) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail_url: course.thumbnail_url || '/default-cover.jpg',
          instructor: {
            name: 'Unknown Instructor', // We'll need to fetch instructor data separately if needed
            avatar: '/default-avatar.png',
          },
          estimated_duration: course.estimated_duration,
          total_enrollments: course.total_enrollments,
          level: course.difficulty_level || 'Beginner',
          category: course.category || 'Uncategorized',
          price: course.price,
          rating: course.rating,
          lessons: course.total_lessons || 0,
        }));
        setCourses(mappedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
              {loading ? (
                <div className="text-center text-gray-400 py-12">Loading courses...</div>
              ) : courses.length === 0 ? (
                <div className="text-center text-gray-400 py-12">No courses found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.slice(0, 4).map((course: Course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.2 }}
                      whileHover={{ y: -5 }}
                    >
                      <CourseCard course={{
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        thumbnail: course.thumbnail_url,
                        instructor: course.instructor,
                        duration: course.estimated_duration || 0,
                        students: course.total_enrollments || 0,
                        level: course.level,
                        category: course.category,
                        status: 'published',
                      }} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};