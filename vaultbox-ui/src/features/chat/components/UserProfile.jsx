import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfile = ({ user }) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <p className="text-sm mb-4">{user.bio}</p>
      <h3 className="text-lg font-semibold mb-2">Shared Files</h3>
      <ScrollArea className="flex-1">
        {user.sharedFiles.map((file) => (
          <div key={file.id} className="flex items-center space-x-2 py-2">
            <span className="text-blue-500">📎</span>
            <span className="text-sm">{file.name}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default UserProfile;