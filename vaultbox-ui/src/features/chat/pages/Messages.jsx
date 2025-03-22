import { useCallback, useEffect, useMemo, useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatLayout from "../components/ChatLayout";
import { useAuth } from "@login/context/auth";
import { useCipher } from '@/components/Layout/Layout';
import { encryptText } from "../utils/encryption";
import { toast } from "sonner";

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
    sendMessage,
    socketConnected,
    loading
  } = useChat("direct");

  const { user } = useAuth();
  const userId = user?.id;
  const [sendingMessage, setSendingMessage] = useState(false);

  // Access cipher mode from context
  const { cipherMode } = useCipher();

  if (!user || !userId) {
    return <div>Loading user data...</div>;
  }

  const handleSendMessage = useCallback(
    (content) => {
      if (!currentChat || !content.trim()) return;
      
      // Create optimistic message with temporary ID
      const tempId = `temp_${Date.now()}`;
      const createdAt = new Date().toISOString(); // Ensure ISO string format for dates
      const messagePayload = {
        _id: tempId,
        type: "direct_message",
        senderId: userId,
        receiverId: currentChat._id,
        content,
        createdAt,
        senderName: user.username,
        pending: true
      };
      
      // Add optimistic message to UI
      setMessages((prev) => [...prev, messagePayload]);
      setSendingMessage(true);
      
      // Prepare socket message
      const socketPayload = {
        type: "direct_message",
        senderId: userId,
        receiverId: currentChat._id,
        content
      };
      
      // Send through websocket
      const success = sendMessage(socketPayload);
      
      if (!success) {
        // If immediate sending failed, we'll retry automatically (handled in useChat)
        toast.warning("Message queued for delivery", {
          description: "You may be temporarily disconnected. We'll send it when reconnected."
        });
      }
      
      // Update message to mark as sent
      setTimeout(() => {
        setMessages((prev) => 
          prev.map(msg => 
            msg._id === tempId 
              ? { ...msg, pending: false }
              : msg
          )
        );
        setSendingMessage(false);
      }, 500);
    },
    [currentChat, userId, user?.username, sendMessage, setMessages]
  );

  useEffect(() => {
    if (currentChat) {
      console.log("Selected chat:", currentChat.username || currentChat.name);
      setMessages([]);
      fetchMessages(currentChat);
    }
  }, [currentChat?._id, fetchMessages, setMessages]);
  
  useEffect(() => {
    // Update connection status for user feedback
    if (!socketConnected) {
      toast.warning("Connection lost", {
        description: "Reconnecting to server...",
        duration: 3000,
      });
    } else {
      toast.dismiss();
    }
  }, [socketConnected]);

  // Transform messages with encrypted text if cipher mode is enabled
  const processedMessages = useMemo(() => {
    if (!cipherMode) return messages;
    
    return messages.map(message => {
      // Ensure message has a valid createdAt date
      const safeMessage = {
        ...message,
        createdAt: message.createdAt || new Date().toISOString()
      };
      
      // Use a safe fallback for encryption key
      const encryptionKey = String(safeMessage._id || Date.now());
      
      return {
        ...safeMessage,
        content: encryptText(safeMessage.content, encryptionKey)
      };
    });
  }, [messages, cipherMode]);

  if (error) return <div>Error: {error}</div>;

  return (
    <ChatLayout
      chatType="direct"
      chats={chats}
      currentChat={currentChat}
      setCurrentChat={(chat) => {
        setCurrentChat(chat);
      }}
      messages={processedMessages}
      onSendMessage={handleSendMessage}
      onFileUpload={uploadFile}
      userId={userId}
      isConnected={socketConnected}
      isSending={sendingMessage}
      loading={loading}
    />
  );
};

export default Messages;
