import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

const ChatList = ({ chats = [], currentChat, onChatSelect, chatType }) => {
  const [selectedId, setSelectedId] = useState(currentChat?._id);
  
  // Handle chat selection with visual feedback
  const handleSelect = (chat) => {
    setSelectedId(chat._id);
    onChatSelect(chat);
  };
  
  return (
    <div className="space-y-1.5">
      {chats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="bg-muted/50 rounded-lg p-6 flex flex-col items-center">
            <div className="text-lg mb-1">
              {chatType === "channel" ? "No channels found" : "No conversations found"}
            </div>
            <p className="text-sm text-muted-foreground">
              {chatType === "channel" 
                ? "Channels you join will appear here" 
                : "Start a conversation to see it here"}
            </p>
          </div>
        </div>
      ) : (
        chats.map((chat) => {
          const hasUnread = chat.unreadCount > 0
          const isActive = currentChat?._id === chat._id
          const isSelected = selectedId === chat._id;
          
          return (
            <button
              key={chat._id}
              className={cn(
                "flex items-center justify-between w-full p-3 rounded-lg",
                "transition-all duration-200 ease-in-out",
                "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "bg-primary/90 text-primary-foreground shadow-sm"
                  : isSelected && !isActive
                    ? "bg-muted/90" // Visual feedback while loading
                    : hasUnread
                      ? "bg-primary/10 hover:bg-primary/20"
                      : "hover:bg-muted"
              )}
              onClick={() => handleSelect(chat)}
              disabled={isActive}
            >
              <div className="flex items-center space-x-3">
                {chatType === "direct" ? (
                  <Avatar className={cn(
                    "h-10 w-10 border-2 transition-all duration-200",
                    isActive 
                      ? "border-primary-foreground" 
                      : isSelected && !isActive
                        ? "border-primary/30"
                        : "border-background"
                  )}>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className={cn(
                      "font-medium transition-colors duration-200",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : isSelected && !isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 text-primary"
                    )}>
                      {chat.username?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground"
                        : isSelected && !isActive
                          ? "bg-primary/20 text-primary border-primary/30"
                          : "bg-primary/10 text-primary border-background"
                    )}
                  >
                    #{chat.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex flex-col items-start overflow-hidden">
                  <span className={cn(
                    "text-sm font-medium truncate max-w-[150px]",
                    hasUnread && "font-semibold"
                  )}>
                    {chat.name || chat.username}
                  </span>
                  {chat.lastMessage && (
                    <span
                      className={cn(
                        "text-xs truncate max-w-[150px] transition-colors duration-200",
                        isActive 
                          ? "text-primary-foreground/80" 
                          : isSelected && !isActive
                            ? "text-muted-foreground/70"
                            : "text-muted-foreground"
                      )}
                    >
                      {chat.lastMessage}
                    </span>
                  )}
                </div>
              </div>
              {hasUnread && (
                <Badge 
                  variant={isActive ? "outline" : "default"} 
                  className={cn(
                    "ml-2 px-1.5 min-w-[1.5rem] text-center transition-all duration-200",
                    isActive 
                      ? "border-primary-foreground/50 text-primary-foreground" 
                      : "bg-primary"
                  )}
                >
                  {chat.unreadCount}
                </Badge>
              )}
              
              {/* Loading indicator when chat is selected but not yet active */}
              {isSelected && !isActive && (
                <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2"></div>
              )}
            </button>
          )
        })
      )}
    </div>
  )
}

export default ChatList
