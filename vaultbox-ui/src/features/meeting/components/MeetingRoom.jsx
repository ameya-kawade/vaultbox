"use client";

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import JitsiMeetComponent from "./JitsiMeetComponent";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAuth } from "@/features/login/context/auth";
import { deleteMeeting } from '../services/meetingService';

const MeetingRoom = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inMeeting, setInMeeting] = useState(true);
  
  // Get token from URL query params first, then from state (backward compatibility)
  const jwtToken = searchParams.get('jwt') || location.state?.token || "";
  const [loading, setLoading] = useState(false);

  const handleMeetingEnd = async () => {
    setInMeeting(false);
    
    try {
      await deleteMeeting(roomId);
      console.log("Meeting ended successfully");
    } catch (error) {
      console.error("Error ending meeting:", error);
    }
    
    navigate("/video");
  };

  if (loading) return <div>Loading meeting...</div>;
  // For admins, if token is required but not available, show an error.
  if (user.role === "admin" && !jwtToken) return <div>Error: No token available.</div>;

  return (
    <div className="w-full h-screen relative">
      {inMeeting ? (
        <JitsiMeetComponent
          roomName={roomId}
          user={user.username || "Guest"}
          jwtToken={jwtToken}
          onMeetingEnd={handleMeetingEnd}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p>You have left the meeting.</p>
          <Button onClick={() => navigate("/video")}>Back</Button>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
