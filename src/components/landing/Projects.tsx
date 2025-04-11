"use client";

import { Card } from "@/components/ui/card";

export const Projects = () => {
  return (
    <section className="container py-20 border-t">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6">Show, don&apos;t tell.</h2>
          <p className="text-xl text-muted-foreground">
            Prove what you&apos;ve learned through real-world projects that employers actually care about.
          </p>
        </div>
        <Card className="p-8 bg-secondary/50">
          <div className="aspect-video rounded-lg bg-secondary mb-4" />
          <h3 className="font-semibold mb-2">E-Commerce Platform</h3>
          <p className="text-sm text-muted-foreground">
            Built with React, Node.js, and PostgreSQL
          </p>
        </Card>
      </div>
    </section>
  );
};
