// Import necessary dependencies
const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/userController');
const authMiddleware = require('../../../middlewares/authMiddleware');
const bruteForceMiddleware = require('../../../middlewares/bruteForceMiddleware');
const rateLimitMiddleware = require('../../../middlewares/rateLimitMiddleware');

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// Define the User routes
router.post('/register',userController.registerUser);
router.post('/login',userController.loginUser);
router.post('/logout', [authMiddleware.authMiddleware], userController.logoutUser);
router.get('/:id', [authMiddleware.authMiddleware], userController.getUser);
router.put('/:id', [authMiddleware.authMiddleware], userController.updateUser);
router.delete('/:id', [authMiddleware.authMiddleware], userController.deleteUser);
router.get('/', [authMiddleware.authMiddleware], userController.getUsers);
router.put('/:id/change-role', [authMiddleware.authMiddleware], userController.changeUserRole);

// Run the key rotation
require('../../../../keyRotation');

// Export the router
module.exports = router;