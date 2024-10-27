"use client";

import { useEffect } from "react";
import React from "react";
import useUser from "../hooks/useUser.tsx";
import LoginForm from "../components/Forms/LoginForm.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.tsx";
import WaveBackground from "../components/WaveBackground/index.tsx";

export default function Home() {
  const { redirect } = useUser();
  useEffect(redirect);

  return (
    <section className="flex w-full h-screen justify-center items-center">
      <Card className="2xl:w-[15%] xl:w-[20%] md:w-[40%] sm:w-[80%] w-[90%] h-fit rounded-md bg-black/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full h-full">
          <LoginForm />
        </CardContent>
      </Card>
      <WaveBackground />
    </section>
  );
}
