import React, { useState, useEffect } from "react";
import { Search, MessageSquare, Hash, Video, Users, Bell, Calendar, Shield, Fingerprint } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/login/context/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotifications } from "@/features/notifications/NotificationContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatService from "@/services/chatService";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([
    { id: 1, title: "Team Meeting", date: "Today, 3:00 PM", participants: 5 },
    { id: 2, title: "Project Review", date: "Tomorrow, 10:00 AM", participants: 3 },
    { id: 3, title: "Client Presentation", date: "Sep 25, 2:30 PM", participants: 8 }
  ]);

  // Fetch recent activity on mount
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        // Get recent direct messages
        const directMessagesResponse = await ChatService.getContacts();
        const directMessages = directMessagesResponse.success && directMessagesResponse.data ? 
          directMessagesResponse.data : [];
        
        // Get recent channels
        const channelsResponse = await ChatService.getChannels();
        const channels = channelsResponse.success && channelsResponse.msg && 
          channelsResponse.msg.channels ? channelsResponse.msg.channels : [];
        
        // Sort by last activity
        setRecentChats(directMessages.slice(0, 5));
        setRecentChannels(channels.slice(0, 5));
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  // Handle clicking on a notification
  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    if (notification.chatType === "channel") {
      navigate("/channels");
    } else {
      navigate("/messages");
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
          
          <Button variant="outline" size="icon" onClick={() => navigate("/messages")}>
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => navigate("/video")}>
            <Video className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabs for Recent Activity and Notifications */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Direct Messages */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Recent Conversations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ScrollArea className="h-full">
                      {loading ? (
                        <div className="flex justify-center items-center h-full">
                          <p>Loading...</p>
                        </div>
                      ) : recentChats.length > 0 ? (
                        <ul className="space-y-2">
                          {recentChats.map((chat) => (
                            <li key={chat._id} className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => navigate("/messages")}>
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={chat.avatarUrl} alt={chat.username} />
                                <AvatarFallback>{getInitials(chat.username)}</AvatarFallback>
                              </Avatar>
                              <div className="overflow-hidden">
                                <p className="font-medium">{chat.username}</p>
                                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || "No recent messages"}</p>
                              </div>
                              {chat.unreadCount > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Users className="h-10 w-10 mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No recent conversations</p>
                          <Button variant="outline" className="mt-2" onClick={() => navigate("/messages")}>
                            Start a conversation
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Recent Channels */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Hash className="h-5 w-5 mr-2" />
                      Recent Channels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ScrollArea className="h-full">
                      {loading ? (
                        <div className="flex justify-center items-center h-full">
                          <p>Loading...</p>
                        </div>
                      ) : recentChannels.length > 0 ? (
                        <ul className="space-y-2">
                          {recentChannels.map((channel) => (
                            <li key={channel._id} className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer" onClick={() => navigate("/channels")}>
                              <div className="h-8 w-8 bg-accent rounded-md flex items-center justify-center mr-2">
                                <Hash className="h-4 w-4" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-medium">#{channel.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{channel.description || "No description"}</p>
                              </div>
                              {channel.unreadCount > 0 && (
                                <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                  {channel.unreadCount}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Hash className="h-10 w-10 mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No recent channel activity</p>
                          <Button variant="outline" className="mt-2" onClick={() => navigate("/channels")}>
                            Browse channels
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
              
              {/* Upcoming Events */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {events.map((event) => (
                      <li key={event.id} className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                        <Badge variant="outline">{event.participants} participants</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Security Status */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Status
              </CardTitle>
              <CardDescription>Your account security overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium flex items-center">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Encryption Keys
                  </p>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Your encryption keys are up to date and secure</p>
              </div>
              
              <div className="space-y-3">
                <p className="font-medium">Security Recommendations</p>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start">
                    <div className="bg-green-500/20 p-1 rounded-full mr-2 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    Strong password is set
                  </li>
                  <li className="text-sm flex items-start text-muted-foreground">
                    <div className="bg-amber-500/20 p-1 rounded-full mr-2 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 9v4"></path><path d="M12 16h.01"></path><circle cx="12" cy="12" r="10"></circle></svg>
                    </div>
                    Enable two-factor authentication
                  </li>
                </ul>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => navigate("/settings")}>
                Manage Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions - Only visible on mobile */}
      <div className="grid grid-cols-3 gap-4 mt-6 sm:hidden">
        <Button onClick={() => navigate("/video")} className="h-auto py-4">
          <div className="flex flex-col items-center">
            <Video className="h-5 w-5 mb-1" />
            <span className="text-xs">Meeting</span>
          </div>
        </Button>
        <Button onClick={() => navigate("/messages")} className="h-auto py-4">
          <div className="flex flex-col items-center">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Message</span>
          </div>
        </Button>
        <Button onClick={() => navigate("/channels")} className="h-auto py-4">
          <div className="flex flex-col items-center">
            <Hash className="h-5 w-5 mb-1" />
            <span className="text-xs">Channels</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
