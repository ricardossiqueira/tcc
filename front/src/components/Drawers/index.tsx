import {
  Drawer as DrawerUI,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import React from "react";

export interface IDrawerProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

export default function Drawer(
  props: IDrawerProps,
) {
  return (
    <DrawerUI>
      <DrawerTrigger asChild >
        {props.children}
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-3 w-full">
          <DrawerHeader>
            <DrawerTitle>Terminal</DrawerTitle>
          </DrawerHeader>
          <div className="w-full h-60">
            {props.content}
          </div>
        </div>
      </DrawerContent>
    </DrawerUI>
  );
}
