"use client"

import React, { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, isValid } from "date-fns"
import { FileIcon, ImageIcon, FileVideo, Download, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MessageList = ({ messages = [], userId }) => {
  const scrollRef = useRef(null)
  const containerRef = useRef(null)
  const [darkMode, setDarkMode] = useState(false)
  const [loadingFileIds, setLoadingFileIds] = useState([])
  const [errorFileIds, setErrorFileIds] = useState([])
  const [fadeIn, setFadeIn] = useState(false)

  // Add fade-in effect when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setFadeIn(false);
      // Short delay to ensure the fade-out happens first
      const timeout = setTimeout(() => {
        setFadeIn(true);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  // Scroll to bottom on initial load and whenever messages change.
  useEffect(() => {
    // Option 1: Scroll container directly
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
    // Option 2 (preferred): Scroll dummy element into view with smooth behavior
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, userId])

  // Safe date parser that returns a valid date or current date as fallback
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    
    try {
      const parsedDate = new Date(dateString);
      return isValid(parsedDate) ? parsedDate : new Date();
    } catch (error) {
      console.warn(`Invalid date: ${dateString}`, error);
      return new Date();
    }
  };

  const formatMessageTime = (dateString) => {
    const date = parseDate(dateString);
    return format(date, "HH:mm");
  }

  const renderDateDivider = (dateString) => {
    const date = parseDate(dateString);
    return (
      <div className="flex items-center my-6" key={dateString}>
        <div className="flex-1 border-t border-border/60"></div>
        <span className="mx-4 text-xs font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full shadow-sm">
          {format(date, "MMMM d, yyyy")}
        </span>
        <div className="flex-1 border-t border-border/60"></div>
      </div>
    )
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleFileDownload = (fileUrl, fileName) => {
    const fileId = `${fileName}-${fileUrl.substring(fileUrl.lastIndexOf('/') + 1)}`;
    
    // Add to loading state
    setLoadingFileIds(prev => [...prev, fileId]);
    setErrorFileIds(prev => prev.filter(id => id !== fileId));
    
    // Create an invisible a element
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Set its attributes
    a.href = fileUrl;
    a.download = fileName;
    
    // Trigger the download
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(fileUrl);
    document.body.removeChild(a);
    
    // Remove from loading state after a short delay
    setTimeout(() => {
      setLoadingFileIds(prev => prev.filter(id => id !== fileId));
    }, 1000);
  }

  const renderAttachment = (file) => {
    // Get file extension and details
    const fileName = file.name || file.fileName || "File"
    const fileUrl = file.url || file.fileUrl || "#"
    const fileSize = file.size || file.fileSize || 0
    const fileId = `${fileName}-${fileUrl.substring(fileUrl.lastIndexOf('/') + 1)}`;
    
    const isLoading = loadingFileIds.includes(fileId);
    const hasError = errorFileIds.includes(fileId);

    // Determine file type based on extension or mime type
    let fileCategory = "unknown"
    if (file.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName)) {
      fileCategory = "image"
    } else if (file.type?.startsWith("video/") || /\.(mp4|webm|mov|avi)$/i.test(fileName)) {
      fileCategory = "video"
    } else if (file.type?.startsWith("application/pdf") || /\.pdf$/i.test(fileName)) {
      fileCategory = "pdf"
    } else if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(fileName)) {
      fileCategory = "office"
    } else if (/\.(txt|md|json|js|jsx|ts|tsx|html|css|csv)$/i.test(fileName)) {
      fileCategory = "text"
    }

    // Handle different file types
    switch (fileCategory) {
      case "image":
        return (
          <div className="mt-2 max-w-xs overflow-hidden">
            <div className="relative group">
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block"
                onClick={(e) => {
                  if (hasError) {
                    e.preventDefault();
                    return;
                  }
                }}
              >
                <img
                  src={fileUrl || "/placeholder.svg"}
                  alt={fileName}
                  className={cn(
                    "rounded-lg max-h-40 object-cover border border-border/40 transition-all",
                    hasError ? "opacity-50" : "hover:opacity-90 shadow-sm hover:shadow-md"
                  )}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                    setErrorFileIds(prev => [...prev, fileId]);
                  }}
                  loading="lazy"
                />
                {hasError && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/40">
                    <span className="text-xs font-medium text-background">Failed to load image</span>
                  </div>
                )}
              </a>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between">
              <div className="flex items-center truncate max-w-[80%]">
                <ImageIcon className="h-3 w-3 mr-1.5 flex-shrink-0 text-primary/70" />
                <span className="truncate font-medium">{fileName}</span>
              </div>
              <span className="text-xs opacity-70">{formatFileSize(fileSize)}</span>
            </div>
          </div>
        );

      case "video":
      case "pdf":
      case "office":
      case "text":
      default:
        return (
          <div className="mt-2 max-w-xs animate-in fade-in-50 duration-200 transition-all">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border/60 p-3 bg-background hover:bg-muted/50 transition-colors",
                hasError && "opacity-60"
              )}
            >
              <div className={`p-2 rounded-md ${fileCategory === "pdf" ? "bg-red-500/10" : "bg-primary/10"}`}>
                <FileIcon className={`h-5 w-5 ${fileCategory === "pdf" ? "text-red-500" : "text-primary"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{fileName}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full hover:bg-background/80"
                onClick={() => handleFileDownload(fileUrl, fileName)}
                disabled={isLoading || hasError}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasError ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className={cn("h-full", darkMode && "dark")}>
      <ScrollArea className="h-full bg-background" ref={containerRef}>
        <div 
          className={cn(
            "flex flex-col p-4 gap-6 transition-opacity duration-300 ease-in-out",
            fadeIn ? "opacity-100" : "opacity-0"
          )}
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-10 text-center">
              <div className="flex flex-col items-center max-w-sm p-6">
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-xs text-muted-foreground/70">
                  Start the conversation by sending a message or sharing a file
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = String(message.senderId) === String(userId)
              
              // Safely parse dates for comparison
              const currentMessageDate = parseDate(message.createdAt);
              const previousMessageDate = index > 0 ? parseDate(messages[index - 1]?.createdAt) : null;
              
              // Determine if we should show a date divider
              const showDateDivider =
                index === 0 ||
                !previousMessageDate ||
                format(currentMessageDate, "yyyy-MM-dd") !== format(previousMessageDate, "yyyy-MM-dd");

              return (
                <React.Fragment key={message._id || index}>
                  {showDateDivider && renderDateDivider(message.createdAt)}
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      isCurrentUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {message.senderName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`group flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isCurrentUser ? "You" : message.senderName || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                          "animate-in fade-in-50 slide-in-from-bottom-3 duration-300",
                          isCurrentUser
                            ? "bg-primary/90 text-primary-foreground rounded-tr-none"
                            : "bg-muted/80 hover:bg-muted text-foreground rounded-tl-none border border-border/40",
                          "transition-all hover:shadow-md",
                          message.pending && "opacity-70"
                        )}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                          {message.pending && (
                            <span className="ml-2 inline-block animate-pulse">...</span>
                          )}
                        </div>

                        {/* Render file attachments if present */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((file, i) => (
                              <div key={i}>{renderAttachment(file)}</div>
                            ))}
                          </div>
                        )}

                        {/* Support for files array format */}
                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.files.map((file, i) => (
                              <div key={i}>{renderAttachment(file)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          )}
          {/* Dummy element for auto-scrolling */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  )
}

export default MessageList

