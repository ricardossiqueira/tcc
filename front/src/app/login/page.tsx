"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "../../components/Forms/Login";
import { RegisterForm } from "../../components/Forms/Register";
import useUser from "../../hooks/useUser";
import Loading from "../../components/Loading";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useRouter();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  useEffect(() => {
    if (user) {
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
            {isLogin ? (
              <LoginForm onToggleForm={toggleForm} />
            ) : (
              <RegisterForm onToggleForm={toggleForm} />
            )}
          </div>
        </div>
      </section>
    );

  return <Loading />;
}
