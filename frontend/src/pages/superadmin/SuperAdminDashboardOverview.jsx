import React, { useState, useEffect } from 'react';
import {
  LuUsers,
  LuCheckCircle2,
  LuClipboardList,
  LuBookOpen,
  LuFileText,
  LuMapPin,
  LuBarChart3,
  LuWallet,
} from 'react-icons/lu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { draftTNA2026API, tempatDiklatRealisasiAPI, trainingProposalAPI, divisiAPI, branchAPI } from '../../utils/api';
import './SuperAdminDashboardOverview.css';

const SuperAdminDashboardOverview = ({ users, proposals, auditLogs, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [realisasiData, setRealisasiData] = useState([]);
  const [rekapPerBulan, setRekapPerBulan] = useState([]);
  const [rekapGabungan, setRekapGabungan] = useState(null);
  const [divisiList, setDivisiList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(u => u.status === 'active').length : 0;
  const totalProposals = proposals ? proposals.length : 0;
  
  // Status breakdown
  const pendingCount = proposals ? proposals.filter(p => p.status === 'MENUNGGU').length : 0;
  const waitingFinalCount = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN').length : 0;
  const finalApprovedCount = proposals ? proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').length : 0;
  const rejectedCount = proposals ? proposals.filter(p => p.status === 'DITOLAK').length : 0;
  
  // Budget calculations - based on approved proposals
  const totalBudgetRequested = proposals ? proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalBudgetApprovedAdmin = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalBudgetApprovedFinal = proposals ? proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalBudgetAllApproved = totalBudgetApprovedAdmin + totalBudgetApprovedFinal;
  
  // Participant calculations
  const totalParticipantsRequested = proposals ? proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  const totalParticipantsApproved = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN' || p.status === 'APPROVE_SUPERADMIN').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  const totalParticipants = proposals ? proposals.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  
  // Realisasi data calculations
  const totalDrafts = drafts.length;
  const totalRealisasi = realisasiData.length;
  const totalKegiatanRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0);
  const totalPesertaRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0);
  const totalBiayaRealisasi = realisasiData.reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0);
  
  // Calculate rekap gabungan totals
  const totalDraftGabungan = rekapGabungan ? rekapGabungan.total.totalDraft : 0;
  const totalBiayaGabungan = rekapGabungan ? rekapGabungan.total.totalBiaya : 0;
  const totalPesertaGabungan = rekapGabungan ? rekapGabungan.total.totalPeserta : 0;

  useEffect(() => {
    fetchDashboardData();
  }, [proposals]); // Re-fetch when proposals change

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('SuperAdminDashboardOverview: Fetching dashboard data...');
      console.log('SuperAdminDashboardOverview: Current proposals count:', proposals?.length || 0);
      
      // Fetch drafts
      try {
        const draftsResult = await draftTNA2026API.getAll();
        if (draftsResult.success) {
          console.log('SuperAdminDashboardOverview: Drafts fetched:', draftsResult.drafts?.length || 0);
          setDrafts(draftsResult.drafts || []);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching drafts:', err);
      }

      // Fetch tempat diklat realisasi
      try {
        const realisasiResult = await tempatDiklatRealisasiAPI.getAll();
        if (realisasiResult.success) {
          console.log('SuperAdminDashboardOverview: Realisasi data fetched:', realisasiResult.data?.length || 0);
          setRealisasiData(realisasiResult.data || []);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching realisasi:', err);
      }

      // Fetch rekap per bulan
      try {
        const rekapResult = await tempatDiklatRealisasiAPI.getRekapPerBulan(new Date().getFullYear());
        if (rekapResult.success) {
          console.log('SuperAdminDashboardOverview: Rekap per bulan fetched:', rekapResult.rekap?.length || 0);
          setRekapPerBulan(rekapResult.rekap || []);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching rekap per bulan:', err);
      }

      // Fetch rekap gabungan (20 cabang + 18 divisi) - might take longer
      try {
        const rekapGabunganResult = await draftTNA2026API.getRekapGabungan();
        if (rekapGabunganResult.success) {
          console.log('SuperAdminDashboardOverview: Rekap gabungan fetched');
          setRekapGabungan(rekapGabunganResult.rekap);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching rekap gabungan:', err);
      }

      // Fetch divisi list
      try {
        const divisiResult = await divisiAPI.getAll();
        if (divisiResult.success) {
          console.log('SuperAdminDashboardOverview: Divisi list fetched:', divisiResult.divisi?.length || 0);
          setDivisiList(divisiResult.divisi || []);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching divisi:', err);
      }

      // Fetch branch list
      try {
        const branchResult = await branchAPI.getAll();
        if (branchResult.success) {
          console.log('SuperAdminDashboardOverview: Branch list fetched:', branchResult.branch?.length || 0);
          setBranchList(branchResult.branch || []);
        }
      } catch (err) {
        console.warn('SuperAdminDashboardOverview: Error fetching branch:', err);
      }
    } catch (error) {
      console.error('SuperAdminDashboardOverview: Error fetching dashboard data:', error);
      // Don't throw - let component continue rendering
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for proposals status
  const proposalStatusData = [
    { name: 'Menunggu', value: pendingCount, color: '#FFA500' },
    { name: 'Disetujui Admin', value: waitingFinalCount, color: '#4CAF50' },
    { name: 'Disetujui Superadmin', value: finalApprovedCount, color: '#2196F3' },
    { name: 'Ditolak', value: rejectedCount, color: '#F44336' },
  ].filter(item => item.value > 0); // Only show non-zero values

  // Chart data for budget comparison (Requested vs Approved vs Realized)
  const budgetComparisonData = [
    { 
      name: 'Di Request', 
      'Total Biaya (Juta)': parseFloat((totalBudgetRequested / 1000000).toFixed(2)),
      'Jumlah Peserta': totalParticipantsRequested,
      'Jumlah Usulan': pendingCount,
      'Jumlah Kegiatan': 0
    },
    { 
      name: 'Disetujui', 
      'Total Biaya (Juta)': parseFloat((totalBudgetAllApproved / 1000000).toFixed(2)),
      'Jumlah Peserta': totalParticipantsApproved,
      'Jumlah Usulan': waitingFinalCount + finalApprovedCount,
      'Jumlah Kegiatan': 0
    },
    { 
      name: 'Telah Terlaksana', 
      'Total Biaya (Juta)': parseFloat((totalBiayaRealisasi / 1000000).toFixed(2)),
      'Jumlah Peserta': totalPesertaRealisasi,
      'Jumlah Usulan': 0,
      'Jumlah Kegiatan': totalKegiatanRealisasi
    },
  ];

  // Chart data for budget breakdown by status
  const budgetByStatusData = [
    { name: 'Menunggu', value: totalBudgetRequested, color: '#FFA500' },
    { name: 'Disetujui Admin', value: totalBudgetApprovedAdmin, color: '#4CAF50' },
    { name: 'Disetujui Superadmin', value: totalBudgetApprovedFinal, color: '#2196F3' },
  ].filter(item => item.value > 0);

  // Prepare chart data for rekap per bulan
  const chartDataPerBulan = rekapPerBulan.map(month => ({
    name: month.namaBulan,
    'Total Kegiatan': month.total.totalKegiatan,
    'Total Peserta': month.total.totalPeserta,
    'Total Biaya (Juta)': parseFloat((month.total.totalBiaya / 1000000).toFixed(2)),
  }));

  // Prepare chart data for drafts
  const draftStatusData = [
    { name: 'Draft', value: drafts.filter(d => d.status === 'DRAFT').length, color: '#2196F3' },
    { name: 'Submitted', value: drafts.filter(d => d.status === 'SUBMITTED').length, color: '#FF9800' },
    { name: 'Approved', value: drafts.filter(d => d.status === 'APPROVED').length, color: '#4CAF50' },
  ];

  // Prepare chart data for rekap gabungan - top 10 branches
  const topBranchesData = rekapGabungan?.branches
    ?.sort((a, b) => b.totalBiaya - a.totalBiaya)
    .slice(0, 10)
    .map(b => ({
      name: b.nama.length > 15 ? b.nama.substring(0, 15) + '...' : b.nama,
      'Total Draft': b.totalDraft,
      'Total Biaya (Juta)': parseFloat((b.totalBiaya / 1000000).toFixed(2)),
      'Total Peserta': b.totalPeserta,
    })) || [];

  // Prepare chart data for rekap gabungan - top 10 divisi
  const topDivisiData = rekapGabungan?.divisi
    ?.sort((a, b) => b.totalBiaya - a.totalBiaya)
    .slice(0, 10)
    .map(d => ({
      name: d.nama.length > 15 ? d.nama.substring(0, 15) + '...' : d.nama,
      'Total Draft': d.totalDraft,
      'Total Biaya (Juta)': parseFloat((d.totalBiaya / 1000000).toFixed(2)),
      'Total Peserta': d.totalPeserta,
    })) || [];

  // Group proposals by divisi - Fixed to properly get divisi from user relation
  const proposalsByDivisi = (proposals && divisiList && divisiList.length > 0) ? divisiList.map(divisi => {
    const divisiProposals = proposals.filter(p => {
      // Check multiple possible paths to divisi
      if (p.user) {
        const userDivisiId = p.user.divisiId || (p.user.divisi && p.user.divisi.id);
        return userDivisiId === divisi.id;
      }
      return false;
    });
    const requested = divisiProposals.filter(p => p.status === 'MENUNGGU');
    const approved = divisiProposals.filter(p => p.status === 'APPROVE_ADMIN' || p.status === 'APPROVE_SUPERADMIN');
    
    return {
      divisiId: divisi.id,
      divisiNama: divisi.nama,
      totalUsulan: divisiProposals.length,
      diRequest: requested.length,
      disetujui: approved.length,
      totalBiayaRequested: requested.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0),
      totalBiayaApproved: approved.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0),
      totalPesertaRequested: requested.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0),
      totalPesertaApproved: approved.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0),
    };
  }).filter(d => d.totalUsulan > 0) : [];

  // Group proposals by branch - Fixed to properly get branch from multiple sources
  const proposalsByBranch = (proposals && proposals.length > 0 && branchList && branchList.length > 0) ? branchList.map(branch => {
    const branchProposals = proposals.filter(p => {
      // Check multiple possible paths to branch
      if (p.branchId === branch.id) return true;
      if (p.branch && p.branch.id === branch.id) return true;
      if (p.user && p.user.branchId === branch.id) return true;
      if (p.user && p.user.branch && p.user.branch.id === branch.id) return true;
      return false;
    });
    const requested = branchProposals.filter(p => p.status === 'MENUNGGU');
    const approved = branchProposals.filter(p => p.status === 'APPROVE_ADMIN' || p.status === 'APPROVE_SUPERADMIN');
    
    return {
      branchId: branch.id,
      branchNama: branch.nama,
      totalUsulan: branchProposals.length,
      diRequest: requested.length,
      disetujui: approved.length,
      totalBiayaRequested: requested.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0),
      totalBiayaApproved: approved.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0),
      totalPesertaRequested: requested.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0),
      totalPesertaApproved: approved.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0),
    };
  }).filter(b => b.totalUsulan > 0) : [];
  
  console.log('SuperAdminDashboardOverview: proposalsByBranch count:', proposalsByBranch.length);

  // Chart data for divisi comparison
  const divisiChartData = proposalsByDivisi
    .sort((a, b) => b.totalBiayaApproved - a.totalBiayaApproved)
    .slice(0, 10)
    .map(d => ({
      name: d.divisiNama.length > 20 ? d.divisiNama.substring(0, 20) + '...' : d.divisiNama,
      'Di Request': parseFloat((d.totalBiayaRequested / 1000000).toFixed(2)),
      'Disetujui': parseFloat((d.totalBiayaApproved / 1000000).toFixed(2)),
      'Jumlah Usulan': d.totalUsulan,
    }));

  // Chart data for branch comparison
  const branchChartData = proposalsByBranch
    .sort((a, b) => b.totalBiayaApproved - a.totalBiayaApproved)
    .slice(0, 10)
    .map(b => ({
      name: b.branchNama.length > 20 ? b.branchNama.substring(0, 20) + '...' : b.branchNama,
      'Di Request': parseFloat((b.totalBiayaRequested / 1000000).toFixed(2)),
      'Disetujui': parseFloat((b.totalBiayaApproved / 1000000).toFixed(2)),
      'Jumlah Usulan': b.totalUsulan,
    }));


  return (
    <div className="dashboard-overview">
      {/* Modern Header Banner */}
      <div className="dashboard-header-banner" role="region" aria-label="Dashboard Header">
        <h1>Dashboard Superadmin</h1>
        <p>Selamat datang di panel administrasi PT Pelindo - Overview lengkap semua cabang dan divisi</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={18} /></div>
          <div className="stat-content">
            <h3>{totalUsers}</h3>
            <p>Total Pengguna</p>
            <small>{activeUsers} aktif</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuClipboardList size={18} /></div>
          <div className="stat-content">
            <h3>{totalProposals}</h3>
            <p>Total Usulan</p>
            <small>{pendingCount} menunggu</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={18} /></div>
          <div className="stat-content">
            <h3>{finalApprovedCount}</h3>
            <p>Disetujui Final</p>
            <small>Semua branch</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={18} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {(totalBudgetAllApproved / 1000000).toFixed(2)} Juta
            </h3>
            <p>Total Anggaran Disetujui</p>
            <small>Admin + Superadmin</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={18} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {(totalBiayaRealisasi / 1000000).toFixed(2)} Juta
            </h3>
            <p>Total Biaya Realisasi</p>
            <small>Diklat yang telah terlaksana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={18} /></div>
          <div className="stat-content">
            <h3>{totalPesertaRealisasi}</h3>
            <p>Total Peserta Realisasi</p>
            <small>Diklat yang telah terlaksana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={18} /></div>
          <div className="stat-content">
            <h3>{totalDrafts}</h3>
            <p>Draft TNA 2026</p>
            <small>20 Cabang + 18 Divisi</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuMapPin size={18} /></div>
          <div className="stat-content">
            <h3>{totalRealisasi}</h3>
            <p>Tempat Diklat Realisasi</p>
            <small>Per bulan</small>
          </div>
        </div>

        {rekapGabungan && (
          <>
            <div className="stat-card">
              <div className="stat-icon"><LuBarChart3 size={18} /></div>
              <div className="stat-content">
                <h3>{rekapGabungan.total?.totalDraft || 0}</h3>
                <p>Total Draft Gabungan</p>
                <small>20 Cabang + 18 Divisi</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><LuBarChart3 size={18} /></div>
              <div className="stat-content">
                <h3>
                  Rp{" "}
                  {((rekapGabungan.total?.totalBiaya || 0) / 1000000).toFixed(2)} Juta
                </h3>
                <p>Total Biaya Gabungan</p>
                <small>20 Cabang + 18 Divisi</small>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <h3>Grafik dan Analisis</h3>
        
        <div className="charts-grid">
          {/* Proposal Status Donut Chart */}
          <div className="chart-card">
            <h4>Status Usulan Pelatihan</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={proposalStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {proposalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} usulan`,
                    props.payload.name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '0.875rem' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Comparison Chart - Requested vs Approved vs Realized */}
          <div className="chart-card chart-full-width">
            <h4>Perbandingan: Di Request vs Disetujui vs Telah Terlaksana</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={budgetComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" label={{ value: 'Biaya (Juta Rp)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Jumlah', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Total Biaya (Juta)') {
                      return [`Rp ${value} Juta`, 'Total Biaya'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="Total Biaya (Juta)" fill="#60a5fa" name="Total Biaya (Juta Rp)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="Jumlah Peserta" fill="#34d399" name="Jumlah Peserta" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="Jumlah Usulan" fill="#fbbf24" name="Jumlah Usulan" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="Jumlah Kegiatan" fill="#fb923c" name="Jumlah Kegiatan" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Breakdown by Status */}
          {budgetByStatusData.length > 0 && (
            <div className="chart-card">
              <h4>Rincian Biaya Berdasarkan Status</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={budgetByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {budgetByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `Rp ${(value / 1000000).toFixed(2)} Juta`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontSize: '0.875rem' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Draft Status Donut Chart */}
          <div className="chart-card">
            <h4>Status Draft TNA 2026</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={draftStatusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {draftStatusData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} draft`,
                    props.payload.name
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '0.875rem' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Branches Bar Chart */}
          {topBranchesData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Top 10 Cabang - Total Draft dan Biaya</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topBranchesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Total Draft" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Total Biaya (Juta)" fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top 10 Divisi Bar Chart */}
          {topDivisiData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Top 10 Divisi Korporat - Total Draft dan Biaya</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topDivisiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Total Draft" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Total Biaya (Juta)" fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rekap Per Bulan Line Chart */}
          <div className="chart-card chart-full-width">
            <h4>Rekap Tempat Diklat Realisasi Per Bulan ({new Date().getFullYear()})</h4>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartDataPerBulan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Total Kegiatan" stroke="#8884d8" />
                <Line type="monotone" dataKey="Total Peserta" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rekap Per Bulan Bar Chart - Biaya */}
          <div className="chart-card chart-full-width">
            <h4>Total Biaya Realisasi Per Bulan ({new Date().getFullYear()}) - Juta Rupiah</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartDataPerBulan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Biaya (Juta Rp)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => `Rp ${value} Juta`}
                />
                <Legend />
                <Bar dataKey="Total Biaya (Juta)" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Analysis Card */}
          <div className="chart-card chart-full-width">
            <h4>Ringkasan Analisis</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '12px 0' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#0271B6', fontSize: '0.8125rem', fontWeight: '500', letterSpacing: '-0.01em' }}>Usulan yang Di Request</h5>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Jumlah:</strong> {pendingCount} usulan</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Biaya:</strong> Rp {(totalBudgetRequested / 1000000).toFixed(2)} Juta</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Peserta:</strong> {totalParticipantsRequested} orang</p>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#4CAF50', fontSize: '0.8125rem', fontWeight: '500', letterSpacing: '-0.01em' }}>Usulan yang Disetujui</h5>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Jumlah:</strong> {waitingFinalCount + finalApprovedCount} usulan</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Biaya:</strong> Rp {(totalBudgetAllApproved / 1000000).toFixed(2)} Juta</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Peserta:</strong> {totalParticipantsApproved} orang</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  <strong style={{ color: '#1e293b', fontWeight: '500' }}>Detail:</strong> {waitingFinalCount} disetujui Admin, {finalApprovedCount} disetujui Superadmin
                </p>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#2196F3', fontSize: '0.8125rem', fontWeight: '500', letterSpacing: '-0.01em' }}>Diklat yang Telah Terlaksana</h5>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Jumlah Kegiatan:</strong> {totalKegiatanRealisasi} kegiatan</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Biaya:</strong> Rp {(totalBiayaRealisasi / 1000000).toFixed(2)} Juta</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Total Peserta:</strong> {totalPesertaRealisasi} orang</p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}><strong style={{ color: '#1e293b', fontWeight: '500' }}>Tempat Diklat:</strong> {totalRealisasi} lokasi</p>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#FFA500', fontSize: '0.8125rem', fontWeight: '500', letterSpacing: '-0.01em' }}>Persentase Realisasi</h5>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  <strong style={{ color: '#1e293b', fontWeight: '500' }}>Biaya:</strong> {totalBudgetAllApproved > 0 ? ((totalBiayaRealisasi / totalBudgetAllApproved) * 100).toFixed(1) : 0}%
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  <strong style={{ color: '#1e293b', fontWeight: '500' }}>Peserta:</strong> {totalParticipantsApproved > 0 ? ((totalPesertaRealisasi / totalParticipantsApproved) * 100).toFixed(1) : 0}%
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#64748b' }}>
                  <strong style={{ color: '#1e293b', fontWeight: '500' }}>Tingkat Persetujuan:</strong> {totalProposals > 0 ? (((waitingFinalCount + finalApprovedCount) / totalProposals) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Divisi Chart */}
          {divisiChartData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Perbandingan Usulan per Divisi Korporat</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={divisiChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" label={{ value: 'Biaya (Juta Rp)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Jumlah Usulan', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Di Request' || name === 'Disetujui') {
                        return [`Rp ${value} Juta`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Di Request" fill="#fbbf24" name="Biaya Di Request (Juta)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="left" dataKey="Disetujui" fill="#34d399" name="Biaya Disetujui (Juta)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Jumlah Usulan" fill="#60a5fa" name="Jumlah Usulan" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Branch Chart */}
          {branchChartData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Perbandingan Usulan per Cabang</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={branchChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" label={{ value: 'Biaya (Juta Rp)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Jumlah Usulan', angle: 90, position: 'insideRight' }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Di Request' || name === 'Disetujui') {
                        return [`Rp ${value} Juta`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Di Request" fill="#fbbf24" name="Biaya Di Request (Juta)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="left" dataKey="Disetujui" fill="#34d399" name="Biaya Disetujui (Juta)" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Jumlah Usulan" fill="#2196F3" name="Jumlah Usulan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Data Table by Divisi */}
          {proposalsByDivisi.length > 0 ? (
            <div className="chart-card chart-full-width">
              <h4>Rekap Usulan per Divisi Korporat</h4>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Divisi</th>
                      <th>Total Usulan</th>
                      <th>Di Request</th>
                      <th>Disetujui</th>
                      <th>Biaya Di Request</th>
                      <th>Biaya Disetujui</th>
                      <th>Peserta Di Request</th>
                      <th>Peserta Disetujui</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalsByDivisi
                      .sort((a, b) => b.totalBiayaApproved - a.totalBiayaApproved)
                      .map((item, index) => (
                        <tr key={item.divisiId || index}>
                          <td>{index + 1}</td>
                          <td className="text-left"><strong>{item.divisiNama || 'N/A'}</strong></td>
                          <td>{item.totalUsulan || 0}</td>
                          <td><span className="badge badge-warning">{item.diRequest || 0}</span></td>
                          <td><span className="badge badge-success">{item.disetujui || 0}</span></td>
                          <td className="text-right">Rp {((item.totalBiayaRequested || 0) / 1000000).toFixed(2)} Juta</td>
                          <td className="text-right">Rp {((item.totalBiayaApproved || 0) / 1000000).toFixed(2)} Juta</td>
                          <td>{item.totalPesertaRequested || 0}</td>
                          <td>{item.totalPesertaApproved || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="chart-card chart-full-width">
              <h4>Rekap Usulan per Divisi Korporat</h4>
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <p>Tidak ada data divisi yang memiliki usulan</p>
              </div>
            </div>
          )}

          {/* Data Table by Branch */}
          {proposalsByBranch.length > 0 ? (
            <div className="chart-card chart-full-width">
              <h4>Rekap Usulan per Cabang</h4>
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Cabang</th>
                      <th>Total Usulan</th>
                      <th>Di Request</th>
                      <th>Disetujui</th>
                      <th>Biaya Di Request</th>
                      <th>Biaya Disetujui</th>
                      <th>Peserta Di Request</th>
                      <th>Peserta Disetujui</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalsByBranch
                      .sort((a, b) => b.totalBiayaApproved - a.totalBiayaApproved)
                      .map((item, index) => (
                        <tr key={item.branchId || index}>
                          <td>{index + 1}</td>
                          <td className="text-left"><strong>{item.branchNama || 'N/A'}</strong></td>
                          <td>{item.totalUsulan || 0}</td>
                          <td><span className="badge badge-warning">{item.diRequest || 0}</span></td>
                          <td><span className="badge badge-success">{item.disetujui || 0}</span></td>
                          <td className="text-right">Rp {((item.totalBiayaRequested || 0) / 1000000).toFixed(2)} Juta</td>
                          <td className="text-right">Rp {((item.totalBiayaApproved || 0) / 1000000).toFixed(2)} Juta</td>
                          <td>{item.totalPesertaRequested || 0}</td>
                          <td>{item.totalPesertaApproved || 0}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="chart-card chart-full-width">
              <h4>Rekap Usulan per Cabang</h4>
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <p>Tidak ada data cabang yang memiliki usulan</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboardOverview;
