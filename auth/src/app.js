const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
const morgan = require('morgan');
// const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('./config');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const app = express();

// // Middleware
// app.use(helmet());
// const corsOptions = {
//   origin: ['http://localhost:4001'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };

// app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Routes - only register once
app.use('/api', authRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;