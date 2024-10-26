import { Button } from "@/components/ui/button";
import {
  Drawer as DrawerUI,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Counter } from "./Counter";

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
