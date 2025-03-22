import React from "react";
import { twMerge } from "tailwind-merge";

interface GradientSpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function GradientSpan({
  children,
  className,
  ...rest
}: GradientSpanProps) {
  return (
    <span
      className={twMerge(
        [
          "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600",
        ],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
