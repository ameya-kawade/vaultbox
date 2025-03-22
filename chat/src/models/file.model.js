import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const fileSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return `file_${uuidv4().slice(0, 8)}`;
    }
  },
  messageId: { type: String, refPath: 'messageType' },
  messageType: { 
    type: String, 
    enum: ['Message', 'PrivateMessage'],
    default: 'Message'
  },
  channelId: { type: String, ref: "Channel" },
  receiverId: { type: String, ref: "User" },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, 
  bucketName: { type: String, default: "default-bucket" }, 
  fileSize: { type: Number, required: true },
  userId: { type: String, ref: "User" },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const File = mongoose.model("File", fileSchema);
