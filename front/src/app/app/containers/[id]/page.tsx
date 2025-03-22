"use client";

import React from "react";
import { ContainerDetails } from "../../../../components/ContainerDetails";
import { motion } from "framer-motion";

export default function App() {
  const motionInitial = { opacity: 0, y: 20 };
  const motionAnimate = { opacity: 1, y: 0 };
  const motionTransition = { duration: 0.5 };

  return (
    <motion.div
      initial={motionInitial}
      animate={motionAnimate}
      transition={motionTransition}
      className="max-w-[90%] mx-auto my-6 space-y-6"
    >
      <ContainerDetails />
    </motion.div>
  );
}
