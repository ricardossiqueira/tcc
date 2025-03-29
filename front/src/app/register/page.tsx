"use client";

import { useEffect, useState } from "react";
import { RegisterForm } from "../../components/Forms/Register";
import useUser from "../../hooks/useUser";
import Loading from "../../components/Loading";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter();

  const toggleForm = () => {
    push("/login");
  };

  useEffect(() => {
    if (user?.token) {
      push("/app");
    } else {
      setIsLoading(false);
    }
  }, [user, push]);

  if (!isLoading)
    return (
      <section>
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm md:max-w-3xl">
            <RegisterForm onToggleForm={toggleForm} />
          </div>
        </div>
      </section>
    );

  return <Loading />;
}
