"use client";

import React from "react";
import WaveBackground from "../components/WaveBackground/index";
import Hero from "../components/Hero";
import { Header } from "../components/Headers/Header";

export default function Home() {

  return (
    <section className="flex items-center justify-center w-full h-max flex-col">
      <Header />
      <Hero />
      {
        /* <Card className="w-[20%] md:w-[40%]">
        <CardHeader>
        <CardTitle>POST Request Payload</CardTitle>
        <CardDescription>
        Add key-value pairs to the payload to be sent in the POST request.
        </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <PostRequestPayloadForm />
        </CardContent>
        </Card> */
      }
      <WaveBackground rotation={{ x: 0, y: 3, z: 100 }} />
    </section>
  );
}
