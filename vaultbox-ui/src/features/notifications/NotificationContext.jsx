"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useWebSocket } from "../chat/hooks/useWebSocket";

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notifications");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [unreadCount, setUnreadCount] = useState(0);

  // Ensure userId is string
  const userIdStr = userId ? String(userId) : null;

  // Calculate overall unread notifications (could be used for a global counter)
  useEffect(() => {
    setUnreadCount(notifications.filter((notif) => !notif.read).length);
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // addNotification now supports notifications with extra fields like chatType and chatId.
  const addNotification = useCallback((notification) => {
    if (!notification) return;
    
    // Skip self-notifications
    if (notification.senderId === userIdStr) {
      return;
    }
    
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: Date.now(),
      ...notification,
    };
    
    console.log("Adding notification:", newNotification);
    setNotifications((prev) => [newNotification, ...prev]);

    if (Notification.permission === "granted") {
      new Notification(notification.title || "New Notification", {
        body: notification.message || notification.content || "",
      });
    }
  }, [userIdStr]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notifications for a specific chat (channel or direct) as read.
  const markChatNotificationsAsRead = useCallback((chatId) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.chatId === chatId ? { ...notif, read: true } : notif))
    );
  }, []);

  // Setup notification handler function
  const handleNotification = useCallback((notificationData) => {
    console.log("Received notification in handler:", notificationData);
    addNotification(notificationData);
  }, [addNotification]);

  // Initialize WebSocket with proper handlers
  const { sendMessage } = useWebSocket(
    userIdStr, 
    null,  // No message handler needed for notifications
    handleNotification // Pass notification handler
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        markChatNotificationsAsRead,
        sendMessage,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications() {
  return useContext(NotificationsContext);
}
