const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
require('dotenv').config();

const encryptionKey = process.env.ENCRYPTION_KEY;

function encryptRefreshToken(refreshToken) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
  let encryptedToken = cipher.update(refreshToken, 'utf8', 'hex');
  encryptedToken += cipher.final('hex');
  return `${iv.toString('hex')}:${encryptedToken}`;
}

function decryptRefreshToken(encryptedToken) {
  const [iv, encryptedData] = encryptedToken.split(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedToken = decipher.update(encryptedData, 'hex', 'utf8');
  decryptedToken += decipher.final('utf8');
  return decryptedToken;
}

module.exports = {
  encryptRefreshToken,
  decryptRefreshToken
};