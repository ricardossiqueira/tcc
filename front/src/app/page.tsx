"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/Forms/LoginForm";

export default function Home() {
  return (
    <section className="flex w-full h-screen justify-center items-center">
      <Card className="flex w-[40%] h-fit rounded-md p-5">
        <CardContent className="flex flex-col w-full h-full">
          <CardTitle>
            Login
          </CardTitle>
          <CardContent className="flex w-full h-full p-5">
            <LoginForm />
          </CardContent>
        </CardContent>
      </Card>
    </section>
  );
}
