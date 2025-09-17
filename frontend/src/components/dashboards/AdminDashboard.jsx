import React, { useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import AdminDashboardOverview from '../../pages/admin/AdminDashboardOverview.jsx';
import UserManagement from '../../pages/admin/UserManagement.jsx';
import ProposalApproval from '../../pages/admin/ProposalApproval.jsx';
import ApprovedProposals from '../../pages/admin/ApprovedProposals.jsx';
import Reports from '../../pages/admin/Reports.jsx';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', role: 'user', unit: 'IT Division', email: 'john@pelindo.com', status: 'active' },
    { id: 2, username: 'jane_smith', role: 'user', unit: 'HR Division', email: 'jane@pelindo.com', status: 'active' },
    { id: 3, username: 'bob_wilson', role: 'user', unit: 'Finance Division', email: 'bob@pelindo.com', status: 'inactive' }
  ]);
  
  const [proposals, setProposals] = useState([
    {
      id: 1,
      uraian: 'Pelatihan Leadership Management',
      pengaju: 'john_doe',
      unit: 'IT Division',
      waktuPelaksanaan: 'Februari 2025',
      status: 'PENDING',
      tanggalPengajuan: '2024-01-15',
      totalBiaya: 15000000,
      jumlahPeserta: 25
    },
    {
      id: 2,
      uraian: 'Training Digital Marketing',
      pengaju: 'jane_smith',
      unit: 'HR Division',
      waktuPelaksanaan: 'Maret 2025',
      status: 'PENDING',
      tanggalPengajuan: '2024-01-10',
      totalBiaya: 8500000,
      jumlahPeserta: 15
    },
    {
      id: 3,
      uraian: 'Workshop Project Management',
      pengaju: 'bob_wilson',
      unit: 'Finance Division',
      waktuPelaksanaan: 'April 2025',
      status: 'APPROVED_BY_ADMIN',
      tanggalPengajuan: '2024-01-05',
      totalBiaya: 12000000,
      jumlahPeserta: 20
    }
  ]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleApproveProposal = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'APPROVED_BY_ADMIN', approvedBy: user.username, approvedAt: new Date().toISOString() }
        : proposal
    ));
  };

  const handleRejectProposal = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'REJECTED', rejectedBy: user.username, rejectedAt: new Date().toISOString() }
        : proposal
    ));
  };

  const handleConfirmToSuperAdmin = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'WAITING_SUPERADMIN_APPROVAL', confirmedBy: user.username, confirmedAt: new Date().toISOString() }
        : proposal
    ));
  };

  const handleAddUser = () => {
    console.log('Add user');
  };

  const handleEditUser = (userId) => {
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const handleViewDetail = (proposalId) => {
    console.log('View detail:', proposalId);
  };

  const handleGenerateReport = (reportType, dateRange) => {
    console.log('Generate report:', reportType, dateRange);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'user-management':
        return (
          <UserManagement 
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            currentUserRole="admin"
          />
        );
      
      case 'proposal-approval':
        return (
          <ProposalApproval 
            proposals={proposals}
            onApprove={handleApproveProposal}
            onReject={handleRejectProposal}
            onViewDetail={handleViewDetail}
          />
        );
      
      case 'approved-proposals':
        return (
          <ApprovedProposals 
            proposals={proposals}
            onConfirmToSuperAdmin={handleConfirmToSuperAdmin}
            onViewDetail={handleViewDetail}
          />
        );
      
      case 'reports':
        return (
          <Reports 
            proposals={proposals}
            users={users}
            onGenerateReport={handleGenerateReport}
          />
        );
      
      default:
        return (
          <AdminDashboardOverview 
            users={users}
            proposals={proposals}
            onNavigate={handleMenuChange}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        user={user} 
        activeMenu={activeMenu} 
        onMenuChange={handleMenuChange}
        onLogout={onLogout}
      />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-spacer" />
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
            >
              <span className="user-avatar">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
              <span className="user-name">{user?.username || 'User'}</span>
              <span className={`chevron ${isUserMenuOpen ? 'open' : ''}`}>▾</span>
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={() => { setActiveMenu('profile'); setIsUserMenuOpen(false); }}>Profile</button>
                <button className="dropdown-item danger" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
