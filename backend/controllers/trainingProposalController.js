import { TrainingProposal, TrainingProposalItem, User, Branch, Divisi } from "../models/index.js";
import ExcelJS from "exceljs";

const trainingProposalController = {
  // Get all proposals with role-based filtering
  async getAllProposals(req, res) {
    try {
      // Asumsi role dan id user saat ini didapat dari middleware otentikasi
      const { id: currentUserId, role: currentUserRole } = req.user;
      const { branchId, divisiId, status } = req.query; // Query params for filtering

      console.log('=== GET ALL PROPOSALS ===');
      console.log('Current User Role:', currentUserRole);
      console.log('Current User ID:', currentUserId);
      console.log('Query params:', { branchId, divisiId, status });

      let whereClause = {};

      // Filter berdasarkan role
      if (currentUserRole === "user") {
        // User hanya bisa melihat proposal miliknya
        whereClause.userId = currentUserId;
      } else if (currentUserRole === "admin") {
        // Admin hanya bisa melihat proposal dari branch mereka
        // Get admin's branchId
        let adminBranchId = null;
        
        // Try to get from req.user first (should be set by middleware)
        if (req.user && req.user.branchId) {
          adminBranchId = req.user.branchId;
          console.log('Admin branchId from req.user:', adminBranchId);
        } else {
          // Fallback: Query database to get admin's branchId
          const admin = await User.findByPk(currentUserId, {
            attributes: ['id', 'username', 'branchId']
          });
          if (admin && admin.branchId) {
            adminBranchId = admin.branchId;
            console.log('Admin branchId from database:', adminBranchId);
          }
        }
        
        if (adminBranchId) {
          whereClause.branchId = Number(adminBranchId);
          console.log('Admin filtering by branchId:', whereClause.branchId);
        } else {
          console.log('Admin branchId not found, returning empty list');
          return res.json({
            success: true,
            proposals: []
          });
        }
      }
      // Superadmin can see all proposals, but can filter by branchId and divisiId from query params

      // Additional filters for superadmin (from query params)
      if (currentUserRole === "superadmin") {
        if (branchId) {
          whereClause.branchId = Number(branchId);
          console.log('Superadmin filtering by branchId:', whereClause.branchId);
        }
        if (status) {
          whereClause.status = status;
          console.log('Superadmin filtering by status:', whereClause.status);
        }
        // Note: divisiId filter will be handled after query in JavaScript (because it's nested in user)
      }

      // Build include array with user, branch, and divisi info
      const includeArray = [
        { 
          model: TrainingProposalItem, 
          as: 'items' 
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'email', 'branchId', 'divisiId'],
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
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'nama']
        }
      ];

      console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));

      let proposals = await TrainingProposal.findAll({
        where: whereClause,
        include: includeArray,
        order: [['created_at', 'DESC']]
      });

      // Additional filter for divisiId if specified (for superadmin)
      // This needs to be done in JavaScript because divisiId is nested in user
      if (currentUserRole === "superadmin" && divisiId) {
        const divisiIdNum = Number(divisiId);
        proposals = proposals.filter(p => {
          const userDivisiId = p.user?.divisiId ? Number(p.user.divisiId) : null;
          return userDivisiId === divisiIdNum;
        });
        console.log('After divisiId filter:', proposals.length, 'proposals');
      }

      console.log('Found proposals:', proposals.length);

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

  // Export proposals as Excel (.xlsx) with formatting and totals row
  async exportProposalsXlsx(req, res) {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;
      
      let whereClause = {};
      
      // Filter berdasarkan role (same as getAllProposals)
      if (currentUserRole === 'user') {
        whereClause.userId = currentUserId;
      } else if (currentUserRole === 'admin') {
        // Admin hanya bisa export proposal dari branch mereka
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
          return res.status(403).json({
            success: false,
            message: "Tidak dapat mengekspor: Branch tidak ditemukan"
          });
        }
      }
      // Superadmin can export all proposals
      
      const proposals = await TrainingProposal.findAll({ 
        where: whereClause,
        include: [{ model: TrainingProposalItem, as: 'items' }]
      });

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Usulan Pelatihan');

      // Header row (styled like template)
      const headers = [
        'NO',
        'URAIAN',
        'WAKTU PELAKSANAAN (BULAN)',
        'JUMLAH PESERTA (ORG)',
        'JUMLAH HARI PELAKSANAAN PELATIHAN',
        'LEVEL TINGKATAN (STRUKTURAL/NON STRUKTURAL)',
        'BEBAN DIKLAT / ORG (Rp.)',
        'BEBAN TRANSPORTASI DIKLAT / ORG (Rp.)',
        'BEBAN AKOMODASI DIKLAT / ORG (Rp.)',
        'BEBAN UANG SAKU DIKLAT / ORG (Rp.)',
        'TOTAL USULAN BIAYA DIKLAT (Rp.)',
      ];
      ws.addRow(headers);
      ws.getRow(1).eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007ACC' } }; // Pelindo blue
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Column widths
      const widths = [6, 60, 22, 22, 28, 35, 22, 28, 28, 28, 30];
      widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

      // Data rows: one row per item
      let no = 1;
      proposals.forEach((p) => {
        const items = Array.isArray(p.items) && p.items.length ? p.items : [
          // Backward compatibility: use header-level fields if items absent
          {
            Uraian: p.Uraian,
            WaktuPelaksanan: p.WaktuPelaksanan,
            JumlahPeserta: p.JumlahPeserta,
            JumlahHariPesertaPelatihan: p.JumlahHariPesertaPelatihan,
            LevelTingkatan: p.LevelTingkatan,
            Beban: p.Beban,
            BebanTransportasi: p.BebanTransportasi,
            BebanAkomodasi: p.BebanAkomodasi,
            BebanUangSaku: p.BebanUangSaku,
            TotalUsulan: p.TotalUsulan,
          }
        ];
        items.forEach((it) => {
          const bulan = it.WaktuPelaksanan ? new Date(it.WaktuPelaksanan).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : '';
          const row = ws.addRow([
            no++,
            it.Uraian || '',
            bulan,
            it.JumlahPeserta || 0,
            it.JumlahHariPesertaPelatihan || 0,
            it.LevelTingkatan || '',
            it.Beban || 0,
            it.BebanTransportasi || 0,
            it.BebanAkomodasi || 0,
            it.BebanUangSaku || 0,
            (it.TotalUsulan != null ? it.TotalUsulan : ((it.Beban||0)+(it.BebanTransportasi||0)+(it.BebanAkomodasi||0)+(it.BebanUangSaku||0))) || 0,
          ]);
          row.eachCell((cell, col) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            if (col >= 7 && col <= 11) {
              cell.numFmt = '#,##0';
            }
            if (col === 1 || col === 4 || col === 5) {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            } else {
              cell.alignment = { vertical: 'top', wrapText: true };
            }
          });
        });
      });

      // Totals row with yellow fill
      const lastRow = ws.addRow([
        '',
        'Total Biaya',
        '',
        0,
        0,
        '',
        { formula: `SUM(G2:G${ws.lastRow.number})` },
        { formula: `SUM(H2:H${ws.lastRow.number})` },
        { formula: `SUM(I2:I${ws.lastRow.number})` },
        { formula: `SUM(J2:J${ws.lastRow.number})` },
        { formula: `SUM(K2:K${ws.lastRow.number})` },
      ]);
      lastRow.eachCell((cell, col) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // yellow
        cell.font = { bold: col === 2 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if ([7,8,9,10,11].includes(col)) cell.numFmt = '#,##0';
        if ([3,4,5].includes(col)) cell.alignment = { horizontal: 'center' };
      });

      const fileName = `training_proposals_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export proposals XLSX error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengekspor Excel' });
    }
  },

  // Export single proposal as Excel (.xlsx)
  async exportProposalByIdXlsx(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;
      const p = await TrainingProposal.findByPk(proposalId, { include: [{ model: TrainingProposalItem, as: 'items' }] });
      if (!p) return res.status(404).json({ success: false, message: 'Usulan tidak ditemukan' });
      if (currentUserRole === 'user' && p.userId !== currentUserId) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Usulan Pelatihan');
      const headers = [
        'NO','URAIAN','WAKTU PELAKSANAAN (BULAN)','JUMLAH PESERTA (ORG)','JUMLAH HARI PELAKSANAAN PELATIHAN','LEVEL TINGKATAN (STRUKTURAL/NON STRUKTURAL)','BEBAN DIKLAT / ORG (Rp.)','BEBAN TRANSPORTASI DIKLAT / ORG (Rp.)','BEBAN AKOMODASI DIKLAT / ORG (Rp.)','BEBAN UANG SAKU DIKLAT / ORG (Rp.)','TOTAL USULAN BIAYA DIKLAT (Rp.)']
      ws.addRow(headers);
      ws.getRow(1).eachCell((cell)=>{
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007ACC' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      const widths = [6,60,22,22,28,35,22,28,28,28,30];
      widths.forEach((w,i)=>ws.getColumn(i+1).width=w);

      const items = Array.isArray(p.items) && p.items.length ? p.items : [{
        Uraian: p.Uraian,
        WaktuPelaksanan: p.WaktuPelaksanan,
        JumlahPeserta: p.JumlahPeserta,
        JumlahHariPesertaPelatihan: p.JumlahHariPesertaPelatihan,
        LevelTingkatan: p.LevelTingkatan,
        Beban: p.Beban,
        BebanTransportasi: p.BebanTransportasi,
        BebanAkomodasi: p.BebanAkomodasi,
        BebanUangSaku: p.BebanUangSaku,
        TotalUsulan: p.TotalUsulan,
      }];
      let idx = 1;
      items.forEach((it) => {
        const bulan = it.WaktuPelaksanan ? new Date(it.WaktuPelaksanan).toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : '';
        const row = ws.addRow([
          idx++,
          it.Uraian || '',
          bulan,
          it.JumlahPeserta || 0,
          it.JumlahHariPesertaPelatihan || 0,
          it.LevelTingkatan || '',
          it.Beban || 0,
          it.BebanTransportasi || 0,
          it.BebanAkomodasi || 0,
          it.BebanUangSaku || 0,
          (it.TotalUsulan != null ? it.TotalUsulan : ((it.Beban||0)+(it.BebanTransportasi||0)+(it.BebanAkomodasi||0)+(it.BebanUangSaku||0))) || 0,
        ]);
        row.eachCell((cell, col)=>{
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (col >= 7 && col <= 11) cell.numFmt = '#,##0';
          if (col === 1 || col === 4 || col === 5) cell.alignment = { horizontal: 'center', vertical: 'middle' };
          else cell.alignment = { vertical: 'top', wrapText: true };
        });
      });

      const last = ws.lastRow.number;
      const total = ws.addRow(['','Total Biaya','',0,0,'', {formula:`SUM(G2:G${last})`},{formula:`SUM(H2:H${last})`},{formula:`SUM(I2:I${last})`},{formula:`SUM(J2:J${last})`},{formula:`SUM(K2:K${last})`}]);
      total.eachCell((cell,col)=>{
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
        cell.font = { bold: col===2 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if ([7,8,9,10,11].includes(col)) cell.numFmt = '#,##0';
      });

      const fileName = `training_proposal_${p.id}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      await wb.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Export single XLSX error:', error);
      res.status(500).json({ success: false, message: 'Gagal mengekspor Excel' });
    }
  },

  // Create new proposal (supports items[])
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
        items,
      } = req.body;

      // Asumsi id user pembuat didapat dari middleware otentikasi
      const { id: userId } = req.user;
      console.log('User ID from auth:', userId);

      // Get user's branchId to auto-assign to proposal
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'branchId', 'divisiId']
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan"
        });
      }
      
      const branchId = user.branchId;
      console.log('User branchId for proposal:', branchId);

      // Jika items ada, validasi minimal satu item dengan uraian
      if (Array.isArray(items) && items.length > 0) {
        const validItems = items.filter(it => (it?.Uraian || '').trim() !== '');
        if (validItems.length === 0) {
          return res.status(400).json({ success: false, message: 'Minimal satu item uraian harus diisi' });
        }
      } else if (!Uraian || !WaktuPelaksanan || !JumlahPeserta || !LevelTingkatan) {
        return res.status(400).json({
          success: false,
          message: "Field wajib harus diisi",
        });
      }

      // Buat proposal baru dengan branchId dari user
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
        userId,
        branchId: branchId // Auto-assign branchId from user
      };
      
      console.log('Data yang akan disimpan:', proposalData);
      
      const newProposal = await TrainingProposal.create(proposalData);

      // Jika items ada: simpan item dan hitung total proposal
      if (Array.isArray(items) && items.length > 0) {
        const itemsToCreate = items
          .filter(it => (it?.Uraian || '').trim() !== '')
          .map(it => {
            const BebanVal = parseFloat(it.Beban) || 0;
            const TransVal = parseFloat(it.BebanTransportasi) || 0;
            const AkomVal = parseFloat(it.BebanAkomodasi) || 0;
            const SakuVal = parseFloat(it.BebanUangSaku) || 0;
            const total = it.TotalUsulan != null ? parseFloat(it.TotalUsulan) : (BebanVal + TransVal + AkomVal + SakuVal);
            return {
              proposalId: newProposal.id,
              Uraian: it.Uraian,
              WaktuPelaksanan: it.WaktuPelaksanan || null,
              JumlahPeserta: it.JumlahPeserta || null,
              JumlahHariPesertaPelatihan: it.JumlahHariPesertaPelatihan || null,
              LevelTingkatan: it.LevelTingkatan || null,
              Beban: BebanVal,
              BebanTransportasi: TransVal,
              BebanAkomodasi: AkomVal,
              BebanUangSaku: SakuVal,
              TotalUsulan: total,
            };
          });
        await TrainingProposalItem.bulkCreate(itemsToCreate);
        const grandTotal = itemsToCreate.reduce((acc, it) => acc + (it.TotalUsulan || 0), 0);
        await newProposal.update({ TotalUsulan: grandTotal });
      }
      
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

  // Update proposal with role validation (supports items[] replace)
  async updateProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;

      // Cek apakah proposal ada
      const proposal = await TrainingProposal.findByPk(proposalId, { include: [{ model: TrainingProposalItem, as: 'items' }] });
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

      const { items, ...headerRest } = req.body;

      // Lakukan update untuk header
      await proposal.update(headerRest);

      // Jika items dikirim, replace semua items
      if (Array.isArray(items)) {
        await TrainingProposalItem.destroy({ where: { proposalId: proposal.id } });
        const itemsToCreate = items
          .filter(it => (it?.Uraian || '').trim() !== '')
          .map(it => {
            const BebanVal = parseFloat(it.Beban) || 0;
            const TransVal = parseFloat(it.BebanTransportasi) || 0;
            const AkomVal = parseFloat(it.BebanAkomodasi) || 0;
            const SakuVal = parseFloat(it.BebanUangSaku) || 0;
            const total = it.TotalUsulan != null ? parseFloat(it.TotalUsulan) : (BebanVal + TransVal + AkomVal + SakuVal);
            return {
              proposalId: proposal.id,
              Uraian: it.Uraian,
              WaktuPelaksanan: it.WaktuPelaksanan || null,
              JumlahPeserta: it.JumlahPeserta || null,
              JumlahHariPesertaPelatihan: it.JumlahHariPesertaPelatihan || null,
              LevelTingkatan: it.LevelTingkatan || null,
              Beban: BebanVal,
              BebanTransportasi: TransVal,
              BebanAkomodasi: AkomVal,
              BebanUangSaku: SakuVal,
              TotalUsulan: total,
            };
          });
        if (itemsToCreate.length) await TrainingProposalItem.bulkCreate(itemsToCreate);
        const grandTotal = itemsToCreate.reduce((acc, it) => acc + (it.TotalUsulan || 0), 0);
        await proposal.update({ TotalUsulan: grandTotal });
      }

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
      const proposal = await TrainingProposal.findByPk(proposalId, { include: [{ model: TrainingProposalItem, as: 'items' }] });
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

  // Export proposals as CSV with role-based filtering
  async exportProposals(req, res) {
    try {
      const { id: currentUserId, role: currentUserRole } = req.user;

      let whereClause = {};
      if (currentUserRole === "user") {
        whereClause.userId = currentUserId;
      }

      const proposals = await TrainingProposal.findAll({ where: whereClause });

      // Define fields to export
      const headers = [
        "ID",
        "Uraian",
        "WaktuPelaksanan",
        "JumlahPeserta",
        "JumlahHariPesertaPelatihan",
        "LevelTingkatan",
        "Beban",
        "BebanTransportasi",
        "BebanAkomodasi",
        "BebanUangSaku",
        "TotalUsulan",
        "UserID",
        "Status",
        "Alasan",
        "CreatedAt",
        "UpdatedAt",
      ];

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = proposals.map((p) => [
        p.id,
        p.Uraian,
        p.WaktuPelaksanan ? new Date(p.WaktuPelaksanan).toISOString() : "",
        p.JumlahPeserta,
        p.JumlahHariPesertaPelatihan,
        p.LevelTingkatan,
        p.Beban,
        p.BebanTransportasi,
        p.BebanAkomodasi,
        p.BebanUangSaku,
        p.TotalUsulan,
        p.userId,
        p.status,
        p.alasan || "",
        p.created_at ? new Date(p.created_at).toISOString() : "",
        p.updated_at ? new Date(p.updated_at).toISOString() : "",
      ]);

      const csvContent = [headers, ...rows]
        .map((line) => line.map(escapeCSV).join(","))
        .join("\n");

      const fileName = `training_proposals_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      res.status(200).send(csvContent);
    } catch (error) {
      console.error("Export proposals error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengekspor data usulan training",
      });
    }
  },

  // Export a single proposal by ID as CSV with role validation
  async exportProposalById(req, res) {
    try {
      const proposalId = req.params.id;
      const { id: currentUserId, role: currentUserRole } = req.user;

      const proposal = await TrainingProposal.findByPk(proposalId);
      if (!proposal) {
        return res.status(404).json({ success: false, message: "Usulan training tidak ditemukan" });
      }

      // Access control: user can only export own proposal
      if (currentUserRole === 'user' && proposal.userId !== currentUserId) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }

      const headers = [
        "ID",
        "Uraian",
        "WaktuPelaksanan",
        "JumlahPeserta",
        "JumlahHariPesertaPelatihan",
        "LevelTingkatan",
        "Beban",
        "BebanTransportasi",
        "BebanAkomodasi",
        "BebanUangSaku",
        "TotalUsulan",
        "UserID",
        "Status",
        "Alasan",
        "CreatedAt",
        "UpdatedAt",
      ];

      const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const row = [
        proposal.id,
        proposal.Uraian,
        proposal.WaktuPelaksanan ? new Date(proposal.WaktuPelaksanan).toISOString() : "",
        proposal.JumlahPeserta,
        proposal.JumlahHariPesertaPelatihan,
        proposal.LevelTingkatan,
        proposal.Beban,
        proposal.BebanTransportasi,
        proposal.BebanAkomodasi,
        proposal.BebanUangSaku,
        proposal.TotalUsulan,
        proposal.userId,
        proposal.status,
        proposal.alasan || "",
        proposal.created_at ? new Date(proposal.created_at).toISOString() : "",
        proposal.updated_at ? new Date(proposal.updated_at).toISOString() : "",
      ];

      const csvContent = [headers, row]
        .map((line) => line.map(escapeCSV).join(","))
        .join("\n");

      const fileName = `training_proposal_${proposal.id}.csv`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
      res.status(200).send(csvContent);
    } catch (error) {
      console.error("Export single proposal error:", error);
      res.status(500).json({ success: false, message: "Gagal mengekspor usulan" });
    }
  },
};

export default trainingProposalController;
