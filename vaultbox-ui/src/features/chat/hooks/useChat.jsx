import { useState, useEffect, useCallback, useRef } from 'react';
import ChatService from '../../../services/chatService';
import { toast } from 'sonner';
import { useWebSocket } from './useWebSocket';
import { FileIcon } from 'lucide-react';

// User authentication import
import { useAuth } from '../../../features/login/context/auth';

export const useChat = (chatType) => {
  const { user } = useAuth(); // Get authenticated user
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // For channels, these are the channel members
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiverPublicKey, setReceiverPublicKey] = useState(null);
  const [userId, setUserId] = useState(user?.id || null);
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Update userId if user changes
  useEffect(() => {
    if (user?.id && user.id !== userId) {
      setUserId(user.id);
      console.log("Updated user ID in useChat:", user.id);
    }
  }, [user, userId]);

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
    setMessages([]); // Clear messages immediately to prevent seeing old messages briefly
    
    try {
      let data;
      if (chatType === "direct") {
        data = await ChatService.getDirectMessages(chat._id);
      } else {
        data = await ChatService.getChannelMessages(chat._id);
      }

      if (!data || !data.success || !data.msg) {
        console.error("Invalid data received:", data);
        setMessages([]);
        return;
      }

      // Set receiver's public key if it exists
      if (chatType === "direct" && data.msg.receiverPublicKey) {
        setReceiverPublicKey(data.msg.receiverPublicKey);
      }

      if (!Array.isArray(data.msg.messages)) {
        setMessages([]);
        return;
      }

      // Process messages
      const processedMessages = data.msg.messages.map((msg) => {
        const sender = users.find((u) => Number(u._id) === Number(msg.senderId));
        return {
          ...msg,
          senderName: sender?.username || msg.senderName || "Unknown",
        };
      });

      // Add any orphaned files as separate messages
      const orphanedFileMessages = [];
      if (data.msg.orphanedFiles && Array.isArray(data.msg.orphanedFiles) && data.msg.orphanedFiles.length > 0) {
        // Filter orphaned files to ensure they belong to the current chat context
        const filteredOrphanedFiles = data.msg.orphanedFiles.filter(file => {
          if (chatType === "direct") {
            // For direct messages, only include files where:
            // 1. Current user is the sender and chat partner is the receiver, OR
            // 2. Chat partner is the sender and current user is the receiver
            const isUserSender = String(file.userId) === String(userId);
            const isPartnerReceiver = !file.receiverId || String(file.receiverId) === String(chat._id);
            const isPartnerSender = String(file.userId) === String(chat._id);
            const isUserReceiver = !file.receiverId || String(file.receiverId) === String(userId);
            
            return (isUserSender && isPartnerReceiver) || (isPartnerSender && isUserReceiver);
          } else if (chatType === "channel") {
            // For channels, ensure files belong to this channel
            return String(file.channelId) === String(chat._id);
          }
          return false;
        });
        
        // Group files by uploadedAt time and userId to combine files uploaded together by the same user
        const filesByTime = filteredOrphanedFiles.reduce((groups, file) => {
          const uploadTime = new Date(file.uploadedAt);
          // Round to the nearest minute to group files uploaded at similar times
          const timeKey = `${file.userId}_${new Date(
            uploadTime.getFullYear(),
            uploadTime.getMonth(),
            uploadTime.getDate(),
            uploadTime.getHours(),
            uploadTime.getMinutes()
          ).toISOString()}`;
          
          if (!groups[timeKey]) {
            groups[timeKey] = [];
          }
          groups[timeKey].push(file);
          return groups;
        }, {});

        // Create a message for each group of files
        Object.entries(filesByTime).forEach(([timeKey, files]) => {
          // Extract just the ISO date portion if the timeKey format is userId_date
          const dateStr = timeKey.includes('_') ? timeKey.split('_')[1] : timeKey;
          
          // Safely create a date with validation
          let fileTime;
          try {
            fileTime = new Date(dateStr);
            // Check if the date is valid
            if (isNaN(fileTime.getTime())) {
              // If invalid, use current time
              fileTime = new Date();
            }
          } catch (e) {
            // If any error in date parsing, use current time
            fileTime = new Date();
          }
          
          const senderId = files[0].userId;
          const sender = users.find((u) => String(u._id) === String(senderId));
          
          orphanedFileMessages.push({
            _id: `file_group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId,
            senderName: sender?.username || "Unknown",
            // Remove explicit text about sharing a file
            content: "", // Empty content so only the files are shown
            createdAt: fileTime.toISOString(),
            files: files,
            isFileMessage: true
          });
        });
      }

      // Combine regular messages and orphaned file messages, then sort by creation time
      const allMessages = [...processedMessages, ...orphanedFileMessages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(allMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err?.message || "Error fetching messages");
    } finally {
      setLoading(false);
    }
  }, [chatType, users, userId]);

  // Handle selecting a new chat
  const handleChatSelect = (chat) => {
    if (!chat || !chat._id) {
      console.error("handleChatSelect: Chat is invalid", chat);
      return;
    }
    
    // If already on this chat, do nothing
    if (chat._id === currentChat?._id) return;
    
    // Reset states when changing chats
    setCurrentChat(chat);
    setMessages([]); // Clear messages immediately
    setError(null); // Clear any previous errors
    
    // Fetch new messages for the selected chat
    fetchMessages(chat);
  };

  // Enhanced file upload method
  const uploadFile = useCallback(async (file) => {
    if (!currentChat || !currentChat._id) {
      console.error("[useChat] Cannot upload file - no current chat selected");
      throw new Error("No chat selected");
    }
    
    console.log("[useChat] Starting file upload for:", file.name, "in chat:", currentChat._id);
    
    // Store tempId outside the try block so it's available in catch
    const tempId = `temp_${Date.now()}`;
    
    try {
      // Create a temporary message with the file
      const createdAt = new Date().toISOString(); // Ensure valid ISO string date
      const tempMessage = {
        _id: tempId,
        senderId: userId || user?.id || '1', // Fallback to '1' if nothing else available
        senderName: 'You',
        content: "", // Empty content
        createdAt,
        // Add proper file structure for preview
        files: [{
          _id: `temp_file_${Date.now()}`,
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          tempFile: true,
          uploadProgress: 0
        }],
        isFileMessage: true,
        isUploading: true
      };
      
      // Add temporary message to show upload progress
      setMessages(prev => [...prev, tempMessage]);
      
      // Upload the file directly - don't create FormData here, it's done in the service
      let response;
      if (chatType === "direct") {
        response = await ChatService.uploadFileToDirect(currentChat._id, file);
      } else {
        response = await ChatService.uploadFileToChannel(currentChat._id, file);
      }
      
      console.log("[useChat] File upload response:", response);
      
      if (!response.success) {
        throw new Error(response.message || "Upload failed");
      }
      
      // The response should contain the uploaded file data
      const uploadedFiles = Array.isArray(response.data) ? response.data : [response.data];
      
      if (uploadedFiles.length === 0) {
        console.warn("[useChat] File uploaded but no file data returned");
        return;
      }
      
      // Process files to ensure consistent structure
      const processedFiles = uploadedFiles.map(f => ({
        _id: f._id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: f.fileName || f.filename || f.name || file.name,
        fileUrl: f.fileUrl || f.url || "",
        fileSize: f.fileSize || f.size || file.size,
        bucketName: f.bucketName || "default-bucket",
        uploadedAt: f.uploadedAt || createdAt,
        userId: userId,
        receiverId: chatType === "direct" ? currentChat._id : null,
        channelId: chatType === "channel" ? currentChat._id : null
      }));
      
      // Extract file IDs for socket message
      const fileIds = processedFiles.map(file => file._id);
      
      // Send socket notification about file upload
      if (socketRef.current && socketRef.current.connected) {
        if (chatType === "direct") {
          socketRef.current.emit('fileSendNotify', {
            sender: userId,
            receiver: currentChat._id,
            uploadedFiles: processedFiles
          });
        } else {
          socketRef.current.emit('grpFileSendNotify', {
            channelId: currentChat._id,
            userId: userId,
            uploadedFiles: processedFiles
          });
        }
      }
      
      // Create a real message with the file attachments to replace the temp message
      const fileMessage = {
        _id: response.messageId || `file_${Date.now()}`,
        senderId: userId || user?.id || '1', 
        senderName: 'You',
        content: "", // Empty content instead of "Shared a file"
        createdAt,
        files: processedFiles,
        fileIds: fileIds,
        isFileMessage: true
      };
      
      console.log("[useChat] Creating file message:", fileMessage);
      
      // Add socket message if we don't have a messageId yet (meaning the server didn't create the message)
      if (!response.messageId && socketRef.current && socketRef.current.connected) {
        // Send a socket message with the file IDs
        if (chatType === "direct") {
          socketRef.current.emit('message', {
            senderId: userId,
            receiverId: currentChat._id, 
            content: "", // Empty content for file messages
            fileIds: fileIds
          });
        } else {
          socketRef.current.emit('grpMessage', {
            channelId: currentChat._id,
            senderId: userId,
            content: "", // Empty content for file messages
            fileIds: fileIds
          });
        }
      }
      
      // Replace the temporary message with the real one
      setMessages(prev => prev.filter(msg => msg._id !== tempId).concat(fileMessage));
      
      return processedFiles;
    } catch (error) {
      console.error("[useChat] Error uploading file:", error);
      
      // Update the temporary message to show the error
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? {
          ...msg,
          content: `Error: ${file.name}`, // Clear error message
          isUploading: false,
          isError: true
        } : msg
      ));
      
      toast.error(`Failed to upload ${file.name}`);
      throw error;
    }
  }, [currentChat, chatType, userId, user?.id, socketRef, setMessages]);

  // Function to handle file notification
  const handleFileNotify = useCallback((notification) => {
    console.log("File notification received", notification);
    
    // Create notification toast with enhanced file information
    if (notification.uploadedFiles || notification.file) {
      const { sender, file, chatId, channelId, messageId, uploadedFiles, receiver } = notification;
      
      // Determine if we have a single file or multiple files
      const files = uploadedFiles || (file ? [file] : []);
      
      // Make sure we have proper chat/channel ID
      if ((!chatId && !channelId && !receiver) || files.length === 0) {
        console.error("Invalid file notification, missing chatId/channelId/receiver or files", notification);
        return;
      }
      
      // If we have a receiver, use it as chatId for direct messages
      const effectiveChatId = chatId || receiver;
      
      // Only process notifications that belong to the currently selected context (direct/channel)
      const isDirectMessage = chatType === "direct" && effectiveChatId;
      const isChannelMessage = chatType === "channel" && channelId;
      
      if (!isDirectMessage && !isChannelMessage) {
        console.log("Ignoring file notification that doesn't match current chat type", {
          chatType, hasChannelId: !!channelId, hasChatId: !!effectiveChatId
        });
        return;
      }
      
      // In direct messages, ensure user is part of the conversation
      if (isDirectMessage && 
         String(effectiveChatId) !== String(currentChat?._id) && 
         String(effectiveChatId) !== String(userId) &&
         String(sender) !== String(userId)) {
        console.log("Ignoring direct message file - not part of this conversation", {
          chatId: effectiveChatId, currentChatId: currentChat?._id, userId
        });
        return;
      }
      
      // Determine if this notification is for the current chat/channel
      const isCurrentChatNotification = 
        (isDirectMessage && currentChat && (
          String(currentChat._id) === String(effectiveChatId) || 
          String(currentChat._id) === String(sender)
        )) || 
        (isChannelMessage && currentChat && String(currentChat._id) === String(channelId));
      
      // Only add to messages if it belongs to the current chat
      if (isCurrentChatNotification) {
        const createdAt = new Date().toISOString(); // Ensure valid ISO string date
        const senderId = sender || notification.sender;
        
        // Process each file to ensure it has all required properties
        const processedFiles = files.map(f => ({
          _id: f._id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: f.fileName || f.filename || f.name || "File",
          fileUrl: f.fileUrl || f.url || "",
          fileSize: f.fileSize || f.size || 0,
          bucketName: f.bucketName || "default-bucket",
          uploadedAt: f.uploadedAt || createdAt,
          userId: senderId,
          receiverId: isDirectMessage ? effectiveChatId : null,
          channelId: isChannelMessage ? channelId : null
        }));
        
        // Create a file message
        const fileMessage = {
          _id: messageId || `file-${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: typeof senderId === 'object' ? senderId._id : senderId,
          senderName: typeof senderId === 'object' ? senderId.username : 
                     (notification.senderName || "Unknown"),
          // Remove the text about sharing a file
          content: "", // Empty content to just show the file
          createdAt,
          files: processedFiles,
          isFileMessage: true
        };
        
        // Add to messages immediately
        setMessages((prev) => [...prev, fileMessage]);
      }
      
      // Create toast notification only if it's not for the current chat
      if (!isCurrentChatNotification) {
        const senderName = typeof sender === 'object' ? sender.username : notification.senderName || "Someone";
        const fileName = files[0]?.fileName || files[0]?.filename || files[0]?.name || "File";
        const chatName = notification.chatName || "a chat";
        const channelName = notification.channelName || "a channel";
        
        // Show toast notification
        toast.info(
          <div className="flex flex-col gap-1">
            <span><strong>{senderName}</strong> shared a file in {isDirectMessage ? chatName : channelName}</span>
            <span className="text-xs flex items-center">
              <FileIcon className="h-3 w-3 mr-1" /> {fileName}
            </span>
          </div>,
          {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => {
                // Navigate to that chat/channel
                if (isDirectMessage && effectiveChatId) {
                  const targetChat = chats.find(c => String(c._id) === String(effectiveChatId));
                  if (targetChat) {
                    setCurrentChat(targetChat);
                  }
                } else if (isChannelMessage && channelId) {
                  const targetChannel = chats.find(c => String(c._id) === String(channelId));
                  if (targetChannel) {
                    setCurrentChat(targetChannel);
                  }
                }
              },
            },
          }
        );
      }
    }
  }, [chatType, currentChat, chats, setCurrentChat, setMessages, userId]);
  
  // Define message handling functions
  const handleIncomingMessage = useCallback((newMsg) => {
    console.log(`[useChat] Received message (${chatType}):`, newMsg);

    if (!newMsg || (!newMsg.senderId && chatType === "direct") || (!newMsg.channelId && chatType === "channel")) {
      console.warn("Invalid message received:", newMsg);
      return;
    }

    if (chatType === "direct") {
      // Validate that the message is for this user or from this user
      const isMessageParticipant = 
        String(newMsg.senderId) === String(userId) || 
        String(newMsg.receiverId) === String(userId);
      
      if (!isMessageParticipant) {
        console.warn("Received direct message not intended for this user:", newMsg);
        return;
      }
      
      // Add sender name if missing
      if (!newMsg.senderName) {
        if (String(newMsg.senderId) === String(userId)) {
          newMsg.senderName = "You";
        } else {
          // Try to find sender name from contacts
          const sender = chats.find(chat => String(chat._id) === String(newMsg.senderId));
          newMsg.senderName = sender ? sender.username : `User ${String(newMsg.senderId).slice(0, 5)}`;
        }
      }

      // Add to messages if it's for the current chat
      const isForCurrentChat = currentChat && 
        (String(newMsg.senderId) === String(currentChat._id) || 
         String(newMsg.receiverId) === String(currentChat._id));
      
      if (isForCurrentChat) {
        // Add message with a short delay for smooth animation
        setTimeout(() => {
          setMessages(prev => [...prev, newMsg]);
        }, 100);
      }
    } else {
      // Validate the channel message is for a channel the user is in
      const isUserInChannel = chats.some(c => String(c._id) === String(newMsg.channelId));
      
      if (!isUserInChannel) {
        console.warn("Received channel message for channel user is not in:", newMsg);
        return;
      }
      
      // Add sender name if missing
      if (!newMsg.senderName) {
        // Try to find sender name from users list
        const sender = users.find(u => String(u._id) === String(newMsg.senderId));
        newMsg.senderName = sender ? sender.username : "Unknown";
      }

      // If message is for current channel, add to messages
      if (currentChat && String(newMsg.channelId) === String(currentChat._id)) {
        // Add message with a short delay for smooth animation
        setTimeout(() => {
          setMessages(prev => [...prev, newMsg]);
        }, 100);
      }
    }
  }, [chatType, userId, currentChat, chats, users]);

  // Handle notification messages
  const handleNotification = useCallback((notification) => {
    console.log(`[useChat] Received notification:`, notification);
    // Notifications will be handled by the notification context
  }, []);
  
  // Get the socket connection
  const { sendMessage: sendWebSocketMessage, isConnected, getSocket } = useWebSocket(
    userId,
    handleIncomingMessage,
    handleNotification,
    handleFileNotify
  );
  
  // Update socket connection status
  useEffect(() => {
    setSocketConnected(isConnected);
  }, [isConnected]);
  
  // Store the socket reference
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socketRef.current = socket;
      console.log('[useChat] Socket reference updated');
    }
  }, [getSocket, isConnected]);

  // Enhanced message sending with retries
  const sendMessage = useCallback((payload) => {
    if (!socketRef.current) {
      console.warn('Socket reference not available, getting fresh reference');
      socketRef.current = getSocket();
    }
    
    const success = sendWebSocketMessage(payload);
    if (!success) {
      // If sending failed, try once more after a short delay
      setTimeout(() => {
        console.log('Retrying message send...');
        sendWebSocketMessage(payload);
      }, 500);
    }
    
    return success;
  }, [sendWebSocketMessage, getSocket]);

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
    uploadFile,
    receiverPublicKey,
    sendMessage,
    socketConnected
  };
};
