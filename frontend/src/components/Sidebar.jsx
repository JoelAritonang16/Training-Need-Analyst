import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ user, activeMenu, onMenuChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getUserMenuItems = () => {
    const role = user?.role?.toLowerCase();
    
    const baseMenus = {
      user: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { id: 'proposal-form', icon: '📝', label: 'Ajukan Pelatihan', path: '/proposal-form' },
        { id: 'my-proposals', icon: '📋', label: 'Usulan Saya', path: '/my-proposals' },
        { id: 'profile', icon: '👤', label: 'Profil', path: '/profile' }
      ],
      admin: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { id: 'user-management', icon: '👥', label: 'Manajemen User', path: '/user-management' },
        { id: 'proposal-approval', icon: '✅', label: 'Persetujuan Usulan', path: '/proposal-approval' },
        { id: 'approved-proposals', icon: '📄', label: 'Usulan Disetujui', path: '/approved-proposals' },
        { id: 'reports', icon: '📈', label: 'Laporan', path: '/reports' },
        { id: 'profile', icon: '👤', label: 'Profil', path: '/profile' }
      ],
      superadmin: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { id: 'user-management', icon: '👥', label: 'Manajemen User', path: '/user-management' },
        { id: 'proposal-approval', icon: '✅', label: 'Persetujuan Usulan', path: '/proposal-approval' },
        { id: 'approved-proposals', icon: '📄', label: 'Usulan Disetujui', path: '/approved-proposals' },
        { id: 'final-approval', icon: '🔐', label: 'Persetujuan Akhir', path: '/final-approval' },
        { id: 'all-proposals', icon: '📚', label: 'Semua Usulan', path: '/all-proposals' },
        { id: 'system-config', icon: '⚙️', label: 'Konfigurasi Sistem', path: '/system-config' },
        { id: 'reports', icon: '📈', label: 'Laporan', path: '/reports' },
        { id: 'audit-logs', icon: '📜', label: 'Log Audit', path: '/audit-logs' },
        { id: 'profile', icon: '👤', label: 'Profil', path: '/profile' }
      ]
    };

    return baseMenus[role] || baseMenus.user;
  };

  const menuItems = getUserMenuItems();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
  <div className="sidebar-header">
    <div className="sidebar-brand">
      <img src="/LogoNonBG.png" alt="Logo Pelindo" className="sidebar-logo" />
      {!isCollapsed && (
        <div className="brand-text">
          <h2>Sistem Pelatihan</h2>
          <p>PT Pelindo</p>
        </div>
      )}
    </div>
    <button 
      className="sidebar-toggle"
      onClick={() => setIsCollapsed(!isCollapsed)}
      title={isCollapsed ? 'Expand' : 'Collapse'}
    >
      {isCollapsed ? '→' : '←'}
    </button>
  </div>

  <div className="sidebar-user">
	  {/* User section removed as requested */}
  </div>

  <nav className="sidebar-nav">
    <ul className="nav-menu">
      {menuItems.map((item) => (
        <li key={item.id} className="nav-item">
          <button
            className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        </li>
      ))}
    </ul>
  </nav>

  {/* Gambar Batik Pelindo sebagai latar belakang */}
  <div className="batik-background">
    <img src="/batikpelindo.png" alt="Motif Batik Pelindo" className="batik-image" />
  </div>
</div>

  );
};

export default Sidebar;
