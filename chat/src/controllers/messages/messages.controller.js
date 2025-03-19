import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../../models/user.model.js';
import { PrivateMessage } from '../../models/privateMessage.model.js';

const getContacts = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const contacts = await User.find({ _id: { $ne: userId } }).select('username email');

        if (contacts.length === 0) {
            return res.json(
                new ApiResponse(200, null, "No contacts found. Add contacts.")
            );
        }

        return res.json(
            new ApiResponse(200, contacts, "Contacts retrieved successfully.")
        );
    } catch (error) {
        throw new ApiError(500, "An error occurred while fetching contacts.");
    }
};

const getChat = async (req, res, next) => {
    try {

        const partnerId = Number(req.params.receiverId);
        const currentUserId = req.user.id;
        console.log("partnerId:", partnerId, typeof partnerId);
        console.log("currentUserId:", currentUserId, typeof currentUserId);


      if (isNaN(partnerId) || isNaN(currentUserId)) {
        return next(new ApiError(400, 'Invalid user id.'));
      }

      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
 
      const query = {
        $or: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId }
        ]
      };
  
      const messages = await PrivateMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
  
      const totalMessages = await PrivateMessage.countDocuments(query);
      const totalPages = Math.ceil(totalMessages / limitNum);
  
      return res.status(200).json(
        new ApiResponse(200, 'Chat messages retrieved successfully.', {
          messages,
          currentPage: pageNum,
          totalPages,
          totalMessages
        }, true)
      );
    } catch (error) {
      console.error("Error in getChat:", error);
      return next(new ApiError(500, 'An error occurred while fetching chat messages.'));
    }
  };
  
  

export { getContacts, getChat };