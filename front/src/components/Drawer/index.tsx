import {
  Drawer as DrawerUI,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer.tsx";
import React from "react";
import { Button } from "../ui/button.tsx";

export default function Drawer(
  props: { buttonTitle: string; children: React.ReactNode },
) {
  return (
    <DrawerUI>
      <DrawerTrigger asChild>
        <Button variant="outline">{props.buttonTitle}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-3 w-full">
          <DrawerHeader>
            <DrawerTitle>Terminal</DrawerTitle>
          </DrawerHeader>
          <div className="w-full h-60">
            {props.children}
          </div>
        </div>
      </DrawerContent>
    </DrawerUI>
  );
}
