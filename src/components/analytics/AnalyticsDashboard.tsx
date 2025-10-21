'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Eye, DollarSign,
  BarChart3, Activity, Target, Award,
  Download, RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalRevenue: number;
    totalCourses: number;
    completionRate: number;
    avgRating: number;
    totalHours: number;
  };
  revenue: {
    monthly: Array<{ month: string; revenue: number; growth: number }>;
    yearly: Array<{ year: string; revenue: number; growth: number }>;
  };
  students: {
    newStudents: number;
    activeStudents: number;
    completionRate: number;
    retentionRate: number;
  };
  courses: {
    published: number;
    draft: number;
    totalViews: number;
    avgRating: number;
  };
  engagement: {
    dailyActiveUsers: number;
    avgSessionDuration: number;
    bounceRate: number;
    topCourses: Array<{ name: string; views: number; rating: number }>;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  onExport,
  onRefresh,
  loading = false,
  className
}) => {
  // const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const overviewCards = [
    {
      title: 'Total Students',
      value: data.overview.totalStudents.toLocaleString(),
      icon: Users,
      change: '+12%',
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: `$${data.overview.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+8%',
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${data.overview.completionRate}%`,
      icon: Target,
      change: '+5%',
      trend: 'up',
      color: 'text-purple-600'
    },
    {
      title: 'Average Rating',
      value: data.overview.avgRating.toFixed(1),
      icon: Award,
      change: '+0.2',
      trend: 'up',
      color: 'text-yellow-600'
    }
  ];

  const revenueData = useMemo(() => {
    return timeRange === '1y' ? data.revenue.yearly : data.revenue.monthly;
  }, [data.revenue, timeRange]);

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your course performance and student engagement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Time Range:</span>
        {timeRangeOptions.map((option) => (
          <Button
            key={option.value}
            variant={timeRange === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimeRangeChange(option.value as '7d' | '30d' | '90d' | '1y')}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <div className="flex items-center mt-2">
                      {getTrendIcon(card.trend as 'up' | 'down')}
                      <span className={cn('text-sm font-medium ml-1', getTrendColor(card.trend as 'up' | 'down'))}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn('p-3 rounded-full bg-gray-100 dark:bg-gray-800', card.color)}>
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p className="font-medium">{(item as any).month || (item as any).year}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${item.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(item.growth > 0 ? 'up' : 'down')}
                    <span className={cn(
                      'text-sm font-medium ml-1',
                      getTrendColor(item.growth > 0 ? 'up' : 'down')
                    )}>
                      {Math.abs(item.growth)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Student Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Active Users</span>
                <span className="font-semibold">{data.engagement.dailyActiveUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Session Duration</span>
                <span className="font-semibold">{data.engagement.avgSessionDuration}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Bounce Rate</span>
                <span className="font-semibold">{data.engagement.bounceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Top Performing Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.engagement.topCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.views} views
                      </span>
                      <div className="flex items-center">
                        <Award className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {course.views > 1000 ? 'Popular' : 'Growing'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Course Stats</h3>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Published</span>
                <span className="font-semibold">{data.courses.published}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Draft</span>
                <span className="font-semibold">{data.courses.draft}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Views</span>
                <span className="font-semibold">{data.courses.totalViews.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Student Metrics</h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">New Students</span>
                <span className="font-semibold">{data.students.newStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Students</span>
                <span className="font-semibold">{data.students.activeStudents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="font-semibold">{data.students.completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Performance</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Retention Rate</span>
                <span className="font-semibold">{data.students.retentionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Rating</span>
                <span className="font-semibold">{data.courses.avgRating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Hours</span>
                <span className="font-semibold">{data.overview.totalHours}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
