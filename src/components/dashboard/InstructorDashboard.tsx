"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
                <div className="text-2xl font-semibold mt-1">4</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Enrolled Students</div>
                <div className="text-2xl font-semibold mt-1">128</div>
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
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-md font-semibold">React Bootcamp</div>
                    <div className="text-sm text-muted-foreground">12 students enrolled</div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Beginner</Badge>
                      <Badge variant="outline">Web Dev</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">View Submissions</Button>
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
              <div className="flex justify-between">
                <p>🔔 Alex submitted <strong>Project 2</strong> for React Bootcamp</p>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex justify-between">
                <p>🎓 Mia earned a certificate in <strong>Frontend Basics</strong></p>
                <span className="text-xs text-muted-foreground">5h ago</span>
              </div>
              <div className="flex justify-between">
                <p>📬 John messaged you regarding <strong>JavaScript Mastery</strong></p>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
