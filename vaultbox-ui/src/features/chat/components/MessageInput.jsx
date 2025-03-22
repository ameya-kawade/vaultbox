"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Image, Smile, Plus, X, Loader2, FileIcon, AlertCircle, WifiOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const MessageInput = ({ onSendMessage, onFileUpload, isTyping, disabled = false, isSending = false }) => {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const messageInputRef = useRef(null)

  useEffect(() => {
    // Auto-focus the input when the component mounts
    messageInputRef.current?.focus()
  }, [])

  // Reset progress when upload completes
  useEffect(() => {
    if (!isUploading) {
      // Wait a bit before resetting progress to allow for completion animation
      const timer = setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isUploading])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Don't proceed if disabled or already sending
    if (disabled || isSending) return;
    
    if (message.trim() || pendingFiles.length > 0) {
      onSendMessage(message)
      setMessage("")
      
      // If there are pending files, upload them too
      if (pendingFiles.length > 0) {
        uploadPendingFiles()
      }
    }
  }

  const prepareFile = (file) => {
    // Create an object URL for previewing images
    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file) 
      : null
    
    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview,
      isUploading: false,
      error: null
    }
  }

  const handleFileSelect = (e) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    // Add files to pending queue
    const newPendingFiles = files.map(prepareFile)
    setPendingFiles((prev) => [...prev, ...newPendingFiles])
    
    // Clear the file input
    e.target.value = ""
    
    // Close options menu
    setShowOptions(false)
    
    // Auto-upload option (can be toggled)
    // uploadPendingFiles()
  }

  const removePendingFile = (fileId) => {
    if (disabled || isUploading) return;
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const uploadPendingFiles = async () => {
    if (pendingFiles.length === 0 || isUploading || disabled) return;
    
    setIsUploading(true)
    const totalFiles = pendingFiles.length
    let completedFiles = 0
    
    try {
      // Update each file status to uploading
      setPendingFiles((prev) => 
        prev.map((f) => ({ ...f, isUploading: true, error: null }))
      )
      
      for (const fileObj of pendingFiles) {
        try {
          // Start the file upload
          await onFileUpload(fileObj.file)
          
          // Mark as complete
          setPendingFiles((prev) => 
            prev.map((f) => f.id === fileObj.id 
              ? { ...f, isUploading: false, isComplete: true } 
              : f
            )
          )
          
          // Update progress
          completedFiles++
          setUploadProgress(Math.round((completedFiles / totalFiles) * 100))
          
        } catch (error) {
          console.error(`Failed to upload ${fileObj.name}:`, error)
          
          // Mark file as failed
          setPendingFiles((prev) => 
            prev.map((f) => f.id === fileObj.id 
              ? { ...f, isUploading: false, error: error.message || "Upload failed" } 
              : f
            )
          )
        }
      }
      
      // Success message if at least some files uploaded successfully
      if (completedFiles > 0) {
        toast.success(`${completedFiles} file${completedFiles > 1 ? "s" : ""} uploaded successfully`)
        
        // Remove all successfully uploaded files after a delay
        setTimeout(() => {
          setPendingFiles((prev) => prev.filter((f) => !f.isComplete))
        }, 2000)
      }
      
    } catch (error) {
      console.error("File upload process failed:", error)
      toast.error(`Upload process failed: ${error.message || "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Format file size in a human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Determine if the input should be disabled
  const isInputDisabled = disabled || isUploading;

  return (
    <div className="bg-background p-2">
      {/* Connection lost indicator */}
      {disabled && (
        <div className="mb-2 text-sm text-amber-500 flex items-center gap-2 px-3">
          <WifiOff className="h-4 w-4" />
          <span>Connection lost. Reconnecting...</span>
        </div>
      )}
    
      {isTyping && (
        <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2 px-3">
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div
              className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span>Someone is typing...</span>
        </div>
      )}
      
      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-2">
          {pendingFiles.map((fileObj) => (
            <div 
              key={fileObj.id} 
              className={cn(
                "flex items-center gap-2 bg-muted/60 rounded-lg p-2 pr-3 border border-border/30", 
                fileObj.error && "bg-destructive/10 border-destructive/30"
              )}
            >
              <div className="p-1.5 rounded-md bg-background">
                {fileObj.type.startsWith('image/') && fileObj.preview ? (
                  <div className="h-6 w-6 relative rounded-sm overflow-hidden">
                    <img 
                      src={fileObj.preview} 
                      alt={fileObj.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <FileIcon className="h-4 w-4 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 max-w-[150px]">
                <div className="text-xs font-medium truncate">{fileObj.name}</div>
                {fileObj.error ? (
                  <div className="text-xs text-destructive truncate">{fileObj.error}</div>
                ) : (
                  <div className="text-xs text-muted-foreground">{formatFileSize(fileObj.size)}</div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-muted"
                onClick={() => removePendingFile(fileObj.id)}
                disabled={fileObj.isUploading || isInputDisabled}
              >
                {fileObj.isUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : fileObj.error ? (
                  <AlertCircle className="h-3 w-3 text-destructive" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
          
          {pendingFiles.length > 0 && !isUploading && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="text-xs h-8 self-end"
              onClick={uploadPendingFiles}
              disabled={isInputDisabled}
            >
              Upload {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
      
      {/* Upload progress indicator */}
      {isUploading && (
        <div className="mb-2 px-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Uploading files...</span>
            <span className="text-xs font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}
      
      {/* Message sending indicator */}
      {isSending && !isUploading && (
        <div className="mb-2 px-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Sending message...</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "Reconnecting to server..." : "Type a message..."}
            className={cn(
              "flex-1 rounded-full pr-12 py-6 border-muted-foreground/20 focus-visible:ring-primary/50",
              (isInputDisabled || isSending) && "opacity-70 cursor-not-allowed",
              disabled && "bg-muted/30"
            )}
            disabled={isInputDisabled || isSending}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <TooltipProvider>
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowOptions(!showOptions)}
                      className="rounded-full h-8 w-8 hover:bg-muted"
                      aria-label="More options"
                      disabled={isInputDisabled || isSending}
                    >
                      {isUploading || isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : showOptions ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {disabled ? "Reconnecting..." : showOptions ? "Close options" : "More options"}
                  </TooltipContent>
                </Tooltip>
                {showOptions && (
                  <div className="absolute bottom-full mb-2 right-0 bg-background border rounded-lg shadow-lg p-1.5 flex gap-1 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            fileInputRef.current.accept = "image/*,video/*,application/pdf,text/*"
                            fileInputRef.current?.click()
                          }}
                          disabled={isInputDisabled || isSending}
                          className="rounded-full h-8 w-8 hover:bg-muted"
                          aria-label="Attach file"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Attach file</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-muted"
                          aria-label="Send image"
                          disabled={isInputDisabled || isSending}
                          onClick={() => {
                            fileInputRef.current.accept = "image/*"
                            fileInputRef.current?.click()
                          }}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Send image</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 hover:bg-muted"
                          aria-label="Add emoji"
                          disabled={isInputDisabled || isSending}
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Add emoji</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,application/pdf,text/*"
          multiple
          disabled={isInputDisabled || isSending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={((!message.trim() && pendingFiles.length === 0) || isInputDisabled || isSending)}
          className={cn(
            "rounded-full h-10 w-10 flex items-center justify-center", 
            ((!message.trim() && pendingFiles.length === 0) || isInputDisabled || isSending) && "opacity-70"
          )}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}

export default MessageInput

