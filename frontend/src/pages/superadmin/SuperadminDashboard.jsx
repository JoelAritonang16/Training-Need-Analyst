import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TrainingProposalForm from '../user/TrainingProposalForm.jsx';
import SuperAdminDashboardOverview from './SuperAdminDashboardOverview.jsx';
import FinalApproval from './FinalApproval.jsx';
import AllProposals from './AllProposals.jsx';
import SystemConfig from './SystemConfig.jsx';
import AuditLogs from './AuditLogs.jsx';
import UserManagement from '../admin/UserManagement.jsx';
import UserCreate from '../admin/UserCreate.jsx';
import UserEdit from '../admin/UserEdit.jsx';
import DivisiManagement from './DivisiManagement.jsx';
import BranchManagement from './BranchManagement.jsx';
import AnakPerusahaanManagement from './AnakPerusahaanManagement.jsx';
import { trainingProposalAPI } from '../../utils/api';
import './SuperadminDashboard.css';

const SuperadminDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', role: 'user', unit: 'IT Division', email: 'john@pelindo.com', status: 'active', createdAt: '2024-01-01' },
    { id: 2, username: 'jane_smith', role: 'user', unit: 'HR Division', email: 'jane@pelindo.com', status: 'active', createdAt: '2024-01-02' },
    { id: 3, username: 'bob_wilson', role: 'user', unit: 'Finance Division', email: 'bob@pelindo.com', status: 'inactive', createdAt: '2024-01-03' },
    { id: 4, username: 'admin_user', role: 'admin', unit: 'Management', email: 'admin@pelindo.com', status: 'active', createdAt: '2024-01-04' }
  ]);
  
  const [proposals, setProposals] = useState([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
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
      
      console.log('SuperadminDashboard: Fetching proposals from database...');
      const data = await trainingProposalAPI.getAll();
      
      if (data.success) {
        console.log('SuperadminDashboard: Proposals fetched:', data.proposals);
        setProposals(data.proposals || []);
      } else {
        setError(data.message || 'Gagal mengambil data proposal');
      }
    } catch (err) {
      console.error('SuperadminDashboard: Error fetching proposals:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'admin_user', action: 'APPROVE_PROPOSAL', target: 'Workshop Project Management', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, user: 'john_doe', action: 'SUBMIT_PROPOSAL', target: 'Pelatihan Leadership Management', timestamp: '2024-01-15T09:15:00Z' },
    { id: 3, user: 'superadmin', action: 'FINAL_APPROVE', target: 'Pelatihan Cyber Security', timestamp: '2024-01-14T14:20:00Z' },
    { id: 4, user: 'admin_user', action: 'CREATE_USER', target: 'jane_smith', timestamp: '2024-01-14T11:45:00Z' }
  ]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleFinalApprove = async (proposalId) => {
    try {
      console.log('SuperadminDashboard: Final approving proposal:', proposalId);
      
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
        alert('Proposal berhasil disetujui final!');
        // Refresh data from database
        fetchProposals();
        
        // Add audit log
        const proposal = proposals.find(p => p.id === proposalId);
        setAuditLogs(prev => [{
          id: Date.now(),
          user: user.username,
          action: 'FINAL_APPROVE',
          target: proposal?.Uraian || 'Unknown',
          timestamp: new Date().toISOString()
        }, ...prev]);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('SuperadminDashboard: Error final approving proposal:', error);
      alert('Terjadi kesalahan saat menyetujui proposal final');
    }
  };

  const handleFinalReject = async (proposalId) => {
    const reason = prompt('Masukkan alasan penolakan final:');
    if (!reason || reason.trim() === '') {
      alert('Alasan penolakan harus diisi');
      return;
    }
    
    try {
      console.log('SuperadminDashboard: Final rejecting proposal:', proposalId, 'Reason:', reason);
      
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
        alert('Proposal berhasil ditolak final!');
        // Refresh data from database
        fetchProposals();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('SuperadminDashboard: Error final rejecting proposal:', error);
      alert('Terjadi kesalahan saat menolak proposal final');
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    // Add audit log
    const user = users.find(u => u.id === userId);
    setAuditLogs(prev => [{
      id: Date.now(),
      user: user.username,
      action: 'DELETE_USER',
      target: user.username,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  };

  const handleAddUser = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    console.log('User added:', newUser);
  };

  const handleStartEditUser = (user) => {
    setSelectedUserForEdit(user);
    setActiveMenu('user-edit');
  };

  const handleViewDetail = (proposalId) => {
    console.log('View proposal detail:', proposalId);
  };

  const handleEditProposal = (proposalId) => {
    console.log('Edit proposal:', proposalId);
  };

  const handleSaveConfig = (config) => {
    console.log('Save system config:', config);
  };

  const handleBackupSystem = () => {
    console.log('Backup system initiated');
  };

  const handleRestoreSystem = () => {
    console.log('Restore system initiated');
  };

  const handleNavigate = (menuId) => {
    setActiveMenu(menuId);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'proposal-form':
        return <TrainingProposalForm user={user} />;
      
      case 'proposal-approval':
        return (
          <AllProposals
            proposals={proposals}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            onViewDetail={handleViewDetail}
            onEditProposal={handleEditProposal}
            onNavigate={handleNavigate}
            initialStatusFilter="waiting"
            headerTitle="Persetujuan Usulan"
          />
        );

      case 'approved-proposals':
        return (
          <AllProposals
            proposals={proposals}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            onViewDetail={handleViewDetail}
            onEditProposal={handleEditProposal}
            onNavigate={handleNavigate}
            initialStatusFilter="approved"
            headerTitle="Usulan Disetujui"
          />
        );

      case 'user-management':
        return (
          <UserManagement 
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleStartEditUser}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            currentUserRole="superadmin"
            onNavigate={handleNavigate}
          />
        );
      
      case 'user-create':
        return (
          <UserCreate 
            currentUserRole="superadmin" 
            onNavigate={handleNavigate} 
          />
        );

      case 'user-edit':
        return (
          <UserEdit 
            currentUserRole="superadmin"
            user={selectedUserForEdit}
            onNavigate={handleNavigate}
          />
        );
      
      case 'final-approval':
        return (
          <FinalApproval 
            proposals={proposals}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            onViewDetail={handleViewDetail}
          />
        );
      
      case 'all-proposals':
        return (
          <AllProposals 
            proposals={proposals}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            onViewDetail={handleViewDetail}
            onEditProposal={handleEditProposal}
            onNavigate={handleNavigate}
          />
        );
      
      case 'system-config':
        return (
          <SystemConfig 
            onSaveConfig={handleSaveConfig}
            onBackupSystem={handleBackupSystem}
            onRestoreSystem={handleRestoreSystem}
          />
        );
      
      case 'divisi-management':
        return <DivisiManagement />;
      
      case 'branch-management':
        return <BranchManagement />;
      
      case 'anak-perusahaan-management':
        return <AnakPerusahaanManagement />;
      
      case 'audit-logs':
        return (
          <AuditLogs 
            auditLogs={auditLogs}
          />
        );
      
      default:
        return (
          <SuperAdminDashboardOverview 
            users={users}
            proposals={proposals}
            auditLogs={auditLogs}
            onNavigate={handleNavigate}
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
                <button className="dropdown-item danger" onClick={onLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperadminDashboard;
