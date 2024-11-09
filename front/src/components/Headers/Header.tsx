"use client";

import React from "react";
import { Button } from "../ui/button";
import useUser from "../../hooks/useUser";
import { LoginDialog } from "../AuthDialog/index";

export function Header() {
  const { logout, user } = useUser();

  return (
    <header
      className="bg-black/30 backdrop-blur-sm px-[7%] flex w-screen items-center h-16 justify-between top-0 sticky z-10"
      aria-label="Header"
    >
      <ul className="flex flex-row items-center">
        <li className="font-normal text-lg px-3">
          Logo
        </li>
      </ul>
      <div className="flex items-center">
        {user
          ? (
            <Button variant="ghost" onClick={() => logout()}>
              Logout
            </Button>
          )
          : <LoginDialog />}
      </div>
    </header>
  );
}
