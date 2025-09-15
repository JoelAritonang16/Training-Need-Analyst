import express from 'express';
import authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
router.post('/login', authController.login);
router.get('/user/:id', authController.getUser);
router.get('/me', auth.isAuthenticated, authController.getCurrentUser);
router.get('/check', authController.checkAuth);
router.post('/logout', authController.logout);

export default router;
