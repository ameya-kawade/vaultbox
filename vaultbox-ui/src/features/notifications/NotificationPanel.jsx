import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, Trash2, X } from "lucide-react";
import { useNotifications } from "./NotificationContext";
import { Badge } from "@/components/ui/badge";

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[90vw] sm:w-[400px] md:w-[540px] [&>button]:hidden">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2">
            Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
            )}
          </SheetTitle>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
                <Button variant="outline" size="sm" onClick={clearNotifications}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 mb-3 rounded-lg border ${
                  notification.read ? "bg-background" : "bg-accent border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-medium">
                    {notification.title || "Notification"}
                    {!notification.read && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </h3>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark read
                    </Button>
                  )}
                </div>
                <p className="text-sm mt-1 text-foreground/80">
                  {notification.message || notification.content}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;
