import React, { useState, useEffect } from 'react';
import {
  LuUsers,
  LuCheckCircle2,
  LuClipboardList,
  LuShieldCheck,
  LuBookOpen,
  LuBuilding,
  LuStore,
  LuFactory,
  LuSettings,
  LuScrollText,
  LuFileText,
  LuMapPin,
  LuBarChart3,
  LuWallet,
} from 'react-icons/lu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { draftTNA2026API, tempatDiklatRealisasiAPI, trainingProposalAPI } from '../../utils/api';
import './SuperAdminDashboardOverview.css';

const SuperAdminDashboardOverview = ({ users, proposals, auditLogs, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [realisasiData, setRealisasiData] = useState([]);
  const [rekapPerBulan, setRekapPerBulan] = useState([]);
  const [rekapGabungan, setRekapGabungan] = useState(null);
  const [loading, setLoading] = useState(true);

  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter(u => u.status === 'active').length : 0;
  const totalProposals = proposals ? proposals.length : 0;
  const pendingCount = proposals ? proposals.filter(p => p.status === 'MENUNGGU').length : 0;
  const waitingFinalCount = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN').length : 0;
  const finalApprovedCount = proposals ? proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').length : 0;
  const rejectedCount = proposals ? proposals.filter(p => p.status === 'DITOLAK').length : 0;
  const totalBudget = proposals ? proposals.filter(p => p.status === 'APPROVE_SUPERADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalDrafts = drafts.length;
  const totalRealisasi = realisasiData.length;
  
  // Calculate total participants
  const totalParticipants = proposals ? proposals.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  
  // Calculate rekap gabungan totals
  const totalDraftGabungan = rekapGabungan ? rekapGabungan.total.totalDraft : 0;
  const totalBiayaGabungan = rekapGabungan ? rekapGabungan.total.totalBiaya : 0;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch drafts
      const draftsResult = await draftTNA2026API.getAll();
      if (draftsResult.success) {
        setDrafts(draftsResult.drafts || []);
      }

      // Fetch tempat diklat realisasi
      const realisasiResult = await tempatDiklatRealisasiAPI.getAll();
      if (realisasiResult.success) {
        setRealisasiData(realisasiResult.data || []);
      }

      // Fetch rekap per bulan
      const rekapResult = await tempatDiklatRealisasiAPI.getRekapPerBulan(new Date().getFullYear());
      if (rekapResult.success) {
        setRekapPerBulan(rekapResult.rekap || []);
      }

      // Fetch rekap gabungan (20 cabang + 18 divisi)
      const rekapGabunganResult = await draftTNA2026API.getRekapGabungan();
      if (rekapGabunganResult.success) {
        setRekapGabungan(rekapGabunganResult.rekap);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  // Prepare chart data for rekap per bulan
  const chartDataPerBulan = rekapPerBulan.map(month => ({
    name: month.namaBulan,
    'Total Kegiatan': month.total.totalKegiatan,
    'Total Peserta': month.total.totalPeserta,
    'Total Biaya (Juta)': (month.total.totalBiaya / 1000000).toFixed(2),
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
      'Total Biaya (Miliar)': (b.totalBiaya / 1000000000).toFixed(2),
      'Total Peserta': b.totalPeserta,
    })) || [];

  // Prepare chart data for rekap gabungan - top 10 divisi
  const topDivisiData = rekapGabungan?.divisi
    ?.sort((a, b) => b.totalBiaya - a.totalBiaya)
    .slice(0, 10)
    .map(d => ({
      name: d.nama.length > 15 ? d.nama.substring(0, 15) + '...' : d.nama,
      'Total Draft': d.totalDraft,
      'Total Biaya (Miliar)': (d.totalBiaya / 1000000000).toFixed(2),
      'Total Peserta': d.totalPeserta,
    })) || [];

  // Sidebar-equivalent items to display as tiles on the dashboard
  const menuTiles = [
    { id: 'user-management', icon: <LuUsers size={22} />, label: 'Manajemen User' },
    { id: 'proposal-approval', icon: <LuCheckCircle2 size={22} />, label: 'Persetujuan Usulan' },
    { id: 'approved-proposals', icon: <LuClipboardList size={22} />, label: 'Usulan Disetujui' },
    { id: 'final-approval', icon: <LuShieldCheck size={22} />, label: 'Persetujuan Akhir' },
    { id: 'all-proposals', icon: <LuBookOpen size={22} />, label: 'Semua Usulan' },
    { id: 'draft-tna-2026', icon: <LuFileText size={22} />, label: 'Draft TNA 2026' },
    { id: 'tempat-diklat-realisasi', icon: <LuMapPin size={22} />, label: 'Tempat Diklat Realisasi' },
    { id: 'rekap-gabungan', icon: <LuBarChart3 size={22} />, label: 'Rekap Gabungan' },
    { id: 'divisi-management', icon: <LuBuilding size={22} />, label: 'Manajemen Divisi' },
    { id: 'branch-management', icon: <LuStore size={22} />, label: 'Manajemen Branch' },
    { id: 'anak-perusahaan-management', icon: <LuFactory size={22} />, label: 'Manajemen Anak Perusahaan' },
    { id: 'system-config', icon: <LuSettings size={22} />, label: 'Konfigurasi Sistem' },
    { id: 'audit-logs', icon: <LuScrollText size={22} />, label: 'Log Audit' },
  ];

  return (
    <div className="dashboard-overview">
      {/* Blue rounded banner header */}
      <div className="admin-banner" role="region" aria-label="Dashboard Header">
        <h1>Dashboard Superadmin</h1>
        <p>Selamat datang di panel administrasi PT Pelindo - Overview lengkap semua cabang dan divisi</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={24} /></div>
          <div className="stat-content">
            <h3>{totalUsers}</h3>
            <p>Total Pengguna</p>
            <small>{activeUsers} aktif</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuClipboardList size={24} /></div>
          <div className="stat-content">
            <h3>{totalProposals}</h3>
            <p>Total Usulan</p>
            <small>{pendingCount} menunggu</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={24} /></div>
          <div className="stat-content">
            <h3>{finalApprovedCount}</h3>
            <p>Disetujui Final</p>
            <small>Semua branch</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={24} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {totalBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
            </h3>
            <p>Total Anggaran</p>
            <small>Disetujui final</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={24} /></div>
          <div className="stat-content">
            <h3>{totalDrafts}</h3>
            <p>Draft TNA 2026</p>
            <small>20 Cabang + 18 Divisi</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuMapPin size={24} /></div>
          <div className="stat-content">
            <h3>{totalRealisasi}</h3>
            <p>Tempat Diklat Realisasi</p>
            <small>Per bulan</small>
          </div>
        </div>

        {rekapGabungan && (
          <>
            <div className="stat-card">
              <div className="stat-icon"><LuBarChart3 size={24} /></div>
              <div className="stat-content">
                <h3>{rekapGabungan.total?.totalDraft || 0}</h3>
                <p>Total Draft Gabungan</p>
                <small>20 Cabang + 18 Divisi</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><LuBarChart3 size={24} /></div>
              <div className="stat-content">
                <h3>
                  Rp{" "}
                  {((rekapGabungan.total?.totalBiaya || 0) / 1000000000).toFixed(2)}M
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
          {/* Proposal Status Pie Chart */}
          <div className="chart-card">
            <h4>Status Usulan Pelatihan</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={proposalStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {proposalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Draft Status Pie Chart */}
          <div className="chart-card">
            <h4>Status Draft TNA 2026</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={draftStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {draftStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top 10 Branches Bar Chart */}
          {topBranchesData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Top 10 Cabang - Total Draft dan Biaya</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topBranchesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Total Draft" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="Total Biaya (Miliar)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top 10 Divisi Bar Chart */}
          {topDivisiData.length > 0 && (
            <div className="chart-card chart-full-width">
              <h4>Top 10 Divisi Korporat - Total Draft dan Biaya</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDivisiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Total Draft" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="Total Biaya (Miliar)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rekap Per Bulan Line Chart */}
          <div className="chart-card chart-full-width">
            <h4>Rekap Tempat Diklat Realisasi Per Bulan ({new Date().getFullYear()})</h4>
            <ResponsiveContainer width="100%" height={300}>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataPerBulan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Total Biaya (Juta)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="action-buttons">
          <button
            className="action-btn primary"
            onClick={() => onNavigate("proposal-approval")}
          >
            <span className="btn-icon"><LuCheckCircle2 size={18} /></span>
            Review Usulan ({pendingCount})
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onNavigate("draft-tna-2026")}
          >
            <span className="btn-icon"><LuFileText size={18} /></span>
            Draft TNA 2026 ({totalDrafts})
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onNavigate("tempat-diklat-realisasi")}
          >
            <span className="btn-icon"><LuMapPin size={18} /></span>
            Tempat Diklat Realisasi
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onNavigate("rekap-gabungan")}
          >
            <span className="btn-icon"><LuBarChart3 size={18} /></span>
            Rekap Gabungan (20 Cabang + 18 Divisi)
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onNavigate("all-proposals")}
          >
            <span className="btn-icon"><LuBookOpen size={18} /></span>
            Semua Usulan
          </button>
        </div>
      </div>

      {/* Sidebar-driven menu tiles */}
      <div className="menu-tiles">
        {menuTiles.map(tile => (
          <button
            key={tile.id}
            className="menu-tile"
            onClick={() => onNavigate(tile.id)}
          >
            <span className="tile-icon" aria-hidden>{tile.icon}</span>
            <span className="tile-label">{tile.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboardOverview;
