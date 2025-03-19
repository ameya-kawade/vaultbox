const jwtUtils = require('../utils/jwtUtils');
const otpUtils = require('../utils/otpUtils');
const emailService = require('./emailService');

// Mock user data (replace with a database later)
const users = [
  {
    id: '1',
    email: 'therushidesign@gmail.com',
    username: 'Rushi',
    password: 'pass', // Plain password - no hashing for now
    role: 'admin',
    createdAt: '2024-02-08',
    lastLogin: null
  },
  {
    id: '2',
    email: 'notavgrushi@gmail.com',
    username: 'psy',
    password: 'zero', // Plain password - no hashing for now
    role: 'user',
    createdAt: '2024-02-08',
    lastLogin: null
  }
];

const otpStore = new Map();

// Authenticate user and generate OTP
const authenticateUser = async (email, password) => {
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Authentication failed');

  // Direct comparison without bcrypt
  if (user.password !== password) {
    throw new Error('Authentication failed');
  }

  const otp = otpUtils.generateOTP();

  // Always store with string ID and log the exact value
  const userIdStr = String(user.id);
  otpStore.set(userIdStr, { otp, createdAt: Date.now() });
  
  console.log(`Stored OTP ${otp} for userId=${userIdStr}`);

  emailService.sendOTPEmail(user.email, otp)
    .then(() => console.log(`OTP email sent to ${user.email}: ${otp}`))
    .catch(err => console.error('Error sending OTP email:', err));

  // Return the user ID as-is (string)
  return { userId: user.id };
};

// Verify OTP and issue JWT token
const verifyOTP = async (userId, otp) => {
  // Convert userId to string to match how it's stored
  const userIdStr = String(userId);
  
  // Log for debugging
  console.log(`Verifying OTP for userId=${userId}, stored OTPs:`, 
    Array.from(otpStore.entries()).map(([id, data]) => `${id}:${data.otp}`));
  
  const storedOTP = otpStore.get(userIdStr);
  if (!storedOTP) {
    console.log(`No OTP found for userId=${userIdStr}`);
    throw new Error('Invalid OTP or OTP expired');
  }

  // Log the OTP comparison
  console.log(`Comparing provided OTP=${otp} with stored OTP=${storedOTP.otp}`);
  
  if (storedOTP.otp !== otp || Date.now() - storedOTP.createdAt > 5 * 60 * 1000) {
    otpStore.delete(userIdStr);
    throw new Error('Invalid or expired OTP');
  }

  otpStore.delete(userIdStr);
  
  // Also convert userId to string when looking up the user
  const user = users.find(u => String(u.id) === userIdStr);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.lastLogin = new Date().toISOString();
  
  const userData = {
    id: String(user.id),
    email: user.email,
    username: user.username,
    role: user.role,
    lastLogin: user.lastLogin
  };
  
  const token = jwtUtils.generateToken(userData);
  
  return { token, user: userData };
};

const getUserById = (userId) => {
  // Convert to string to ensure consistent comparison
  const userIdStr = String(userId);
  return users.find(user => String(user.id) === userIdStr) || null;
};


// Export everything properly
module.exports = {
  authenticateUser,
  verifyOTP,
  getUserById
};