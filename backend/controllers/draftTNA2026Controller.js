import { DraftTNA2026, Branch, Divisi, User, Notification, TrainingProposal } from "../models/index.js";
import { Sequelize, Op } from "sequelize";
import sequelize from "../db/db.js";

const draftTNA2026Controller = {
  // Get all drafts with role-based filtering
  async getAllDrafts(req, res) {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;
      const { branchId, divisiId } = req.query;

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

      // Cari proposal terkait untuk mendapatkan evaluasi realisasi
      // Draft dibuat dari proposal yang sudah direalisasikan, jadi cari proposal dengan:
      // - uraian yang sama
      // - waktuPelaksanaan yang sama (dibandingkan berdasarkan tanggal saja)
      // - branchId yang sama
      // - status SUDAH_IMPLEMENTASI
      let evaluasiRealisasi = null;
      try {
        // Format waktu pelaksanaan untuk perbandingan (hanya tanggal, tanpa waktu)
        const draftWaktuPelaksanaan = new Date(draft.waktuPelaksanaan);
        const draftDateStart = new Date(draftWaktuPelaksanaan);
        draftDateStart.setHours(0, 0, 0, 0);
        const draftDateEnd = new Date(draftWaktuPelaksanaan);
        draftDateEnd.setHours(23, 59, 59, 999);
        
        // Cari proposal dengan uraian dan waktu pelaksanaan yang sama
        const relatedProposal = await TrainingProposal.findOne({
          where: {
            branchId: draft.branchId,
            implementasiStatus: 'SUDAH_IMPLEMENTASI',
            Uraian: draft.uraian,
            WaktuPelaksanan: {
              [Op.between]: [draftDateStart, draftDateEnd]
            }
          },
          attributes: ['id', 'evaluasiRealisasi'],
          order: [['updated_at', 'DESC']],
          limit: 1
        });

        if (relatedProposal && relatedProposal.evaluasiRealisasi) {
          evaluasiRealisasi = relatedProposal.evaluasiRealisasi;
        } else {
          // Jika tidak ditemukan dengan uraian header, coba cari dari items
          const { TrainingProposalItem } = require('../models/index.js');
          const relatedProposalFromItem = await TrainingProposal.findOne({
            include: [
              {
                model: TrainingProposalItem,
                as: 'items',
                where: {
                  Uraian: draft.uraian,
                  WaktuPelaksanan: {
                    [Op.between]: [draftDateStart, draftDateEnd]
                  }
                },
                attributes: []
              }
            ],
            where: {
              branchId: draft.branchId,
              implementasiStatus: 'SUDAH_IMPLEMENTASI'
            },
            attributes: ['id', 'evaluasiRealisasi'],
            order: [['updated_at', 'DESC']],
            limit: 1
          });

          if (relatedProposalFromItem && relatedProposalFromItem.evaluasiRealisasi) {
            evaluasiRealisasi = relatedProposalFromItem.evaluasiRealisasi;
          }
        }
      } catch (evalError) {
        console.warn('Error fetching evaluation from proposal:', evalError);
        // Continue without evaluation if there's an error
      }

      // Convert draft to plain object and add evaluation
      const draftData = draft.toJSON ? draft.toJSON() : draft;
      draftData.evaluasiRealisasi = evaluasiRealisasi;

      res.json({
        success: true,
        draft: draftData,
      });
    } catch (error) {
      console.error("Get draft by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data draft",
      });
    }
  },

  // Create draft (only superadmin can create manually, draft biasanya auto-generated dari proposal)
  async createDraft(req, res) {
    try {
      const { role: currentUserRole, id: currentUserId } = req.user;
      
      // Hanya superadmin yang bisa create draft secara manual
      if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya superadmin yang dapat membuat draft secara manual. Draft biasanya dibuat otomatis dari proposal yang sudah direalisasi.",
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
        tahun = 2026,
      } = req.body;

      // Validasi required fields
      if (!branchId || !uraian || !waktuPelaksanaan || !jumlahPeserta || !jumlahHari || !levelTingkatan) {
        return res.status(400).json({
          success: false,
          message: "Field yang wajib diisi: branchId, uraian, waktuPelaksanaan, jumlahPeserta, jumlahHari, levelTingkatan",
        });
      }

      const newDraft = await DraftTNA2026.create({
        tahun: tahun,
        branchId: branchId,
        divisiId: divisiId,
        uraian,
        waktuPelaksanaan,
        jumlahPeserta,
        jumlahHari,
        levelTingkatan,
        beban: beban || 0,
        bebanTransportasi: bebanTransportasi || 0,
        bebanAkomodasi: bebanAkomodasi || 0,
        bebanUangSaku: bebanUangSaku || 0,
        totalUsulan: totalUsulan || 0,
        status: 'DRAFT',
        createdBy: currentUserId,
      });

      res.status(201).json({
        success: true,
        message: "Draft TNA berhasil dibuat",
        draft: newDraft,
      });
    } catch (error) {
      console.error("Create draft error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat draft TNA",
        error: error.message,
      });
    }
  },

  // Update draft (only superadmin can update, admin is view only)
  async updateDraft(req, res) {
    try {
      const { role: currentUserRole } = req.user;
      const { id } = req.params;

      const draft = await DraftTNA2026.findByPk(id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft tidak ditemukan",
        });
      }

      // Hanya superadmin yang bisa update draft
      if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Hanya superadmin yang dapat mengedit draft. Admin hanya dapat melihat draft (view only).",
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

      const oldStatus = draft.status;
      
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

      // Send notification when status changes to SUBMITTED
      if (status === 'SUBMITTED' && oldStatus !== 'SUBMITTED') {
        // Get all admins and superadmins
        const adminsAndSuperadmins = await User.findAll({
          where: {
            role: {
              [Sequelize.Op.in]: ['admin', 'superadmin']
            }
          },
          attributes: ['id', 'username', 'fullName', 'role']
        });

        // Get draft details for notification message
        const updatedDraft = await DraftTNA2026.findByPk(id, {
          include: [
            { model: Branch, as: 'branch', attributes: ['nama'] },
            { model: Divisi, as: 'divisi', attributes: ['nama'] },
            { model: User, as: 'creator', attributes: ['username', 'fullName'] }
          ]
        });

        const branchName = updatedDraft.branch?.nama || 'Unknown';
        const divisiName = updatedDraft.divisi?.nama || '';
        const creatorName = updatedDraft.creator?.fullName || updatedDraft.creator?.username || 'User';
        const tahun = updatedDraft.tahun || 2026;

        // Send notification to all admins and superadmins
        for (const admin of adminsAndSuperadmins) {
          await Notification.create({
            userId: admin.id,
            draftTNAId: id,
            type: 'DRAFT_TNA_SUBMITTED',
            title: `Draft TNA ${tahun} Telah Diselesaikan`,
            message: `Draft TNA ${tahun} dari ${branchName}${divisiName ? ` - ${divisiName}` : ''} telah diselesaikan oleh ${creatorName}. Draft telah siap untuk direalisasikan.`
          });
        }

      }

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

  // Submit draft (change status to SUBMITTED) - user can submit their own draft
  async submitDraft(req, res) {
    try {
      const { role: currentUserRole, id: currentUserId } = req.user;
      const { id } = req.params;

      const draft = await DraftTNA2026.findByPk(id, {
        include: [
          { model: Branch, as: 'branch', attributes: ['nama'] },
          { model: Divisi, as: 'divisi', attributes: ['nama'] },
          { model: User, as: 'creator', attributes: ['username', 'fullName'] }
        ]
      });

      if (!draft) {
        return res.status(404).json({
          success: false,
          message: "Draft tidak ditemukan",
        });
      }

      // User hanya bisa submit draft mereka sendiri
      if (currentUserRole === "user") {
        if (draft.createdBy !== currentUserId) {
          return res.status(403).json({
            success: false,
            message: "Anda hanya dapat submit draft yang Anda buat sendiri",
          });
        }
        if (draft.status !== 'DRAFT') {
          return res.status(400).json({
            success: false,
            message: "Draft ini sudah disubmit atau tidak dalam status DRAFT",
          });
        }
      } else if (currentUserRole !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki akses untuk submit draft",
        });
      }

      // Update status to SUBMITTED
      await draft.update({
        status: 'SUBMITTED',
        updatedBy: currentUserId,
      });

      // Send notification to all admins and superadmins
      const adminsAndSuperadmins = await User.findAll({
        where: {
          role: {
            [Sequelize.Op.in]: ['admin', 'superadmin']
          }
        },
        attributes: ['id', 'username', 'fullName', 'role']
      });

      const branchName = draft.branch?.nama || 'Unknown';
      const divisiName = draft.divisi?.nama || '';
      const creatorName = draft.creator?.fullName || draft.creator?.username || 'User';
      const tahun = draft.tahun || 2026;

      // Send notification to all admins and superadmins
      for (const admin of adminsAndSuperadmins) {
        await Notification.create({
          userId: admin.id,
          draftTNAId: id,
          type: 'DRAFT_TNA_SUBMITTED',
          title: `Draft TNA ${tahun} Telah Diselesaikan`,
          message: `Draft TNA ${tahun} dari ${branchName}${divisiName ? ` - ${divisiName}` : ''} telah diselesaikan oleh ${creatorName}. Draft telah siap untuk direalisasikan.`
        });
      }

      res.json({
        success: true,
        message: "Draft TNA berhasil disubmit",
        draft: draft,
      });
    } catch (error) {
      console.error("Submit draft error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal submit draft TNA",
        error: error.message,
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

