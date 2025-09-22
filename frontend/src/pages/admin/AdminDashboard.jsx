import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import AdminDashboardOverview from './AdminDashboardOverview.jsx';
import UserManagement from './UserManagement.jsx';
import ProposalApproval from './ProposalApproval.jsx';
import ApprovedProposals from './ApprovedProposals.jsx';
import Reports from './Reports.jsx';
import { trainingProposalAPI } from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', role: 'user', unit: 'IT Division', email: 'john@pelindo.com', status: 'active' },
    { id: 2, username: 'jane_smith', role: 'user', unit: 'HR Division', email: 'jane@pelindo.com', status: 'active' },
    { id: 3, username: 'bob_wilson', role: 'user', unit: 'Finance Division', email: 'bob@pelindo.com', status: 'inactive' }
  ]);
  
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch proposals from database
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('AdminDashboard: Fetching proposals from database...');
      const data = await trainingProposalAPI.getAll();
      
      if (data.success) {
        console.log('AdminDashboard: Proposals fetched:', data.proposals);
        setProposals(data.proposals || []);
      } else {
        setError(data.message || 'Gagal mengambil data proposal');
      }
    } catch (err) {
      console.error('AdminDashboard: Error fetching proposals:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      console.log('AdminDashboard: Approving proposal:', proposalId);
      
      // Call API to update status
      const response = await fetch(`http://localhost:5000/api/training-proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'APPROVE_ADMIN'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal berhasil disetujui!');
        // Refresh data from database
        fetchProposals();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('AdminDashboard: Error approving proposal:', error);
      alert('Terjadi kesalahan saat menyetujui proposal');
    }
  };

  const handleRejectProposal = async (proposalId) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (!reason || reason.trim() === '') {
      alert('Alasan penolakan harus diisi');
      return;
    }
    
    try {
      console.log('AdminDashboard: Rejecting proposal:', proposalId, 'Reason:', reason);
      
      // Call API to update status
      const response = await fetch(`http://localhost:5000/api/training-proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'DITOLAK',
          alasan: reason.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal berhasil ditolak!');
        // Refresh data from database
        fetchProposals();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('AdminDashboard: Error rejecting proposal:', error);
      alert('Terjadi kesalahan saat menolak proposal');
    }
  };

  const handleConfirmToSuperAdmin = async (proposalId) => {
    try {
      console.log('AdminDashboard: Confirming to SuperAdmin:', proposalId);
      
      // Call API to update status
      const response = await fetch(`http://localhost:5000/api/training-proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'APPROVE_SUPERADMIN'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Proposal berhasil dikonfirmasi ke Super Admin!');
        // Refresh data from database
        fetchProposals();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('AdminDashboard: Error confirming to SuperAdmin:', error);
      alert('Terjadi kesalahan saat mengonfirmasi ke Super Admin');
    }
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
