import * as Minio from "minio";
import uploadToBucket from "../utils/uploadToBucket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import renewPresignedUrl from "../utils/renewPresignedUrl.js";
import { File } from "../models/file.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Channel } from "../models/channel.model.js";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const propogateFileMessage = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  const uploadedFiles = [];
  // Extract IDs from query params
  const chatId = req.query.userId;  // For direct messages
  const channelId = req.query.channelId;  // For channel messages
  
  try {
    // Get sender information for enhanced metadata
    const sender = {
      _id: req.user?.id || null,
      username: req.user?.username || "Unknown User"
    };

    // Get chat or channel metadata if available
    let chatName = null;
    let channelName = null;

    if (channelId) {
      // Get channel information
      try {
        const channel = await Channel.findById(channelId);
        if (channel) {
          channelName = channel.name;
        }
      } catch (error) {
        console.log("Error fetching channel info:", error);
      }
    } else if (chatId) {
      // Get chat partner information
      try {
        const chatPartner = await User.findById(chatId);
        if (chatPartner) {
          chatName = chatPartner.username;
        }
      } catch (error) {
        console.log("Error fetching chat partner info:", error);
      }
    }
    
    for (const file of req.files) {
      // Upload file to storage bucket and destructure the response
      const { presignedUrl, bucketName } = await uploadToBucket(
        file.path,
        file.mimetype,
      );

      // Prepare file data
      const fileData = {
        fileName: file.originalname,
        mimetype: file.mimetype,
        fileSize: file.size,
        fileUrl: presignedUrl,
        uploadedAt: new Date(),
        userId: req.user?.id || null,
        bucketName: bucketName,
      };
      
      // Set appropriate message type and channel ID if applicable
      if (channelId) {
        fileData.channelId = channelId;
        fileData.messageType = 'Message';
      } else if (chatId) {
        fileData.messageType = 'PrivateMessage';
      }

      // Save file details in MongoDB
      const newFile = await File.create(fileData);

      // Prepare enhanced file metadata for frontend
      const enhancedFile = {
        _id: newFile._id,
        fileName: newFile.fileName,
        fileUrl: newFile.fileUrl,
        fileSize: newFile.fileSize,
        bucketName: newFile.bucketName,
        uploadedAt: newFile.uploadedAt,
        sender: sender,
        chatId: chatId || null,
        channelId: channelId || null,
        chatName: chatName,
        channelName: channelName
      };

      uploadedFiles.push(enhancedFile);
    }

    req.uploadedFiles = uploadedFiles; // Attach file metadata to req object

    res
      .status(200)
      .json(new ApiResponse(200, uploadedFiles, "Files uploaded successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

const presignedUrlRenewal = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Fetch message details from database
    const message = await Message.findById(messageId);
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    // Ensure the message is a file type
    const fileDetails = await File.findOne({ messageId });
    if (!fileDetails) {
      throw new ApiError(400, "No file associated with this message");
    }

    // Generate new presigned URL
    const presignedUrl = await renewPresignedUrl(
      fileDetails.fileUrl,
      fileDetails.bucketName,
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          presignedUrl,
          "Presigned URL retrieved successfully",
        ),
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

const deleteFile = async (req, res) => {
  try {
    const { messageId } = req.body;

    // Fetch bucketName, filename from files Collection from MongoDB
    const bucketName = "";
    const fileName = "";

    if (!bucketName || !fileName) {
      return next(new ApiError(400, "Bucket name and file name are required"));
    }

    await minioClient.removeObject(bucketName, fileName);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    if (error.code === "NoSuchBucket") {
      return new ApiError(404, "Bucket not found");
    }
    if (error.code === "NoSuchKey") {
      return new ApiError(404, "File not found in the bucket");
    }
    new ApiError(500, "Internal Server Error");
  }
};

export { propogateFileMessage, presignedUrlRenewal, deleteFile };
