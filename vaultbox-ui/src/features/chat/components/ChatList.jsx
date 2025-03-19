import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const ChatList = ({ chats = [], currentChat, onChatSelect, chatType }) => {
  return (
    <div className="p-4 space-y-2">
      {chats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {chatType === "channel" ? "No channels found" : "No conversations found"}
        </div>
      ) : (
        chats.map((chat) => {
          const hasUnread = chat.unreadCount > 0

          return (
            <button
              key={chat._id}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors ${
                currentChat?._id === chat._id
                  ? "bg-primary text-primary-foreground"
                  : hasUnread
                    ? "bg-primary/10 hover:bg-primary/20"
                    : "hover:bg-accent"
              }`}
              onClick={() => onChatSelect(chat)}
            >
              <div className="flex items-center space-x-3">
                {chatType === "direct" ? (
                  <Avatar>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.username?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      currentChat?._id === chat._id
                        ? "bg-primary-foreground text-primary"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    #{chat.name?.[0] || "?"}
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-medium ${hasUnread ? "font-bold" : ""}`}>
                    {chat.name || chat.username}
                  </span>
                  {chat.lastMessage && (
                    <span
                      className={`text-xs ${
                        currentChat?._id === chat._id ? "text-primary-foreground/70" : "text-muted-foreground"
                      } truncate max-w-[150px]`}
                    >
                      {chat.lastMessage}
                    </span>
                  )}
                </div>
              </div>
              {hasUnread && (
                <Badge variant={currentChat?._id === chat._id ? "outline" : "secondary"} className="ml-2">
                  {chat.unreadCount}
                </Badge>
              )}
            </button>
          )
        })
      )}
    </div>
  )
}

export default ChatList

