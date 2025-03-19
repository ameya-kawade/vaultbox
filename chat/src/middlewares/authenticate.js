import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const authenticate = async (req, res, next) => {
    const token = req.cookies.user;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Handle both ID formats
      if (!decoded.id && !decoded._id) {
        throw new Error("Invalid token format: missing user ID");
      }
      
      // Get userId in string format
      const userId = String(decoded.id || decoded._id);
      
      // Actually verify the user exists in the database
      let user = null;
      
      try {
        // Try different methods to find the user
        user = await User.findById(userId);
        
        if (!user && !isNaN(userId)) {
          user = await User.findById(Number(userId));
        }
        
        if (!user) {
          user = await User.findOne({ 
            $or: [
              { _id: userId },
              { id: userId }
            ]
          });
        }
      } catch (err) {
        console.error('Error finding user:', err);
      }
      
      if (!user) {
        console.log(`User not found in database for ID: ${userId}`);
        return res.status(401).json({ message: "User not found" });
      }
      
      // Normalize the user object
      req.user = {
        id: String(user._id),
        username: user.username || decoded.username,
        email: user.email || decoded.email,
        role: user.role || decoded.role || "user"
      };

      next();
    } 
    catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: "Invalid authentication token" });
    }
};

export default authenticate;