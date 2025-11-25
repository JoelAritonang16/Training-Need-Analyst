import { User, Divisi, Branch, TrainingProposal, DraftTNA2026, TempatDiklatRealisasi } from '../models/index.js';
import { Op } from 'sequelize';

const demografiController = {
  // Get demographic data with optional filters
  async getDemografiData(req, res) {
    try {
      const { branchId, divisiId } = req.query;
      
      console.log('=== GET DEMOGRAFI DATA ===');
      console.log('Filters:', { branchId, divisiId });
      
      // Build where clause
      let whereClause = {
        role: 'user' // Only count regular users, not admins
      };
      
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        whereClause.branchId = parseInt(branchId);
      }
      
      if (divisiId && divisiId !== 'all' && divisiId !== 'ALL') {
        whereClause.divisiId = parseInt(divisiId);
      }
      
      // Fetch users with relations
      const users = await User.findAll({
        where: whereClause,
        include: [
          {
            model: Divisi,
            as: 'divisi',
            attributes: ['id', 'nama'],
            required: false
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama'],
            required: false
          }
        ],
        attributes: ['id', 'username', 'role', 'branchId', 'divisiId', 'fullName']
      });
      
      console.log(`Found ${users.length} users`);
      
      // Build proposal where clause based on filters
      // IMPORTANT: Filter proposals berdasarkan branchId dan userId (untuk divisi)
      let proposalWhereClause = {};
      
      // Jika filter Branch dipilih, filter berdasarkan branchId di proposal
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        proposalWhereClause.branchId = parseInt(branchId);
      }
      
      // Jika filter Divisi dipilih, filter berdasarkan userId yang memiliki divisiId tersebut
      if (divisiId && divisiId !== 'all' && divisiId !== 'ALL') {
        // Get user IDs dari users yang sudah terfilter (sudah include divisi filter)
        const divisiUserIds = users.map(u => u.id);
        if (divisiUserIds.length > 0) {
          // Filter berdasarkan userId untuk memastikan hanya proposal dari user dengan divisi tersebut
          proposalWhereClause.userId = { [Op.in]: divisiUserIds };
        } else {
          // Jika tidak ada user dengan divisi tersebut, return empty
          proposalWhereClause.userId = { [Op.in]: [] };
        }
      } else if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        // Jika hanya branch filter (tanpa divisi), filter berdasarkan branchId saja
        // branchId sudah di-set di atas di line 54
        // Untuk memastikan konsistensi, kita juga bisa filter berdasarkan user yang ada di branch tersebut
        // Tapi karena proposal sudah punya branchId, kita bisa langsung filter berdasarkan branchId
        // Tidak perlu filter userId karena proposal.branchId sudah cukup
      }
      
      // Fetch training proposals with full data
      // Pastikan filter benar-benar diterapkan
      console.log('Proposal where clause:', JSON.stringify(proposalWhereClause, null, 2));
      
      const proposals = await TrainingProposal.findAll({
        where: proposalWhereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'divisiId', 'branchId'],
            include: [
              {
                model: Divisi,
                as: 'divisi',
                attributes: ['id', 'nama'],
                required: false
              },
              {
                model: Branch,
                as: 'branch',
                attributes: ['id', 'nama'],
                required: false
              }
            ],
            required: false // Allow proposals even if user not found
          },
          {
            model: Branch,
            as: 'branch',
            attributes: ['id', 'nama'],
            required: false
          }
        ],
        attributes: ['id', 'LevelTingkatan', 'userId', 'branchId', 'status', 'TotalUsulan', 'JumlahPeserta']
      });
      
      console.log(`Found ${proposals.length} proposals with filters`);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active' || !u.status).length;
      const totalProposals = proposals.length;
      
      // Status breakdown
      const pendingCount = proposals.filter(p => p.status === 'MENUNGGU').length;
      const waitingFinalCount = proposals.filter(p => p.status === 'APPROVE_ADMIN').length;
      const finalApprovedCount = proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').length;
      const rejectedCount = proposals.filter(p => p.status === 'DITOLAK').length;
      
      // Budget calculations
      const totalBudgetRequested = proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0);
      const totalBudgetApprovedAdmin = proposals.filter(p => p.status === 'APPROVE_ADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0);
      const totalBudgetApprovedFinal = proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0);
      const totalBudgetAllApproved = totalBudgetApprovedAdmin + totalBudgetApprovedFinal;
      
      // Participant calculations
      const totalParticipantsRequested = proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0);
      const totalParticipantsApproved = proposals.filter(p => p.status === 'APPROVE_ADMIN' || p.status === 'APPROVE_SUPERADMIN').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0);
      const totalParticipants = proposals.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0);
      
      // Jenis Pekerja (Job Type) - Based on TrainingProposal LevelTingkatan
      const jenisPekerja = {
        'Struktural': proposals.filter(p => p.LevelTingkatan === 'STRUKTURAL').length,
        'Non Struktural': proposals.filter(p => p.LevelTingkatan === 'NON STRUKTURAL').length
      };
      
      // Fetch drafts with filters - sama seperti getAllDrafts
      let draftWhereClause = {};
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        draftWhereClause.branchId = parseInt(branchId);
      }
      if (divisiId && divisiId !== 'all' && divisiId !== 'ALL') {
        draftWhereClause.divisiId = parseInt(divisiId);
      }
      
      console.log('Draft where clause:', JSON.stringify(draftWhereClause, null, 2));
      
      const drafts = await DraftTNA2026.findAll({
        where: draftWhereClause,
        attributes: ['id', 'status', 'branchId', 'divisiId']
      });
      
      console.log(`Found ${drafts.length} drafts with filters`);
      
      const totalDrafts = drafts.length;
      const draftStatus = {
        'Draft': drafts.filter(d => d.status === 'DRAFT').length,
        'Submitted': drafts.filter(d => d.status === 'SUBMITTED').length,
        'Approved': drafts.filter(d => d.status === 'APPROVED').length
      };
      
      // Fetch tempat diklat realisasi with filters
      let realisasiWhereClause = {};
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        realisasiWhereClause.branchId = parseInt(branchId);
      }
      // Note: TempatDiklatRealisasi tidak punya divisiId, hanya branchId
      
      console.log('Realisasi where clause:', JSON.stringify(realisasiWhereClause, null, 2));
      
      const realisasiData = await TempatDiklatRealisasi.findAll({
        where: realisasiWhereClause,
        attributes: ['id', 'jumlahKegiatan', 'totalPeserta', 'totalBiaya', 'branchId']
      });
      
      console.log(`Found ${realisasiData.length} realisasi data with filters`);
      
      const totalRealisasi = realisasiData.length;
      const totalKegiatanRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0);
      const totalPesertaRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0);
      const totalBiayaRealisasi = realisasiData.reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0);
      
      // Distribusi berdasarkan Branch
      const distribusiBranch = {};
      users.forEach(user => {
        const branchName = user.branch?.nama || 'Tidak Ada Branch';
        distribusiBranch[branchName] = (distribusiBranch[branchName] || 0) + 1;
      });
      
      // Distribusi berdasarkan Divisi
      const distribusiDivisi = {};
      users.forEach(user => {
        const divisiName = user.divisi?.nama || 'Tidak Ada Divisi';
        distribusiDivisi[divisiName] = (distribusiDivisi[divisiName] || 0) + 1;
      });
      
      // Group proposals by divisi
      const proposalsByDivisi = {};
      proposals.forEach(proposal => {
        const divisiName = proposal.user?.divisi?.nama || 'Tidak Ada Divisi';
        if (!proposalsByDivisi[divisiName]) {
          proposalsByDivisi[divisiName] = {
            totalUsulan: 0,
            diRequest: 0,
            disetujui: 0,
            totalBiayaRequested: 0,
            totalBiayaApproved: 0
          };
        }
        proposalsByDivisi[divisiName].totalUsulan++;
        if (proposal.status === 'MENUNGGU') {
          proposalsByDivisi[divisiName].diRequest++;
          proposalsByDivisi[divisiName].totalBiayaRequested += parseFloat(proposal.TotalUsulan) || 0;
        }
        if (proposal.status === 'APPROVE_ADMIN' || proposal.status === 'APPROVE_SUPERADMIN') {
          proposalsByDivisi[divisiName].disetujui++;
          proposalsByDivisi[divisiName].totalBiayaApproved += parseFloat(proposal.TotalUsulan) || 0;
        }
      });
      
      // Group proposals by branch
      const proposalsByBranch = {};
      proposals.forEach(proposal => {
        const branchName = proposal.branch?.nama || proposal.user?.branch?.nama || 'Tidak Ada Branch';
        if (!proposalsByBranch[branchName]) {
          proposalsByBranch[branchName] = {
            totalUsulan: 0,
            diRequest: 0,
            disetujui: 0,
            totalBiayaRequested: 0,
            totalBiayaApproved: 0
          };
        }
        proposalsByBranch[branchName].totalUsulan++;
        if (proposal.status === 'MENUNGGU') {
          proposalsByBranch[branchName].diRequest++;
          proposalsByBranch[branchName].totalBiayaRequested += parseFloat(proposal.TotalUsulan) || 0;
        }
        if (proposal.status === 'APPROVE_ADMIN' || proposal.status === 'APPROVE_SUPERADMIN') {
          proposalsByBranch[branchName].disetujui++;
          proposalsByBranch[branchName].totalBiayaApproved += parseFloat(proposal.TotalUsulan) || 0;
        }
      });
      
      // Format response - sama seperti dashboard utama
      const response = {
        success: true,
        data: {
          // User stats
          totalUsers: totalUsers,
          activeUsers: activeUsers,
          
          // Proposal stats
          totalProposals: totalProposals,
          pendingCount: pendingCount,
          waitingFinalCount: waitingFinalCount,
          finalApprovedCount: finalApprovedCount,
          rejectedCount: rejectedCount,
          
          // Budget stats
          totalBudgetRequested: totalBudgetRequested,
          totalBudgetApprovedAdmin: totalBudgetApprovedAdmin,
          totalBudgetApprovedFinal: totalBudgetApprovedFinal,
          totalBudgetAllApproved: totalBudgetAllApproved,
          
          // Participant stats
          totalParticipantsRequested: totalParticipantsRequested,
          totalParticipantsApproved: totalParticipantsApproved,
          totalParticipants: totalParticipants,
          
          // Jenis Pekerja
          jenisPekerja: {
            'Struktural': jenisPekerja['Struktural'],
            'Non Struktural': jenisPekerja['Non Struktural']
          },
          
          // Draft stats
          totalDrafts: totalDrafts,
          draftStatus: draftStatus,
          
          // Realisasi stats
          totalRealisasi: totalRealisasi,
          totalKegiatanRealisasi: totalKegiatanRealisasi,
          totalPesertaRealisasi: totalPesertaRealisasi,
          totalBiayaRealisasi: totalBiayaRealisasi,
          
          // Distribusi
          distribusiBranch: distribusiBranch,
          distribusiDivisi: distribusiDivisi,
          proposalsByDivisi: proposalsByDivisi,
          proposalsByBranch: proposalsByBranch
        },
        filters: {
          branchId: branchId || 'all',
          divisiId: divisiId || 'all'
        }
      };
      
      console.log('Demografi data prepared:', {
        totalUsers: response.data.totalUsers,
        totalProposals: response.data.totalProposals,
        jenisPekerja: response.data.jenisPekerja,
        distribusiBranch: Object.keys(distribusiBranch).length,
        distribusiDivisi: Object.keys(distribusiDivisi).length,
        proposalsByDivisi: Object.keys(proposalsByDivisi).length,
        proposalsByBranch: Object.keys(proposalsByBranch).length
      });
      
      res.json(response);
    } catch (error) {
      console.error('Get demografi data error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data demografi',
        error: error.message
      });
    }
  }
};

export default demografiController;

