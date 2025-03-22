"use client"

import React, { useState, useEffect } from "react"
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, FileText, Download, FileImage, FileVideo, FileClock } from "lucide-react"
import { toast } from "sonner"
import ChatService from "../../../services/chatService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const UserInfo = ({ user, onClose }) => {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch shared files
  useEffect(() => {
    const fetchSharedFiles = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        // Get files shared in direct messages with this user
        const response = await ChatService.getDirectMessageFiles(user._id);
        console.log("[UserInfo] Received files response:", response);
        
        if (response.success && Array.isArray(response.data)) {
          setSharedFiles(response.data);
        } else if (response.success && Array.isArray(response.msg)) {
          setSharedFiles(response.msg);
        } else {
          console.warn("[UserInfo] No valid files data, setting empty array");
          setSharedFiles([]);
        }
      } catch (error) {
        console.error("Error fetching shared files:", error);
        toast.error("Failed to load shared files");
        setSharedFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedFiles();
  }, [user]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return <FileImage className="h-5 w-5" />;
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return <FileVideo className="h-5 w-5" />;
    } else if (extension === 'pdf') {
      return <FileText className="h-5 w-5" />;
    } else {
      return <FileClock className="h-5 w-5" />;
    }
  };

  const handleDownloadFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <SheetContent className="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.username?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle className="text-xl">{user?.username}</SheetTitle>
            <SheetDescription>{user?.email}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="mt-6">
        <Tabs defaultValue="files">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">Shared Files</TabsTrigger>
            <TabsTrigger value="info">User Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="mt-4 space-y-4">
            <h3 className="text-sm font-medium">
              Files 
              <Badge variant="outline" className="ml-2">{sharedFiles.length}</Badge>
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-[200px]">
                <p className="text-sm text-muted-foreground">Loading files...</p>
              </div>
            ) : sharedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <FileText className="h-10 w-10 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No files shared yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-3">
                  {sharedFiles.map((file) => (
                    <div 
                      key={file._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {getFileIcon(file.fileName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadFile(file.fileUrl)}
                        className="ml-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <p className="text-sm">
                  {user?.status || "No status"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.bio || "No bio available"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Role</h3>
                <Badge variant="outline">
                  {user?.role || "Member"}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SheetContent>
  );
};

export default UserInfo; 