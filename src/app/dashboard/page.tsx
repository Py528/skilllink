import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import LearnerDashboard from "@/components/dashboard/LearnerDashboard";


// 👇 Replace this mock with real logic (e.g., from auth/user context)
const mockUserRole = "learner"; // or "instructor"

export default function DashboardPage() {
  return mockUserRole === "learner" ? <InstructorDashboard /> : <LearnerDashboard />;
}
