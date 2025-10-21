"use client";

import { useParticles } from '@/hooks/useParticles';

export const ParticleBackground = () => {
  const canvasRef = useParticles();

  return (
    <div className="absolute inset-0 z-0 pointer-events-none" style={{ height: "100vh" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-90"
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 90%)`,
        }}
      />
    </div>
  );
};