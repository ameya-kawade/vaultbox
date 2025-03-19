"use client"

import React, { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

const MessageList = ({ messages = [], userId }) => {
  const scrollRef = useRef(null)
  const containerRef = useRef(null)

  // Scroll to bottom on initial load and whenever messages change.
  useEffect(() => {
    // Option 1: Scroll container directly
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
    // Option 2 (preferred): Scroll dummy element into view with smooth behavior
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, userId])

  const formatMessageTime = (date) => {
    return format(new Date(date), "HH:mm")
  }

  const renderDateDivider = (date) => {
    return (
      <div className="flex items-center my-4" key={date}>
        <div className="flex-1 border-t"></div>
        <span className="mx-4 text-xs text-muted-foreground">{format(new Date(date), "MMMM d, yyyy")}</span>
        <div className="flex-1 border-t"></div>
      </div>
    )
  }

  // Debug log to see what's in the messages
  console.log("Messages data:", messages);

  return (
    <ScrollArea className="h-full" ref={containerRef}>
      <div className="flex flex-col p-4 gap-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === userId
          const showDateDivider =
            index === 0 ||
            format(new Date(message.createdAt), "yyyy-MM-dd") !==
              format(new Date(messages[index - 1]?.createdAt), "yyyy-MM-dd")

          return (
            <React.Fragment key={message._id || index}>
              {showDateDivider && renderDateDivider(message.createdAt)}
              <div
                className={`flex gap-3 max-w-[85%] ${
                  isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                }`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>{message.senderName?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`group flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                  <span className="text-sm text-muted-foreground mb-1">
                    {isCurrentUser ? "You" : message.senderName || "Unknown"}
                  </span>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.content}
                    <span className="ml-2 inline-block text-xs opacity-0 transition-opacity group-hover:opacity-60">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )
        })}
        {/* Dummy element for auto-scrolling */}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
}

export default MessageList

