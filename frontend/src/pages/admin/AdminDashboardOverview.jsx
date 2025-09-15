import React from 'react';
import './AdminDashboardOverview.css';

const AdminDashboardOverview = ({ users, proposals, onNavigate }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalProposals = proposals.length;
  const pendingCount = proposals.filter(p => p.status === 'PENDING').length;
  const approvedCount = proposals.filter(p => p.status === 'APPROVED_BY_ADMIN').length;

  return (
    <div className="dashboard-overview">
      <div className="content-header">
        <h1>Dashboard Admin</h1>
        <p>Kelola pengguna, review usulan pelatihan, dan monitoring sistem</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{totalUsers}</h3>
            <p>Total Pengguna</p>
            <small>{activeUsers} aktif</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{totalProposals}</h3>
            <p>Total Usulan</p>
            <small>{pendingCount} menunggu review</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{approvedCount}</h3>
            <p>Disetujui Admin</p>
            <small>Siap konfirmasi</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Rp {proposals.reduce((sum, p) => sum + p.totalBiaya, 0).toLocaleString('id-ID')}</h3>
            <p>Total Anggaran</p>
            <small>Semua usulan</small>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => onNavigate('proposal-approval')}
          >
            <span className="btn-icon">✅</span>
            Review Usulan ({pendingCount})
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => onNavigate('user-management')}
          >
            <span className="btn-icon">👥</span>
            Kelola Pengguna
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => onNavigate('approved-proposals')}
          >
            <span className="btn-icon">📋</span>
            Konfirmasi ke Super Admin ({approvedCount})
          </button>
        </div>
      </div>
      
      <div className="recent-activities">
        <h3>Aktivitas Terbaru</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <p><strong>john_doe</strong> mengajukan usulan "Pelatihan Leadership Management"</p>
              <small>2 jam yang lalu</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p>Usulan "Workshop Project Management" telah disetujui</p>
              <small>1 hari yang lalu</small>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <p>Pengguna baru <strong>jane_smith</strong> telah didaftarkan</p>
              <small>3 hari yang lalu</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
