import express from 'express';
import demografiController from '../controllers/demografiController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get demographic data (with optional filters)
router.get('/', auth.isAuthenticated, demografiController.getDemografiData);

export default router;

