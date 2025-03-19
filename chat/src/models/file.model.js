import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const fileSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return `file_${uuidv4().slice(0, 8)}`;
    }
  },
  messageId: { type: String, ref: "Message" },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, 
  bucketName: { type: String }, 
  fileSize: { type: Number, required: true },
  userId: { type: String, ref: "User" }
}, { timestamps: true });

export const File = mongoose.model("File", fileSchema);
