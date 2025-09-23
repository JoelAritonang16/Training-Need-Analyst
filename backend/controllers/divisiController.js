import { Divisi } from '../models/index.js';
import { Op } from 'sequelize';

const divisiController = {
  // Get all divisi
  async getAll(req, res) {
    try {
      console.log('=== GET ALL DIVISI ===');
      
      const divisi = await Divisi.findAll({
        order: [['nama', 'ASC']]
      });
      
      console.log('Divisi found:', divisi.length);
      
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
      
      console.log('=== GET DIVISI BY ID ===');
      console.log('Divisi ID:', id);
      
      const divisi = await Divisi.findByPk(id);
      
      if (!divisi) {
        return res.status(404).json({
          success: false,
          message: "Divisi tidak ditemukan",
        });
      }
      
      console.log('Divisi found:', divisi.nama);
      
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
      
      console.log('=== CREATE DIVISI ===');
      console.log('Nama:', nama);
      
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
      
      console.log('Divisi created:', newDivisi.nama);
      
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
      
      console.log('=== UPDATE DIVISI ===');
      console.log('Divisi ID:', id);
      console.log('New Nama:', nama);
      
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
      
      console.log('Divisi updated:', divisi.nama);
      
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
      
      console.log('=== DELETE DIVISI ===');
      console.log('Divisi ID:', id);
      
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
      
      console.log('Divisi deleted:', divisi.nama);
      
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
