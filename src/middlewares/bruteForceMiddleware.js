// Import necessary dependencies
const { User } = require('../models/User');

// Maximum number of failed login attempts allowed
const MAX_LOGIN_ATTEMPTS = 5;

// Lockout duration in minutes
const LOCKOUT_DURATION = 30;

// Middleware to handle brute force protection
const bruteForceMiddleware = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the user based on the email
    const user = await User.findOne({ email });

    if (!user) {
      // User not found, proceed with the request
      return next();
    }

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Check if the user is still within the lockout duration
      const currentTime = new Date();
      const lockoutTime = new Date(user.lockoutTime);
      const timeDiffInMinutes = Math.round((currentTime - lockoutTime) / (1000 * 60));

      if (timeDiffInMinutes < LOCKOUT_DURATION) {
        // User account is locked, return an error response
        return res.status(401).json({ error: 'Account locked. Please try again later.' });
      } else {
        // Reset failed login attempts and unlock the account
        user.loginAttempts = 0;
        user.lockoutTime = null;
        await user.save();
      }
    }

    // User is not locked, proceed with the request
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = bruteForceMiddleware;
