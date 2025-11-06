import express from 'express';
import draftTNA2026Controller from '../controllers/draftTNA2026Controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all drafts (with role-based filtering)
router.get('/', auth.isAuthenticated, draftTNA2026Controller.getAllDrafts);

// Get draft by ID
router.get('/:id', auth.isAuthenticated, draftTNA2026Controller.getDraftById);

// Create draft (only superadmin)
router.post('/', auth.isAuthenticated, draftTNA2026Controller.createDraft);

// Update draft (only superadmin)
router.put('/:id', auth.isAuthenticated, draftTNA2026Controller.updateDraft);

// Delete draft (only superadmin)
router.delete('/:id', auth.isAuthenticated, draftTNA2026Controller.deleteDraft);

// Get rekap gabungan (20 cabang + 18 divisi)
router.get('/rekap/gabungan', auth.isAuthenticated, draftTNA2026Controller.getRekapGabungan);

export default router;

