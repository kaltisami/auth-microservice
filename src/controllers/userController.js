const userService = require('../services/userService');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
//const { encryptRefreshToken, decryptRefreshToken } = require('../utils/encryptionUtils');


/**
 * An object representing the options for setting a cookie.
 * @property {boolean} httpOnly - Specifies whether the cookie is accessible only through HTTP requests.
 * @property {boolean} secure - Specifies whether the cookie should only be sent over secure connections (HTTPS).
 * @property {string} sameSite - Specifies the SameSite attribute for the cookie, which controls when the cookie is sent in cross-site requests.
 */
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};

/**
 * Registers a new user with the provided user data.
 * @param {Object} req - The request object containing the user data in the body.
 * @param {Object} res - The response object to send the result of the registration to.
 * @returns None
 * @throws {Error} If there is an error registering the user.
 */
const registerUser = async (req, res) => {
  try {
    let userData = req.body;
    const result = await userService.registerUser(userData);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const { accessToken, refreshToken } = result;
    return res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * Logs in a user with the given email and password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns an object containing the access token and refresh token if successful, or an error message if unsuccessful.
 * @throws {Error} - Throws an error if there is an internal server error.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);

    if (result.error) {
      return res.status(403).json({ error: result.error });
    }

    const { accessToken } = result;

    // Set the access token as an HTTP-only secure cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
    });

    // Set the expiration time of the cookie based on the expiration time of the access token
    const accessTokenPayload = jwt.decode(accessToken);
    const expirationTime = accessTokenPayload.exp * 1000; // Convert expiration time to milliseconds
    cookieOptions.expires = new Date(expirationTime);


    return res.status(200).cookie('access_token', accessToken, cookieOptions).end();
    //.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logs out a user by invalidating their refresh token.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object containing a success message or an error message.
 * @throws {Error} - Throws an error if there is an issue with the server.
 */
const logoutUser = async (req, res) => {
  try {
    const { access_token } = req.body;
    const user = req.user; // Assuming the authenticated user object is stored in the req.user property

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const refresh_token = user.encryptedRefreshToken;
    const result = await userService.logoutUser(access_token, refresh_token);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    // Clear the access token cookie
    res.clearCookie('access_token');

    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/**
 * Retrieves a user with the given ID from the database and returns it as a JSON object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object containing the user's information.
 * @throws {Error} - If there is an error retrieving the user from the database.
 */
const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.getUser(userId);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Updates a user with the given ID using the data provided in the request body.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The updated user object or an error message.
 * @throws {Error} - Throws an error if there is an issue with the server.
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const result = await userService.updateUser(userId, updateData);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Deletes a user with the given ID from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON object containing a success message or an error message.
 * @throws {Error} - Throws an error if there is an issue with the database connection.
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.deleteUser(userId);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves a list of users from the user service and returns it as a JSON response.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON response containing the list of users or an error message.
 * @throws {Error} - Throws an error if there is an issue retrieving the users.
 */
const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers();

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//
/**
 * Changes the role of a user with the given userId.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - The response object with a status code and a JSON object containing the result of the operation.
 * @throws {Error} - If there is an error while processing the request.
 */
const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const result = await userService.changeUserRole(userId, role);

    if (result.error) {
      return res.status(404).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

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