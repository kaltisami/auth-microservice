const mongoose = require('mongoose');

const tokenTypes = {
  ACCESS: "access",
  REFRESH: "refresh",
};

// Define the token blacklist schema
const accessTokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  tokenType: {
    type: String,
    required: true,
  },
  revokedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the token blacklist model
const TokenBlacklist = mongoose.model('TokenBlacklist', accessTokenBlacklistSchema);

// Export the model
module.exports = {
  TokenBlacklist,
  tokenTypes,
};