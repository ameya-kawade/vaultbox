import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return `msg_${uuidv4().slice(0, 8)}`; // Short UUID
    }
  },
  channelId: { type: String, ref: "Channel" },
  senderId: { type: String, ref: "User" },
  content: { type: String, required: true }
}, { timestamps: true });

export const Message = mongoose.model("Message", messageSchema);
