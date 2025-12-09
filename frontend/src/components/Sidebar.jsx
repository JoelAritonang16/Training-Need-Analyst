import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { notificationAPI } from '../utils/api';
import {
  LuGauge,
  LuUsers,
  LuClipboardList,
  LuBookOpen,
  LuCheckCircle2,
  LuShieldCheck,
  LuBuilding2,
  LuBuilding,
  LuStore,
  LuFactory,
  LuFileBarChart,
  LuUserCircle,
  LuFileText,
  LuMapPin,
  LuBarChart3
} from 'react-icons/lu';

const Sidebar = ({ user, activeMenu, onMenuChange, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draftTNANotificationCount, setDraftTNANotificationCount] = useState(0);

  // Fetch draft TNA notification count
  useEffect(() => {
    const fetchDraftTNANotificationCount = async () => {
      if (user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'superadmin')) {
        try {
          const result = await notificationAPI.getDraftTNANotificationCount();
          if (result.success) {
            setDraftTNANotificationCount(result.count || 0);
          }
        } catch (error) {
          console.error('Error fetching draft TNA notification count:', error);
        }
      }
    };

    fetchDraftTNANotificationCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDraftTNANotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Update body class when sidebar collapses/expands
  React.useEffect(() => {
    // Set initial state on mount
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.body.classList.remove('sidebar-expanded');
    } else {
      document.body.classList.add('sidebar-expanded');
      document.body.classList.remove('sidebar-collapsed');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('sidebar-collapsed');
      document.body.classList.remove('sidebar-expanded');
    };
  }, [isCollapsed]);
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
        { id: 'dashboard', icon: <LuGauge size={18} />, label: 'Dashboard', path: '/dashboard' },
        { id: 'proposal-create', icon: <LuClipboardList size={18} />, label: 'Buat Usulan Baru', path: '/training-proposals/create' },
        { id: 'proposal-list', icon: <LuBookOpen size={18} />, label: 'Daftar Usulan', path: '/training-proposals' },
        { id: 'profile', icon: <LuUserCircle size={18} />, label: 'Profil Saya', path: '/profile' }
      ],
      admin: [
        { id: 'dashboard', icon: <LuGauge size={18} />, label: 'Dashboard', path: '/dashboard' },
        { id: 'user-management', icon: <LuUsers size={18} />, label: 'Manajemen User', path: '/user-management' },
        { id: 'proposal-approval', icon: <LuCheckCircle2 size={18} />, label: 'Persetujuan Usulan', path: '/proposal-approval' },
        { id: 'approved-proposals', icon: <LuClipboardList size={18} />, label: 'Usulan Disetujui', path: '/approved-proposals' },
        { id: 'draft-tna-2026', icon: <LuFileText size={18} />, label: 'Draft TNA', path: '/draft-tna-2026' },
        { id: 'tempat-diklat-realisasi', icon: <LuMapPin size={18} />, label: 'Tempat Diklat Realisasi', path: '/tempat-diklat-realisasi' },
        { id: 'reports', icon: <LuFileBarChart size={18} />, label: 'Laporan', path: '/reports' },
        { id: 'profile', icon: <LuUserCircle size={18} />, label: 'Profil', path: '/profile' }
      ],
      superadmin: [
        { id: 'dashboard', icon: <LuGauge size={18} />, label: 'Dashboard', path: '/dashboard' },
        { id: 'user-management', icon: <LuUsers size={18} />, label: 'Manajemen User', path: '/user-management' },
        { id: 'all-proposals', icon: <LuBookOpen size={18} />, label: 'Semua Usulan', path: '/all-proposals' },
        { id: 'draft-tna-2026', icon: <LuFileText size={18} />, label: 'Draft TNA', path: '/draft-tna-2026' },
        { id: 'tempat-diklat-realisasi', icon: <LuMapPin size={18} />, label: 'Tempat Diklat Realisasi', path: '/tempat-diklat-realisasi' },
        { id: 'rekap-gabungan', icon: <LuBarChart3 size={18} />, label: 'Rekap Gabungan', path: '/rekap-gabungan' },
        { id: 'company-management', icon: <LuBuilding2 size={18} />, label: 'Manajemen Perusahaan', path: '/company-management' },
        { id: 'reports', icon: <LuFileBarChart size={18} />, label: 'Laporan', path: '/reports' },
        { id: 'profile', icon: <LuUserCircle size={18} />, label: 'Profil', path: '/profile' }
      ]
    };

    return baseMenus[role] || baseMenus.user;
  };

  const menuItems = getUserMenuItems();

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
  <div className="sidebar-header">
    <div className="sidebar-brand">
     
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
                    <span className="nav-icon"><LuCheckCircle2 size={18} /></span>
                    {!isCollapsed && <span className="nav-label">Persetujuan Usulan</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'approved-proposals' ? 'active' : ''}`}
                    onClick={() => onMenuChange('approved-proposals')}
                    title={isCollapsed ? 'Usulan Disetujui' : ''}
                  >
                    <span className="nav-icon"><LuClipboardList size={18} /></span>
                    {!isCollapsed && <span className="nav-label">Usulan Disetujui</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'final-approval' ? 'active' : ''}`}
                    onClick={() => onMenuChange('final-approval')}
                    title={isCollapsed ? 'Persetujuan Akhir' : ''}
                  >
                    <span className="nav-icon"><LuShieldCheck size={18} /></span>
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
                    <span className="nav-icon"><LuBuilding size={18} /></span>
                    {!isCollapsed && <span className="nav-label">Manajemen Divisi</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'branch-management' ? 'active' : ''}`}
                    onClick={() => onMenuChange('branch-management')}
                    title={isCollapsed ? 'Manajemen Branch' : ''}
                  >
                    <span className="nav-icon"><LuStore size={18} /></span>
                    {!isCollapsed && <span className="nav-label">Manajemen Branch</span>}
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeMenu === 'anak-perusahaan-management' ? 'active' : ''}`}
                    onClick={() => onMenuChange('anak-perusahaan-management')}
                    title={isCollapsed ? 'Manajemen Anak Perusahaan' : ''}
                  >
                    <span className="nav-icon"><LuFactory size={18} /></span>
                    {!isCollapsed && <span className="nav-label">Manajemen Anak Perusahaan</span>}
                  </button>
                </li>
              </ul>
            </li>
          );
        }
        // Add notification badge for Draft TNA 2026
        const showNotificationBadge = item.id === 'draft-tna-2026' && 
          (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin') &&
          draftTNANotificationCount > 0;

        return (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-link ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => onMenuChange(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && (
                <span className="nav-label">
                  {item.label}
                  {showNotificationBadge && (
                    <span className="notification-badge">{draftTNANotificationCount}</span>
                  )}
                </span>
              )}
              {isCollapsed && showNotificationBadge && (
                <span className="notification-badge notification-badge-collapsed">{draftTNANotificationCount}</span>
              )}
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
