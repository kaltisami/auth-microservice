const { User } = require('../models/User');
const {TokenBlacklist, tokenTypes} = require('../models/TokenBlacklist');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addToBlacklist } = require('../utils/tokenUtils');
const { encryptRefreshToken } = require('../utils/encryptionUtils');

const saltRounds = 12;

const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits();

/**
 * Hashes the given password using a password hashing library.
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 */
async function hashPassword(password) {
  // Use a password hashing library instead of bcrypt directly
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * Generates an access token for the given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {string} The access token.
 */
function generateAccessToken(userId) {
  // Use a separate function to generate and return tokens
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  return accessToken;
}

/**
 * Generates a refresh token for the given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {string} The refresh token.
 */
function generateRefreshToken(userId) {
  // Use a separate function to generate and return tokens
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  const encryptedRefreshToken = encryptRefreshToken(refreshToken); // Assign the encrypted token to the variable
  return encryptedRefreshToken;
}

/**
 * Validates the email and password format.
 * @param {string} email - The email address to be validated.
 * @param {string} password - The password to be validated.
 * @returns {Object} An object containing an error message if the email or password is invalid, or null if both are valid.
 */
function validateEmailAndPassword(email, password) {
  // Use a library like 'password-validator' for password validation
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email format' };
  }

  if (!passwordSchema.validate(password)) {
    return { error: 'Password must contain at least 8 characters, including uppercase and lowercase letters, and at least one digit' };
  }

  return null;
}

/**
 * Registers a new user with the given user data.
 * @async
 * @param {Object} userData - An object containing the user's email and password.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The user's password.
 * @returns {Object} An object containing a message and access and refresh tokens if the user was successfully registered, or an error message if there was an issue with the registration process.
 */
async function registerUser(userData) {
  try {
    const { email, password } = userData;

    const validationError = validateEmailAndPassword(email, password);
    if (validationError) {
      return validationError;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({ ...userData, password: hashedPassword });
    const savedUser = await newUser.save();
    const accessToken = generateAccessToken(savedUser._id);
    const refreshToken = generateRefreshToken(savedUser._id);

    return { message: 'User registered successfully', accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Authenticates a user by checking if the email and password are valid.
 * @param {string} email - the email of the user
 * @param {string} password - the password of the user
 * @returns {Object} - an object containing either an error message or an access token and refresh token
 * if the authentication is successful.
 */
async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return { error: 'Invalid email or password' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: 'Invalid email or password' };
    }

    const accessToken = generateAccessToken(user._id);
    const encryptedRefreshToken = generateRefreshToken(user._id);

    // Save the encrypted refresh token to the user model
    user.encryptedRefreshToken = encryptedRefreshToken;
    await user.save();

    return { accessToken, refreshToken: encryptedRefreshToken };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Logs out a user by adding their access token to the list of revoked tokens.
 * @param {string} access_token - The access token of the user to log out.
 * @returns {Promise<{message: string} | {error: string}>} - A promise that resolves with a success message or rejects with an error message.
 * If the access token is not provided, the promise will reject with an error message.
 * If there is an error while logging out the user, the promise will reject with an error message.
 */
async function logoutUser(access_token, refresh_token) {
  try {
    if (!(access_token && refresh_token)) {
      return { error: 'Access and refresh tokens are required' };
    }

    await addToBlacklist(access_token.access_token, TokenBlacklist.tokenTypes.ACCESS);
    await addToBlacklist(refresh_token.refresh_token, TokenBlacklist.tokenTypes.REFRESH);

    return { message: 'User logged out successfully' };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Retrieves a user from the database by their ID and returns an object with their
 * information, excluding sensitive data.
 * @param {string} userId - the ID of the user to retrieve
 * @returns {Promise<Object>} - an object containing the user's information, or an error message
 * if the user is not found or there is an internal server error.
 */
async function getUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    const userWithoutSensitiveInfo = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      // Add other non-sensitive user properties here
    };

    return userWithoutSensitiveInfo;
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Updates a user's information in the database.
 * @param {string} userId - The ID of the user to update.
 * @param {Object} updateData - An object containing the updated user information.
 * @returns {Object} - An object containing the updated user information without sensitive data.
 * If the user is not found, returns an error object with a message "User not found".
 * If there is an internal server error, returns an error object with a message "Internal server error".
 */
async function updateUser(userId, updateData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    Object.assign(user, updateData);
    await user.save();

    const userWithoutSensitiveInfo = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      // Add other non-sensitive user properties here
    };

    return userWithoutSensitiveInfo;
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Deletes a user with the given ID from the database.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<{message: string}> | {error: string}>} - A message indicating success or an error message.
 */
async function deleteUser(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    await user.remove();

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Retrieves all users from the database.
 * @returns {Promise<{users: User[]}>} - A promise that resolves to an object containing an array of users.
 * If an error occurs, the promise will resolve to an object containing an error message.
 */
async function getUsers() {
  try {
    const users = await User.find();
    return { users };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * Changes the role of a user with the given ID.
 * @param {string} userId - The ID of the user to update.
 * @param {string} role - The new role to assign to the user.
 * @returns {Promise<{message: string, user: User} | {error: string}>} - A promise that resolves to an object containing a success message and the updated user object, or an error message if the user is not found or an internal server error occurs.
 */
async function changeUserRole(userId, role) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found' };
    }

    user.role = role;
    await user.save();

    return { message: 'User role updated successfully', user };
  } catch (error) {
    console.error(error);
    return { error: 'Internal server error' };
  }
}

/**
 * A module that exports functions for user management.
 * @module userManagement
 */
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  changeUserRole,
};