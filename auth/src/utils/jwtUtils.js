const jwt = require('jsonwebtoken');
const config = require('../config');

const SECRET_KEY = config.jwtSecret;

// Generate JWT Token with compatible format for chat service
const generateToken = (user) => {
  return jwt.sign(
    {
      id: String(user.id),
      _id: String(user.id), // Add _id field to match what chat service expects
      username: user.username,
      email: user.email,
      role: user.role || "user"
    },
    SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// Verify JWT Token (Improved!)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    throw new Error("Invalid token"); // ❌ Don't return null, throw an error!
  }
};

const generateJitsiToken = (user, room) => {
  return jwt.sign(
    {
      context: {
        user: {
          avatar: user.avatar || '',
          name: user.name,
          email: user.email,
          id: user.id,
        }
      },
      moderator: true,
      
      aud: "jitsi",
      iss: "jitsi",  // Replace with your Jitsi App ID
      sub: "jitsi-meet.example.com",  // Replace with your Jitsi domain
      room: "*",       
         // Room name
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token valid for 1 hour
    },
    SECRET_KEY
  );
};


module.exports = {
  generateToken,
  verifyToken,
  generateJitsiToken
};
