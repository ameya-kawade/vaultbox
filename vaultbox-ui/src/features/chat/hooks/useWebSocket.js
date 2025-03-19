import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (userId, onIncomingMessage, onNotification) => {
  const ws = useRef(null);
  const stableUserId = useRef(userId);

  const connect = useCallback(() => {
    if (ws.current?.connected) return;
    if (ws.current) {
      ws.current.removeAllListeners();
      ws.current.disconnect();
    }
    
    if (!stableUserId.current) {
      console.warn("No user ID provided for socket connection");
      return;
    }
    
    console.log(`Attempting to connect socket for user ID: ${stableUserId.current}`);
    
    const userIdStr = String(stableUserId.current);
    
    ws.current = io("/", {
      path: "/chat/socket.io",
      transports: ["websocket"],
      query: { userId: userIdStr },
      withCredentials: true,
      extraHeaders: { Cookie: document.cookie },
      autoConnect: true,
      reconnection: true,
    });

    ws.current.on("connect", () => {
      console.log("WebSocket connected with ID:", ws.current.id);
      ws.current.emit("authenticate", { userId: userIdStr });
    });

    ws.current.on("grpMessage", (msg) => {
      console.log("Received grpMessage:", msg);
      if (onIncomingMessage) onIncomingMessage(msg);
    });

    ws.current.on("message", (msg) => {
      console.log("Received direct message:", msg);
      if (onIncomingMessage) onIncomingMessage(msg);
    });

    ws.current.on("notification", (notificationData) => {
      console.log("Received notification:", notificationData);
      if (onNotification) onNotification(notificationData);
    });

    ws.current.on("disconnect", (reason) => {
      console.warn("WebSocket disconnected:", reason);
    });

    ws.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    
    ws.current.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }, [onIncomingMessage, onNotification]);

  useEffect(() => {
    stableUserId.current = userId;
    connect();
    
    return () => {
      if (ws.current) {
        console.log("Disconnecting WebSocket");
        ws.current.disconnect();
        ws.current = null;
      }
    };
  }, [userId, connect]);

  const sendMessage = useCallback((payload) => {
    if (ws.current?.connected) {
      console.log("Sending message:", payload);
      if (payload.type === "direct_message") {
        ws.current.emit("message", payload);
      } else {
        ws.current.emit("grpMessage", payload);
      }
    } else {
      console.warn("WebSocket not connected; message not sent");
      connect();
    }
  }, [connect]);

  return { sendMessage };
};
