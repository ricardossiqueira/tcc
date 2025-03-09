"use client";

import React from "react";
import WaveBackground from "../components/WaveBackground/index";
import Hero from "../components/Hero";



export default function Home() {

  return (
    <section>
      <WaveBackground rotation={{ x: 0, y: 0, z: 100 }} />
      <Hero />
    </section>
  );
}
