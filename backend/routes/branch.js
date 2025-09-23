import express from 'express';
import branchController from '../controllers/branchController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all branch
router.get('/', auth.isAuthenticated, branchController.getAll);

// Get branch by ID
router.get('/:id', auth.isAuthenticated, branchController.getById);

// Create new branch (admin/superadmin only)
router.post('/', auth.isAuthenticated, auth.isAdminOrSuperadmin, branchController.create);

// Update branch (admin/superadmin only)
router.put('/:id', auth.isAuthenticated, auth.isAdminOrSuperadmin, branchController.update);

// Delete branch (superadmin only)
router.delete('/:id', auth.isAuthenticated, auth.isSuperadmin, branchController.delete);

export default router;
