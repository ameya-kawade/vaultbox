import { useCallback, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useWebSocket } from "../hooks/useWebSocket";
import ChatLayout from "../components/ChatLayout";
import { useAuth } from "@login/context/auth";

const Messages = () => {
  const {
    chats,
    currentChat,
    setCurrentChat,
    messages,
    setMessages,
    error,
    fetchMessages,
    uploadFile,
  } = useChat("direct");

  const { user } = useAuth();
  const userId = user?.id;

  if (!user || !userId) {
    return <div>Loading user data...</div>;
  }

  // Handle incoming direct messages.
  const handleIncomingMessage = useCallback(
    (newMsg) => {
      console.log("New direct message:", newMsg);
      if (!newMsg.senderName) {
        if (newMsg.senderId === userId) {
          newMsg.senderName = "You";
        } else if (currentChat && currentChat.username) {
          newMsg.senderName = currentChat.username;
        } else {
          newMsg.senderName = "Unknown";
        }
      }
      setMessages((prev) => [...prev, newMsg]);
    },
    [setMessages, userId, currentChat]
  );

  // Handle incoming notifications.
  const handleNotification = useCallback((notificationData) => {
    console.log("New notification received:", notificationData);
    // You can integrate with your notifications context here.
  }, []);

  const { sendMessage: sendWebSocketMessage } = useWebSocket(
    userId,
    handleIncomingMessage,
    handleNotification
  );

  const handleSendMessage = useCallback(
    (content) => {
      if (!currentChat) return;
      const messagePayload = {
        type: "direct_message",
        senderId: userId,
        receiverId: currentChat._id,
        content,
        createdAt: new Date().toISOString(),
        senderName: user.username,
      };
      sendWebSocketMessage(messagePayload);
      setMessages((prev) => [...prev, messagePayload]);
    },
    [currentChat, userId, user.username, sendWebSocketMessage, setMessages]
  );

  useEffect(() => {
    if (currentChat) {
      setMessages([]);
      fetchMessages(currentChat);
    }
  }, [currentChat, fetchMessages, setMessages]);

  if (error) return <div>Error: {error}</div>;

  return (
    <ChatLayout
      chatType="direct"
      chats={chats}
      currentChat={currentChat}
      setCurrentChat={(chat) => {
        setCurrentChat(chat);
        setMessages([]);
        fetchMessages(chat);
      }}
      messages={messages}
      onSendMessage={handleSendMessage}
      onFileUpload={uploadFile}
      userId={userId}
    />
  );
};

export default Messages;
