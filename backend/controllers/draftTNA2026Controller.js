import { DraftTNA2026, Branch, Divisi, User } from "../models/index.js";
import { Sequelize } from "sequelize";
import sequelize from "../db/db.js";

const draftTNA2026Controller = {
  // Get all drafts with role-based filtering
  async getAllDrafts(req, res) {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;
      const { branchId, divisiId } = req.query;

      console.log('=== GET ALL DRAFTS ===');
      console.log('Current User Role:', currentUserRole);
      console.log('Query params:', { branchId, divisiId });

      let whereClause = {};

      // Filter berdasarkan role
      if (currentUserRole === "user") {
        // User hanya bisa melihat draft dari divisi mereka
        const user = await User.findByPk(currentUserId, {
          attributes: ['id', 'branchId', 'divisiId']
        });
        
        if (user && user.branchId) {
          whereClause.branchId = user.branchId;
        }
        if (user && user.divisiId) {
          whereClause.divisiId = user.divisiId;
        }
      } else if (currentUserRole === "admin") {
        // Admin hanya bisa melihat draft dari branch mereka
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
            drafts: []
          });
        }
      }
      // Superadmin can see all drafts, but can filter by branchId and divisiId

      if (currentUserRole === "superadmin") {
        if (branchId) {
          whereClause.branchId = Number(branchId);
        }
        if (divisiId) {
          whereClause.divisiId = Number(divisiId);
        }
      }

      const drafts = await DraftTNA2026.findAll({
        where: whereClause,
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'fullName']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'username', 'fullName']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        drafts: drafts,
      });
    } catch (error) {
      console.error("Get all drafts error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data draft TNA 2026",
      });
    }
  },

  // Get draft by ID
  async getDraftById(req, res) {
    try {
      const { id } = req.params;
      const draft = await DraftTNA2026.findByPk(id, {
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'fullName']
          },
          {
            model: User,
            as: 'updater',
            attributes: ['id', 'username', 'fullName']
          }
        ]
      });

      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft tidak ditemukan",
        });
      }

      res.json({
        success: true,
        draft: draft,
      });
    } catch (error) {
      console.error("Get draft by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data draft",
      });
    }
  },

  // Create draft (only superadmin can create)
  async createDraft(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      
      if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya superadmin yang dapat membuat draft",
        });
      }

      const {
        branchId,
        divisiId,
        uraian,
        waktuPelaksanaan,
        jumlahPeserta,
        jumlahHari,
        levelTingkatan,
        beban,
        bebanTransportasi,
        bebanAkomodasi,
        bebanUangSaku,
        totalUsulan,
      } = req.body;

      const newDraft = await DraftTNA2026.create({
        tahun: 2026,
        branchId,
        divisiId,
        uraian,
        waktuPelaksanaan,
        jumlahPeserta,
        jumlahHari,
        levelTingkatan,
        beban,
        bebanTransportasi,
        bebanAkomodasi,
        bebanUangSaku,
        totalUsulan,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Draft TNA 2026 berhasil dibuat",
        draft: newDraft,
      });
    } catch (error) {
      console.error("Create draft error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat draft TNA 2026",
      });
    }
  },

  // Update draft (only superadmin can update)
  async updateDraft(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      const { id } = req.params;

      if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya superadmin yang dapat mengedit draft",
        });
      }

      const draft = await DraftTNA2026.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft tidak ditemukan",
        });
      }

      const {
        branchId,
        divisiId,
        uraian,
        waktuPelaksanaan,
        jumlahPeserta,
        jumlahHari,
        levelTingkatan,
        beban,
        bebanTransportasi,
        bebanAkomodasi,
        bebanUangSaku,
        totalUsulan,
        status,
      } = req.body;

      await draft.update({
        branchId,
        divisiId,
        uraian,
        waktuPelaksanaan,
        jumlahPeserta,
        jumlahHari,
        levelTingkatan,
        beban,
        bebanTransportasi,
        bebanAkomodasi,
        bebanUangSaku,
        totalUsulan,
        status,
        updatedBy: req.user.id,
      });

      res.json({
        success: true,
        message: "Draft TNA 2026 berhasil diupdate",
        draft: draft,
      });
    } catch (error) {
      console.error("Update draft error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate draft TNA 2026",
      });
    }
  },

  // Delete draft (only superadmin)
  async deleteDraft(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      
      if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya superadmin yang dapat menghapus draft",
        });
      }

      const { id } = req.params;
      const draft = await DraftTNA2026.findByPk(id);
      
      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft tidak ditemukan",
        });
      }

      await draft.destroy();

      res.json({
        success: true,
        message: "Draft TNA 2026 berhasil dihapus",
      });
    } catch (error) {
      console.error("Delete draft error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus draft TNA 2026",
      });
    }
  },

  // Get rekap gabungan (20 cabang + 18 divisi)
  async getRekapGabungan(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      
      if (currentUserRole !== "admin" && currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak",
        });
      }

      // Get all branches (20 cabang)
      const branches = await Branch.findAll({
        attributes: ['id', 'nama']
      });

      // Get all divisi (18 divisi korporat)
      const divisi = await Divisi.findAll({
        attributes: ['id', 'nama']
      });

      // Get all drafts
      const allDrafts = await DraftTNA2026.findAll({
        where: { tahun: 2026 },
        include: [
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama']
          },
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama']
          }
        ]
      });

      // Calculate per branch
      const draftsPerBranch = {};
      allDrafts.forEach(draft => {
        if (draft.branchId) {
          const branchId = draft.branchId;
          if (!draftsPerBranch[branchId]) {
            draftsPerBranch[branchId] = {
              branchId: branchId,
              branchName: draft.branch?.nama || '',
              totalDraft: 0,
              totalBiaya: 0,
              totalPeserta: 0
            };
          }
          draftsPerBranch[branchId].totalDraft++;
          draftsPerBranch[branchId].totalBiaya += parseFloat(draft.totalUsulan || 0);
          draftsPerBranch[branchId].totalPeserta += parseInt(draft.jumlahPeserta || 0);
        }
      });

      // Calculate per divisi
      const draftsPerDivisi = {};
      allDrafts.forEach(draft => {
        if (draft.divisiId) {
          const divisiId = draft.divisiId;
          if (!draftsPerDivisi[divisiId]) {
            draftsPerDivisi[divisiId] = {
              divisiId: divisiId,
              divisiName: draft.divisi?.nama || '',
              totalDraft: 0,
              totalBiaya: 0,
              totalPeserta: 0
            };
          }
          draftsPerDivisi[divisiId].totalDraft++;
          draftsPerDivisi[divisiId].totalBiaya += parseFloat(draft.totalUsulan || 0);
          draftsPerDivisi[divisiId].totalPeserta += parseInt(draft.jumlahPeserta || 0);
        }
      });

      // Calculate totals
      const totalDrafts = await DraftTNA2026.count({ where: { tahun: 2026 } });
      const totalBiaya = await DraftTNA2026.sum('totalUsulan', { where: { tahun: 2026 } });
      const totalPeserta = await DraftTNA2026.sum('jumlahPeserta', { where: { tahun: 2026 } });

      res.json({
        success: true,
        rekap: {
          branches: branches.map(b => {
            const branchData = draftsPerBranch[b.id];
            return {
              id: b.id,
              nama: b.nama,
              totalDraft: branchData ? branchData.totalDraft : 0,
              totalBiaya: branchData ? branchData.totalBiaya : 0,
              totalPeserta: branchData ? branchData.totalPeserta : 0,
            };
          }),
          divisi: divisi.map(d => {
            const divisiData = draftsPerDivisi[d.id];
            return {
              id: d.id,
              nama: d.nama,
              totalDraft: divisiData ? divisiData.totalDraft : 0,
              totalBiaya: divisiData ? divisiData.totalBiaya : 0,
              totalPeserta: divisiData ? divisiData.totalPeserta : 0,
            };
          }),
          total: {
            totalDraft: totalDrafts,
            totalBiaya: totalBiaya || 0,
            totalPeserta: totalPeserta || 0,
          }
        }
      });
    } catch (error) {
      console.error("Get rekap gabungan error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat rekap gabungan",
      });
    }
  },
};

export default draftTNA2026Controller;

