const TokenBlacklist = require('../models/TokenBlacklist');

/**
 * Adds a token to the blacklist by creating a new entry in the TokenBlacklist collection.
 * @param {string} token - The token to be added to the blacklist.
 * @returns {Promise<void>} - A promise that resolves when the token is successfully added to the blacklist.
 */
async function addToBlacklist(token, tokenType) {
  const revokedToken = new TokenBlacklist({ token, tokenType });
  await revokedToken.save();
}

/**
 * Checks if a given token is blacklisted.
 * @param {string} token - The token to check.
 * @returns {Promise<boolean>} - A promise that resolves to true if the token is blacklisted, false otherwise.
 */
async function isTokenBlacklisted(token) {
  const result = await TokenBlacklist.exists({ token });
  return result;
}

/**
 * Cleans up the token blacklist by deleting all tokens that were revoked more than
 * 30 days ago.
 * @returns None
 */
async function cleanupBlacklist() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await TokenBlacklist.deleteMany({ revokedAt: { $lt: thirtyDaysAgo } });
  } catch (error) {
    console.error('Failed to clean up blacklist', error);
  }
}

setInterval(cleanupBlacklist, 24 * 60 * 60 * 1000);

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
};