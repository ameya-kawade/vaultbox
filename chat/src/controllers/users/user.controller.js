import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return next(new ApiError(400, "Query parameter 'q' is required"));
    }
    // Convert query to lowercase
    const qLower = q.toLowerCase();
    // Create a case-insensitive regex based on the lowercase query
    const regex = new RegExp(qLower, "i");
    
    const users = await User.find({
      $or: [
        { email: { $regex: regex } },
        { username: { $regex: regex } }
      ]
    }).select("_id username email");

    // Map the returned usernames to lowercase
    const loweredUsers = users.map(user => ({
      _id: user._id,
      username: user.username.toLowerCase(),
      email: user.email.toLowerCase()
    }));

    return res.status(200).json(new ApiResponse(200, "Users fetched successfully", loweredUsers, true));
  } catch (error) {
    return next(new ApiError(500, "Error searching users"));
  }
};

  
export const updateUserPublicKey = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from JWT token
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({ error: "Public key is required" });
        }

        // Update user's public key
        const user = await User.findByIdAndUpdate(userId, { publicKey }, { new: true });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Public key updated successfully" });
    } catch (error) {
        console.error("Error updating public key:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
