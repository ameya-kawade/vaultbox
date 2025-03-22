import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../../models/user.model.js';
import { PrivateMessage } from '../../models/privateMessage.model.js';
import { File } from '../../models/file.model.js';

const getContacts = async (req, res) => {
    try {
        const { id: userId } = req.user;
        
        // Find all conversations that involve the current user
        const conversations = await PrivateMessage.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).select('senderId receiverId');
        
        // Extract unique user IDs from conversations
        const contactIds = new Set();
        conversations.forEach(conv => {
            if (String(conv.senderId) !== String(userId)) {
                contactIds.add(String(conv.senderId));
            }
            if (String(conv.receiverId) !== String(userId)) {
                contactIds.add(String(conv.receiverId));
            }
        });
        
        // Convert Set to Array for MongoDB query
        const contactIdsArray = Array.from(contactIds);
        
        // If no contacts found, return early
        if (contactIdsArray.length === 0) {
            return res.json(
                new ApiResponse(200, [], "No contacts found. Start a conversation to add contacts.")
            );
        }
        
        // Get details of the contact users
        const contacts = await User.find({ _id: { $in: contactIdsArray } }).select('username email');

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
  
        // Get messages
        const messages = await PrivateMessage.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
  
        // Get total message count
        const totalMessages = await PrivateMessage.countDocuments(query);
        const totalPages = Math.ceil(totalMessages / limitNum);
        
        // Get associated files for each message
        const messagesWithFiles = await Promise.all(messages.map(async (message) => {
            const files = await File.find({ 
                messageId: message._id, 
                messageType: 'PrivateMessage' 
            });
            
            const msgObj = message.toObject();
            msgObj.files = files;
            return msgObj;
        }));
        
        // Get orphaned files (files not attached to messages)
        const orphanedFiles = await File.find({
            messageId: null,
            messageType: 'PrivateMessage',
            userId: { $in: [currentUserId, partnerId] }
        });
  
        return res.status(200).json(
            new ApiResponse(200, 'Chat messages retrieved successfully.', {
                messages: messagesWithFiles,
                orphanedFiles,
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