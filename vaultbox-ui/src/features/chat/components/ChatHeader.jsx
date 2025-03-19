import { ChevronLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ChatHeader = ({ chat, chatType, onInfoClick, onBack, isMobile = false, unreadCount = 0 }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#1F1F23]">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-1">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {chatType === "direct" ? (
          <Avatar>
            <AvatarImage src={chat.avatar} />
            <AvatarFallback>{chat.username?.[0] || "?"}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            #{chat.name?.[0] || "?"}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium">{chatType === "direct" ? chat.username : chat.name}</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {chat.status && <p className="text-xs text-muted-foreground">{chat.status}</p>}
        </div>
      </div>

      <Button variant="ghost" size="icon" onClick={onInfoClick}>
        <Info className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default ChatHeader

