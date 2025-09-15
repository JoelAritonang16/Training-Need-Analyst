import React, { useState } from 'react';
import Sidebar from '../Sidebar.jsx';
import TrainingProposalForm from '../TrainingProposalForm.jsx';
import SuperAdminDashboardOverview from '../../pages/superadmin/SuperAdminDashboardOverview.jsx';
import FinalApproval from '../../pages/superadmin/FinalApproval.jsx';
import AllProposals from '../../pages/superadmin/AllProposals.jsx';
import SystemConfig from '../../pages/superadmin/SystemConfig.jsx';
import AuditLogs from '../../pages/superadmin/AuditLogs.jsx';
import UserManagement from '../../pages/admin/UserManagement.jsx';
import './SuperadminDashboard.css';

const SuperadminDashboard = ({ user, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', role: 'user', unit: 'IT Division', email: 'john@pelindo.com', status: 'active', createdAt: '2024-01-01' },
    { id: 2, username: 'jane_smith', role: 'user', unit: 'HR Division', email: 'jane@pelindo.com', status: 'active', createdAt: '2024-01-02' },
    { id: 3, username: 'bob_wilson', role: 'user', unit: 'Finance Division', email: 'bob@pelindo.com', status: 'inactive', createdAt: '2024-01-03' },
    { id: 4, username: 'admin_user', role: 'admin', unit: 'Management', email: 'admin@pelindo.com', status: 'active', createdAt: '2024-01-04' }
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
      jumlahPeserta: 25,
      level: 'STRUKTURAL'
    },
    {
      id: 2,
      uraian: 'Training Digital Marketing',
      pengaju: 'jane_smith',
      unit: 'HR Division',
      waktuPelaksanaan: 'Maret 2025',
      status: 'APPROVED_BY_ADMIN',
      tanggalPengajuan: '2024-01-10',
      totalBiaya: 8500000,
      jumlahPeserta: 15,
      level: 'NON STRUKTURAL'
    },
    {
      id: 3,
      uraian: 'Workshop Project Management',
      pengaju: 'bob_wilson',
      unit: 'Finance Division',
      waktuPelaksanaan: 'April 2025',
      status: 'WAITING_SUPERADMIN_APPROVAL',
      tanggalPengajuan: '2024-01-05',
      totalBiaya: 12000000,
      jumlahPeserta: 20,
      level: 'STRUKTURAL'
    },
    {
      id: 4,
      uraian: 'Pelatihan Cyber Security',
      pengaju: 'john_doe',
      unit: 'IT Division',
      waktuPelaksanaan: 'Mei 2025',
      status: 'FINAL_APPROVED',
      tanggalPengajuan: '2023-12-20',
      totalBiaya: 20000000,
      jumlahPeserta: 30,
      level: 'STRUKTURAL'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'admin_user', action: 'APPROVE_PROPOSAL', target: 'Workshop Project Management', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, user: 'john_doe', action: 'SUBMIT_PROPOSAL', target: 'Pelatihan Leadership Management', timestamp: '2024-01-15T09:15:00Z' },
    { id: 3, user: 'superadmin', action: 'FINAL_APPROVE', target: 'Pelatihan Cyber Security', timestamp: '2024-01-14T14:20:00Z' },
    { id: 4, user: 'admin_user', action: 'CREATE_USER', target: 'jane_smith', timestamp: '2024-01-14T11:45:00Z' }
  ]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleFinalApprove = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'FINAL_APPROVED', finalApprovedBy: user.username, finalApprovedAt: new Date().toISOString() }
        : proposal
    ));
    
    // Add audit log
    const proposal = proposals.find(p => p.id === proposalId);
    setAuditLogs(prev => [{
      id: Date.now(),
      user: user.username,
      action: 'FINAL_APPROVE',
      target: proposal.uraian,
      timestamp: new Date().toISOString()
    }, ...prev]);
  };

  const handleFinalReject = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'FINAL_REJECTED', finalRejectedBy: user.username, finalRejectedAt: new Date().toISOString() }
        : proposal
    ));
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

  const handleEditUser = (userId) => {
    console.log('Edit user:', userId);
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
      
      case 'user-management':
        return (
          <UserManagement 
            users={users}
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onToggleStatus={handleToggleUserStatus}
            currentUserRole="superadmin"
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
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperadminDashboard;
