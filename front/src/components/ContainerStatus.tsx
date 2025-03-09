import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "./ui/tooltip";
import { Dot } from "lucide-react";

export interface IContainerStatusProps {
  status: string;
}

export default function ContainerStatus({ status }: IContainerStatusProps) {
  return (
    <Tooltip>
      <TooltipProvider>
        <TooltipContent>Container status</TooltipContent>
        <TooltipTrigger>
          <span className="p-1 rounded-sm cursor-default text-base flex items-center space-x-1">
            {status === "Up" ? (
              <Dot className="text-green-500 scale-[2]" />
            ) : (
              <Dot className="text-red-500 scale-[2]" />
            )}
            <p className="pr-2">{status}</p>
          </span>
        </TooltipTrigger>
      </TooltipProvider>
    </Tooltip>
  );
}
