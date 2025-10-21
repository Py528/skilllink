"use client";
// components/hero/RotatingText.tsx

import { useState, useEffect } from "react";
import { RotatingTextProps } from "@/types";

export const RotatingText = ({
  texts,
  mainClassName,
  rotationInterval,
}: RotatingTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval || 2200);
    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentIndex].split("");

  return (
    <span className={`inline-flex ${mainClassName}`}>
      {currentText.map((char, i) => (
        <span key={`${char}-${i}`} className="inline-block">
          {char}
        </span>
      ))}
    </span>
  );
};