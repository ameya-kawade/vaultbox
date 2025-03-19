import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import { Channel } from "./src/models/channel.model.js";
import { Message } from "./src/models/message.model.js";
import { PrivateMessage } from "./src/models/privateMessage.model.js";

const MONGODB_URI = "mongodb://root:example@mongodb:27017/test?authSource=admin";

async function seedDatabaseIfNeeded() {
  try {
    await mongoose.connect(MONGODB_URI, { authSource: "admin" });
    console.log("Connected to MongoDB");

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already seeded. Exiting.");
      process.exit(0);
    }

    console.log("Seeding database...");

    // Create users with numeric IDs
    const usersData = [
      { _id: 1, username: "Rushi", email: "therushidesign@gmail.com", passwordHash: "pass123", role: "admin", isEmailVerified: true },
      { _id: 2, username: "psy", email: "notavgrushi@gmail.com", passwordHash: "pass123", isEmailVerified: true },
      { _id: 3, username: "alice", email: "alice@example.com", passwordHash: "pass123", isEmailVerified: true },
      { _id: 4, username: "bob", email: "bob@example.com", passwordHash: "pass123", isEmailVerified: true },
      { _id: 5, username: "charlie", email: "charlie@example.com", passwordHash: "pass123", isEmailVerified: true },
      { _id: 6, username: "dave", email: "dave@example.com", passwordHash: "pass123", isEmailVerified: true }
    ];

    // Capture the inserted users
    const createdUsers = await User.insertMany(usersData);
    console.log("Users created.");

    // Create channels with an owner field
    const channelsData = [
      { 
        name: "General Chat", 
        description: "A channel for general discussions.", 
        members: ["1", "2", "3", "4", "5", "6"], // Convert to strings to match schema
        owner: 1 // Rushi as owner
      },
      { 
        name: "Tech Talk", 
        description: "Discuss latest tech trends.", 
        members: ["1", "3", "4", "5"],
        owner: 1
      },
      { 
        name: "Gaming", 
        description: "Chat about gaming.", 
        members: ["2", "3", "6"],
        owner: 2
      },
      { 
        name: "Memes", 
        description: "For sharing memes.", 
        members: ["1", "2", "4", "5", "6"],
        owner: 4
      }
    ];

    const createdChannels = await Channel.insertMany(channelsData);
    console.log("Channels created.");

    // Update each user's joinedChannels and contacts
    await Promise.all(
      createdUsers.map(async (user) => {
        const contacts = createdUsers
          .filter(u => u._id !== user._id)
          .map(u => u._id); // user IDs remain numeric
          
        const joinedChannels = createdChannels
          .filter(c => c.members.includes(user._id.toString()))
          .map(c => c._id); // channel IDs are strings like "chnl_general_chat"
        
        await User.findByIdAndUpdate(user._id, { $set: { joinedChannels, contacts } });
      })
    );

    // Create messages with string IDs for senderId to match schema
    const messagesData = [
      { channelId: createdChannels[0]._id, senderId: "1", content: "Welcome to General Chat!" },
      { channelId: createdChannels[0]._id, senderId: "2", content: "Hey everyone!" },
      { channelId: createdChannels[0]._id, senderId: "3", content: "This is a cool chat app!" },
      { channelId: createdChannels[1]._id, senderId: "1", content: "Anyone trying AI stuff?" },
      { channelId: createdChannels[1]._id, senderId: "4", content: "Yes, been experimenting with OpenAI models!" },
      { channelId: createdChannels[1]._id, senderId: "5", content: "I built a chatbot recently!" },
      { channelId: createdChannels[2]._id, senderId: "6", content: "Favorite game right now?" },
      { channelId: createdChannels[2]._id, senderId: "3", content: "Elden Ring!" },
      { channelId: createdChannels[2]._id, senderId: "2", content: "I love FPS games!" },
      { channelId: createdChannels[3]._id, senderId: "5", content: "Here's a hilarious meme!" },
      { channelId: createdChannels[3]._id, senderId: "1", content: "Haha, that's a good one!" }
    ];

    await Message.insertMany(messagesData);
    console.log("Messages created.");

    // Create private messages with string IDs for senderId and receiverId
    const privateMessagesData = [
      { senderId: "1", receiverId: "2", content: "Hey Psy, how's it going?" },
      { senderId: "2", receiverId: "1", content: "Hey Rushi, I'm doing good!" },
      { senderId: "3", receiverId: "4", content: "Hi Bob, nice to meet you!" },
      { senderId: "4", receiverId: "3", content: "Nice to meet you too Alice!" },
      { senderId: "1", receiverId: "3", content: "Alice, are you joining the meeting?" },
      { senderId: "3", receiverId: "1", content: "Yes, I'll be there." },
      { senderId: "5", receiverId: "6", content: "Hey Dave, let's collaborate on a project!" },
      { senderId: "6", receiverId: "5", content: "Sure, let's discuss the details!" }
    ];

    await PrivateMessage.insertMany(privateMessagesData);
    console.log("Private Messages created.");

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedDatabaseIfNeeded();
