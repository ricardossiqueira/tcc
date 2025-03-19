import { useState, useEffect } from "react";

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

const useSSE = (url: string): Event => {
  const [lastEvent, setLastEvent] = useState<Event | undefined>();

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);
      } catch (error) {
        console.log("Erro ao parsear JSON:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.log("Erro na conexão SSE:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return lastEvent;
};

export { useSSE };
