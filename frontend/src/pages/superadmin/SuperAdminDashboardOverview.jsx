import React from 'react';
import './SuperAdminDashboardOverview.css';

const SuperAdminDashboardOverview = ({ users, proposals, auditLogs, onNavigate }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalProposals = proposals.length;
  const pendingCount = proposals.filter(p => p.status === 'PENDING').length;
  const waitingFinalCount = proposals.filter(p => p.status === 'WAITING_SUPERADMIN_APPROVAL').length;
  const finalApprovedCount = proposals.filter(p => p.status === 'FINAL_APPROVED').length;
  const totalBudget = proposals.filter(p => p.status === 'FINAL_APPROVED').reduce((sum, p) => sum + p.totalBiaya, 0);

  return (
    <div className="dashboard-overview">
      <div className="content-header">
        <div>
          <h1>Dashboard Super Admin</h1>
          <p>Kontrol penuh sistem manajemen pelatihan PT Pelindo</p>
        </div>
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
            <small>{pendingCount} pending</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{waitingFinalCount}</h3>
            <p>Menunggu Persetujuan</p>
            <small>Super Admin</small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{finalApprovedCount}</h3>
            <p>Disetujui Final</p>
            <small>Siap eksekusi</small>
          </div>
        </div>
        
        <div className="stat-card budget">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Rp {totalBudget.toLocaleString('id-ID')}</h3>
            <p>Budget Disetujui</p>
            <small>Tahun 2025</small>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Aksi Cepat</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary"
            onClick={() => onNavigate('final-approval')}
          >
            <span className="btn-icon">🔐</span>
            Persetujuan Akhir ({waitingFinalCount})
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
            onClick={() => onNavigate('all-proposals')}
          >
            <span className="btn-icon">📋</span>
            Semua Usulan
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => onNavigate('system-config')}
          >
            <span className="btn-icon">⚙️</span>
            Konfigurasi Sistem
          </button>
        </div>
      </div>
      
      <div className="system-overview">
        <div className="overview-section">
          <h3>Status Sistem</h3>
          <div className="system-status">
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>Database: Online</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>Server: Running</span>
            </div>
            <div className="status-item">
              <span className="status-indicator online"></span>
              <span>Backup: Up to date</span>
            </div>
          </div>
        </div>
        
        <div className="overview-section">
          <h3>Aktivitas Terbaru</h3>
          <div className="activity-list">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="activity-item">
                <div className="activity-icon">
                  {log.action === 'SUBMIT_PROPOSAL' ? '📝' : 
                   log.action === 'APPROVE_PROPOSAL' ? '✅' : 
                   log.action === 'FINAL_APPROVE' ? '🔐' : '👤'}
                </div>
                <div className="activity-content">
                  <p><strong>{log.user}</strong> {log.action.toLowerCase().replace(/_/g, ' ')} "{log.target}"</p>
                  <small>{new Date(log.timestamp).toLocaleString('id-ID')}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardOverview;
