import express from 'express';
import anakPerusahaanController from '../controllers/anakPerusahaanController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all anak perusahaan
router.get('/', auth.isAuthenticated, anakPerusahaanController.getAll);

// Get anak perusahaan by ID
router.get('/:id', auth.isAuthenticated, anakPerusahaanController.getById);

// Create new anak perusahaan
router.post('/', auth.isAuthenticated, auth.isAdminOrSuperadmin, anakPerusahaanController.create);

// Update anak perusahaan
router.put('/:id', auth.isAuthenticated, auth.isAdminOrSuperadmin, anakPerusahaanController.update);

// Delete anak perusahaan
router.delete('/:id', auth.isAuthenticated, auth.isSuperadmin, anakPerusahaanController.delete);

// Get branches for specific anak perusahaan
router.get('/:id/branches', auth.isAuthenticated, anakPerusahaanController.getBranches);

// Add branch to anak perusahaan
router.post('/:id/branches', auth.isAuthenticated, auth.isAdminOrSuperadmin, anakPerusahaanController.addBranch);

// Remove branch from anak perusahaan
router.delete('/:id/branches/:branchId', auth.isAuthenticated, auth.isAdminOrSuperadmin, anakPerusahaanController.removeBranch);

export default router;
