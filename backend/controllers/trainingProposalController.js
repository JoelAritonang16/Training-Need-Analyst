import { TrainingProposal } from "../models/index.js";

const trainingProposalController = {
  // Get all proposals with role-based filtering
  async getAllProposals(req, res) {
    try {
      // Asumsi role dan id user saat ini didapat dari middleware otentikasi
      const { id: currentUserId, role: currentUserRole } = req.user;

      let whereClause = {};

      // Filter berdasarkan role: user biasa hanya bisa melihat proposal miliknya
      if (currentUserRole === "user") {
        whereClause.userId = currentUserId; // Hanya tampilkan proposal yang dibuat oleh user ini
      }
      // 'admin' dan 'superadmin' bisa melihat semua proposal, jadi whereClause tetap kosong

      const proposals = await TrainingProposal.findAll({
        where: whereClause,
      });

      res.json({
        success: true,
        proposals: proposals,
      });
    } catch (error) {
      console.error("Get all proposals error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data usulan training",
      });
    }
  },

  // Create new proposal
  async createProposal(req, res) {
    try {
      console.log('=== CREATE PROPOSAL DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Request user:', req.user);
      console.log('Request headers:', req.headers);
      
      const {
        Uraian,
        WaktuPelaksanan,
        JumlahPeserta,
        JumlahHariPesertaPelatihan,
        LevelTingkatan,
        Beban,
        BebanTransportasi,
        BebanAkomodasi,
        BebanUangSaku,
        TotalUsulan,
      } = req.body;

      // Asumsi id user pembuat didapat dari middleware otentikasi
      const { id: userId } = req.user;
      console.log('User ID from auth:', userId);

      // Validasi input
      if (!Uraian || !WaktuPelaksanan || !JumlahPeserta || !LevelTingkatan) {
        return res.status(400).json({
          success: false,
          message: "Field wajib harus diisi",
        });
      }

      // Buat proposal baru
      const proposalData = {
        Uraian,
        WaktuPelaksanan,
        JumlahPeserta,
        JumlahHariPesertaPelatihan,
        LevelTingkatan,
        Beban,
        BebanTransportasi,
        BebanAkomodasi,
        BebanUangSaku,
        TotalUsulan,
        userId
      };
      
      console.log('Data yang akan disimpan:', proposalData);
      
      const newProposal = await TrainingProposal.create(proposalData);
      
      console.log('Proposal berhasil dibuat:', newProposal);

      res.status(201).json({
        success: true,
        message: "Usulan training berhasil dibuat",
        proposal: newProposal,
      });
    } catch (error) {
      console.error("Create proposal error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat usulan training",
      });
    }
  },

  // Update proposal with role validation
  async updateProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;

      // Cek apakah proposal ada
      const proposal = await TrainingProposal.findByPk(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Usulan training tidak ditemukan",
        });
      }

      // Validasi hak akses: user biasa hanya bisa mengedit proposal miliknya
      if (currentUserRole === "user" && proposal.userId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak: Anda hanya dapat mengedit usulan milik sendiri.",
        });
      }

      // 'admin' atau 'superadmin' bisa mengedit semua proposal

      // Lakukan update
      await proposal.update(req.body);

      res.json({
        success: true,
        message: "Usulan training berhasil diupdate",
        proposal: proposal,
      });
    } catch (error) {
      console.error("Update proposal error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupdate usulan training",
      });
    }
  },

  // Delete proposal with role validation
  async deleteProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;

      // Cek apakah proposal ada
      const proposal = await TrainingProposal.findByPk(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Usulan training tidak ditemukan",
        });
      }

      // Validasi hak akses: user biasa hanya bisa menghapus proposal miliknya
      if (currentUserRole === "user" && proposal.userId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak: Anda hanya dapat menghapus usulan milik sendiri.",
        });
      }

      // 'admin' atau 'superadmin' bisa menghapus semua proposal

      // Hapus proposal
      await proposal.destroy();

      res.json({
        success: true,
        message: "Usulan training berhasil dihapus",
      });
    } catch (error) {
      console.error("Delete proposal error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus usulan training",
      });
    }
  },

  // Get single proposal by ID with role validation
  async getProposalById(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;

      // Cek apakah proposal ada
      const proposal = await TrainingProposal.findByPk(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Usulan training tidak ditemukan",
        });
      }

      // Validasi hak akses: user biasa hanya dapat melihat detail proposal miliknya
      if (currentUserRole === "user" && proposal.userId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak: Anda hanya dapat melihat usulan milik sendiri.",
        });
      }

      res.json({
        success: true,
        proposal: proposal,
      });
    } catch (error) {
      console.error("Get proposal by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat data usulan training",
      });
    }
  },

  // Update proposal status (for admin/superadmin)
  async updateProposalStatus(req, res) {
    try {
      const proposalId = req.params.id;
      const { status, alasan } = req.body;
      const { id: currentUserId, role: currentUserRole } = req.user;

      console.log('=== UPDATE PROPOSAL STATUS ===');
      console.log('Proposal ID:', proposalId);
      console.log('New Status:', status);
      console.log('Reason:', alasan);
      console.log('Current User:', currentUserId, currentUserRole);

      // Validasi status
      const validStatuses = ['MENUNGGU', 'APPROVE_ADMIN', 'APPROVE_SUPERADMIN', 'DITOLAK'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status tidak valid",
        });
      }

      // Cek apakah proposal ada
      const proposal = await TrainingProposal.findByPk(proposalId);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Usulan training tidak ditemukan",
        });
      }

      // Validasi hak akses berdasarkan role dan status
      if (currentUserRole === 'user') {
        return res.status(403).json({
          success: false,
          message: "User tidak memiliki akses untuk mengubah status proposal",
        });
      }

      // Admin hanya bisa approve atau reject (tidak bisa approve superadmin)
      if (currentUserRole === 'admin') {
        if (status === 'APPROVE_SUPERADMIN') {
          return res.status(403).json({
            success: false,
            message: "Admin tidak dapat memberikan approval superadmin",
          });
        }
      }

      // Superadmin bisa melakukan semua perubahan status
      // Jika status DITOLAK, wajib ada alasan
      if (status === 'DITOLAK' && (!alasan || alasan.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: "Alasan penolakan harus diisi",
        });
      }

      // Update proposal
      const updateData = { status };
      if (status === 'DITOLAK') {
        updateData.alasan = alasan.trim();
      } else {
        updateData.alasan = null; // Clear reason if not rejected
      }

      await proposal.update(updateData);

      console.log('Proposal status updated successfully');

      res.json({
        success: true,
        message: `Status proposal berhasil diubah menjadi ${status}`,
        proposal: proposal,
      });

    } catch (error) {
      console.error("Update proposal status error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengubah status proposal",
      });
    }
  },
};

export default trainingProposalController;
