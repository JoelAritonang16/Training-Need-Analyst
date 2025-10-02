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

  // Sidebar-equivalent items to display as tiles on the dashboard
  const menuTiles = [
    { id: 'user-management', icon: '👥', label: 'Manajemen User' },
    { id: 'proposal-approval', icon: '✅', label: 'Persetujuan Usulan' },
    { id: 'approved-proposals', icon: '📄', label: 'Usulan Disetujui' },
    { id: 'final-approval', icon: '🔐', label: 'Persetujuan Akhir' },
    { id: 'all-proposals', icon: '📚', label: 'Semua Usulan' },
    { id: 'divisi-management', icon: '🏢', label: 'Manajemen Divisi' },
    { id: 'branch-management', icon: '🏪', label: 'Manajemen Branch' },
    { id: 'anak-perusahaan-management', icon: '🏭', label: 'Manajemen Anak Perusahaan' },
    { id: 'system-config', icon: '⚙️', label: 'Konfigurasi Sistem' },
    { id: 'audit-logs', icon: '📜', label: 'Log Audit' },
  ];

  return (
    <div className="dashboard-overview">
      {/* Blue rounded banner header */}
      <div className="admin-banner" role="region" aria-label="Dashboard Header">
        <h1>Dashboard Admin</h1>
        <p>Selamat datang di panel administrasi PT Pelindo</p>
      </div>

      {/* Only show menu tiles derived from Sidebar items */}
      
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
