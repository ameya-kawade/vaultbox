"use client"

import { useCallback, useEffect, useState, useMemo } from "react"
import { useChat } from "../hooks/useChat"
import ChatLayout from "../components/ChatLayout"
import { useAuth } from "@login/context/auth"
import { useNotifications } from "../../notifications/NotificationContext"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import ChatService from "../../../services/chatService"
import { toast } from "sonner"
import { useCipher } from '@/components/Layout/Layout'
import { encryptText } from "../utils/encryption"

const Channels = () => {
  const {
    chats: channels,
    currentChat,
    setCurrentChat,
    messages,
    setMessages,
    users,
    error,
    fetchMessages,
    uploadFile,
    sendMessage,
    socketConnected,
    loading
  } = useChat("channel")

  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const userId = user?.id

  // Channel creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Access cipher mode from context
  const { cipherMode } = useCipher()

  if (!user || !userId) {
    return <div>Loading user data...</div>
  }

  const handleSendMessage = useCallback((content) => {
    if (!currentChat || !content.trim()) return;
    
    // Create optimistic message
    const tempId = `temp_${Date.now()}`;
    const createdAt = new Date().toISOString(); // Ensure ISO string format for dates
    const messagePayload = {
      _id: tempId,
      type: "channel_message",
      channelId: currentChat._id,
      senderId: userId,
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
      type: "channel_message",
      channelId: currentChat._id,
      senderId: userId,
      content
    };
    
    // Send the message
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
    
  }, [currentChat, userId, user?.username, sendMessage, setMessages]);

  // Create new channel
  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) {
      toast.error("Channel name is required")
      return
    }

    setIsCreating(true)
    try {
      const response = await ChatService.createChannel(newChannel)
      toast.success("Channel created successfully")
      setIsCreateDialogOpen(false)
      setNewChannel({ name: "", description: "" })
      
      // Refresh the channels list
      if (refreshChats) {
        refreshChats();
      } else {
        // Fallback to fetch channels directly via API 
        const channelsResp = await ChatService.getChannels();
        if (channelsResp.success && channelsResp.msg?.channels) {
          setChats(channelsResp.msg.channels);
        }
      }
    } catch (error) {
      toast.error("Failed to create channel")
      console.error("Error creating channel:", error)
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (currentChat) {
      console.log("Selected channel:", currentChat.name);
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

  if (error) return <div>Error: {error}</div>

  return (
    <>
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold">Channels</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Channel
        </Button>
      </div>

      <ChatLayout
        chatType="channel"
        chats={channels}
        currentChat={currentChat}
        setCurrentChat={setCurrentChat}
        messages={processedMessages}
        onSendMessage={handleSendMessage}
        onFileUpload={uploadFile}
        userId={userId}
        isConnected={socketConnected}
        isSending={sendingMessage}
        loading={loading}
      />

      {/* Create Channel Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="channel-name" className="text-sm font-medium">
                Channel Name
              </label>
              <Input
                id="channel-name"
                placeholder="e.g. general"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="channel-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="channel-description"
                placeholder="What is this channel about?"
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Channels

