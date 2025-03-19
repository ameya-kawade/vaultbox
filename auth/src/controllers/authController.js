const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const config = require('../config');
const jwtUtils = require('../utils/jwtUtils'); 
const { v4: uuidv4 } = require("uuid");

// In-memory meeting store for tracking active meetings
const meetingStore = new Set(); // Use a Set to track unique meeting names

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticateUser(email, password);
    
    // Ensure userId is explicitly a string before sending back to client
    const userId = String(result.userId);
    
    // Log the exact value we're sending back
    console.log(`Login successful for ${email}, returning userId: ${userId} (type: ${typeof userId})`);
    
    // Return userId as string 
    res.json({ userId });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Verify OTP and generate token
    const { token, user: userData } = await authService.verifyOTP(userId, otp);

    if (!token) {
      throw new Error("Failed to generate token");
    }

    // Set HTTP-only cookie with JWT token
    res.cookie("user", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: (process.env.NODE_ENV === "production"? 365 : 1) * 24 * 60 * 60 * 1000, 
    });

    // Return only one response with the format the frontend expects
    res.json({
      user: {
        id: userData.id,
        name: userData.username,
        email: userData.email,
      }
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(400).json({ message: error.message || "OTP verification failed" });
  }
};

const validateSession = async (req, res) => {
  try {
    const token = req.cookies.user;
    if (!token) {
      return res.status(401).json({ message: "No authentication token" });
    }

    const decoded = jwtUtils.verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token: userId missing");
    }

    const user = await authService.getUserById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    res.json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role || "admin",
      },
    });
  } catch (error) {
    console.error("Session validation failed:", error.message);
    res.status(401).json({ message: error.message || "Invalid session" });
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

const getUserById = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const token = req.cookies.user;
    if (!token) {
      return res.status(401).json({ message: "No authentication token" });
    }

    const decoded = jwtUtils.verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token: id missing");
    }

    const user = await authService.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
};

/**
 * Creates a new meeting if the name doesn't already exist and returns a Jitsi token
 */
const createMeeting = async (req, res) => {
  try {
    const { room } = req.body;
    
    if (!room) {
      return res.status(400).json({ message: "Meeting name is required" });
    }
    
    // Check if meeting name already exists
    if (meetingStore.has(room)) {
      return res.status(409).json({ 
        message: "Meeting already exists", 
        exists: true 
      });
    }
    
    // Add meeting to the store
    meetingStore.add(room);
    console.log(`Meeting created: ${room}. Total active meetings: ${meetingStore.size}`);
    
    
    const jitsiToken = jwtUtils.generateJitsiToken(req.user, room);
    
    res.status(201).json({ 
      message: "Meeting created successfully",
      room: room,
      token: jitsiToken,  // Include the JWT token in the response
      meetingId: room,
      roomName: room
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ message: "Failed to create meeting" });
  }
};

/**
 * Deletes a meeting if it exists in the store
 */
const deleteMeeting = async (req, res) => {
  try {
    const { room } = req.body;
    
    if (!room) {
      return res.status(400).json({ message: "Meeting name is required" });
    }
    
    // Check if meeting exists
    if (!meetingStore.has(room)) {
      return res.status(404).json({ 
        message: "Meeting does not exist or has already ended",
        exists: false 
      });
    }
    
    // Remove meeting from the store
    meetingStore.delete(room);
    console.log(`Meeting deleted: ${room}. Total active meetings: ${meetingStore.size}`);
    
    res.status(200).json({ 
      message: "Meeting ended successfully" 
    });
  } catch (error) {
    console.error("Error ending meeting:", error);
    res.status(500).json({ message: "Failed to end meeting" });
  }
};

// When a Jitsi token is generated, we should check if the meeting exists
// and create it if it doesn't
const getJitsiToken = async (req, res) => {
  try {
    const { room } = req.body;
    if (!room) {
      return res.status(400).json({ message: "Room name or ID is required" });
    }
    
    // If the meeting doesn't exist yet, add it to the store
    if (!meetingStore.has(room)) {
      meetingStore.add(room);
      console.log(`Meeting automatically created: ${room}. Total active meetings: ${meetingStore.size}`);
    }
    
    const tokenFromCookie = req.user;
    const decoded = jwtUtils.verifyToken(tokenFromCookie);
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token: id missing");
    }
    
    const user = await authService.getUserById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Anyone can generate a token now
    const jitsiToken = jwtUtils.generateJitsiToken(user, room);
    res.json({ token: jitsiToken, meetingId: room, roomName: room });
  } catch (error) {
    console.error("Error generating Jitsi token:", error);
    res.status(500).json({ message: "Failed to generate Jitsi token" });
  }
};

module.exports = {
  login,
  verifyOTP,
  validateSession,
  logout,
  getUserById,
  getJitsiToken,
  createMeeting,
  deleteMeeting
};