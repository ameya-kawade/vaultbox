"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/login/context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Calendar, Users, Clock, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMeeting, joinMeeting } from '../services/meetingService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const VideoMeeting = () => {
  const { user } = useAuth();
  const [inputRoomName, setInputRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
  
  // Sample upcoming meetings data - in a real app this would come from an API
  const upcomingMeetings = [
    { id: 1, title: "Team Weekly Sync", date: "Today, 3:00 PM", participants: 5, roomId: "team-weekly" },
    { id: 2, title: "Project Review", date: "Tomorrow, 10:00 AM", participants: 3, roomId: "project-review" },
    { id: 3, title: "Client Presentation", date: "Sep 25, 2:30 PM", participants: 8, roomId: "client-presentation" }
  ];

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  };

  // Handle creating a meeting (all users)
  const handleCreateMeeting = async () => {
    if (!inputRoomName.trim()) {
      showAlert("Please enter a valid room name.", "error");
      return;
    }
    setLoading(true);
    try {
      // Use the new service function
      const data = await createMeeting(inputRoomName.trim());
      
      console.log("Meeting created:", data);
      
      const token = encodeURIComponent(data.token);
      navigate(`/video/${data.room}?jwt=${token}`);
      showAlert("Meeting created successfully");
    } catch (error) {
      console.error("Error creating meeting:", error);
      if (error.response?.status === 409) {
        showAlert("Meeting name already exists", "error");
      } else {
        showAlert("Error creating meeting", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle joining an existing meeting
  const handleJoinMeeting = async () => {
    if (!inputRoomName.trim()) {
      showAlert("Please enter a valid meeting link or ID.", "error");
      return;
    }
    
    setLoading(true);
    try {
      if (isCreateMode) {
        // Creating a new meeting
        const data = await createMeeting(inputRoomName.trim());
        const token = encodeURIComponent(data.token);
        navigate(`/video/${data.room}?jwt=${token}`);
        showAlert("Meeting created successfully");
      } else {
        // Simply navigate to the meeting room without verification
        // This assumes the room exists and will be handled by the backend
        navigate(`/video/${inputRoomName.trim()}`);
        showAlert("Joining meeting...");
      }
    } catch (error) {
      console.error("Error with meeting:", error);
      if (error.response?.status === 409) {
        showAlert("Meeting name already exists", "error");
      } else {
        showAlert("Error processing request", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/video/${inputRoomName}`);
    showAlert("Meeting link copied to clipboard");
  };
  
  const joinScheduledMeeting = async (meeting) => {
    setLoading(true);
    try {
      // Simply navigate to the meeting room without verification
      navigate(`/video/${meeting.roomId}`);
      showAlert(`Joining ${meeting.title}...`);
    } catch (error) {
      console.error("Error joining scheduled meeting:", error);
      showAlert("Could not join the meeting", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert
              className={cn(
                "w-96",
                alert.type === "error" ? "border-destructive" : "border-primary"
              )}
            >
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Vaultbox Meetings</h1>
        <p className="text-muted-foreground mt-2">
          Secure, high-quality video meetings for teams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Start or Join a Meeting</CardTitle>
              <CardDescription>
                Create a new meeting or join an existing one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Show create/join toggle for all users */}
                <div className="flex items-center justify-center space-x-3 bg-muted rounded-lg p-2">
                  <Label 
                    htmlFor="meeting-mode" 
                    className={!isCreateMode ? "font-medium" : "text-muted-foreground"}
                  >
                    Join
                  </Label>
                  <Switch
                    id="meeting-mode"
                    checked={isCreateMode}
                    onCheckedChange={() => setIsCreateMode(!isCreateMode)}
                  />
                  <Label 
                    htmlFor="meeting-mode" 
                    className={isCreateMode ? "font-medium" : "text-muted-foreground"}
                  >
                    Create
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>
                    {isCreateMode ? "Room Name" : "Meeting Link or ID"}
                  </Label>
                  <Input
                    placeholder={
                      isCreateMode
                        ? "Enter room name"
                        : "Enter meeting link or ID"
                    }
                    value={inputRoomName}
                    onChange={(e) => setInputRoomName(e.target.value)}
                    className="h-10"
                  />
                </div>

                {inputRoomName && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm bg-muted p-2 rounded-md"
                  >
                    <span className="truncate flex-1">
                      {window.location.origin}/video/{inputRoomName}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyMeetingLink} className="h-6 w-6">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleJoinMeeting} 
                disabled={loading}
                size="lg"
              >
                {loading
                  ? "Processing..."
                  : isCreateMode
                    ? "Create Meeting"
                    : "Join Meeting"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Upcoming Meetings</span>
              </CardTitle>
              <CardDescription>
                Click on a meeting to join instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-8rem)]">
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div 
                    key={meeting.id} 
                    className="border rounded-lg hover:border-primary/50 transition-colors p-4 cursor-pointer"
                    onClick={() => joinScheduledMeeting(meeting)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{meeting.title}</h3>
                      <Badge variant="outline">{meeting.participants} participants</Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>{meeting.date}</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Video className="h-3.5 w-3.5 mr-1.5" />
                        Join Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoMeeting;
