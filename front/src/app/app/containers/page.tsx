"use client";

import React from "react";
import ContainerList from "../../../components/ContainerList";

export default function App() {
  return (
    <div className="max-w-[90%] mx-auto mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Containers</h1>
      </div>
      <ContainerList />
    </div>
  );
}


