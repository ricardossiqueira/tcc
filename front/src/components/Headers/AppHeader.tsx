"use client";

import React from "react";
import NavBreadcrumb from "./Breadcrumb";

export function AppHeader() {
  return (
    <header
      className=" flex w-full items-center h-16 justify-between top-0 sticky z-10"
      aria-label="Header"
    >
      <div className="flex flex-row items-center space-x-8">
        <span className="font-normal text-lg">
          Logo
        </span>
        <span>
          <NavBreadcrumb />
        </span>
      </div>
    </header>
  );
}
