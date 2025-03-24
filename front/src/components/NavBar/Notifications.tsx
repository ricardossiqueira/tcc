import { api } from "../../api/axios";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useSSE } from "../../hooks/useSSE";
import useUser from "../../hooks/useUser";
import { Button } from "../ui/button";

interface NotificationCreatedProps {
  timestamp: string;
  containerId: string;
  callback?: () => void;
}

function NotificationCreated({
  timestamp,
  containerId,
}: NotificationCreatedProps) {
  const { push } = useRouter();
  return (
    <div
      className="p-[2px] bg-gradient-to-r from-purple-400 to-pink-600 rounded-md cursor-pointer mr-4"
      onClick={() => {
        push(`/app/containers/${containerId}`);
      }}
    >
      <div className="flex items-center gap-2">
        <div className="bg-muted rounded-md py-1 px-4 text-right flex flex-col">
          <span className="text-xs text-zinc-300">
            {dayjs(timestamp).format("MMM, DD HH:mm")}
          </span>
          <span className="text-sm">Container created successfully!</span>
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  const { user } = useUser();
  const event = useSSE(`${api.getUri()}/sse/notifications/${user.id}`);

  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={event ? event.id + "data" : "data"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {event?.type === "created" ? (
            <NotificationCreated
              timestamp={event?.timestamp}
              containerId={event?.container_id}
            />
          ) : (
            <div
              className={
                event &&
                "mr-4 rounded-md bg-muted py-1 px-4 text-sm flex flex-col text-right"
              }
            >
              <span className="text-xs text-zinc-300">
                {event && dayjs(event?.timestamp).format("MMM, DD HH:mm")}
              </span>
              <span className="text-sm">{event?.message}</span>
            </div>
          )}
        </motion.div>
        <motion.div
          key={event ? event.id + "icon" : "icon"}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="z-10"
        >
          <Button
            variant="ghost"
            className="rounded-full"
            onClick={() => void api.get("/sse/test")}
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export { Notifications };
