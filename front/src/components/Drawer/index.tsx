import {
  Drawer as DrawerUI,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer.tsx";
import { Counter } from "./Counter.tsx";
import React from "react";
import { Button } from "../ui/button.tsx";

export default function Drawer() {
  return (
    <DrawerUI>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-3 w-full">
          <DrawerHeader>
            <DrawerTitle>Terminal</DrawerTitle>
          </DrawerHeader>
          <div className="w-full h-60">
            <Counter />
          </div>
        </div>
      </DrawerContent>
    </DrawerUI>
  );
}
