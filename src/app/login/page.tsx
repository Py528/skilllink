"use client";

import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { ParticleBackground } from "@/components/hero/ParticleBackground";


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col relative">
      {/* Particle background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground />
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 90%)`,
          }}
        />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-20">
        <LoginForm />
      </main>
    </div>
  );
}
