const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models/User');
const { isTokenBlacklisted } = require('../utils/tokenUtils');

// Load environment variables or use default values
require('dotenv').config();

// Configure the JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '1h', // Token expiration time
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      //console.log('Authentication payload:', payload);

      // Find the user based on the ID in the payload
      const user = await User.findById(payload.userId);
      
      //console.log('User found:', user); // Debug statement: Log the user object

      // If the user is found and the token is not revoked, return the user object
      if (user && !(await isTokenBlacklisted(payload.token))) {
        console.log('Authentication successful'); // Debug statement: Log successful authentication
        return done(null, user);
      }

      //console.log('Authentication failed'); // Debug statement: Log authentication failure

      // If user is not found or token is revoked, return false
      return done(null, false);
    } catch (error) {
      //console.log('Error during authentication:', error); // Debug statement: Log authentication error
      
      // Handle errors
      return done(error, false);
    }
  })
);

// Middleware for authenticating requests
const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) {
      //console.log('Authentication error:', error); // Debug statement: Log authentication error
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      //console.log('User not found',user); // Debug statement: Log user not found
      return res.status(401).json({ error: 'Unauthorized' });
    }

    //console.log('User authenticated:', user); // Debug statement: Log the authenticated user
    req.user = user; // Attach the authenticated user to the request object

    // Continue to the next middleware or route handler
    next();
  })(req, res, next);
};

module.exports = {
  authMiddleware,
};
