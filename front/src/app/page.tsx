"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveBackground from "../components/WaveBackground/index";
import { degreesToRadians } from "popmotion";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "motion/react";
import { LoginDialog } from "../components/AuthDialog";

const PARALLAX_PAGES = 3;

export default function Home() {
  const parallax = useRef<IParallax>(null);
  const [shouldGoPrev, setShouldGoPrev] = useState(false);
  const [shouldGoNext, setShouldGoNext] = useState(false);
  const [y, setY] = useState(0);

  const handleScroll = () => {
    if (parallax.current) {
      setY(degreesToRadians(parallax.current.current / 340));
    } else {
      parallax.current.current = 0;
    }
  };

  useEffect(() => {
    const container = document.querySelector(".parallax-selector");
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (parallax.current) {
      setShouldGoPrev(parallax.current.offset !== 0);
      setShouldGoNext(parallax.current.offset < PARALLAX_PAGES - 1);
    }
  }, [parallax.current?.offset]);

  function parallaxNext() {
    parallax.current.scrollTo(parallax.current.offset + 1);
  }

  function parallaxPrev() {
    parallax.current.scrollTo(parallax.current.offset - 1);
  }

  return (
    <section>
      <WaveBackground rotation={{ x: 0, y, z: 100 }} />
      <Parallax
        pages={PARALLAX_PAGES}
        ref={parallax}
        className="parallax-selector"
        horizontal
      >
        <ParallaxLayer
          offset={1}
          speed={2.5}
          sticky={{ start: 0, end: 2 }}
          className="items-center justify-start flex p-36"
        >
          <div className="text-justify w-fit">
            <h1 className="text-xl md:text-9xl font-bold mb-4 font-JetBrainsMono flex flex-col">
              <span>Create</span>
              <span>Intelligent</span>
              <span>Python Functions</span>
            </h1>
            <p className="text-lg md:text-4xl text-gray-300 mb-8">
              Generate AI-powered microservices, ready to integrate with
              low-code platforms.
            </p>
          </div>
        </ParallaxLayer>
        <ParallaxLayer offset={0} sticky={{ start: 0, end: 2 }}>
          <div className="absolute top-5 right-10">
            <LoginDialog />
          </div>
          {shouldGoNext && (
            <motion.button
              className="absolute right-5 top-1/2 h-fit w-fit flex items-center justify-center"
              onClick={parallaxNext}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            >
              <ChevronsRight className="h-12 w-12" />
            </motion.button>
          )}
          {shouldGoPrev && (
            <motion.button
              className="absolute left-5 top-1/2 h-fit w-fit flex items-center justify-center"
              onClick={parallaxPrev}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            >
              <ChevronsLeft className="h-12 w-12" />
            </motion.button>
          )}
        </ParallaxLayer>
        <ParallaxLayer
          offset={0}
          speed={3}
          className="items-center justify-end flex p-36"
        >
          <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg w-fit">
            <h3 className="text-2xl font-semibold mb-2">
              1. Write the Function
            </h3>
            <p className="text-gray-400">
              Create the Python function with the logic your application needs.
            </p>
          </div>
        </ParallaxLayer>
        <ParallaxLayer
          offset={1}
          speed={3}
          className="items-center justify-end flex p-36"
        >
          <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg w-fit">
            <h3 className="text-2xl font-semibold mb-2">
              2. Configure Parameters
            </h3>
            <p className="text-gray-400">
              Define inputs, outputs, and additional parameters to customize.
            </p>
          </div>
        </ParallaxLayer>
        <ParallaxLayer
          offset={2}
          speed={3}
          className="items-center justify-end flex p-36"
        >
          <div className="border from-white/5 to-black/5 bg-gradient-to-bl backdrop-blur-sm p-6 rounded-lg shadow-lg w-fit">
            <h3 className="text-2xl font-semibold mb-2">
              3. Publish and Integrate
            </h3>
            <p className="text-gray-400">
              Generate an API to consume the service on any platform.
            </p>
          </div>
        </ParallaxLayer>
      </Parallax>
    </section>
  );
}
