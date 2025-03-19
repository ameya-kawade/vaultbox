import * as Minio from "minio";
import uploadToBucket from "../utils/uploadToBucket.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import renewPresignedUrl from "../utils/renewPresignedUrl.js";
import { File } from "../models/file.model.js";
import { Message } from "../models/message.model.js";

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

  try {
    for (const file of req.files) {
      // Upload file to storage bucket and destructure the response
      const { presignedUrl, bucketName } = await uploadToBucket(
        file.path,
        file.mimetype,
      );

      // Save file details in MongoDB with the correct fileUrl as a string
      const newFile = await File.create({
        fileName: file.originalname,
        mimetype: file.mimetype,
        fileSize: file.size,
        fileUrl: presignedUrl, // Fixed: storing the string URL
        uploadedAt: new Date(),
        userId: req.user?.id || null, // Ensuring user is authenticated
        bucketName: bucketName, // Using the bucketName from uploadToBucket
      });

      uploadedFiles.push(newFile);
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
