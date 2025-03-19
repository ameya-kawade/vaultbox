"use client"

import { useCallback, useEffect, useState } from "react"
import { useChat } from "../hooks/useChat"
import { useWebSocket } from "../hooks/useWebSocket"
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
    refreshChats,
  } = useChat("channel")

  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const userId = user?.id

  // Channel creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newChannel, setNewChannel] = useState({ name: "", description: "" })
  const [isCreating, setIsCreating] = useState(false)

  if (!user || !userId) {
    return <div>Loading user data...</div>
  }

  // Handle incoming group messages.
  const handleGrpMessage = useCallback(
    (newMsg) => {
      console.log("New group message received:", newMsg)
      if (!newMsg.senderName) {
        const sender = users.find((u) => String(u._id) === String(newMsg.senderId))
        newMsg.senderName = sender ? sender.username : "Unknown"
      }

      // If message is for current channel, add to messages
      if (currentChat && newMsg.channelId === currentChat._id) {
        setMessages((prev) => [...prev, newMsg])
      } else {
        // If message is for another channel, create notification
        const targetChannel = channels.find((c) => c._id === newMsg.channelId)
        if (targetChannel) {
          addNotification({
            title: `New message in #${targetChannel.name}`,
            message: `${newMsg.senderName}: ${newMsg.content}`,
            chatId: newMsg.channelId,
            chatType: "channel",
          })

          // Update unread count for the channel
          refreshChats()
        }
      }
    },
    [currentChat, setMessages, users, channels, addNotification, refreshChats],
  )

  // Handle incoming notifications.
  const handleNotification = useCallback(
    (notificationData) => {
      console.log("New notification received:", notificationData)
      // Map content to message if message isn't provided.
      addNotification({
        ...notificationData,
        message: notificationData.message || notificationData.content,
      })
    },
    [addNotification],
  )

  const { sendMessage } = useWebSocket(userId, handleGrpMessage, handleNotification)

  const handleSendMessage = (content) => {
    if (!currentChat) return
    const messagePayload = {
      type: "channel_message",
      channelId: currentChat._id,
      senderId: userId,
      content,
      createdAt: new Date().toISOString(),
    }
    sendMessage(messagePayload)
    setMessages((prev) => [...prev, { ...messagePayload, senderName: user.username }])
  }

  // Create new channel
  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) {
      toast.error("Channel name is required")
      return
    }

    setIsCreating(true)
    try {
      await ChatService.createChannel(newChannel)
      toast.success("Channel created successfully")
      setIsCreateDialogOpen(false)
      setNewChannel({ name: "", description: "" })
      refreshChats() // Refresh the channels list
    } catch (error) {
      toast.error("Failed to create channel")
      console.error("Error creating channel:", error)
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    if (currentChat) {
      setMessages([])
      fetchMessages(currentChat)
    }
  }, [currentChat, fetchMessages, setMessages])

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
        messages={messages}
        onSendMessage={handleSendMessage}
        onFileUpload={uploadFile}
        userId={userId}
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

