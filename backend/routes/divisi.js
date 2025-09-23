import express from 'express';
import divisiController from '../controllers/divisiController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all divisi
router.get('/', auth.isAuthenticated, divisiController.getAll);

// Get divisi by ID
router.get('/:id', auth.isAuthenticated, divisiController.getById);

// Create new divisi (admin/superadmin only)
router.post('/', auth.isAuthenticated, auth.isAdminOrSuperadmin, divisiController.create);

// Update divisi (admin/superadmin only)
router.put('/:id', auth.isAuthenticated, auth.isAdminOrSuperadmin, divisiController.update);

// Delete divisi (superadmin only)
router.delete('/:id', auth.isAuthenticated, auth.isSuperadmin, divisiController.delete);

export default router;
