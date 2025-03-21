"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button, ButtonProps } from "../ui/button";
import dynamic from "next/dynamic";

// Lazy load SparkleEffect to fix hydration mismatch
const SparkleEffect = dynamic(
  () => import("./SparkleEffect").then((mod) => mod.SparkleEffect),
  { ssr: false },
);

export function AIButton(props: ButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevents hydration error by delaying effect-related content until client-side render
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="relative">
      {isMounted && <SparkleEffect />}
      <Button
        {...props}
        className={cn(
          "relative w-full py-6 font-bold transition-all",
          "bg-purple-600 hover:bg-purple-500 text-white",
          "shadow-[0_0_20px_rgba(168,85,247,0.6)]",
          "hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]",
          "dark:bg-purple-700 dark:hover:bg-purple-600",
          "dark:shadow-[0_0_25px_rgba(192,132,252,0.7)]",
          "dark:hover:shadow-[0_0_35px_rgba(192,132,252,0.9)]",
          "rounded-xl overflow-hidden",
          props.className,
        )}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {props?.isLoading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>Generate with AI</span>
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 opacity-100 dark:from-purple-600 dark:via-purple-700 dark:to-purple-800" />
      </Button>
    </div>
  );
}
