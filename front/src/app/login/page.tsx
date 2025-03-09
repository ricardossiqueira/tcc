"use client"

import { useState } from "react"
import { LoginForm } from "../../components/Forms/Login"
import { RegisterForm } from "../../components/Forms/Register"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <section>
      <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          {isLogin ? <LoginForm onToggleForm={toggleForm} /> : <RegisterForm onToggleForm={toggleForm} />}
        </div>
      </div>
    </section>
  )
}

