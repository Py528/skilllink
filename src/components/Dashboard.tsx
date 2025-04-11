import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">SkillLink</h1>
        <Avatar>
          <AvatarImage src="/user-avatar.png" alt="User Avatar" />
        </Avatar>
      </header>

      <div className="text-xl font-light">Welcome back, Alex 👋</div>

      <section className="space-y-6">
        <h2 className="text-lg font-medium">My Courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="text-md font-semibold">Full-Stack Web Dev</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/instructor.png" />
                  </Avatar>
                  <span className="text-sm text-gray-600">Jane Doe</span>
                </div>
                <Progress value={70} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Landing Page", status: "Pending" },
            { name: "API Backend", status: "Reviewed" },
          ].map((project, idx) => (
            <Card key={idx} className="rounded-2xl shadow-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <span>{project.name}</span>
                <span className="text-sm text-gray-500">{project.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Credentials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((_, idx) => (
            <Card key={idx} className="rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium">Web Dev Certificate</div>
                <div className="text-xs text-gray-400">#8f2d...4a6b</div>
                <Button variant="outline" size="sm">View PDF</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
