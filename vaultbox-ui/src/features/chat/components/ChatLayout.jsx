"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import ChatList from "./ChatList"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ChannelInfo from "./ChannelInfo"
import UserProfile from "./UserProfile"
import { MessageSquare } from 'lucide-react'

export default function ChatLayout({
  chatType,
  chats,
  currentChat,
  setCurrentChat,
  messages,
  onSendMessage,
  onFileUpload,
  userId,
}) {
  const [showInfo, setShowInfo] = useState(false)
  // Mobile view: "contacts" or "chat"
  const [mobileView, setMobileView] = useState("contacts")

  const handleChatSelect = (chat) => {
    setCurrentChat(chat)
    setShowInfo(false)
    setMobileView("chat")
  }

  // Back chevron toggles mobile view back to contacts
  const handleBack = () => {
    setMobileView("contacts")
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Desktop/Tablet View (sm and up) */}
      <div className="hidden sm:flex h-full w-full bg-background rounded-lg border border-[#1F1F23] overflow-hidden">
        {/* Left Sidebar - Always visible on desktop */}
        <div className="w-80 border-r border-[#1F1F23] flex-shrink-0 h-full">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-[#1F1F23]">
              <h1 className="text-lg font-medium">
                {chatType === "channel" ? "  Channels" : "  Messages"}
              </h1>
            </div>
            <ScrollArea className="flex-1">
              <ChatList
                chats={chats}
                currentChat={currentChat}
                onChatSelect={handleChatSelect}
                chatType={chatType}
              />
            </ScrollArea>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <ChatHeader
                chat={currentChat}
                chatType={chatType}
                onInfoClick={() => setShowInfo(true)}
              />
              
              {/* Message List */}
              <ScrollArea className="flex-1 p-4">
                <MessageList messages={messages} userId={userId} />
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-4 border-t border-[#1F1F23]">
                <MessageInput
                  onSendMessage={onSendMessage}
                  onFileUpload={onFileUpload}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-muted/20 rounded-full p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a channel or direct message from the sidebar to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar – Info Panel */}
        <Sheet open={showInfo} onOpenChange={setShowInfo}>
          <SheetContent
            side="right"
            className="w-[400px] sm:w-[540px] p-0 bg-background border-l border-[#1F1F23]"
          >
            {currentChat &&
              (chatType === "channel" ? (
                <ChannelInfo channel={currentChat} />
              ) : (
                <UserProfile user={currentChat} />
              ))}
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile View (< sm) */}
      <div className="sm:hidden flex flex-col h-full w-full">
        {mobileView === "contacts" ? (
          <div className="h-full flex flex-col">
            {/* Header for Chat List */}
            <div className="p-4 border-b border-[#1F1F23] flex-shrink-0">
              <h1 className="text-lg font-medium">
                {chatType === "channel" ? "Channels" : "Conversations"}
              </h1>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <ChatList
                  chats={chats}
                  currentChat={currentChat}
                  onChatSelect={handleChatSelect}
                  chatType={chatType}
                />
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Fixed Chat Header */}
            <div className="flex-shrink-0">
              <ChatHeader
                chat={currentChat}
                chatType={chatType}
                onInfoClick={() => setShowInfo(true)}
                onBack={handleBack}
                isMobile={true}
              />
            </div>
            
            {/* Scrollable Message Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <MessageList messages={messages} userId={userId} />
              </ScrollArea>
            </div>
            
            {/* Fixed Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-[#1F1F23] bg-background">
              <MessageInput
                onSendMessage={onSendMessage}
                onFileUpload={onFileUpload}
              />
            </div>
          </div>
        )}
        
        {/* Mobile Info Panel */}
        <Sheet open={showInfo} onOpenChange={setShowInfo}>
          <SheetContent
            side="right"
            className="w-full p-0 bg-background"
          >
            {currentChat &&
              (chatType === "channel" ? (
                <ChannelInfo channel={currentChat} />
              ) : (
                <UserProfile user={currentChat} />
              ))}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}