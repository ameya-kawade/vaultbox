import { useState, useEffect, useCallback } from 'react';
import ChatService from '../../../services/chatService';

export const useChat = (chatType) => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // For channels, these are the channel members
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch channels or direct contacts
  const fetchChats = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (chatType === "direct") {
        response = await ChatService.getContacts(); // Fetch direct chat contacts
        if (response.success && Array.isArray(response.data)) {
          console.log("Contacts received:", response.data);
          setChats(response.data);
        } else {
          setChats([]);
        }
      } else {
        response = await ChatService.getChannels(); // Fetch channels
        if (response.success && response.msg && Array.isArray(response.msg.channels)) {
          console.log("Channels received:", response.msg.channels);
          setChats(response.msg.channels);
        } else {
          setChats([]);
        }
      }
    } catch (err) {
      setError(err?.message || "Error fetching chats");
    } finally {
      setLoading(false);
    }
  }, [chatType]);

  // Fetch channel members when a channel is selected
  const fetchUsers = useCallback(async () => {
    try {
      if (chatType === "channel" && currentChat && currentChat._id) {
        const response = await ChatService.getChannelMembers(currentChat._id);
        if (response.success && Array.isArray(response.data)) {
          console.log("Channel members received:", response.data);
          setUsers(response.data);
        } else if (response.success && Array.isArray(response.msg)) {
          console.log("Channel members received:", response.msg);
          setUsers(response.msg);
        } else {
          console.warn("No valid channel members data:", response);
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err?.message || "Error fetching users");
    }
  }, [chatType, currentChat]);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chat) => {
    if (!chat || !chat._id) {
      console.error("fetchMessages: Chat object or ID is missing", chat);
      return;
    }

    setLoading(true);
    try {
      let data;
      if (chatType === "direct") {
        data = await ChatService.getDirectMessages(chat._id);
      } else {
        data = await ChatService.getChannelMessages(chat._id);
      }

      if (!data || !data.success || !data.msg || !Array.isArray(data.msg.messages)) {
        console.error("Invalid data received:", data);
        setMessages([]);
        return;
      }

      setMessages((prev) => {
        const messageIds = new Set(prev.map((msg) => msg._id));
        const enrichedMessages = data.msg.messages.map((msg) => {
          const sender = users.find((u) => Number(u._id) === Number(msg.senderId));
          return {
            ...msg,
            senderName: sender?.username || "Unknown",
          };
        });
        const uniqueNewMessages = enrichedMessages.filter((msg) => !messageIds.has(msg._id));
        uniqueNewMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return [...prev, ...uniqueNewMessages];
      });
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err?.message || "Error fetching messages");
    } finally {
      setLoading(false);
    }
  }, [chatType, users]);

  // Handle selecting a new chat
  const handleChatSelect = (chat) => {
    if (!chat || !chat._id) {
      console.error("handleChatSelect: Chat is invalid", chat);
      return;
    }
    if (chat._id === currentChat?._id) return;
    setCurrentChat(chat);
    setMessages([]);
    fetchMessages(chat);
  };

  useEffect(() => {
    fetchChats();
    if (chatType === "channel" && currentChat && currentChat._id) {
      fetchUsers();
    }
  }, [fetchChats, fetchUsers, chatType, currentChat]);

  return {
    chats,
    currentChat,
    setCurrentChat: handleChatSelect,
    messages,
    setMessages,
    users,
    loading,
    error,
    fetchMessages,
    uploadFile: useCallback(async (file) => {
      if (!currentChat) return;
      try {
        if (chatType === "direct") {
          await ChatService.uploadFileToDirect(currentChat._id, file);
        } else {
          await ChatService.uploadFileToChannel(currentChat._id, file);
        }
      } catch (err) {
        setError(err?.message || "Error uploading file");
      }
    }, [currentChat, chatType]),
  };
};
