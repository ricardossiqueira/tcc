"use client";

import { useEffect, useState } from "react";

export const Counter = () => {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8090/api/sse");

    eventSource.onopen = () => console.log(">>> connection opened");

    eventSource.onmessage = (event) => {
      const newMessage = event.data;
      setMessages((prevMessages: string[]) => [...prevMessages, newMessage]);
    };

    eventSource.onerror = (error) => {
      console.log(">>> failed: ", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return messages.map((v, i) => (
    <p className="font-JetBrainsMono" key={i}>{"🚀"} {v}</p>
  ));
};
