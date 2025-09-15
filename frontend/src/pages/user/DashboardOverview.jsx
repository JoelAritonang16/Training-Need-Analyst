import React from 'react';
import './DashboardOverview.css';

const DashboardOverview = ({ user, proposals, onNavigate }) => {
  const approvedCount = proposals.filter(p => p.status === 'APPROVED').length;
  const pendingCount = proposals.filter(p => p.status === 'PENDING').length;
  const totalBudget = proposals.reduce((sum, p) => sum + p.totalBiaya, 0);

  return (
    <div className="dashboard-overview">
      <div className="content-header">
        <h1>Dashboard User</h1>
        <p>Selamat datang di Sistem Manajemen Pelatihan PT Pelindo!</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{proposals.length}</h3>
            <p>Total Usulan</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{approvedCount}</h3>
            <p>Disetujui</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{pendingCount}</h3>
            <p>Menunggu Persetujuan</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Rp {totalBudget.toLocaleString('id-ID')}</h3>
            <p>Total Anggaran</p>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => onNavigate('proposal-form')}
          >
            <span className="btn-icon">📝</span>
            Ajukan Pelatihan Baru
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => onNavigate('my-proposals')}
          >
            <span className="btn-icon">📋</span>
            Lihat Usulan Saya
          </button>
        </div>
      </div>
      
      <div className="recent-proposals">
        <h3>Usulan Terbaru</h3>
        <div className="recent-list">
          {proposals.slice(0, 3).map(proposal => (
            <div key={proposal.id} className="recent-item">
              <div className="recent-info">
                <h4>{proposal.uraian}</h4>
                <p>{proposal.waktuPelaksanaan}</p>
              </div>
              <span className={`status-badge ${proposal.status.toLowerCase()}`}>
                {proposal.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
