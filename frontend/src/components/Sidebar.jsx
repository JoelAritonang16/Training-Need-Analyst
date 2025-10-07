import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ user, activeMenu, onMenuChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Submenu state for "Semua Usulan"
  const childProposalIds = ['proposal-approval', 'approved-proposals', 'final-approval'];
  const [isAllProposalsOpen, setIsAllProposalsOpen] = useState(
    childProposalIds.includes(activeMenu)
  );
  // Submenu state for "Manajemen Perusahaan"
  const companyChildren = ['divisi-management', 'branch-management', 'anak-perusahaan-management'];
  const [isCompanyOpen, setIsCompanyOpen] = useState(companyChildren.includes(activeMenu));

  const getUserMenuItems = () => {
    const role = user?.role?.toLowerCase();
    
    const baseMenus = {
      user: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { id: 'proposal-create', icon: '📝', label: 'Buat Usulan Baru', path: '/training-proposals/create' },
        { id: 'proposal-list', icon: '📋', label: 'Daftar Usulan', path: '/training-proposals' },
        { id: 'profile', icon: '👤', label: 'Profil Saya', path: '/profile' }
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
        { id: 'all-proposals', icon: '📚', label: 'Semua Usulan', path: '/all-proposals' },
        { id: 'company-management', icon: '🏢', label: 'Manajemen Perusahaan', path: '/company-management' },
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
      {menuItems.map((item) => {
        if (item.id === 'all-proposals' && (user?.role?.toLowerCase() === 'superadmin')) {
          const isChildActive = childProposalIds.includes(activeMenu);
          const open = isChildActive || isAllProposalsOpen;
          return (
            <li key={item.id} className={`nav-item dropdown ${open ? 'open' : ''}`}>
              <button
                className={`nav-link dropdown-toggle ${isChildActive || activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setIsAllProposalsOpen(!isAllProposalsOpen)}
                title={isCollapsed ? item.label : ''}
                aria-expanded={open}
                aria-controls="submenu-all-proposals"
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {!isCollapsed && (
                  <span className={`dropdown-chevron ${open ? 'open' : ''}`}>▾</span>
                )}
              </button>
              <ul id="submenu-all-proposals" className={`submenu ${open ? 'open' : ''}`}>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'proposal-approval' ? 'active' : ''}`}
                    onClick={() => onMenuChange('proposal-approval')}
                    title={isCollapsed ? 'Persetujuan Usulan' : ''}
                  >
                    <span className="nav-icon">✅</span>
                    {!isCollapsed && <span className="nav-label">Persetujuan Usulan</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'approved-proposals' ? 'active' : ''}`}
                    onClick={() => onMenuChange('approved-proposals')}
                    title={isCollapsed ? 'Usulan Disetujui' : ''}
                  >
                    <span className="nav-icon">📄</span>
                    {!isCollapsed && <span className="nav-label">Usulan Disetujui</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'final-approval' ? 'active' : ''}`}
                    onClick={() => onMenuChange('final-approval')}
                    title={isCollapsed ? 'Persetujuan Akhir' : ''}
                  >
                    <span className="nav-icon">🔐</span>
                    {!isCollapsed && <span className="nav-label">Persetujuan Akhir</span>}
                  </button>
                </li>
              </ul>
            </li>
          );
        }
        if (item.id === 'company-management' && (user?.role?.toLowerCase() === 'superadmin')) {
          const isChildActive = companyChildren.includes(activeMenu);
          const open = isChildActive || isCompanyOpen;
          return (
            <li key={item.id} className={`nav-item dropdown ${open ? 'open' : ''}`}>
              <button
                className={`nav-link dropdown-toggle ${isChildActive || activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                title={isCollapsed ? item.label : ''}
                aria-expanded={open}
                aria-controls="submenu-company-management"
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {!isCollapsed && (
                  <span className={`dropdown-chevron ${open ? 'open' : ''}`}>▾</span>
                )}
              </button>
              <ul id="submenu-company-management" className={`submenu ${open ? 'open' : ''}`}>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'divisi-management' ? 'active' : ''}`}
                    onClick={() => onMenuChange('divisi-management')}
                    title={isCollapsed ? 'Manajemen Divisi' : ''}
                  >
                    <span className="nav-icon">🏢</span>
                    {!isCollapsed && <span className="nav-label">Manajemen Divisi</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'branch-management' ? 'active' : ''}`}
                    onClick={() => onMenuChange('branch-management')}
                    title={isCollapsed ? 'Manajemen Branch' : ''}
                  >
                    <span className="nav-icon">🏪</span>
                    {!isCollapsed && <span className="nav-label">Manajemen Branch</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'anak-perusahaan-management' ? 'active' : ''}`}
                    onClick={() => onMenuChange('anak-perusahaan-management')}
                    title={isCollapsed ? 'Manajemen Anak Perusahaan' : ''}
                  >
                    <span className="nav-icon">🏭</span>
                    {!isCollapsed && <span className="nav-label">Manajemen Anak Perusahaan</span>}
                  </button>
                </li>
              </ul>
            </li>
          );
        }
        return (
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
        );
      })}
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
