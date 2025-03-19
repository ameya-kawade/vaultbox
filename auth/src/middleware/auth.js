const jwtUtils = require('../utils/jwtUtils');  // Ensure this is imported

const authenticateToken = (req, res, next) => {
  // Get token from cookie instead of header
  const token = req.cookies.user;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwtUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken
};