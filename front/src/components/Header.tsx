"use client"

import { ModeToggle } from "./ThemeDropdown";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header
      className="dark:bg-black bg-white border-b px-5 flex w-full items-center h-12 justify-between top-0 sticky z-10"
      aria-label="Header"
    >
      <ul className="flex flex-row items-center">
        <li className="font-normal text-lg px-3">
          Logo
        </li>
        <li className="font-normal text-base px-3">
          <Button variant="link" aria-label="Home">
            Home
          </Button>
        </li>
      </ul>
      <ModeToggle />
    </header>
  );
}
