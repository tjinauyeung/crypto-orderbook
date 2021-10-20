import { useEffect, useRef, useState } from "react";
import { SocketState } from "../types";

type UseWebSocketProps = {
  url: string;
  onMessage;
};

type UseWebSocketResult = {
  sendMessage: (json: unknown) => void;
  status: SocketState;
};

export const useWebSocket = ({
  url,
  onMessage,
}: UseWebSocketProps): UseWebSocketResult => {
  const ws = useRef<WebSocket>(null);
  const [status, setStatus] = useState<SocketState>(SocketState.connecting);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setStatus(SocketState.connected);
    ws.current.onclose = () => setStatus(SocketState.closed);
    ws.current.onerror = () => setStatus(SocketState.error);
    ws.current.onmessage = receiveMessage;
    return () => ws.current.close();
  }, []);

  const receiveMessage = (e: MessageEvent) => {
    let json = {};
    try {
      json = JSON.parse(e.data);
    } catch (e) {
      console.log(
        `Failed to parse message. Reason ${e.message}. Message: ${e}.`
      );
    }
    onMessage(json);
  };

  useEffect(() => {
    if (status === SocketState.connected && queue.length) {
      queue.forEach(msg => sendMessage(msg));
      setQueue([]);
    }
  }, [status, queue]);

  const sendMessage = (message: unknown) => {
    if (status === SocketState.connected) {
      ws.current.send(JSON.stringify(message));
    } else {
      setQueue((messages) => [...messages, message]);
    }
  };

  return {
    sendMessage,
    status,
  };
};
