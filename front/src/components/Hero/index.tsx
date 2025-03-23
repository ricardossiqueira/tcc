"use client";

import { motion } from "framer-motion";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { GradientSpan } from "../GradientSpan";

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center z-10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Transform Your Applications with{" "}
              <GradientSpan>AI Power</GradientSpan>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto"
          >
            Generate intelligent python services and use them in your
            applications.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              onClick={() => (window.location.href = "/login")}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Try It Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-purple-500 hover:bg-purple-500/20"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              See Examples
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
