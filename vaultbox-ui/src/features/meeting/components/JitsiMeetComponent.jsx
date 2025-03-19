"use client";

import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const JitsiMeetComponent = ({ roomName, jwtToken, user, onMeetingEnd }) => {
  return (
    <div className="relative w-full h-[600px] border rounded-lg overflow-hidden">
      <JitsiMeeting
        domain="localhost:8443"
        roomName={roomName}
        jwt={jwtToken}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: true,
          startScreenSharing: true,
          enableEmailInStats: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
        }}
        userInfo={{ displayName: user.username }}
        getIFrameRef={(iframeRef) => {
          // The iframe will take the full dimensions of the container
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
        onApiReady={(externalApi) => {
          // Listen for Jitsi's "readyToClose" event (fires when the built‑in leave button is pressed)
          externalApi.addEventListener("readyToClose", () => {
            onMeetingEnd();
          });
        }}
      />
     
    </div>
  );
};

export default JitsiMeetComponent;
