"use client";

import React from "react";
import { AppContent } from "../../components/AppContent/app";
import { motion } from "framer-motion";

export default function App() {
  const motionInitial = { opacity: 0, y: 20 };
  const motionAnimate = { opacity: 1, y: 0 };
  const motionTransition = { duration: 0.5 };

  return (
    <div className="max-w-[90%] mx-auto mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
          className="text-3xl font-bold"
        >
          Home
        </motion.h1>
      </div>
      <motion.div
        initial={motionInitial}
        animate={motionAnimate}
        transition={motionTransition}
      >
        <AppContent />
      </motion.div>
    </div>
  );
}
