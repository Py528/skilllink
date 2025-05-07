"use client";

import { Github, Mail, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="backdrop-blur-md bg-secondary/60 mt-20 text-muted-foreground border-t border-border">
      <div className="container py-12 space-y-10">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="text-xl font-bold text-foreground">SkillLink</div>
            <p className="text-sm max-w-sm">
              Connecting professionals with the skills they need to succeed in today&apos;s evolving marketplace.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <div className="flex flex-col space-y-2 text-sm">
              {[
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Help Center", href: "#" },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="hover:text-primary flex items-center group transition-colors"
                >
                  <span>{link.name}</span>
                  <ExternalLink
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Connect</h4>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="mailto:contact@skilllink.dev"
                className="hover:text-primary flex items-center transition-colors"
              >
                <Mail size={16} className="mr-2" />
                contact@skilllink.dev
              </a>
              <a
                href="https://github.com/skilllink"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary flex items-center transition-colors"
              >
                <Github size={16} className="mr-2" />
                GitHub
              </a>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col md:flex-row justify-center items-center text-xs text-muted-foreground">
          <p>© {currentYear} SkillLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
