// Import necessary dependencies
const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/api/v1/userRoutes');
const cookieParser = require('cookie-parser');
require('./src/config/database');

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();

// Mount the cookie parser middlewarex
app.use(cookieParser());

/**
 * Middleware function to parse incoming requests with JSON payloads.
 * @returns None
 */
app.use(express.json());

/**
 * Middleware function to parse URL-encoded data with the extended option set to true.
 * @param {Object} express - The Express application object.
 * @returns None
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware function to parse cookies from incoming requests.
 * @returns None
 */
app.use(cookieParser());

// Mount the User routes
app.use('/api/v1/users', userRoutes);

// Error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);



// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});