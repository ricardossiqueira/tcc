import { ContainerStatuses } from "../../api/containers"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"


interface ContainerStatusBadgeProps {
  status: ContainerStatuses
  className?: string
}

export function ContainerStatusBadge({ status, className }: ContainerStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        {
          "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400": status === "Up",
          // "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400": status === undefined,
          "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400": status === "Stopped",
          // "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400": status === undefined,
        },
        className,
      )}
    >
      {status}
    </Badge>
  )
}

