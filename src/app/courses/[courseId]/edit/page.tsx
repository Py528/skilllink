"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Card, CardHeader, CardContent 
} from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Input } from "@/components/publish_course/Input";
import { 
  X, ChevronRight, ChevronDown, Plus, Edit3, 
  Eye, Upload, Move, Copy, Search, Grid, List, Filter,
  Clock, Users, BookOpen, Video, FileText, Image, Download,
  BarChart3, Settings, Home, Layers, FolderOpen,
  Save, Undo, Redo, ExternalLink,
  Calendar, TrendingUp, Star, Play, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { coursesService } from "@/services/coursesService";
import { useUser } from "@/context/UserContext";

// Enhanced Types
interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  instructor_avatar?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  price?: number;
  total_sections: number;
  total_lessons: number;
  total_duration: number;
  enrollment_count: number;
  completion_rate: number;
}

interface LessonData {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  video_url?: string;
  thumbnail_url?: string;
  resources: Array<{ url: string; name: string; type: string }>;
  status: 'draft' | 'published';
  order_index: number;
  section_id?: string;
  views: number;
  completion_rate: number;
}

interface ActivityItem {
  id: string;
  type: 'lesson_created' | 'lesson_updated' | 'section_added' | 'file_uploaded';
  title: string;
  timestamp: string;
  target_id?: string;
}

type SidebarView = 'overview' | 'sections' | 'lessons' | 'files' | 'analytics' | 'settings'; 

// Main Component
export default function SidebarCourseManagement() {
  const router = useRouter();
  const { courseId } = useParams();
  const { user } = useUser();
  const courseIdStr = Array.isArray(courseId) ? courseId[0] : courseId || "";
  
  // State Management
  const [course, setCourse] = useState<CourseData | null>(null);
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentView, setCurrentView] = useState<SidebarView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');


  // Data Fetching
  const fetchCourseData = useCallback(async () => {
    if (!courseIdStr || !user || user.role !== 'instructor') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const courseData = await coursesService.getCourseById(courseIdStr);
      if (!courseData) throw new Error("Course not found");

      const lessonRows = await coursesService.getLessonsByCourseId(courseIdStr);
      
      // Transform course data
      const transformedCourse: CourseData = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description || '',
        instructor_id: courseData.instructor_id || '',
        instructor_name: user.name || 'Unknown Instructor',
        instructor_avatar: user.avatar || '',
        is_published: courseData.is_published || false,
        created_at: courseData.created_at || new Date().toISOString(),
        updated_at: courseData.updated_at || new Date().toISOString(),
        price: courseData.price,
        total_sections: 1, // Default section for now
        total_lessons: lessonRows.length,
        total_duration: lessonRows.reduce((acc: number, lesson: { duration?: number }) => acc + (lesson.duration || 0), 0),
        enrollment_count: Math.floor(Math.random() * 500) + 50,
        completion_rate: Math.floor(Math.random() * 40) + 60
      };

      // Transform lessons data
      const transformedLessons: LessonData[] = lessonRows.map((lesson: { 
        id: string; 
        title: string; 
        description?: string; 
        type?: string; 
        duration?: number; 
        video_url?: string; 
        thumbnail_url?: string; 
        resources?: Array<{ url: string; name: string; type: string }>; 
        status?: string; 
        order_index?: number; 
      }) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: (lesson.type || 'video') as 'video' | 'text' | 'quiz' | 'assignment',
        duration: lesson.duration || 0,
        video_url: lesson.video_url,
        thumbnail_url: lesson.thumbnail_url,
        resources: lesson.resources || [],
        status: (lesson.status || 'draft') as 'draft' | 'published',
        order_index: lesson.order_index || 0,
        section_id: 'default-section',
        views: Math.floor(Math.random() * 1000),
        completion_rate: Math.floor(Math.random() * 40) + 60
      }));

      // Generate sample activities
      const sampleActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'lesson_updated',
          title: 'Updated "Introduction to React"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          target_id: lessonRows[0]?.id
        },
        {
          id: '2',
          type: 'file_uploaded',
          title: 'Uploaded new video file',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'lesson_created',
          title: 'Created new lesson',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCourse(transformedCourse);
      setLessons(transformedLessons);
      setActivities(sampleActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [courseIdStr, user]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Sidebar Component
  const Sidebar = () => (
    <motion.div
      className={`fixed left-0 top-0 h-full bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } transition-all duration-300`}
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 320 }}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <h1 className="text-lg font-bold text-secondary-900 dark:text-white truncate">
                  {course?.title || 'Course Management'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={course?.is_published ? 'success' : 'warning'}>
                    {course?.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {course?.total_lessons} lessons
                  </span>
                </div>
              </motion.div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Course Info */}
        {!sidebarCollapsed && course && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-b border-secondary-200 dark:border-secondary-700"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {course.instructor_name?.charAt(0) || 'I'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                  {course.instructor_name}
                </div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  Instructor
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={course.is_published ? "outline" : "primary"}
                size="sm"
                className="flex-1"
                onClick={handlePublishToggle}
                disabled={saving}
              >
                {course.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {navigationItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                isActive={currentView === item.id}
                isCollapsed={sidebarCollapsed}
                onClick={() => setCurrentView(item.id as SidebarView)}
              />
            ))}
          </nav>

          {/* Course Statistics */}
          {!sidebarCollapsed && course && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-t border-secondary-200 dark:border-secondary-700"
            >
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                Course Statistics
              </h3>
              <div className="space-y-3">
                <StatItem
                  icon={<Layers className="w-4 h-4" />}
                  label="Sections"
                  value={course.total_sections}
                />
                <StatItem
                  icon={<Video className="w-4 h-4" />}
                  label="Lessons"
                  value={course.total_lessons}
                />
                <StatItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Duration"
                  value={`${Math.round(course.total_duration / 60)}h`}
                />
                <StatItem
                  icon={<Users className="w-4 h-4" />}
                  label="Students"
                  value={course.enrollment_count}
                />
                <StatItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Completion"
                  value={`${course.completion_rate}%`}
                />
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-t border-secondary-200 dark:border-secondary-700"
            >
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <QuickActionButton
                  icon={<Plus className="w-4 h-4" />}
                  label="Add Section"
                  onClick={handleAddSection}
                />
                <QuickActionButton
                  icon={<Video className="w-4 h-4" />}
                  label="Add Lesson"
                  onClick={handleAddLesson}
                />
                <QuickActionButton
                  icon={<Upload className="w-4 h-4" />}
                  label="Upload Files"
                  onClick={handleBulkUpload}
                />
                <QuickActionButton
                  icon={<Download className="w-4 h-4" />}
                  label="Export Course"
                  onClick={handleExportCourse}
                />
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          {!sidebarCollapsed && activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 border-t border-secondary-200 dark:border-secondary-700"
            >
              <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-3">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {activities.slice(0, 5).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Navigation Items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'lessons', label: 'Lessons', icon: Video },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Helper Components
  const SidebarNavItem = ({ item, isActive, isCollapsed, onClick }: { 
    item: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }; 
    isActive: boolean; 
    isCollapsed: boolean; 
    onClick: () => void; 
  }) => (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
          : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && (
        <span className="font-medium">{item.label}</span>
      )}
    </motion.button>
  );

  const StatItem = ({ icon, label, value }: { 
    icon: React.ReactNode; 
    label: string; 
    value: string | number; 
  }) => (
    <div className="flex items-center gap-3">
      <div className="text-secondary-500 dark:text-secondary-400">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-secondary-500 dark:text-secondary-400">{label}</div>
        <div className="font-semibold text-secondary-900 dark:text-white">{value}</div>
      </div>
    </div>
  );

  const QuickActionButton = ({ icon, label, onClick }: { 
    icon: React.ReactNode; 
    label: string; 
    onClick: () => void; 
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const ActivityItem = ({ activity }: { activity: ActivityItem }) => (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
      <div className="flex-1 truncate">
        <div className="text-secondary-900 dark:text-white">{activity.title}</div>
        <div className="text-secondary-500 dark:text-secondary-400">
          {new Date(activity.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

  // Event Handlers
  const handlePublishToggle = async () => {
    if (!course) return;
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourse(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = () => {
    console.log('Add section clicked');
    // Implement add section logic
  };

  const handleAddLesson = () => {
    console.log('Add lesson clicked');
    // Implement add lesson logic
  };

  const handleBulkUpload = () => {
    console.log('Bulk upload clicked');
    // Implement bulk upload logic
  };

  const handleExportCourse = () => {
    console.log('Export course clicked');
    // Implement export logic
  };

  // Main Content Area
  const MainContent = () => (
    <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-80'} transition-all duration-300 min-h-screen bg-secondary-50 dark:bg-secondary-900`}>
      {/* Top Bar */}
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white capitalize">
              {currentView}
            </h2>
            {saving && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRedo}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'overview' && <OverviewView />}
            {currentView === 'sections' && <SectionsView />}
            {currentView === 'lessons' && <LessonsView />}
            {currentView === 'files' && <FilesView />}
            {currentView === 'analytics' && <AnalyticsView />}
            {currentView === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );

  // Additional Event Handlers
  const handleSave = () => {
    console.log('Save clicked');
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleUndo = () => {
    console.log('Undo clicked');
    // Implement undo logic
  };

  const handleRedo = () => {
    console.log('Redo clicked');
    // Implement redo logic
  };

  // Filtered lessons for search
  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // View Components
  const OverviewView = () => (
    <div className="space-y-6">
      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Description</h3>
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
              {course?.description || 'No description available.'}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-secondary-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {new Date(course?.created_at || '').toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Edit3 className="w-4 h-4" />
                Updated {new Date(course?.updated_at || '').toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Course Metrics</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Revenue</span>
                <span className="font-semibold text-green-600">${(course?.price || 0) * (course?.enrollment_count || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Completion Rate</span>
                <span className="font-semibold">{course?.completion_rate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Structure Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Structure</h3>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('sections')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Sections
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-secondary-900 dark:text-white">Course Content</div>
                <div className="text-sm text-secondary-600 dark:text-secondary-400">
                  {course?.total_lessons} lessons • {Math.round((course?.total_duration || 0) / 60)}h total
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-secondary-900 dark:text-white">
                    {activity.title}
                  </div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const LessonsView = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border border-secondary-200 dark:border-secondary-700 rounded-md">
            <Button
              variant={layoutMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLayoutMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLayoutMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="primary" onClick={handleAddLesson}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      </div>

      {/* Lessons Grid/List */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLessons.map((lesson) => (
            <LessonListItem key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );

  const FilesView = () => (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
              Upload Files
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <Button variant="primary" onClick={handleFileUpload}>
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileTypeCard
          title="Videos"
          icon={<Video className="w-6 h-6" />}
          count={lessons.filter(l => l.video_url).length}
          color="blue"
        />
        <FileTypeCard
          title="Images"
          icon={<Image className="w-6 h-6" />}
          count={lessons.filter(l => l.thumbnail_url).length}
          color="green"
        />
        <FileTypeCard
          title="Documents"
          icon={<FileText className="w-6 h-6" />}
          count={lessons.reduce((acc, l) => acc + l.resources.length, 0)}
          color="purple"
        />
      </div>

      {/* File Grid */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Files</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lessons.map((lesson) => (
              <React.Fragment key={lesson.id}>
                {lesson.video_url && (
                  <FilePreview
                    type="video"
                    url={lesson.video_url}
                    thumbnail={lesson.thumbnail_url}
                    name={`${lesson.title} - Video`}
                  />
                )}
                {lesson.thumbnail_url && (
                  <FilePreview
                    type="image"
                    url={lesson.thumbnail_url}
                    name={`${lesson.title} - Thumbnail`}
                  />
                )}
                {lesson.resources.map((resource, index) => (
                  <FilePreview
                    key={index}
                    type="document"
                    url={resource.url}
                    name={resource.name}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Views"
          value="12,543"
          change="+12%"
          trend="up"
          icon={<Eye className="w-5 h-5" />}
        />
        <AnalyticsCard
          title="Completion Rate"
          value={`${course?.completion_rate}%`}
          change="+5%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <AnalyticsCard
          title="Average Rating"
          value="4.8"
          change="+0.2"
          trend="up"
          icon={<Star className="w-5 h-5" />}
        />
        <AnalyticsCard
          title="Revenue"
          value={`$${((course?.price || 0) * (course?.enrollment_count || 0)).toLocaleString()}`}
          change="+18%"
          trend="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Enrollment Trend</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-secondary-500">
              Chart placeholder - Enrollment over time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Lesson Performance</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-secondary-500">
              Chart placeholder - Lesson completion rates
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SectionsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Sections</h3>
        <Button variant="primary" onClick={handleAddSection}>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Default Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChevronDown className="w-4 h-4 text-secondary-600" />
              <div>
                <h4 className="font-semibold text-secondary-900 dark:text-white">Course Content</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  {lessons.length} lessons • {Math.round((course?.total_duration || 0) / 60)}h total
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
              >
                <Move className="w-4 h-4 text-secondary-400 cursor-grab" />
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                  {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  {lesson.type === 'text' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-secondary-900 dark:text-white">{lesson.title}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">
                    {lesson.duration}min • {lesson.views} views
                  </div>
                </div>
                <Badge variant={lesson.status === 'published' ? 'success' : 'warning'}>
                  {lesson.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Course Settings</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Course Title
            </label>
            <Input value={course?.title || ''} onChange={() => {}} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Description
            </label>
            <textarea
              className="w-full p-3 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
              rows={4}
              value={course?.description || ''}
              onChange={() => {}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Price
            </label>
            <Input type="number" value={course?.price || 0} onChange={() => {}} />
          </div>

          <div className="flex gap-4">
            <Button variant="primary">Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Additional Helper Components
  const LessonCard = ({ lesson }: { lesson: LessonData }) => (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
      <div className="aspect-video bg-secondary-100 dark:bg-secondary-800 rounded-t-lg relative overflow-hidden">
        {lesson.thumbnail_url ? (
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-secondary-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-12 h-12 text-white" />
          </motion.div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {lesson.duration}min
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-secondary-900 dark:text-white line-clamp-2">
            {lesson.title}
          </h4>
          <Badge variant={lesson.status === 'published' ? 'success' : 'warning'}>
            {lesson.status}
          </Badge>
        </div>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 mb-3">
          {lesson.description}
        </p>
        <div className="flex items-center justify-between text-xs text-secondary-500">
          <span>{lesson.views} views</span>
          <span>{lesson.completion_rate}% completion</span>
        </div>
      </CardContent>
    </Card>
  );

  const LessonListItem = ({ lesson }: { lesson: LessonData }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 bg-secondary-100 dark:bg-secondary-800 rounded overflow-hidden flex-shrink-0">
            {lesson.thumbnail_url ? (
              <img
                src={lesson.thumbnail_url}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-6 h-6 text-secondary-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-secondary-900 dark:text-white truncate">
              {lesson.title}
            </h4>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 truncate">
              {lesson.description}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-secondary-500">
              <span>{lesson.duration}min</span>
              <span>{lesson.views} views</span>
              <span>{lesson.completion_rate}% completion</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={lesson.status === 'published' ? 'success' : 'warning'}>
              {lesson.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FileTypeCard = ({ title, icon, count, color }: { 
    title: string; 
    icon: React.ReactNode; 
    count: number; 
    color: string; 
  }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6 text-center">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex items-center justify-center text-${color}-600 dark:text-${color}-400 mx-auto mb-4`}>
          {icon}
        </div>
        <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{title}</h3>
        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{count}</p>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">files</p>
      </CardContent>
    </Card>
  );

  const FilePreview = ({ type, url, thumbnail, name }: { 
    type: 'video' | 'image' | 'document'; 
    url: string; 
    thumbnail?: string; 
    name: string; 
  }) => (
    <div className="group relative bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden aspect-square cursor-pointer hover:shadow-lg transition-shadow">
      {type === 'video' ? (
        <div className="w-full h-full relative">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-8 h-8 text-secondary-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ) : type === 'image' ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-secondary-400" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-white text-xs truncate">{name}</p>
      </div>
    </div>
  );

  const AnalyticsCard = ({ title, value, change, trend, icon }: { 
    title: string; 
    value: string | number; 
    change: string; 
    trend: 'up' | 'down'; 
    icon: React.ReactNode; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-secondary-500 dark:text-secondary-400">{icon}</div>
          <div className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </div>
        </div>
        <div className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">{value}</div>
        <div className="text-sm text-secondary-600 dark:text-secondary-400">{title}</div>
      </CardContent>
    </Card>
  );

  // Additional Event Handlers
  const handleFileUpload = () => {
    console.log('File upload clicked');
    // Implement file upload logic
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Loading course management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="relative">
      <Sidebar />
      <MainContent />
    </div>
  );
} 