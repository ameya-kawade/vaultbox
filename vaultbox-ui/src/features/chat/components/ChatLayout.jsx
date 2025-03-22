"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import ChatList from "./ChatList"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ChannelInfo from "./ChannelInfo"
import UserInfo from "./UserInfo"
import { MessageSquare, Users, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ChatLayout({
  chatType,
  chats,
  currentChat,
  setCurrentChat,
  messages,
  onSendMessage,
  onFileUpload,
  userId,
  isConnected = true,
  isSending = false,
  loading = false
}) {
  const [showInfo, setShowInfo] = useState(false)
  // Mobile view: "contacts" or "chat"
  const [mobileView, setMobileView] = useState("contacts")
  // Track transition state when switching chats
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleChatSelect = (chat) => {
    if (chat._id === currentChat?._id) return;
    
    // Add transition effect when switching chats
    setIsTransitioning(true);
    
    setCurrentChat(chat)
    setShowInfo(false)
    setMobileView("chat")
    
    // Reset transition after a short delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }

  // Back chevron toggles mobile view back to contacts
  const handleBack = () => {
    setMobileView("contacts")
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Desktop/Tablet View (sm and up) */}
      <div className="hidden sm:flex h-full w-full bg-background rounded-xl border shadow-sm overflow-hidden">
        {/* Left Sidebar - Always visible on desktop */}
        <div className="w-80 border-r flex-shrink-0 h-full bg-muted/30">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-2">
              {chatType === "channel" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : (
                <MessagesSquare className="h-5 w-5 text-primary" />
              )}
              <h1 className="text-lg font-semibold">{chatType === "channel" ? "Channels" : "Messages"}</h1>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                <ChatList chats={chats} currentChat={currentChat} onChatSelect={handleChatSelect} chatType={chatType} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-background">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <ChatHeader 
                chat={currentChat} 
                chatType={chatType} 
                onInfoClick={() => setShowInfo(true)} 
              />

              {/* Message List */}
              <div className={cn(
                "flex-1 overflow-hidden transition-opacity duration-300",
                (loading || isTransitioning) ? "opacity-60" : "opacity-100"
              )}>
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : (
                  <MessageList messages={messages} userId={userId} />
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-muted/20">
                <MessageInput 
                  onSendMessage={onSendMessage} 
                  onFileUpload={onFileUpload} 
                  disabled={!isConnected || loading}
                  isSending={isSending}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-primary/10 rounded-full p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-primary/70" />
              </div>
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a {chatType === "channel" ? "channel" : "conversation"} from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar – Info Panel */}
        <Sheet open={showInfo} onOpenChange={setShowInfo}>
          <SheetContent side="right" className={cn("w-[400px] sm:w-[540px] p-0 bg-background border-l", "shadow-lg")}>
            {currentChat &&
              (chatType === "channel" ? <ChannelInfo channel={currentChat} /> : <UserInfo user={currentChat} />)}
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile View (< sm) */}
      <div className="sm:hidden flex flex-col h-full w-full bg-background rounded-lg border shadow-sm overflow-hidden">
        {mobileView === "contacts" ? (
          <div className="h-full flex flex-col">
            {/* Header for Chat List */}
            <div className="p-4 border-b flex items-center gap-2 bg-muted/30">
              {chatType === "channel" ? (
                <Users className="h-5 w-5 text-primary" />
              ) : (
                <MessagesSquare className="h-5 w-5 text-primary" />
              )}
              <h1 className="text-lg font-semibold">{chatType === "channel" ? "Channels" : "Conversations"}</h1>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-2">
                  <ChatList
                    chats={chats}
                    currentChat={currentChat}
                    onChatSelect={handleChatSelect}
                    chatType={chatType}
                  />
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Fixed Chat Header */}
            <div className="flex-shrink-0 border-b">
              <ChatHeader
                chat={currentChat}
                chatType={chatType}
                onInfoClick={() => setShowInfo(true)}
                onBack={handleBack}
                isMobile={true}
              />
            </div>

            {/* Scrollable Message Area */}
            <div className={cn(
              "flex-1 overflow-hidden transition-opacity duration-300",
              (loading || isTransitioning) ? "opacity-60" : "opacity-100"
            )}>
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full"></div>
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  </div>
                </div>
              ) : (
                <MessageList messages={messages} userId={userId} />
              )}
            </div>

            {/* Fixed Input Area */}
            <div className="flex-shrink-0 p-4 border-t bg-muted/20">
              <MessageInput 
                onSendMessage={onSendMessage} 
                onFileUpload={onFileUpload} 
                disabled={!isConnected || loading}
                isSending={isSending}
              />
            </div>
          </div>
        )}

        {/* Mobile Info Panel */}
        <Sheet open={showInfo} onOpenChange={setShowInfo}>
          <SheetContent side="right" className="w-full p-0 bg-background shadow-lg">
            {currentChat &&
              (chatType === "channel" ? <ChannelInfo channel={currentChat} /> : <UserInfo user={currentChat} />)}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

