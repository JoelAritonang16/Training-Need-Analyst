import express from 'express';
import tempatDiklatRealisasiController from '../controllers/tempatDiklatRealisasiController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all tempat diklat realisasi (with role-based filtering)
router.get('/', auth.isAuthenticated, tempatDiklatRealisasiController.getAll);

// Get rekap per bulan per branch
router.get('/rekap/bulan', auth.isAuthenticated, tempatDiklatRealisasiController.getRekapPerBulan);

// Create tempat diklat realisasi
router.post('/', auth.isAuthenticated, tempatDiklatRealisasiController.create);

// Update tempat diklat realisasi
router.put('/:id', auth.isAuthenticated, tempatDiklatRealisasiController.update);

// Delete tempat diklat realisasi
router.delete('/:id', auth.isAuthenticated, tempatDiklatRealisasiController.delete);

export default router;

