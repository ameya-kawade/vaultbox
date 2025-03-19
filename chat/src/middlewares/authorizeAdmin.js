import { ApiError } from "../utils/ApiError.js";
import { Channel } from "../models/channel.model.js";

const authorizeAdmin = async (req, res, next) => {
  try {
    // Ensure an authenticated user exists
    if (!req.user) {
      return next(new ApiError(403, "Unauthorized"));
    }

    // If channelId is provided, check channel ownership.
    const { channelId } = req.body;
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return next(new ApiError(404, "Channel not found"));
      }
      // Allow if the current user is the channel owner or has admin role.
      if (
        String(channel.owner) === String(req.user.id) ||
        req.user.role === "admin"
      ) {
        return next();
      } else {
        return next(new ApiError(403, "Unauthorized"));
      }
    }

    // If no channelId is provided, only allow admin.
    // if (req.user.role === "admin") {
    //   return next();
    // } else {
    //   return next(new ApiError(403, "Unauthorized"));
    // }
  } catch (error) {
    return next(new ApiError(500, "Internal server error"));
  }
};

export default authorizeAdmin;
