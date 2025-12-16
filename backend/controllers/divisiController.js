import { Divisi } from '../models/index.js';
import { Op } from 'sequelize';

const divisiController = {
  // Get all divisi
  async getAll(req, res) {
    try {
      const divisi = await Divisi.findAll({
        order: [['nama', 'ASC']]
      });
      
      res.json({
        success: true,
        message: "Data divisi berhasil diambil",
        divisi: divisi
      });
      
    } catch (error) {
      console.error("Get all divisi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data divisi",
      });
    }
  },

  // Get divisi by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      const divisi = await Divisi.findByPk(id);
      
      if (!divisi) {
        return res.status(404).json({
          success: false,
          message: "Divisi tidak ditemukan",
        });
      }
      
      res.json({
        success: true,
        message: "Data divisi berhasil diambil",
        divisi: divisi
      });
      
    } catch (error) {
      console.error("Get divisi by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data divisi",
      });
    }
  },

  // Create new divisi
  async create(req, res) {
    try {
      const { nama } = req.body;
      
      // Validation
      if (!nama || nama.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Nama divisi harus diisi",
        });
      }
      
      // Check if divisi already exists
      const existingDivisi = await Divisi.findOne({
        where: { nama: nama.trim() }
      });
      
      if (existingDivisi) {
        return res.status(400).json({
          success: false,
          message: "Divisi dengan nama tersebut sudah ada",
        });
      }
      
      // Create divisi
      const newDivisi = await Divisi.create({
        nama: nama.trim()
      });
      
      res.status(201).json({
        success: true,
        message: "Divisi berhasil dibuat",
        divisi: newDivisi
      });
      
    } catch (error) {
      console.error("Create divisi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat divisi",
      });
    }
  },

  // Update divisi
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nama } = req.body;
      
      // Validation
      if (!nama || nama.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "Nama divisi harus diisi",
        });
      }
      
      // Check if divisi exists
      const divisi = await Divisi.findByPk(id);
      if (!divisi) {
        return res.status(404).json({
          success: false,
          message: "Divisi tidak ditemukan",
        });
      }
      
      // Check if nama already exists (excluding current divisi)
      const existingDivisi = await Divisi.findOne({
        where: { 
          nama: nama.trim(),
          id: { [Op.ne]: id }
        }
      });
      
      if (existingDivisi) {
        return res.status(400).json({
          success: false,
          message: "Divisi dengan nama tersebut sudah ada",
        });
      }
      
      // Update divisi
      await divisi.update({
        nama: nama.trim()
      });
      
      res.json({
        success: true,
        message: "Divisi berhasil diupdate",
        divisi: divisi
      });
      
    } catch (error) {
      console.error("Update divisi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate divisi",
      });
    }
  },

  // Delete divisi
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if divisi exists
      const divisi = await Divisi.findByPk(id);
      if (!divisi) {
        return res.status(404).json({
          success: false,
          message: "Divisi tidak ditemukan",
        });
      }
      
      // Delete divisi
      await divisi.destroy();
      
      res.json({
        success: true,
        message: "Divisi berhasil dihapus",
      });
      
    } catch (error) {
      console.error("Delete divisi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus divisi",
      });
    }
  }
};

export default divisiController;
