import React, { useState, useEffect } from "react";
import {
  LuUsers,
  LuClipboardList,
  LuCheckCircle2,
  LuWallet,
  LuFileCheck2,
  LuFileText,
  LuMapPin,
} from 'react-icons/lu';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { draftTNA2026API, tempatDiklatRealisasiAPI, trainingProposalAPI } from '../../utils/api';
import "./AdminDashboardOverview.css";

const AdminDashboardOverview = ({ users, proposals, user, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [realisasiData, setRealisasiData] = useState([]);
  const [rekapPerBulan, setRekapPerBulan] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalUsers = users ? users.length : 0;
  const activeUsers = users ? users.filter((u) => u.status === "active").length : 0;
  const totalProposals = proposals ? proposals.length : 0;
  const pendingCount = proposals ? proposals.filter((p) => p.status === "MENUNGGU").length : 0;
  const approvedCount = proposals ? proposals.filter(
    (p) => p.status === "APPROVE_ADMIN"
  ).length : 0;
  const rejectedCount = proposals ? proposals.filter((p) => p.status === "DITOLAK").length : 0;
  const totalDrafts = drafts.length;
  const totalRealisasi = realisasiData.length;
  
  // Calculate total budget from proposals
  const totalBudget = proposals ? proposals.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  
  // Calculate total participants
  const totalParticipants = proposals ? proposals.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch drafts (view only for admin)
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for proposals status
  const proposalStatusData = [
    { name: 'Menunggu', value: pendingCount, color: '#FFA500' },
    { name: 'Disetujui Admin', value: approvedCount, color: '#4CAF50' },
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

  return (
    <div className="dashboard-overview">
      <div className="content-header">
        <h1>Dashboard Admin</h1>
        <p>Kelola pengguna, review usulan pelatihan, dan monitoring sistem</p>
      </div>

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
            <small>{pendingCount} menunggu review</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={24} /></div>
          <div className="stat-content">
            <h3>{approvedCount}</h3>
            <p>Disetujui Admin</p>
            <small>Siap </small>
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
            <small>Semua usulan</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={24} /></div>
          <div className="stat-content">
            <h3>{totalParticipants}</h3>
            <p>Total Peserta</p>
            <small>Semua usulan</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={24} /></div>
          <div className="stat-content">
            <h3>{totalDrafts}</h3>
            <p>Draft TNA 2026</p>
            <small>Branch: {user?.branch?.nama || 'N/A'}</small>
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
            onClick={() => onNavigate("user-management")}
          >
            <span className="btn-icon"><LuUsers size={18} /></span>
            Kelola Pengguna
          </button>
          <button
            className="action-btn secondary"
            onClick={() => onNavigate("approved-proposals")}
          >
            <span className="btn-icon"><LuFileCheck2 size={18} /></span>
            Konfirmasi ke Super Admin ({approvedCount})
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
        </div>
      </div>

      <div className="recent-activities">
        <h3>Aktivitas Terbaru</h3>
        <div className="activity-list">
          {proposals && proposals.length > 0 ? (
            proposals.slice(0, 5).map((proposal) => {
              const statusIcon = proposal.status === 'APPROVE_ADMIN' ? <LuCheckCircle2 size={18} /> :
                                proposal.status === 'DITOLAK' ? <LuClipboardList size={18} /> :
                                <LuClipboardList size={18} />;
              const statusText = proposal.status === 'APPROVE_ADMIN' ? 'telah disetujui' :
                                proposal.status === 'DITOLAK' ? 'telah ditolak' :
                                'menunggu persetujuan';
              const timeAgo = proposal.created_at ? 
                new Date(proposal.created_at).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Tanggal tidak tersedia';
              
              return (
                <div key={proposal.id} className="activity-item">
                  <div className="activity-icon">{statusIcon}</div>
                  <div className="activity-content">
                    <p>
                      <strong>{proposal.user?.username || proposal.user?.fullName || 'User'}</strong> - 
                      Usulan "{proposal.Uraian || 'N/A'}" {statusText}
                    </p>
                    <small>{timeAgo}</small>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="activity-item">
              <div className="activity-icon"><LuClipboardList size={18} /></div>
              <div className="activity-content">
                <p>Tidak ada aktivitas terbaru</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
