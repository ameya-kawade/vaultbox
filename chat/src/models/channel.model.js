import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: function () {
      return `chnl_${this.name.replace(/\s+/g, "_").toLowerCase()}`;
    }
  },
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: String, ref: "User" }],
  owner: { type: Number, ref: "User", required: true }
}, { timestamps: true });

export const Channel = mongoose.model("Channel", channelSchema);
