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
  
  // Budget calculations - based on status
  const totalBudgetRequested = proposals ? proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalBudgetApproved = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN').reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  const totalBudget = proposals ? proposals.reduce((sum, p) => sum + (parseFloat(p.TotalUsulan) || 0), 0) : 0;
  
  // Participant calculations
  const totalParticipantsRequested = proposals ? proposals.filter(p => p.status === 'MENUNGGU').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  const totalParticipantsApproved = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN').reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  const totalParticipants = proposals ? proposals.reduce((sum, p) => sum + (parseInt(p.JumlahPeserta) || 0), 0) : 0;
  
  // Realisasi data calculations
  const totalKegiatanRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.jumlahKegiatan) || 0), 0);
  const totalPesertaRealisasi = realisasiData.reduce((sum, r) => sum + (parseInt(r.totalPeserta) || 0), 0);
  const totalBiayaRealisasi = realisasiData.reduce((sum, r) => sum + (parseFloat(r.totalBiaya) || 0), 0);

  useEffect(() => {
    fetchDashboardData();
    
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch drafts (view only for admin)
      try {
        const draftsResult = await draftTNA2026API.getAll();
        if (draftsResult.success) {
          setDrafts(draftsResult.drafts || []);
        }
      } catch (err) {
        // Continue with other data fetches
      }

      // Fetch tempat diklat realisasi
      try {
        const realisasiResult = await tempatDiklatRealisasiAPI.getAll();
        if (realisasiResult.success) {
          setRealisasiData(realisasiResult.data || []);
        }
      } catch (err) {
        // Continue with other data fetches
      }

      // Fetch rekap per bulan
      try {
        const rekapResult = await tempatDiklatRealisasiAPI.getRekapPerBulan(new Date().getFullYear());
        if (rekapResult.success) {
          setRekapPerBulan(rekapResult.rekap || []);
        }
      } catch (err) {
        // Continue - this is not critical
      }
    } catch (error) {
      // Don't throw - let component continue rendering
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
      {/* Modern Header Banner */}
      <div className="dashboard-header-banner">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di panel administrasi - Kelola pengguna, review usulan pelatihan, dan monitoring sistem</p>
      </div>

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
            <small>{pendingCount} menunggu review</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={18} /></div>
          <div className="stat-content">
            <h3>{approvedCount}</h3>
            <p>Disetujui Admin</p>
            <small>Siap konfirmasi</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={18} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {(totalBudgetApproved / 1000000).toFixed(2)} Juta
            </h3>
            <p>Anggaran Disetujui</p>
            <small>Usulan yang disetujui</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={18} /></div>
          <div className="stat-content">
            <h3>{totalParticipantsApproved}</h3>
            <p>Peserta Disetujui</p>
            <small>Usulan yang disetujui</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={18} /></div>
          <div className="stat-content">
            <h3>{totalDrafts}</h3>
            <p>Draft TNA</p>
            <small>{user?.branch?.nama || 'N/A'}</small>
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

          {/* Draft Status Donut Chart */}
          <div className="chart-card">
            <h4>Status Draft TNA</h4>
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

          {/* Rekap Per Bulan Line Chart */}
          <div className="chart-card chart-full-width">
            <h4>Rekap Tempat Diklat Realisasi Per Bulan ({new Date().getFullYear()})</h4>
            <ResponsiveContainer width="100%" height={200}>
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
            <ResponsiveContainer width="100%" height={200}>
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
