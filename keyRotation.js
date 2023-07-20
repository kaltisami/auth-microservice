const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Function to generate a new secret for JWT tokens
function generateJwtSecret() {
  const secretBytes = crypto.randomBytes(32);
  const newJwtSecret = secretBytes.toString('hex');
  return newJwtSecret;
}

// Function to generate a new encryption key
function generateEncryptionKey() {
  const keyBytes = crypto.randomBytes(32);
  const newEncryptionKey = keyBytes.toString('hex');
  return newEncryptionKey;
}

// Function to update the secrets in the .env file
function updateSecretsInEnvFile(newAccessTokenSecret, newRefreshTokenSecret, newEncryptionKey) {
  const envFilePath = path.resolve(__dirname, '.env');
  let envContent = fs.readFileSync(envFilePath, 'utf8');

  // Update the JWT and encryption key values in the .env file
  envContent = envContent.replace(/ACCESS_TOKEN_SECRET=[^\r\n]*/, `ACCESS_TOKEN_SECRET=${newAccessTokenSecret}`);
  envContent = envContent.replace(/REFRESH_TOKEN_SECRET=[^\r\n]*/, `REFRESH_TOKEN_SECRET=${newRefreshTokenSecret}`);
  envContent = envContent.replace(/ENCRYPTION_KEY=[^\r\n]*/, `ENCRYPTION_KEY=${newEncryptionKey}`);

  fs.writeFileSync(envFilePath, envContent, 'utf8');
}

// Generate new secrets
const newAccessTokenSecret = generateJwtSecret();
const newRefreshTokenSecret = generateJwtSecret();
const newEncryptionKey = generateEncryptionKey();

// Update the secrets in the .env file
updateSecretsInEnvFile(newAccessTokenSecret, newRefreshTokenSecret, newEncryptionKey);
