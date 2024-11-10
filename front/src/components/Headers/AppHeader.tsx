"use client";

import React from "react";
import NavBreadcrumb from "./Breadcrumb";

export function AppHeader() {
  return (
    <header
      className="bg-black/5 backdrop-blur-sm rounded-t-md top-0 flex shrink-0 items-center gap-2 px-5 py-3 z-50"
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
