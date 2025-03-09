"use client"

import type React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import useUser from "../../hooks/useUser"
import { loginFormSchema } from "../../zod/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "../ui/form"
import { GitHubLogoIcon } from "@radix-ui/react-icons"


export function LoginForm({
  className,
  onToggleForm,
  ...props
}: React.ComponentProps<"div"> & { onToggleForm?: () => void }) {
  const { fetchUser, isLoading } = useUser();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { // prenting the form from being uncontrolled
      identity: "",
      password: ""
    }
  });

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    fetchUser(values);
  }


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">Login to your Acme Inc account</p>
                </div>
                <FormField
                  control={form.control}
                  name="identity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Password</FormLabel>
                        <FormLabel>
                          <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                            Forgot your password?
                          </a>
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input placeholder="Password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Login
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full col-start-2">
                    <GitHubLogoIcon />
                    <span className="sr-only">Login with Github</span>
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onToggleForm}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          </Form>

          <div className="relative hidden bg-muted md:block">
            <img
              src="https://placehold.co/400x600?text=Image"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

