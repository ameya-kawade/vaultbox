// vaultbox-chatapp/tokengen.js
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;

// Set expiration time in seconds (5 years)
const expiresInSeconds = 5 * 365 * 24 * 60 * 60; // 5 years in seconds

export const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: "admin" // Assigning admin role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
};

if (process.argv[1] === new URL(import.meta.url).pathname) {
  // Sample admin user data
  const sampleUser = {
    _id: 1,
    username: "Rushi",
    email: "therushidesign@gmail.com",
    role: "admin" // Admin role
  };
  
  const token = generateToken(sampleUser);
  
  // Compute expiration date for the cookie
  const expirationDate = new Date(Date.now() + expiresInSeconds * 1000);
  const expiresStr = expirationDate.toUTCString();

  // Construct the cookie string
  const cookieString = `user=${token}; Path=/; Expires=${expiresStr};`;
  
  console.log("Cookie string for Postman:");
  console.log(cookieString);
}
