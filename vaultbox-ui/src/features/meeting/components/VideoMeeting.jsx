"use client";

import React, { useState } from "react";
import { useAuth } from "@/features/login/context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { createMeeting } from '../services/meetingService';

const VideoMeeting = () => {
  const { user } = useAuth();
  const [inputRoomName, setInputRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  // Toggle between join mode and create mode (available for all users)
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

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
  const handleJoinMeeting = () => {
    if (!inputRoomName.trim()) {
      showAlert("Please enter a valid meeting link or ID.", "error");
      return;
    }
    
    if (isCreateMode) {
      handleCreateMeeting();
    } else {
      // For joining, we navigate directly to the meeting room
      navigate(`/video/${inputRoomName.trim()}`);
      showAlert("Joining meeting...");
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/video/${inputRoomName}`);
    showAlert("Meeting link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/10 to-background flex flex-col items-center justify-start pt-12 p-4">
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

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Vaultbox Meeting</h1>
          <p className="mt-2 text-muted-foreground">
            Secure, high-quality video meetings for teams
          </p>
        </div>

        <Card className="border-2 bg-transparent">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Show create/join toggle for all users */}
              <div className="flex items-center justify-center space-x-2">
                <Label htmlFor="meeting-mode">Join</Label>
                <Switch
                  id="meeting-mode"
                  checked={isCreateMode}
                  onCheckedChange={() => setIsCreateMode(!isCreateMode)}
                />
                <Label htmlFor="meeting-mode">Create</Label>
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
                />
              </div>

              {inputRoomName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="truncate">
                    {window.location.origin}/video/{inputRoomName}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyMeetingLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              <Button className="w-full" onClick={handleJoinMeeting} disabled={loading}>
                {loading
                  ? "Processing..."
                  : isCreateMode
                    ? "Create Meeting"
                    : "Join Meeting"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoMeeting;
