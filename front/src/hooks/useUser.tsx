"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { z } from "zod";
import { api } from "../api/axios";
import type { loginFormSchema, registerFormSchema } from "../zod/auth.js";
import { useToast } from "./useToast";
import React from "react";

const AUTH_USER_ROUTE = "/api/collections/users/auth-with-password";
const REGISTER_USER_ROUTE = "/api/collections/users/records";
const AUTH_REFRESH_ROUTE = "/api/collections/users/auth-refresh";
const REFRESH_INTERVAL = 1000 * 60 * 10; // 10 minutes

export interface Error {
  code: number;
  message: string;
  data: Data;
}

export type Data = object;

export interface User {
  record: Record;
  token: string;
}

export interface Record {
  avatar: string;
  collectionId: string;
  collectionName: string;
  created: string;
  email: string;
  emailVisibility: boolean;
  id: string;
  name: string;
  updated: string;
  username: string;
  verified: boolean;
}

interface UserContextType {
  user: CachedUserProperties | null;
  isLoading: boolean;
  error: Error | undefined;
  fetchUser: (data: z.infer<typeof loginFormSchema>) => void;
  logout: () => void;
  redirect: () => void;
  registerUser: (data: z.infer<typeof registerFormSchema>) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: undefined,
  fetchUser: () => { },
  logout: () => { },
  redirect: () => { },
  registerUser: () => { },
});

export interface CachedUserProperties {
  id: string;
  token: string;
  username: string;
  name: string;
  email: string;
  cacheTime: number;
}

export const UserProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [user, setUser] = useState<CachedUserProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUser = useCallback(
    (data: z.infer<typeof loginFormSchema>) => {
      setIsLoading(true);
      api
        .post<User | Error>(AUTH_USER_ROUTE, data)
        .then((response) => {
          const responseBody = response.data as User;
          const cachedUserProperties = {
            id: responseBody.record.id,
            token: responseBody.token,
            username: responseBody.record.username,
            name: responseBody.record.name,
            email: responseBody.record.email,
            cacheTime: Date.now(),
          };
          setUser(cachedUserProperties);
          localStorage.setItem("user", JSON.stringify(cachedUserProperties));
          router.push("/app");
          toast({
            title: "Login successful",
            description: "Redirecting to app.",
            variant: "success",
          });
        })
        .catch((err) => {
          setError(err.response?.data as Error);
          toast({
            title: "Login failed",
            description: err.response.data.message,
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [router, toast],
  );

  const registerUser = useCallback(
    (data: z.infer<typeof registerFormSchema>) => {
      setIsLoading(true);
      api
        .post<User | Error>(REGISTER_USER_ROUTE, data)
        .then((response) => {
          const responseBody = response.data as User;
          const cachedUserProperties = {
            id: responseBody.record.id,
            token: responseBody.token,
            username: responseBody.record.username,
            name: responseBody.record.name,
            email: responseBody.record.email,
            cacheTime: Date.now(),
          };
          setUser(cachedUserProperties);
          localStorage.setItem("user", JSON.stringify(cachedUserProperties));
          router.push("/app");
          toast({
            title: "Account created successfully",
            description: "Login with your new credentials.",
            variant: "success",
          });
        })
        .catch((err) => {
          setError(err.response?.data as Error);
          toast({
            title: "Error creating account",
            description: err.response?.data?.message,
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [router, toast],
  );

  const redirect = useCallback(() => {
    if (user) router.push("/app");
  }, [router, user]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    toast({
      title: "Logout successful",
      description: "Redirecting to home.",
      variant: "destructive",
    });
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(() => {
    setIsLoading(true);
    api
      .post<User | Error>(AUTH_REFRESH_ROUTE, {})
      .then((response) => {
        const responseBody = response.data as User;
        const cachedUserProperties = {
          id: responseBody.record.id,
          token: responseBody.token,
          username: responseBody.record.username,
          name: responseBody.record.name,
          email: responseBody.record.email,
          cacheTime: Date.now(),
        };
        setUser(cachedUserProperties);
        localStorage.setItem("user", JSON.stringify(cachedUserProperties));
      })
      .catch((err) => {
        setError(err.response?.data as Error);
        logout();
        toast({
          title: "Failed to refresh user",
          description: "Redirecting to login",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout, toast]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    (() => {
      if (storedUser && isLoading) {
        setUser(JSON.parse(storedUser));
        refreshUser();
      }
      setIsLoading(false);
    })();

    if (isLoading) return;

    function onFocus() {
      const cachedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser((user) =>
        cachedUser?.username ? { ...user, ...cachedUser } : null,
      );
      if (REFRESH_INTERVAL < Date.now() - cachedUser?.cacheTime) refreshUser();
    }
    addEventListener("focus", onFocus);

    return () => removeEventListener("focus", onFocus);
  }, [refreshUser, isLoading]);

  const userContextValue: UserContextType = {
    user,
    isLoading,
    error,
    fetchUser,
    logout,
    redirect,
    registerUser,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default function useUser() {
  return useContext(UserContext);
}
