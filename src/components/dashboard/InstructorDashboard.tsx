"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const courses = [
  {
    title: "React Bootcamp",
    students: 12,
    tags: ["Beginner", "Web Dev"],
  },
  {
    title: "JavaScript Mastery",
    students: 35,
    tags: ["Intermediate", "Frontend"],
  },
  {
    title: "Advanced TypeScript",
    students: 8,
    tags: ["Advanced", "Backend"],
  },
];

const activityLogs = [
  {
    icon: "🔔",
    message: "Alex submitted Project 2 for React Bootcamp",
    time: "2h ago",
  },
  {
    icon: "🎓",
    message: "Mia earned a certificate in Frontend Basics",
    time: "5h ago",
  },
  {
    icon: "📬",
    message: "John messaged you regarding JavaScript Mastery",
    time: "1 day ago",
  },
];

export default function InstructorDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        <main className="w-full max-w-6xl mx-auto p-6 space-y-10">
          <div className="text-2xl font-light">Welcome back, Jane 👩‍🏫</div>

          {/* 📊 Quick Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Active Courses</div>
                <div className="text-2xl font-semibold mt-1">{courses.length}</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Enrolled Students</div>
                <div className="text-2xl font-semibold mt-1">
                  {courses.reduce((sum, c) => sum + c.students, 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Course Reviews</div>
                <div className="text-2xl font-semibold mt-1">36</div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* 📚 Courses Taught */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Courses You&apos;re Teaching</h2>
              <Button size="sm">+ Create New Course</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-md font-semibold">{course.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.students} students enrolled
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {course.tags.map((tag, j) => (
                        <Badge
                          key={j}
                          variant={j === 0 ? "secondary" : "outline"}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Submissions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* 👩‍🎓 Recent Activity */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium">Recent Student Activity</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              {activityLogs.map((log, i) => (
                <div key={i} className="flex justify-between">
                  <p>{log.icon} {log.message}</p>
                  <span className="text-xs text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
