"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/Forms/LoginForm";
import WaveBackground from "@/components/WaveBackground";

export default function Home() {
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
