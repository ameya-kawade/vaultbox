"use client"

import React, { useState, useEffect } from "react"
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, X, Trash2, UserCheck } from "lucide-react"
import { toast } from "sonner"
import ChatService from "../../../services/chatService"
import UserService from "@/services/userService"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@login/context/auth"

const ChannelInfo = ({ channel, onClose }) => {
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const isOwner = user?.id === channel?.owner

  console.log("[ChannelInfo] Initialized for channel:", channel)

  // Fetch channel members
  const fetchMembers = async () => {
    console.log("[ChannelInfo] Fetching members for channel:", channel?._id)
    setIsLoading(true)
    try {
      const response = await ChatService.getChannelMembers(channel._id)
      console.log("[ChannelInfo] Received members response:", response)
      if (Array.isArray(response.data)) {
        setMembers(response.data)
      } else if (Array.isArray(response.msg)) {
        setMembers(response.msg)
      } else {
        console.warn("[ChannelInfo] No valid members data, setting empty array")
        setMembers([])
      }
    } catch (error) {
      console.error("[ChannelInfo] Error fetching members:", error)
      toast.error("Failed to load channel members")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (channel?._id) {
      fetchMembers()
    }
  }, [channel])

  // Search and add member by email or username
  const handleAddMember = async (e) => {
    e.preventDefault()
    const trimmedInput = newMemberEmail.trim()
    console.log("[ChannelInfo] handleAddMember invoked with input:", trimmedInput)
    if (!trimmedInput) {
      toast.error("Email is required")
      return
    }

    setIsLoading(true)
    try {
      // Pass the trimmed query as-is; the backend search is case-insensitive.
      console.log("[ChannelInfo] Searching user with query:", trimmedInput)
      const usersResponse = await UserService.searchUsers(trimmedInput)
      console.log("[ChannelInfo] searchUsers response:", usersResponse)

      // Check if usersResponse is an array; if not, log and return an empty array.
      const usersFound = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : Array.isArray(usersResponse.msg)
          ? usersResponse.msg
          : []
      console.log("[ChannelInfo] Users found:", usersFound)
      
      if (!Array.isArray(usersFound)) {
        console.error("[ChannelInfo] Expected an array but got:", usersFound)
        toast.error("Unexpected response from user search");
        return;
      }

      // Perform a case-insensitive comparison
      const userToAdd = usersFound.find(
        (u) =>
          u.email.toLowerCase() === trimmedInput.toLowerCase() ||
          u.username.toLowerCase() === trimmedInput.toLowerCase()
      )
      if (!userToAdd) {
        console.error("[ChannelInfo] User not found for query:", trimmedInput)
        toast.error("User not found. Please check the email or username.")
        return
      }
      console.log("[ChannelInfo] User to add:", userToAdd)
      await ChatService.addMember(userToAdd._id, channel._id)
      console.log("[ChannelInfo] Successfully added member with id:", userToAdd._id)
      toast.success("Member added successfully")
      setNewMemberEmail("")
      fetchMembers()
    } catch (error) {
      console.error("[ChannelInfo] Error adding member:", error)
      toast.error("Failed to add member")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    console.log("[ChannelInfo] Removing member with id:", memberId)
    setIsLoading(true)
    try {
      await ChatService.removeMember(memberId, channel._id)
      console.log("[ChannelInfo] Member removed:", memberId)
      toast.success("Member removed successfully")
      fetchMembers()
    } catch (error) {
      console.error("[ChannelInfo] Error removing member:", error)
      toast.error("Failed to remove member")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToContacts = async (memberId) => {
    console.log("[ChannelInfo] Adding member to contacts, id:", memberId)
    setIsLoading(true)
    try {
      await ChatService.addMemberToContacts(memberId, channel._id)
      console.log("[ChannelInfo] Added to contacts:", memberId)
      toast.success("Added to contacts successfully")
    } catch (error) {
      console.error("[ChannelInfo] Error adding to contacts:", error)
      toast.error("Failed to add to contacts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChannel = async () => {
    console.log("[ChannelInfo] Deleting channel:", channel._id)
    setIsDeleting(true)
    try {
      await ChatService.deleteChannel(channel._id)
      console.log("[ChannelInfo] Channel deleted successfully")
      toast.success("Channel deleted successfully")
      setIsDeleteDialogOpen(false)
      onClose()
      window.location.reload()
    } catch (error) {
      console.error("[ChannelInfo] Error deleting channel:", error)
      toast.error("Failed to delete channel")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <span className="font-bold">#{channel.name}</span>
          </SheetTitle>
          <SheetDescription>{channel.description}</SheetDescription>
        </SheetHeader>

        {isOwner && (
          <div className="flex justify-end mb-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                console.log("[ChannelInfo] Open delete dialog");
                setIsDeleteDialogOpen(true)
              }}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Channel
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-4 text-sm font-medium">Add Member</h3>
            <form onSubmit={handleAddMember} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={newMemberEmail}
                onChange={(e) => {
                  console.log("[ChannelInfo] New member email changed:", e.target.value);
                  setNewMemberEmail(e.target.value)
                }}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </form>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium">
              Members ({Array.isArray(members) ? members.length : 0})
            </h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading members...</p>
                </div>
              ) : (
                Array.isArray(members) &&
                members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.username?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.username.toLowerCase()}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToContacts(member._id)}
                        title="Add to contacts"
                        disabled={isLoading || member._id === user?.id}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      {isOwner && member._id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member._id)}
                          title="Remove from channel"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </SheetContent>

      {/* Delete Channel Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        console.log("[ChannelInfo] Delete dialog open:", open);
        setIsDeleteDialogOpen(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the channel "{channel.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChannel} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChannelInfo;
