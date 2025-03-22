"use client";

import React, { useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const JitsiMeetComponent = ({ roomName, jwtToken, user, onMeetingEnd }) => {
  const containerRef = useRef(null);

  // Effect to handle responsive sizing and resize events
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Get iframe element
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      
      // Set iframe styles for full responsiveness
      iframe.style.height = "100%";
      iframe.style.width = "100%";
      iframe.style.border = "none";
    };
    
    // Initial call and event listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Retry a few times to make sure iframe is loaded
    const retryIntervals = [100, 300, 600, 1000];
    retryIntervals.forEach(ms => {
      setTimeout(handleResize, ms);
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-7rem)] min-h-[400px] sm:h-[calc(100vh-6rem)] md:h-[calc(100vh-5rem)] border rounded-lg overflow-hidden"
    >
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
          iframeRef.style.border = "none";
        }}
        onApiReady={(externalApi) => {
          // Listen for Jitsi's "readyToClose" event
          externalApi.addEventListener("readyToClose", () => {
            onMeetingEnd();
          });
        }}
      />
    </div>
  );
};

export default JitsiMeetComponent;
