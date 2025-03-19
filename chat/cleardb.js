// clearDatabase.js
import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import { Channel } from "./src/models/channel.model.js";
import { Message } from "./src/models/message.model.js";
import { File } from "./src/models/file.model.js";
import { PrivateMessage } from "./src/models/privateMessage.model.js";

const MONGODB_URI = "mongodb://root:example@mongodb:27017/test?authSource=admin";

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, { authSource: "admin" });
    console.log("Connected to MongoDB");
    await Promise.all([
      User.deleteMany({}),
      Channel.deleteMany({}),
      Message.deleteMany({}),
      File.deleteMany({}),
      PrivateMessage.deleteMany({})
    ]);
    console.log("Database cleared");
    process.exit(0);
  } catch (err) {
    console.error("Error clearing database:", err);
    process.exit(1);
  }
}

clearDatabase();
