"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function LearnerDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        <main className="w-full max-w-6xl mx-auto p-6 space-y-10">
          <div className="text-2xl font-light">Welcome back, Alex 👋</div>

          {/* 📊 Overview Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Enrolled Courses</div>
                <div className="text-2xl font-semibold mt-1">3</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Certificates Earned</div>
                <div className="text-2xl font-semibold mt-1">2</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Pending Projects</div>
                <div className="text-2xl font-semibold mt-1">1</div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* 📚 My Courses */}
          <section className="space-y-6">
            <h2 className="text-lg font-medium">My Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-md font-semibold">Full-Stack Web Dev</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/instructor.png" />
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Jane Doe</span>
                    </div>
                    <Progress value={70} />
                    <div className="text-xs text-muted-foreground">70% complete</div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm">Continue</Button>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* 🧠 Projects */}
          <section className="space-y-6">
            <h2 className="text-lg font-medium">My Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Landing Page", status: "Pending Review" },
                { name: "API Backend", status: "Reviewed" },
              ].map((project, idx) => (
                <Card key={idx} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{project.name}</span>
                      <Badge variant={project.status === "Reviewed" ? "default" : "outline"}>
                        {project.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">View Project</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* 🎓 Credentials */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium">My Certificates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((_, idx) => (
                <Card key={idx} className="rounded-2xl shadow-sm hover:shadow-md transition">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-sm font-medium">Web Dev Certificate</div>
                    <div className="text-xs text-muted-foreground">Issued: Mar 2024</div>
                    <div className="text-xs text-muted-foreground">ID: #8f2d...4a6b</div>
                    <Button variant="outline" size="sm" className="w-full">View PDF</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
