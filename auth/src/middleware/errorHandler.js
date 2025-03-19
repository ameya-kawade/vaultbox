const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  if (err.message === 'Authentication failed') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  res.status(500).json({ message: 'An unexpected error occurred' });
};

module.exports = errorHandler;
