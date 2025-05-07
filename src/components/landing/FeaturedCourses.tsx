"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const courses = [
  { title: "Advanced React Patterns", level: "Intermediate", instructor: "Sarah Chen" },
  { title: "System Design Fundamentals", level: "Advanced", instructor: "Michael Ross" },
  { title: "API Development with Node.js", level: "Intermediate", instructor: "David Kim" },
];

export const FeaturedCourses = () => {
  return (
    <section className="container py-20 border-t">
      <h2 className="text-3xl font-bold text-center mb-16">Featured Courses</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{course.level}</p>
            <div className="flex items-center">
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} alt={course.instructor} />
                <AvatarFallback>{course.instructor.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <span className="ml-3 text-sm">{course.instructor}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
