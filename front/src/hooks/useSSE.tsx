import { useState, useEffect } from "react";
import useUser from "./useUser";

type EventType = "success" | "created";

interface Event {
  id: string;
  type: EventType;
  data: string;
  timestamp: string;
  user_id: string;
  message: string;
  container_id: string;
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

const useSSE = (url: string): Event | undefined => {
  const [lastEvent, setLastEvent] = useState<Event | undefined>();
  const [retryCount, setRetryCount] = useState(0);

  const {
    user: { token },
  } = useUser();

  const fullUrl = `${url}?token=${encodeURIComponent(token)}`;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    const connect = () => {
      eventSource = new EventSource(fullUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent(data);
          setRetryCount(0);
        } catch {}
      };

      eventSource.onerror = () => {
        eventSource?.close();
        if (retryCount < MAX_RETRIES) {
          const retryDelay = INITIAL_RETRY_DELAY * 2 ** retryCount; // Exponencial backoff
          retryTimeout = setTimeout(connect, retryDelay);
          setRetryCount((prev) => prev + 1);
        }
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(retryTimeout);
    };
  }, [url, token]);

  return lastEvent;
};

export { useSSE };
