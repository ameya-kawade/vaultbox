import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Channel } from "../../models/channel.model.js";
import { User } from "../../models/user.model.js";
import { Message } from "../../models/message.model.js";

const getChat = async (req, res, next) => {
  try {
    const channelId = String(req.params.channelId);
    //   if (isNaN(channelId)) {
    //     return next(new ApiError(400, 'Invalid channel id.'));
    //   }

    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 10;

    const messages = await Message.find({ channelId: channelId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalMessages = await Message.countDocuments({
      channelId: channelId,
    });
    const totalPages = Math.ceil(totalMessages / limitNum);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Chat messages retrieved successfully.",
        {
          messages,
          currentPage: pageNum,
          totalPages,
          totalMessages,
        },
        true,
      ),
    );
  } catch (error) {
    console.error("Error fetching channel chat messages:", error);
    return next(
      new ApiError(500, "An error occurred while fetching chat messages."),
    );
  }
};

const getChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find();

    if (!channels || channels.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "No channels found. Join or create a channel.",
            null,
            true,
          ),
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Channels retrieved successfully.",
          { channels },
          true,
        ),
      );
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while fetching channels."),
    );
  }
};

const addMember = async (req, res) => {
  try {
    const { userId, channelId } = req.body;

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      throw new ApiError(404, "User not found");
    }

    const userInChannel = await Channel.exists({
      _id: channelId,
      members: userId,
    });
    if (userInChannel) {
      return res.json(
        new ApiResponse(200, null, "User is already in the channel"),
      );
    }

    await Channel.updateOne({ _id: channelId }, { $push: { members: userId } });
    await User.updateOne(
      { _id: userId },
      { $push: { joinedChannels: channelId } },
    );

    return res.json(new ApiResponse(200, null, "User added successfully"));
  } catch (error) {
    throw new ApiError(500, "An error occurred while adding member to channel");
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId, channelId } = req.body;

    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      throw new ApiError(404, "User not found");
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    if (!channel.members.includes(userId)) {
      throw new ApiError(404, "User is not a member of this channel");
    }

    await Channel.updateOne({ _id: channelId }, { $pull: { members: userId } });
    await User.updateOne(
      { _id: userId },
      { $pull: { joinedChannels: channelId } },
    );

    return res.json(
      new ApiResponse(200, null, "User removed from channel successfully"),
    );
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while removing member from channel",
    );
  }
};

const createChannel = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const owner = req.user.id; // current authenticated user

    // Create the channel with owner set and add owner to members array.
    const newChannel = new Channel({
      name,
      description,
      owner,
      members: [String(owner)]
    });

    await newChannel.save();

    // Update the owner's joinedChannels in the User model.
    await User.updateOne(
      { _id: owner },
      { $push: { joinedChannels: newChannel._id } }
    );

    return res.status(201).json(
      new ApiResponse(201, "Channel created successfully", newChannel, true)
    );
  } catch (error) {
    return next(new ApiError(500, "Error creating channel"));
  }
};

const addMemberToContacts = async (req, res, next) => {
  try {
    const { userId, channelId } = req.body;
    const currentUserId = req.user.id;

    // Retrieve the channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }

    // Verify both current user and target user are in the channel
    if (
      !channel.members.includes(String(currentUserId)) ||
      !channel.members.includes(String(userId))
    ) {
      throw new ApiError(
        402,
        "Both users must be in the same channel to add each other to contacts"
      );
    }

    // Retrieve the user documents
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      throw new ApiError(404, "Target user not found");
    }
    if (!currentUser) {
      throw new ApiError(404, "Current user not found");
    }

    // Add target user to current user's contacts if not already present.
    if (!currentUser.contacts.includes(Number(userId))) {
      currentUser.contacts.push(Number(userId));
      await currentUser.save();
    }

    // Also add current user to target user's contacts if not already present.
    if (!targetUser.contacts.includes(Number(currentUserId))) {
      targetUser.contacts.push(Number(currentUserId));
      await targetUser.save();
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Both users added to each other's contacts successfully",
        null,
        true
      )
    );
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

const getChannelMembers = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate("members", "_id username email");
    if (!channel) return next(new ApiError(404, "Channel not found"));
    return res.status(200).json(
      new ApiResponse(200, "Channel members retrieved", channel.members, true)
    );
  } catch (error) {
    return next(new ApiError(500, "Error retrieving channel members"));
  }
};

const deleteChannel = async (req, res, next) => {
  try {
    // Expect channelId to be passed as a URL parameter
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return next(new ApiError(404, "Channel not found"));
    }
    // Only allow deletion if the authenticated user is the channel owner or an admin
    if (String(req.user.id) !== String(channel.owner) && req.user.role !== "admin") {
      return next(new ApiError(403, "Unauthorized to delete this channel"));
    }
    // Delete the channel document
    await channel.deleteOne();
    // Optionally, remove this channel from all users' joinedChannels arrays
    await User.updateMany({ joinedChannels: channelId }, { $pull: { joinedChannels: channelId } });
    return res.status(200).json(new ApiResponse(200, "Channel deleted successfully", null, true));
  } catch (error) {
    return next(new ApiError(500, "Error deleting channel"));
  }
};



export { getChannels, addMember, getChat, removeMember , addMemberToContacts, getChannelMembers, createChannel, deleteChannel };