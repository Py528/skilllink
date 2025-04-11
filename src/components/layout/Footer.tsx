import { Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  return (
    <footer className="bg-secondary mt-20">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="font-semibold text-xl mb-4 md:mb-0">SkillLink</div>
          <div className="flex items-center space-x-8">
            <a href="#" className="text-sm hover:text-primary">Privacy</a>
            <a href="#" className="text-sm hover:text-primary">Terms</a>
            <a href="#" className="inline-flex items-center space-x-2 text-sm hover:text-primary">
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-sm text-muted-foreground">
          contact@skilllink.dev
        </div>
      </div>
    </footer>
  );
};
