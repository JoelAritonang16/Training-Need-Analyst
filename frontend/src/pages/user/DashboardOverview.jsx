import React, { useState, useEffect } from 'react';
import { LuClipboardList, LuBookOpen, LuFileText } from 'react-icons/lu';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { draftTNA2026API, trainingProposalAPI } from '../../utils/api';
import './DashboardOverview.css';

const DashboardOverview = ({ user, proposals, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalProposals = proposals ? proposals.length : 0;
  const pendingProposals = proposals ? proposals.filter(p => p.status === 'MENUNGGU').length : 0;
  const approvedProposals = proposals ? proposals.filter(p => p.status === 'APPROVE_ADMIN' || p.status === 'APPROVE_SUPERADMIN').length : 0;
  const rejectedProposals = proposals ? proposals.filter(p => p.status === 'DITOLAK').length : 0;
  const totalDrafts = drafts.length;
  
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
      
      // Fetch drafts sesuai divisi user
      const draftsResult = await draftTNA2026API.getAll();
      if (draftsResult.success) {
        // Filter drafts sesuai divisi user
        const userDivisiDrafts = draftsResult.drafts?.filter(d => 
          d.divisiId === user?.divisiId || d.branchId === user?.branchId
        ) || [];
        setDrafts(userDivisiDrafts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for proposals status
  const proposalStatusData = [
    { name: 'Menunggu', value: pendingProposals, color: '#FFA500' },
    { name: 'Disetujui', value: approvedProposals, color: '#4CAF50' },
    { name: 'Ditolak', value: rejectedProposals, color: '#F44336' },
  ].filter(item => item.value > 0); // Only show non-zero values

  // Prepare chart data for drafts
  const draftStatusData = [
    { name: 'Draft', value: drafts.filter(d => d.status === 'DRAFT').length, color: '#2196F3' },
    { name: 'Submitted', value: drafts.filter(d => d.status === 'SUBMITTED').length, color: '#FF9800' },
    { name: 'Approved', value: drafts.filter(d => d.status === 'APPROVED').length, color: '#4CAF50' },
  ];

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        
        <p>Selamat datang, {user?.username || 'User'}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usulan</h3>
          <div className="stat-number">{totalProposals}</div>
          <small>Divisi: {user?.divisi?.nama || 'N/A'}</small>
        </div>
        
        <div className="stat-card">
          <h3>Menunggu Persetujuan</h3>
          <div className="stat-number">{pendingProposals}</div>
          <small>Usulan TNA 2026</small>
        </div>
        
        <div className="stat-card">
          <h3>Disetujui</h3>
          <div className="stat-number">{approvedProposals}</div>
          <small>Usulan yang disetujui</small>
        </div>

        <div className="stat-card">
          <h3>Total Anggaran</h3>
          <div className="stat-number">
            Rp {totalBudget.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </div>
          <small>Semua usulan</small>
        </div>

        <div className="stat-card">
          <h3>Total Peserta</h3>
          <div className="stat-number">{totalParticipants}</div>
          <small>Semua usulan</small>
        </div>

        <div className="stat-card">
          <h3>Draft TNA 2026</h3>
          <div className="stat-number">{totalDrafts}</div>
          <small>Divisi: {user?.divisi?.nama || 'N/A'}</small>
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
          {totalDrafts > 0 && (
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
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => onNavigate('proposal-create')}
          >
            <span className="btn-icon"><LuClipboardList size={18} /></span>
            Buat Usulan Baru
          </button>
          <button 
            className="btn-secondary"
            onClick={() => onNavigate('proposal-list')}
          >
            <span className="btn-icon"><LuBookOpen size={18} /></span>
            Lihat Daftar Usulan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
