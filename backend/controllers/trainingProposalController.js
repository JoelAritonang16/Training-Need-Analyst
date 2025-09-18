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
      const {
        Uraian,
        WaktuPelaksanan,
        JumlahPeserta,
        JumlahHariPesertaPelatihan,
        LevelTingkatan,
        Beban,
        BebanTranportasi,
        BebanAkomodasi,
        BebanUangSaku,
        TotalUsulan,
      } = req.body;

      // Asumsi id user pembuat didapat dari middleware otentikasi
      const { id: userId } = req.user;

      // Validasi input
      if (!Uraian || !WaktuPelaksanan || !JumlahPeserta || !LevelTingkatan) {
        return res.status(400).json({
          success: false,
          message: "Field wajib harus diisi",
        });
      }

      // Buat proposal baru
      const newProposal = await TrainingProposal.create({
        ...req.body,
        userId, // Tambahkan userId ke data yang akan dibuat
      });

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
};

export default trainingProposalController;
