import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (userId, onIncomingMessage, onNotification, onFileNotify) => {
  const ws = useRef(null);
  const stableUserId = useRef(userId);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Get user ID from local storage as fallback
  const getUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser?.id;
      }
    } catch (error) {
      console.error("Error getting user from storage:", error);
    }
    return null;
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.connected) {
      setIsConnected(true);
      return;
    }
    
    if (ws.current) {
      console.log("Cleaning up existing socket connection");
      ws.current.removeAllListeners();
      ws.current.disconnect();
    }
    
    // Try to get userId from different sources
    const effectiveUserId = stableUserId.current || getUserFromStorage();
    
    if (!effectiveUserId) {
      console.warn("No user ID provided for socket connection");
      reconnectAttempts.current += 1;
      
      // Try to reconnect a few times if no userId is available yet
      if (reconnectAttempts.current <= maxReconnectAttempts) {
        setTimeout(() => {
          connect();
        }, 2000); // Try again in 2 seconds
      }
      return;
    }
    
    reconnectAttempts.current = 0; // Reset reconnect attempts
    console.log(`Attempting to connect socket for user ID: ${effectiveUserId}`);
    
    const userIdStr = String(effectiveUserId);
    
    try {
      // Use window.location.origin to ensure we connect to the same origin 
      // when using a proxy, which is important for WebSocket connections
      const socketBaseUrl = window.location.origin;
      console.log(`Creating socket connection to: ${socketBaseUrl} with path: /chat/socket.io`);
      
      ws.current = io(socketBaseUrl, {
        path: "/chat/socket.io",
        transports: ["websocket", "polling"], // Fall back to polling if WebSocket fails
        query: { userId: userIdStr, EIO: 4 }, // Explicitly set Engine.IO version
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true, // Create a new connection every time
      });

      ws.current.on("connect", () => {
        console.log("WebSocket connected successfully with ID:", ws.current.id);
        setIsConnected(true);
        ws.current.emit("authenticate", { userId: userIdStr });
      });

      ws.current.on("authenticated", () => {
        console.log("Socket authenticated successfully");
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
      
      // File notification handlers
      ws.current.on("fileSendNotify", (data) => {
        console.log("Received file notification (direct):", data);
        if (onFileNotify) {
          if (data.uploadedFiles && Array.isArray(data.uploadedFiles)) {
            // Handle multiple files
            data.uploadedFiles.forEach(file => {
              onFileNotify({
                type: "direct",
                sender: data.sender,
                file: file,
                chatId: data.receiver, // Chat partner ID
                chatName: file.chatName || null,
                messageId: file.messageId || null
              });
            });
          } else if (data.uploadedFiles && data.uploadedFiles.data) {
            // Handle legacy format
            data.uploadedFiles.data.forEach(file => {
              onFileNotify({
                type: "direct",
                sender: data.sender,
                file: file,
                chatId: data.receiver,
                chatName: file.chatName || null,
                messageId: file.messageId || null
              });
            });
          } else if (data.file) {
            // Single file format
            onFileNotify({
              type: "direct",
              sender: data.sender,
              file: data.file,
              chatId: data.receiver,
              chatName: data.chatName || null,
              messageId: data.messageId || null
            });
          }
        }
      });
      
      ws.current.on("grpFileSendNotify", (data) => {
        console.log("Received file notification (channel):", data);
        if (onFileNotify) {
          if (data.uploadedFiles && Array.isArray(data.uploadedFiles)) {
            // Handle multiple files
            data.uploadedFiles.forEach(file => {
              onFileNotify({
                type: "channel",
                sender: { _id: data.userId, username: file.sender?.username || "Unknown" },
                file: file,
                channelId: data.channelId,
                channelName: file.channelName || null,
                messageId: file.messageId || null
              });
            });
          } else if (data.uploadedFiles && data.uploadedFiles.data) {
            // Handle legacy format
            data.uploadedFiles.data.forEach(file => {
              onFileNotify({
                type: "channel",
                sender: { _id: data.userId, username: file.sender?.username || "Unknown" },
                file: file,
                channelId: data.channelId,
                channelName: file.channelName || null,
                messageId: file.messageId || null
              });
            });
          } else if (data.file) {
            // Single file format
            onFileNotify({
              type: "channel",
              sender: { _id: data.userId, username: data.file.sender?.username || "Unknown" },
              file: data.file,
              channelId: data.channelId,
              channelName: data.channelName || null,
              messageId: data.messageId || null
            });
          }
        }
      });
      
      ws.current.on("fileUploaded", (data) => {
        console.log("File uploaded event:", data);
      });
      
      ws.current.on("filesUploaded", (data) => {
        console.log("Files uploaded event:", data);
      });
      
      ws.current.on("messageSent", (data) => {
        console.log("Message sent confirmation:", data);
      });

      ws.current.on("disconnect", (reason) => {
        console.warn("WebSocket disconnected:", reason);
        setIsConnected(false);
        
        // Auto-reconnect if disconnected unexpectedly
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            console.log("Attempting reconnection after disconnect:", reason);
            connect();
          }, 1000);
        }
      });

      ws.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        setIsConnected(false);
        
        // Retry connection after delay
        setTimeout(() => {
          console.log("Attempting reconnection after connection error");
          connect();
        }, 2000);
      });
      
      ws.current.on("error", (error) => {
        console.error("Socket error:", error);
      });
      
      // Add a success message once we've set up all event handlers
      console.log("Socket event handlers registered, waiting for connection...");
      
    } catch (error) {
      console.error("Error setting up WebSocket connection:", error);
      setIsConnected(false);
      
      // Try to reconnect after error in socket setup
      setTimeout(() => {
        console.log("Retrying connection after socket setup error");
        connect();
      }, 3000);
    }
  }, [onIncomingMessage, onNotification, onFileNotify, getUserFromStorage]);

  useEffect(() => {
    // Update stableUserId ref when prop changes
    if (userId) {
      stableUserId.current = userId;
    }
    
    // Only try to connect if we don't have a connection already
    if (!ws.current?.connected) {
      connect();
    }
    
    return () => {
      if (ws.current) {
        console.log("Disconnecting WebSocket");
        ws.current.removeAllListeners();
        ws.current.disconnect();
        ws.current = null;
        setIsConnected(false);
      }
    };
  }, [userId, connect]);

  // Update connection when userId changes
  useEffect(() => {
    if (userId && userId !== stableUserId.current) {
      stableUserId.current = userId;
      
      // Reconnect with new user ID if we had a previous connection
      if (ws.current) {
        console.log("User ID changed, reconnecting...");
        connect();
      }
    }
  }, [userId, connect]);

  const sendMessage = useCallback((payload) => {
    if (ws.current?.connected) {
      console.log("Sending message:", payload);
      try {
        if (payload.type === "direct_message") {
          ws.current.emit("message", payload);
        } else {
          ws.current.emit("grpMessage", payload);
        }
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    } else {
      console.warn("WebSocket not connected; attempting to reconnect before sending message");
      connect();
      // Return false to indicate message wasn't sent
      return false;
    }
  }, [connect]);

  // Return the socket reference so it can be used directly
  return { 
    sendMessage, 
    isConnected,
    getSocket: () => ws.current,
    reconnect: connect // Export reconnect function for external use
  };
};