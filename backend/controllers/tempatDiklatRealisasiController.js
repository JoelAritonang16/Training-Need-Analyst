import { TempatDiklatRealisasi, Branch, User } from "../models/index.js";
import { Sequelize } from "sequelize";
import sequelize from "../db/db.js";

const tempatDiklatRealisasiController = {
  // Get all tempat diklat realisasi with role-based filtering
  async getAll(req, res) {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;
      const { branchId, bulan, tahun } = req.query;

      console.log('=== GET ALL TEMPAT DIKLAT REALISASI ===');
      console.log('Current User Role:', currentUserRole);
      console.log('Query params:', { branchId, bulan, tahun });

      let whereClause = {};

      // Filter berdasarkan role
      if (currentUserRole === "admin") {
        // Admin hanya bisa melihat realisasi dari branch mereka
        let adminBranchId = null;
        
        if (req.user && req.user.branchId) {
          adminBranchId = req.user.branchId;
        } else {
          const admin = await User.findByPk(currentUserId, {
            attributes: ['id', 'username', 'branchId']
          });
          if (admin && admin.branchId) {
            adminBranchId = admin.branchId;
          }
        }
        
        if (adminBranchId) {
          whereClause.branchId = Number(adminBranchId);
        } else {
          return res.json({
            success: true,
            data: []
          });
        }
      }
      // Superadmin can see all, but can filter by branchId

      if (currentUserRole === "superadmin" && branchId) {
        whereClause.branchId = Number(branchId);
      }

      if (bulan) {
        whereClause.bulan = Number(bulan);
      }

      if (tahun) {
        whereClause.tahun = Number(tahun);
      } else {
        whereClause.tahun = new Date().getFullYear(); // Default to current year
      }

      const data = await TempatDiklatRealisasi.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'fullName']
          }
        ],
        order: [['tahun', 'DESC'], ['bulan', 'DESC'], ['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.error("Get all tempat diklat realisasi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data tempat diklat realisasi",
      });
    }
  },

  // Get rekap per bulan per branch
  async getRekapPerBulan(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      const { tahun } = req.query;
      const year = tahun ? Number(tahun) : new Date().getFullYear();

      let whereClause = { tahun: year };

      // Filter berdasarkan role
      if (currentUserRole === "admin") {
        let adminBranchId = null;
        
        if (req.user && req.user.branchId) {
          adminBranchId = req.user.branchId;
        } else {
          const admin = await User.findByPk(req.user.id, {
            attributes: ['id', 'username', 'branchId']
          });
          if (admin && admin.branchId) {
            adminBranchId = admin.branchId;
          }
        }
        
        if (adminBranchId) {
          whereClause.branchId = Number(adminBranchId);
        } else {
          return res.json({
            success: true,
            rekap: []
          });
        }
      }

      // Get all branches
      const branches = await Branch.findAll({
        attributes: ['id', 'nama']
      });

      // Get all data first
      const allData = await TempatDiklatRealisasi.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          }
        ]
      });

      // Calculate rekap per bulan per branch manually
      const rekapPerBulan = [];
      for (let bulan = 1; bulan <= 12; bulan++) {
        const bulanData = {
          bulan: bulan,
          namaBulan: new Date(year, bulan - 1).toLocaleString('id-ID', { month: 'long' }),
          branches: branches.map(branch => {
            const branchData = allData.filter(
              r => r.branchId === branch.id && r.bulan === bulan
            );
            
            const totalKegiatan = branchData.reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0);
            const totalPeserta = branchData.reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0);
            const totalBiaya = branchData.reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0);
            
            return {
              id: branch.id,
              nama: branch.nama,
              totalKegiatan: totalKegiatan,
              totalPeserta: totalPeserta,
              totalBiaya: totalBiaya,
            };
          }),
          total: {
            totalKegiatan: allData
              .filter(r => r.bulan === bulan)
              .reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0),
            totalPeserta: allData
              .filter(r => r.bulan === bulan)
              .reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0),
            totalBiaya: allData
              .filter(r => r.bulan === bulan)
              .reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0),
          }
        };
        rekapPerBulan.push(bulanData);
      }

      res.json({
        success: true,
        tahun: year,
        rekap: rekapPerBulan,
      });
    } catch (error) {
      console.error("Get rekap per bulan error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat rekap per bulan",
      });
    }
  },

  // Create tempat diklat realisasi
  async create(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      
      if (currentUserRole !== "admin" && currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya admin dan superadmin yang dapat membuat data realisasi",
        });
      }

      const {
        branchId,
        namaTempat,
        alamat,
        bulan,
        tahun,
        jumlahKegiatan,
        totalPeserta,
        totalBiaya,
        keterangan,
      } = req.body;

      // Auto-assign branchId for admin
      let finalBranchId = branchId;
      if (currentUserRole === "admin") {
        if (req.user && req.user.branchId) {
          finalBranchId = req.user.branchId;
        } else {
          const admin = await User.findByPk(req.user.id, {
            attributes: ['id', 'branchId']
          });
          if (admin && admin.branchId) {
            finalBranchId = admin.branchId;
          }
        }
      }

      const newData = await TempatDiklatRealisasi.create({
        branchId: finalBranchId,
        namaTempat,
        alamat,
        bulan: Number(bulan),
        tahun: tahun || new Date().getFullYear(),
        jumlahKegiatan: Number(jumlahKegiatan),
        totalPeserta: Number(totalPeserta),
        totalBiaya: parseFloat(totalBiaya),
        keterangan,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Data tempat diklat realisasi berhasil dibuat",
        data: newData,
      });
    } catch (error) {
      console.error("Create tempat diklat realisasi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat data tempat diklat realisasi",
      });
    }
  },

  // Update tempat diklat realisasi
  async update(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      const { id } = req.params;

      if (currentUserRole !== "admin" && currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya admin dan superadmin yang dapat mengupdate data",
        });
      }

      const data = await TempatDiklatRealisasi.findByPk(id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      // Admin can only update their own branch data
      if (currentUserRole === "admin") {
        let adminBranchId = null;
        if (req.user && req.user.branchId) {
          adminBranchId = req.user.branchId;
        } else {
          const admin = await User.findByPk(req.user.id, {
            attributes: ['id', 'branchId']
          });
          if (admin && admin.branchId) {
            adminBranchId = admin.branchId;
          }
        }
        
        if (data.branchId !== adminBranchId) {
          return res.status(403).json({
            success: false,
            message: "Anda hanya dapat mengupdate data branch Anda sendiri",
          });
        }
      }

      const {
        branchId,
        namaTempat,
        alamat,
        bulan,
        tahun,
        jumlahKegiatan,
        totalPeserta,
        totalBiaya,
        keterangan,
      } = req.body;

      await data.update({
        branchId: currentUserRole === "superadmin" ? branchId : data.branchId,
        namaTempat,
        alamat,
        bulan: bulan ? Number(bulan) : data.bulan,
        tahun: tahun ? Number(tahun) : data.tahun,
        jumlahKegiatan: jumlahKegiatan ? Number(jumlahKegiatan) : data.jumlahKegiatan,
        totalPeserta: totalPeserta ? Number(totalPeserta) : data.totalPeserta,
        totalBiaya: totalBiaya ? parseFloat(totalBiaya) : data.totalBiaya,
        keterangan,
      });

      res.json({
        success: true,
        message: "Data tempat diklat realisasi berhasil diupdate",
        data: data,
      });
    } catch (error) {
      console.error("Update tempat diklat realisasi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate data tempat diklat realisasi",
      });
    }
  },

  // Delete tempat diklat realisasi
  async delete(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      const { id } = req.params;

      if (currentUserRole !== "admin" && currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya admin dan superadmin yang dapat menghapus data",
        });
      }

      const data = await TempatDiklatRealisasi.findByPk(id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan",
        });
      }

      // Admin can only delete their own branch data
      if (currentUserRole === "admin") {
        let adminBranchId = null;
        if (req.user && req.user.branchId) {
          adminBranchId = req.user.branchId;
        } else {
          const admin = await User.findByPk(req.user.id, {
            attributes: ['id', 'branchId']
          });
          if (admin && admin.branchId) {
            adminBranchId = admin.branchId;
          }
        }
        
        if (data.branchId !== adminBranchId) {
          return res.status(403).json({
            success: false,
            message: "Anda hanya dapat menghapus data branch Anda sendiri",
          });
        }
      }

      await data.destroy();

      res.json({
        success: true,
        message: "Data tempat diklat realisasi berhasil dihapus",
      });
    } catch (error) {
      console.error("Delete tempat diklat realisasi error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus data tempat diklat realisasi",
      });
    }
  },
};

export default tempatDiklatRealisasiController;

