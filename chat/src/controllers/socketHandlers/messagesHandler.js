// messagesHandler.js
import { User } from '../../models/user.model.js';
import { PrivateMessage } from '../../models/privateMessage.model.js';
import { File } from '../../models/file.model.js';

const messagesHandler = async (io, socket, redisAdapter) => {
  sendMessage(io, socket, redisAdapter);
  fileSendNotify(io, socket, redisAdapter);
};

const sendMessage = (io, socket, redisAdapter) => {
  socket.on('message', async (messageData) => {
    try {
      // Use senderId, receiverId, and content to match the frontend payload.
      const { senderId, receiverId, content } = messageData;

      // Check if the receiver exists.
      const receiverExists = await User.exists({ _id: receiverId });

      if (receiverExists) {

        const sender = await User.findById(senderId, 'username');
        messageData.senderName = sender.username;

        // Check if the receiver is connected to any Socket.IO instance.
        const socketId = await redisAdapter.hget('custom:socket', receiverId);
        if (socketId) {
          io.to(socketId).emit('message', messageData);

          //sending notification.
          io.to(socketId).emit('notification', {
            type: 'message',
            title: 'New Message',
            content: `${sender.username} sent you a message.`,
            senderId: senderId,
          });
          
        } else {
          socket.emit('info', "Receiver is offline, but message is sent.");
        }

        // Save the private message in the database.
        const savedMessage = await PrivateMessage.create({
          senderId,
          receiverId,
          content
        });

        // Optionally, send an acknowledgment back to the sender.
        socket.emit('messageSent', { success: true, messageId: savedMessage._id });
      } else {
        socket.emit('error', "Receiver doesn't exist");
      }
    } catch (error) {
      console.log(error);
      socket.emit('error', error.message);
    }
  });
};

const fileSendNotify = (io, socket, redisAdapter) => {
  socket.on('fileSendNotify', async (data) => {
    try {
      const { sender, receiver, uploadedFiles } = data;
      const receiverExists = await User.exists({ _id: receiver });
      if (receiverExists) {
        const socketId = await redisAdapter.hget('custom:socket', receiver);
        if (socketId) {
          io.to(socketId).emit('fileSendNotify', data);
        } else {
          socket.emit('info', "Receiver is offline, but file notification is sent.");
        }
        let filesArray = [];
        if (Array.isArray(uploadedFiles)) {
          filesArray = uploadedFiles;
        } else if (uploadedFiles && uploadedFiles.data && Array.isArray(uploadedFiles.data)) {
          filesArray = uploadedFiles.data;
        }
        const fileRecords = filesArray.map(file => ({
          userId: sender,
          fileName: file.filename,
          fileUrl: file.url,
          fileSize: file.size,
          bucketName: file.bucketName || "default-bucket",
          uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
          messageId: null
        }));
        await File.insertMany(fileRecords);
      } else {
        socket.emit('error', "Receiver doesn't exist");
      }
    } catch (error) {
      console.log(error);
      socket.emit('error', error.message);
    }
  });
};

export { messagesHandler };
