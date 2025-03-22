import { Channel } from '../../models/channel.model.js';
import { Message } from '../../models/message.model.js';
import { File } from '../../models/file.model.js';
import { User } from '../../models/user.model.js'; 
const channelsHandler = async (socket) => {
  // Listen for the authentication event from the client.
  socket.on('authenticate', async (data) => {
    try {
      // Get userId from data or URL query parameters
      let userId = data?.userId;
      
      // If not provided in data, check URL params
      if (!userId && socket.handshake.query && socket.handshake.query.userId) {
        userId = socket.handshake.query.userId;
      }
      
      // If still no userId but we have socket.user.id (from token auth)
      if (!userId && socket.user && socket.user.id) {
        userId = socket.user.id;
      }
      
      if (!userId) {
        throw new Error("No user ID available for authentication");
      }
      
      console.log(`Authenticating socket for user: ${userId}`);
      
      // Convert to string for consistency
      userId = String(userId);
      
      // Set the user information on the socket if not already set
      if (!socket.user) {
        socket.user = { id: userId };
      }
      
      // Ensure user exists in database before joining channels
      try {
        const user = await User.findById(userId);
        if (!user && !isNaN(userId)) {
          // Try numeric ID if string ID failed
          const userNumeric = await User.findById(Number(userId));
          if (userNumeric) {
            // Update socket.user with found user
            socket.user.id = String(userNumeric._id);
            socket.user.username = userNumeric.username;
          }
        }
      } catch (err) {
        console.error(`Error verifying user ${userId} before joining channels:`, err);
      }
      
      // Now join channels
      await joinUserToChannels(socket);
    } catch (error) {
      console.error("Socket authentication error:", error);
      socket.emit('error', error.message);
    }
  });

  // Set up event listeners for group messages and file notifications.
  sendMessage(socket);
  fileSendNotify(socket);

  // When the socket disconnects, remove it from any joined channels.
  socket.on('disconnect', async () => {
    console.log('Socket disconnected, removing from channels');
    await removeUserFromChannels(socket);
  });
};

function sendMessage(socket) {
  socket.on('grpMessage', async (data) => {
    try {
      const { channelId, senderId, content, fileIds } = data;
      if (!channelId || !senderId || !content) {
        throw new Error("Missing required message data");
      }
      
      // Convert senderId to string for consistent comparisons
      const senderIdStr = String(senderId);
      
      // Check if the channel exists
      const channelExists = await Channel.exists({ _id: channelId });
      if (!channelExists) {
        throw new Error("Channel doesn't exist");
      }
      
      // Find sender (try both string and numeric ID)
      let sender = await User.findById(senderIdStr);
      if (!sender && !isNaN(senderIdStr)) {
        sender = await User.findById(Number(senderIdStr));
      }
      
      if (!sender) {
        throw new Error("Sender not found");
      }
      
      // Add sender's name to data
      data.senderName = sender.username;

      // Broadcast the message to other sockets in the channel
      socket.broadcast.to(channelId).emit('grpMessage', data);
      
      // Broadcast notification to the channel
      socket.to(channelId).emit('notification', {
        type: 'message',
        title: 'New Message',
        content: `${sender.username} sent a message in channel ${channelId}`,
        senderId: senderIdStr,
        chatId: channelId
      });
      
      // Save the message to the database with consistent ID format
      const savedMessage = await Message.create({ 
        channelId, 
        senderId: senderIdStr, 
        content 
      });

      // If there are associated file IDs, update the files with the message ID
      if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
        await File.updateMany(
          { _id: { $in: fileIds } },
          { 
            messageId: savedMessage._id, 
            messageType: 'Message',
            channelId: channelId
          }
        );
      }
      
      // Send the message ID back to the sender
      socket.emit('messageSent', { 
        success: true, 
        messageId: savedMessage._id,
        channelId: channelId
      });
      
      console.log(`Message sent by ${sender.username} in channel ${channelId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit('error', error.message);
    }
  });
}

function fileSendNotify(socket) {
  socket.on('grpFileSendNotify', async (data) => {
    try {
      const { channelId, userId, uploadedFiles } = data;
      // Check if the channel exists.
      const channelExists = await Channel.exists({ _id: channelId });
      if (channelExists) {
        // Broadcast the file send notification.
        socket.broadcast.to(channelId).emit('grpFileSendNotify', data);
        
        // Process files
        let filesArray = [];
        if (Array.isArray(uploadedFiles)) {
          filesArray = uploadedFiles;
        } else if (uploadedFiles && uploadedFiles.data && Array.isArray(uploadedFiles.data)) {
          filesArray = uploadedFiles.data;
        }
        
        // Create file records with proper channel association
        const fileRecords = await Promise.all(filesArray.map(async file => {
          const fileRecord = await File.create({ 
            userId, 
            fileName: file.fileName || file.filename, 
            fileUrl: file.fileUrl || file.url, 
            fileSize: file.fileSize || file.size, 
            bucketName: file.bucketName || "default-bucket",
            uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
            messageType: 'Message',
            channelId: channelId
          });
          return fileRecord._id;
        }));
        
        // Emit the file IDs back to the sender so they can be included in a message
        socket.emit('filesUploaded', { fileIds: fileRecords, channelId });
      } else {
        socket.emit('error', "Channel doesn't exist");
      }
    } catch (error) {
      socket.emit('error', error.message);
      console.log(error);
    }
  });
}

async function joinUserToChannels(socket) {
  try {
    const userId = socket.user?.id;
    if (!userId) {
      throw new Error("User ID not found in socket.");
    }
    
    console.log(`Joining channels for user ${userId}`);
    
    // Find all channels where the user is a member
    // Try both string and numeric IDs
    const userIdNum = !isNaN(userId) ? Number(userId) : null;
    
    const query = { 
      members: { 
        $in: userIdNum ? [userId, userIdNum] : [userId] 
      } 
    };
    
    const userChannels = await Channel.find(query).select('_id');
    
    if (userChannels.length === 0) {
      console.log(`No channels found for user ${userId}`);
    }
    
    for (let channel of userChannels) {
      const channelId = String(channel._id);
      socket.join(channelId);
      console.log(`Socket joined channel ${channelId}`);
    }
  } catch (error) {
    console.error("Error joining channels:", error);
    socket.emit('error', error.message);
  }
}

async function removeUserFromChannels(socket) {
  try {
    const userId = socket.user?.id;
    if (!userId) {
      throw new Error("User ID not found in socket.");
    }
    // Find all channels where the user is a member.
    const userChannels = await Channel.find({ members: userId }).select('_id');
    for (let channel of userChannels) {
      socket.leave(channel._id.toString());
      console.log(`Socket left channel ${channel._id.toString()}`);
    }
  } catch (error) {
    socket.emit('error', error.message);
    console.log(error);
  }
}

export { channelsHandler, removeUserFromChannels, joinUserToChannels };
