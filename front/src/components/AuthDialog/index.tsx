import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoginForm from "../Forms/LoginForm";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import RegisterForm from "../Forms/RegisterForm";

export function LoginDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-6 py-3 text-lg text-white font-semibold rounded-md transition duration-300 hover:text-shadow-neon-text">
          Try it out!
        </button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-none" hideClose>
        <DialogTitle className="hidden">Login/Register</DialogTitle>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="p-2">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="p-2">
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
              </CardHeader>
              <CardContent>
                <RegisterForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
