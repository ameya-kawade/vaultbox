import jwt from 'jsonwebtoken';
import { User } from '../../models/user.model.js';

export const assignSocketId = async (socket, redisAdapter) => {
  try {
    // Get token from cookies or query params
    let token = null;
    let userId = null;
    
    // Try to get userId from query params first (used by frontend)
    if (socket.handshake.query && socket.handshake.query.userId) {
      userId = socket.handshake.query.userId;
      console.log(`Found userId in query params: ${userId}`);
    }
    
    // Get cookie header for JWT token
    const cookieHeader = socket.request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split('; ');
      for (let cookie of cookies) {
        if (cookie.startsWith("user=")) {
          token = decodeURIComponent(cookie.split('=')[1]);
          break;
        } else if (cookie.startsWith("token=")) {
          token = decodeURIComponent(cookie.split('=')[1]);
          break;
        }
      }
    }
    
    // Also check auth header as fallback
    if (!token && socket.handshake.headers.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    // If no token found but we have userId from query, try to proceed with that
    if (!token && !userId) {
      console.log('User connected without valid token or userId');
      socket.emit('error', 'Authentication required');
      socket.disconnect(true);
      return false;
    }
    
    // If we have a token, decode it and get userId
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Use decoded token's userId if query param not provided
        if (!userId) {
          userId = decodedToken.id || decodedToken._id;
        }
      } catch (err) {
        console.error('JWT verification error:', err);
      }
    }
    
    // Ensure userId is defined
    if (!userId) {
      console.log('Could not determine user ID');
      socket.emit('error', 'Authentication failed');
      socket.disconnect(true);
      return false;
    }
    
    // Critical: Convert userId to appropriate type for MongoDB lookup
    // MongoDB _id can be either a string or a number, so try both
    console.log(`Looking up user with ID: ${userId} (${typeof userId})`);
    
    // Try multiple approaches to find the user
    let userExists = null;
    
    try {
      // Try string ID first
      userExists = await User.findById(String(userId));
      
      // If not found, try numeric ID if it's a valid number
      if (!userExists && !isNaN(userId)) {
        userExists = await User.findById(Number(userId));
      }
      
      // If still not found, try a more flexible query
      if (!userExists) {
        userExists = await User.findOne({
          $or: [
            { _id: String(userId) },
            { _id: Number(userId) },
            { id: String(userId) },
            { id: Number(userId) }
          ]
        });
      }
    } catch (err) {
      console.error('Error finding user:', err);
    }
    
    if (!userExists) {
      console.error(`User not found in database for ID: ${userId}`);
      socket.emit('error', 'User not found');
      socket.disconnect(true);
      return false;
    }
    
    // User found, proceed with connection
    console.log(`User found: ${userExists.username} with ID ${userExists._id}`);
    
    // Attach the user object to the socket
    socket.user = { 
      id: String(userExists._id),
      username: userExists.username,
      role: userExists.role || 'user'
    };
    
    // Store mappings between socket id and user id in Redis
    await redisAdapter.hset('socket:custom', socket.id, socket.user.id);
    await redisAdapter.hset('custom:socket', socket.user.id, socket.id);
    
    console.log(`User connected with ID: ${socket.user.id} (Socket ID: ${socket.id})`);
    return true;
  } catch (error) {
    console.error('Socket connection error:', error);
    socket.emit('error', 'Connection error');
    socket.disconnect(true);
    return false;
  }
};
