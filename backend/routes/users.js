import express from 'express';
import userController from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all users (with role-based filtering)
router.get('/', auth.isAuthenticated, userController.getAllUsers);

// Get users by role
router.get('/role/:role', auth.isAuthenticated, userController.getUsersByRole);

// Create new user (original)
router.post('/', auth.isAuthenticated, userController.createUser);

// Create user with role validation
router.post('/role-based', auth.isAuthenticated, userController.createUserWithRoleValidation);

// Update user (original)
router.put('/:id', auth.isAuthenticated, userController.updateUser);

// Update user with role validation
router.put('/role-based/:id', auth.isAuthenticated, userController.updateUserWithRoleValidation);

// Delete user (original)
router.delete('/:id', auth.isAuthenticated, userController.deleteUser);

// Delete user with role validation
router.delete('/role-based/:id', auth.isAuthenticated, userController.deleteUserWithRoleValidation);

export default router;
