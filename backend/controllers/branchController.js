import { Branch } from '../models/index.js';
import { Op } from 'sequelize';

const branchController = {
  // Get all branch
  async getAll(req, res) {
    try {
      const branch = await Branch.findAll({
        order: [['nama', 'ASC']]
      });
      
      res.json({
        success: true,
        message: "Data branch berhasil diambil",
        branch: branch
      });
      
    } catch (error) {
      console.error("Get all branch error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data branch",
      });
    }
  },

  // Get branch by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const branch = await Branch.findByPk(id);
      
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch tidak ditemukan",
        });
      }
      
      res.json({
        success: true,
        message: "Data branch berhasil diambil",
        branch: branch
      });
      
    } catch (error) {
      console.error("Get branch by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data branch",
      });
    }
  },

  // Create new branch
  async create(req, res) {
    try {
      const { nama } = req.body;
      
      // Validation
      if (!nama || nama.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Nama branch harus diisi",
        });
      }
      
      // Check if branch already exists
      const existingBranch = await Branch.findOne({
        where: { nama: nama.trim() }
      });
      
      if (existingBranch) {
        return res.status(400).json({
          success: false,
          message: "Branch dengan nama tersebut sudah ada",
        });
      }
      
      // Create branch
      const newBranch = await Branch.create({
        nama: nama.trim()
      });
      
      res.status(201).json({
        success: true,
        message: "Branch berhasil dibuat",
        branch: newBranch
      });
      
    } catch (error) {
      console.error("Create branch error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat branch",
      });
    }
  },

  // Update branch
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nama } = req.body;
      
      // Validation
      if (!nama || nama.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Nama branch harus diisi",
        });
      }
      
      // Check if branch exists
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch tidak ditemukan",
        });
      }
      
      // Check if nama already exists (excluding current branch)
      const existingBranch = await Branch.findOne({
        where: { 
          nama: nama.trim(),
          id: { [Op.ne]: id }
        }
      });
      
      if (existingBranch) {
        return res.status(400).json({
          success: false,
          message: "Branch dengan nama tersebut sudah ada",
        });
      }
      
      // Update branch
      await branch.update({
        nama: nama.trim()
      });
      
      res.json({
        success: true,
        message: "Branch berhasil diupdate",
        branch: branch
      });
      
    } catch (error) {
      console.error("Update branch error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate branch",
      });
    }
  },

  // Delete branch
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if branch exists
      const branch = await Branch.findByPk(id);
      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch tidak ditemukan",
        });
      }
      
      // Delete branch
      await branch.destroy();
      
      res.json({
        success: true,
        message: "Branch berhasil dihapus",
      });
      
    } catch (error) {
      console.error("Delete branch error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus branch",
      });
    }
  }
};

export default branchController;
