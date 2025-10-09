import React from 'react';

const DashboardOverview = ({ user, proposals, onNavigate }) => {
  const totalProposals = proposals ? proposals.length : 0;
  const pendingProposals = proposals ? proposals.filter(p => p.status === 'PENDING').length : 0;
  const approvedProposals = proposals ? proposals.filter(p => p.status === 'APPROVED').length : 0;

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        
        <p>Selamat datang, {user?.username || 'User'}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usulan</h3>
          <div className="stat-number">{totalProposals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Menunggu Persetujuan</h3>
          <div className="stat-number">{pendingProposals}</div>
        </div>
        
        <div className="stat-card">
          <h3>Disetujui</h3>
          <div className="stat-number">{approvedProposals}</div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn-primary"
            onClick={() => onNavigate('proposal-create')}
          >
            Buat Usulan Baru
          </button>
          <button 
            className="btn-secondary"
            onClick={() => onNavigate('proposal-list')}
          >
            Lihat Daftar Usulan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
