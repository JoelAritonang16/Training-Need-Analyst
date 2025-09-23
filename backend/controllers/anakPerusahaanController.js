import { AnakPerusahaan, Branch, AnakPerusahaanBranch } from '../models/index.js';
import { Op } from 'sequelize';

const anakPerusahaanController = {
  // Get all anak perusahaan with their branches
  async getAll(req, res) {
    try {
      const anakPerusahaan = await AnakPerusahaan.findAll({
        attributes: ['id', 'nama', 'created_at', 'updated_at'],
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['id', 'nama'],
            through: { attributes: [] } // Don't include junction table attributes
          }
        ]
      });
      
      res.json({
        success: true,
        anakPerusahaan
      });
    } catch (error) {
      console.error('Get all anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data anak perusahaan'
      });
    }
  },

  // Get anak perusahaan by ID with branches
  async getById(req, res) {
    try {
      const { id } = req.params;
      const anakPerusahaan = await AnakPerusahaan.findByPk(id, {
        attributes: ['id', 'nama', 'created_at', 'updated_at'],
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['id', 'nama'],
            through: { attributes: [] }
          }
        ]
      });

      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        anakPerusahaan
      });
    } catch (error) {
      console.error('Get anak perusahaan by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data anak perusahaan'
      });
    }
  },

  // Create new anak perusahaan with branches
  async create(req, res) {
    try {
      const { nama, branchIds } = req.body;

      if (!nama) {
        return res.status(400).json({
          success: false,
          message: 'Nama anak perusahaan harus diisi'
        });
      }

      // Create anak perusahaan
      const anakPerusahaan = await AnakPerusahaan.create({
        nama: nama.trim()
      });

      // Add branches if provided
      if (branchIds && branchIds.length > 0) {
        await anakPerusahaan.setBranches(branchIds);
      }

      // Fetch the created anak perusahaan with branches
      const createdAnakPerusahaan = await AnakPerusahaan.findByPk(anakPerusahaan.id, {
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['id', 'nama'],
            through: { attributes: [] }
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Anak perusahaan berhasil dibuat',
        anakPerusahaan: createdAnakPerusahaan
      });
    } catch (error) {
      console.error('Create anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat anak perusahaan'
      });
    }
  },

  // Update anak perusahaan and its branches
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nama, branchIds } = req.body;

      const anakPerusahaan = await AnakPerusahaan.findByPk(id);
      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      // Update nama if provided
      if (nama) {
        await anakPerusahaan.update({ nama: nama.trim() });
      }

      // Update branches if provided
      if (branchIds !== undefined) {
        await anakPerusahaan.setBranches(branchIds || []);
      }

      // Fetch updated anak perusahaan with branches
      const updatedAnakPerusahaan = await AnakPerusahaan.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['id', 'nama'],
            through: { attributes: [] }
          }
        ]
      });

      res.json({
        success: true,
        message: 'Anak perusahaan berhasil diupdate',
        anakPerusahaan: updatedAnakPerusahaan
      });
    } catch (error) {
      console.error('Update anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate anak perusahaan'
      });
    }
  },

  // Delete anak perusahaan
  async delete(req, res) {
    try {
      const { id } = req.params;

      const anakPerusahaan = await AnakPerusahaan.findByPk(id);
      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      // Remove all branch associations first
      await anakPerusahaan.setBranches([]);
      
      // Delete the anak perusahaan
      await anakPerusahaan.destroy();

      res.json({
        success: true,
        message: 'Anak perusahaan berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus anak perusahaan'
      });
    }
  },

  // Get branches for a specific anak perusahaan
  async getBranches(req, res) {
    try {
      const { id } = req.params;
      
      const anakPerusahaan = await AnakPerusahaan.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branches',
            attributes: ['id', 'nama'],
            through: { attributes: [] }
          }
        ]
      });

      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        branches: anakPerusahaan.branches
      });
    } catch (error) {
      console.error('Get branches for anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data branch'
      });
    }
  },

  // Add branch to anak perusahaan
  async addBranch(req, res) {
    try {
      const { id } = req.params;
      const { branchId } = req.body;

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: 'Branch ID harus diisi'
        });
      }

      const anakPerusahaan = await AnakPerusahaan.findByPk(id);
      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      // Add branch to anak perusahaan
      await anakPerusahaan.addBranch(branchId);

      res.json({
        success: true,
        message: 'Branch berhasil ditambahkan ke anak perusahaan'
      });
    } catch (error) {
      console.error('Add branch to anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan branch'
      });
    }
  },

  // Remove branch from anak perusahaan
  async removeBranch(req, res) {
    try {
      const { id, branchId } = req.params;

      const anakPerusahaan = await AnakPerusahaan.findByPk(id);
      if (!anakPerusahaan) {
        return res.status(404).json({
          success: false,
          message: 'Anak perusahaan tidak ditemukan'
        });
      }

      // Remove branch from anak perusahaan
      await anakPerusahaan.removeBranch(branchId);

      res.json({
        success: true,
        message: 'Branch berhasil dihapus dari anak perusahaan'
      });
    } catch (error) {
      console.error('Remove branch from anak perusahaan error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus branch'
      });
    }
  }
};

export default anakPerusahaanController;
