"use client";

import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  size: number;
  style: {
    top: string;
    left: string;
    opacity: number;
    transform: string;
  };
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const createSparkle = () => {
    if (sparkles.length >= 20) return; // Limits the number of sparkles for performance

    const sparkle = {
      id: Date.now(),
      size: Math.random() * 15 + 8,
      style: {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.5,
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    };

    setSparkles((prev) => [...prev, sparkle]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
    }, 1500);
  };

  useEffect(() => {
    setIsMounted(true); // Prevents hydration error by delaying sparkle creation until after mount

    const interval = setInterval(() => {
      if (isMounted) createSparkle();
    }, 300);

    return () => clearInterval(interval);
  }, [isMounted, createSparkle]);

  if (!isMounted) return null; // Ensures the component doesn't render before mounting

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-ping"
          style={{
            top: sparkle.style.top,
            left: sparkle.style.left,
            opacity: sparkle.style.opacity,
            transform: sparkle.style.transform,
            animationDuration: "1.5s",
            filter: "drop-shadow(0 0 5px rgba(255, 255, 0, 0.7))",
          }}
        >
          <svg
            width={sparkle.size}
            height={sparkle.size}
            viewBox="0 0 160 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
              fill="url(#sparkleGradient)"
            />
            <defs>
              <radialGradient
                id="sparkleGradient"
                cx="0.5"
                cy="0.5"
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#FFFF00" />
                <stop offset="100%" stopColor="#FFA500" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
}
