import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const privateMessageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return `pmsg_${uuidv4().slice(0, 8)}`; // Unique short ID
    }
  },
  senderId: { type: String, ref: "User" },
  receiverId: { type: String, ref: "User" },
  content: { type: String, required: true }
}, { timestamps: true });

export const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema);
