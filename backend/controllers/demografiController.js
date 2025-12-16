import { User, Divisi, Branch, TrainingProposal, DraftTNA2026, TempatDiklatRealisasi } from '../models/index.js';
import { Op } from 'sequelize';

const demografiController = {
  // Get demographic data with optional filters
  async getDemografiData(req, res) {
    try {
      const { branchId, divisiId } = req.query;
      
      console.log('=== DEMOGRAFI CONTROLLER START ===');
      console.log('Fetching demografi data with filters:', { branchId, divisiId });
      
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
      // Use basic fields only - new demografi fields will be accessed safely with try-catch
      console.log('Fetching users with whereClause:', JSON.stringify(whereClause));
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
        attributes: ['id', 'username', 'role', 'branchId', 'divisiId', 'fullName'],
        raw: false // Ensure Sequelize instances are returned
      });
      console.log(`Fetched ${users.length} users`);
      
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
        const divisiUserIds = users.map(u => u.id).filter(id => id != null);
        if (divisiUserIds.length > 0) {
          // Filter berdasarkan userId untuk memastikan hanya proposal dari user dengan divisi tersebut
          proposalWhereClause.userId = { [Op.in]: divisiUserIds };
        } else {
          // Jika tidak ada user dengan divisi tersebut, set userId ke array kosong untuk return empty
          proposalWhereClause.userId = { [Op.in]: [] };
        }
      }
      
      // Fetch training proposals with full data
      // Pastikan filter benar-benar diterapkan
      console.log('Fetching proposals with whereClause:', JSON.stringify(proposalWhereClause));
      
      let proposals = [];
      try {
        proposals = await TrainingProposal.findAll({
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
        console.log(`Fetched ${proposals.length} proposals`);
      } catch (proposalError) {
        console.error('Error fetching proposals:', proposalError);
        // If proposal fetch fails, continue with empty array
        proposals = [];
      }
      
      const totalUsers = users.length;
      // Note: User model doesn't have status field, so all users are considered active
      const activeUsers = users.length;
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
      
      // Jenis Pekerja (Job Type) - Based on User jenisPekerja field
      // Handle case where field might be null, undefined, or not exist
      let jenisPekerjaCount = { 'Organik': 0, 'Non Organik': 0 };
      let totalJenisPekerja = 0;
      try {
        users.forEach(u => {
          if (u && u.jenisPekerja) {
            const value = String(u.jenisPekerja).toLowerCase();
            if (value === 'organik') jenisPekerjaCount['Organik']++;
            else if (value === 'non organik') jenisPekerjaCount['Non Organik']++;
          }
        });
        totalJenisPekerja = jenisPekerjaCount['Organik'] + jenisPekerjaCount['Non Organik'];
      } catch (err) {
        console.log('Error calculating jenisPekerja:', err.message);
      }
      
      // Pusat Pelayanan - Based on User pusatPelayanan field
      let pusatPelayananCount = { 'Operasional': 0, 'Non Operasional': 0 };
      let totalPusatPelayanan = 0;
      try {
        users.forEach(u => {
          if (u && u.pusatPelayanan) {
            const value = String(u.pusatPelayanan).toLowerCase();
            if (value === 'operasional') pusatPelayananCount['Operasional']++;
            else if (value === 'non operasional') pusatPelayananCount['Non Operasional']++;
          }
        });
        totalPusatPelayanan = pusatPelayananCount['Operasional'] + pusatPelayananCount['Non Operasional'];
      } catch (err) {
        console.log('Error calculating pusatPelayanan:', err.message);
      }
      
      // Jenis Kelamin - Based on User jenisKelamin field
      let jenisKelaminCount = { 'Laki-laki': 0, 'Perempuan': 0 };
      let totalJenisKelamin = 0;
      try {
        users.forEach(u => {
          if (u && u.jenisKelamin) {
            const value = String(u.jenisKelamin).toLowerCase();
            if (value === 'laki-laki') jenisKelaminCount['Laki-laki']++;
            else if (value === 'perempuan') jenisKelaminCount['Perempuan']++;
          }
        });
        totalJenisKelamin = jenisKelaminCount['Laki-laki'] + jenisKelaminCount['Perempuan'];
      } catch (err) {
        console.log('Error calculating jenisKelamin:', err.message);
      }
      
      // Pendidikan - Based on User pendidikan field
      let pendidikanCount = { 'S3': 0, 'S2': 0, 'S1': 0, 'Diploma': 0, 'SMA': 0 };
      let totalPendidikan = 0;
      try {
        users.forEach(u => {
          if (u && u.pendidikan) {
            const value = String(u.pendidikan).toUpperCase();
            if (value === 'S3') pendidikanCount['S3']++;
            else if (value === 'S2') pendidikanCount['S2']++;
            else if (value === 'S1') pendidikanCount['S1']++;
            else if (value === 'DIPLOMA') pendidikanCount['Diploma']++;
            else if (value === 'SMA') pendidikanCount['SMA']++;
          }
        });
        totalPendidikan = Object.values(pendidikanCount).reduce((sum, val) => sum + val, 0);
      } catch (err) {
        console.log('Error calculating pendidikan:', err.message);
      }
      
      // Fetch tempat diklat realisasi with filters (need this before calculating BOPO)
      let realisasiWhereClause = {};
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        realisasiWhereClause.branchId = parseInt(branchId);
      }
      // Note: TempatDiklatRealisasi tidak punya divisiId, hanya branchId
      
      let realisasiData = [];
      let totalBiayaRealisasi = 0;
      try {
        realisasiData = await TempatDiklatRealisasi.findAll({
          where: realisasiWhereClause,
          attributes: ['id', 'jumlahKegiatan', 'totalPeserta', 'totalBiaya', 'branchId']
        });
        totalBiayaRealisasi = realisasiData.reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0);
      } catch (realisasiError) {
        console.error('Error fetching realisasi data:', realisasiError);
        // Continue with empty data
      }
      
      const totalRealisasi = realisasiData.length;
      const totalKegiatanRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0);
      const totalPesertaRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0);
      
      // Jenis Pekerja (Job Type) - Based on TrainingProposal LevelTingkatan (for backward compatibility)
      const jenisPekerjaProposal = {
        'Struktural': proposals.filter(p => p.LevelTingkatan === 'STRUKTURAL').length,
        'Non Struktural': proposals.filter(p => p.LevelTingkatan === 'NON STRUKTURAL').length
      };
      
      // Calculate Produktivitas (Total Budget Approved / Total Users)
      const produktivitas = totalUsers > 0 ? totalBudgetAllApproved / totalUsers : 0;
      
      // Calculate BOPO (Biaya Operasional / Pendapatan Operasional)
      // BOPO = (Total Biaya Realisasi / Total Budget Approved) * 100
      const bopo = totalBudgetAllApproved > 0 ? (totalBiayaRealisasi / totalBudgetAllApproved) * 100 : 0;
      
      // Calculate Rasio Beban (Total Budget Requested / Total Budget Approved) * 100
      const rasioBeban = totalBudgetAllApproved > 0 ? (totalBudgetRequested / totalBudgetAllApproved) * 100 : 0;
      
      // Fetch drafts with filters - sama seperti getAllDrafts
      let draftWhereClause = {};
      if (branchId && branchId !== 'all' && branchId !== 'ALL') {
        draftWhereClause.branchId = parseInt(branchId);
      }
      if (divisiId && divisiId !== 'all' && divisiId !== 'ALL') {
        draftWhereClause.divisiId = parseInt(divisiId);
      }
      
      let drafts = [];
      try {
        drafts = await DraftTNA2026.findAll({
          where: draftWhereClause,
          attributes: ['id', 'status', 'branchId', 'divisiId']
        });
      } catch (draftError) {
        console.error('Error fetching drafts:', draftError);
        // Continue with empty data
      }
      
      const totalDrafts = drafts.length;
      const draftStatus = {
        'Draft': drafts.filter(d => d.status === 'DRAFT').length,
        'Submitted': drafts.filter(d => d.status === 'SUBMITTED').length,
        'Approved': drafts.filter(d => d.status === 'APPROVED').length
      };
      
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
          
          // Jenis Pekerja (from User model)
          jenisPekerjaUser: {
            'Organik': jenisPekerjaCount['Organik'],
            'Non Organik': jenisPekerjaCount['Non Organik'],
            total: totalJenisPekerja
          },
          // Pusat Pelayanan (from User model)
          pusatPelayanan: {
            'Operasional': pusatPelayananCount['Operasional'],
            'Non Operasional': pusatPelayananCount['Non Operasional'],
            total: totalPusatPelayanan
          },
          // Jenis Kelamin (from User model)
          jenisKelamin: {
            'Laki-laki': jenisKelaminCount['Laki-laki'],
            'Perempuan': jenisKelaminCount['Perempuan'],
            total: totalJenisKelamin
          },
          // Pendidikan (from User model)
          pendidikan: {
            'S3': pendidikanCount['S3'],
            'S2': pendidikanCount['S2'],
            'S1': pendidikanCount['S1'],
            'Diploma': pendidikanCount['Diploma'],
            'SMA': pendidikanCount['SMA'],
            total: totalPendidikan
          },
          // Jenis Pekerja (from TrainingProposal - for backward compatibility)
          jenisPekerja: {
            'Struktural': jenisPekerjaProposal['Struktural'],
            'Non Struktural': jenisPekerjaProposal['Non Struktural']
          },
          // Summary metrics
          produktivitas: produktivitas,
          bopo: bopo,
          rasioBeban: rasioBeban,
          
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
      
      console.log('=== DEMOGRAFI CONTROLLER SUCCESS ===');
      res.json(response);
    } catch (error) {
      console.error('=== DEMOGRAFI CONTROLLER ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Gagal memuat data demografi',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

export default demografiController;

