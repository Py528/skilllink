import { Github, Mail, ExternalLink, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="w-full bg-secondary/60 backdrop-blur-md text-muted-foreground border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              SkillLink
            </h2>
            <p className="text-sm max-w-sm leading-relaxed font-medium">
              Empowering professionals with skills for today&apos;s dynamic
              workplace.
            </p>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Resources
            </h3>
            <div className="flex flex-col space-y-2 text-sm">
              {[
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Help Center", href: "#" },
              ].map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="footer-link hover:text-primary inline-flex items-center group transition-all duration-200 ease-in-out"
                >
                  {link.name}
                  <ExternalLink
                    size={14}
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Connect
            </h3>
            <div className="flex flex-col space-y-2 text-sm">
              <a
                href="mailto:contact@skilllink.dev"
                className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
              >
                <Mail size={16} className="mr-2" />
                contact@skilllink.dev
              </a>
              <a
                href="https://github.com/skilllink"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
              >
                <Github size={16} className="mr-2" />
                GitHub
              </a>
              <a
                href="https://twitter.com/skilllink"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link hover:text-primary inline-flex items-center transition-all duration-200 ease-in-out"
              >
                <Twitter size={16} className="mr-2" />
                Twitter
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="text-center text-xs text-muted-foreground/80">
          <p className="font-medium">
            © {currentYear} SkillLink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;