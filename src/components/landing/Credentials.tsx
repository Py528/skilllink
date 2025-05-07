"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Credentials = () => {
  const name = "John Lawrence";

  return (
    <section className="container py-20 border-t">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <Card className="p-8 border-2">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="font-semibold">Advanced React Development</h4>
              <p className="text-sm text-muted-foreground">Issued to {name}</p>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${name}`} alt={name} />
              <AvatarFallback>
                {name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-xs font-mono text-muted-foreground break-all">
            hash: 0x7d8f3e2a1c5b9d6f4...
          </div>
        </Card>
        <div>
          <h2 className="text-3xl font-bold mb-6">
            Earn verifiable, sharable credentials
          </h2>
          <p className="text-xl text-muted-foreground">
            Blockchain-verified certificates that prove your expertise to employers.
          </p>
        </div>
      </div>
    </section>
  );
};
