import React, { useState, useEffect } from 'react';
import { 
  LuClipboardList, 
  LuBookOpen, 
  LuFileText, 
  LuCheckCircle2, 
  LuClock, 
  LuWallet, 
  LuUsers,
  LuFileCheck2
} from 'react-icons/lu';
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
      try {
        const draftsResult = await draftTNA2026API.getAll();
        if (draftsResult.success) {
          // Filter drafts sesuai divisi user
          const userDivisiDrafts = draftsResult.drafts?.filter(d => 
            d.divisiId === user?.divisiId || d.branchId === user?.branchId
          ) || [];
          setDrafts(userDivisiDrafts);
        }
      } catch (err) {
        console.warn('Error fetching drafts:', err);
        // Set empty array if fetch fails
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't throw - let component continue rendering
      setDrafts([]);
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
      {/* Modern Header Banner */}
      <div className="dashboard-header-banner">
        <h1>Dashboard User</h1>
        <p>Selamat datang di panel dashboard user - Kelola usulan pelatihan dan draft TNA 2026 Anda</p>
      </div>

      {/* Metric Cards with Icons */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><LuClipboardList size={20} /></div>
          <div className="stat-content">
            <h3>{totalProposals}</h3>
            <p>Total Usulan</p>
            <small>Divisi: {user?.divisi?.nama || 'N/A'}</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><LuClock size={20} /></div>
          <div className="stat-content">
            <h3>{pendingProposals}</h3>
            <p>Menunggu Persetujuan</p>
            <small>Usulan TNA 2026</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={20} /></div>
          <div className="stat-content">
            <h3>{approvedProposals}</h3>
            <p>Disetujui</p>
            <small>Usulan yang disetujui</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={20} /></div>
          <div className="stat-content">
            <h3>Rp {(totalBudget / 1000000).toFixed(1)} Juta</h3>
            <p>Total Anggaran</p>
            <small>Semua usulan</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={20} /></div>
          <div className="stat-content">
            <h3>{totalParticipants}</h3>
            <p>Total Peserta</p>
            <small>Semua usulan</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={20} /></div>
          <div className="stat-content">
            <h3>{totalDrafts}</h3>
            <p>Draft TNA 2026</p>
            <small>Divisi: {user?.divisi?.nama || 'N/A'}</small>
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
          {totalDrafts > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
