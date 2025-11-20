import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import AdminDashboardOverview from './AdminDashboardOverview.jsx';
import UserManagement from './UserManagement.jsx';
import ProposalApproval from './ProposalApproval.jsx';
import ApprovedProposals from './ApprovedProposals.jsx';
import Reports from './Reports.jsx';
import UserCreate from './UserCreate.jsx';
import UserCreateForAdmin from './UserCreateForAdmin.jsx';
import DraftTNA2026 from './DraftTNA2026.jsx';
import TempatDiklatRealisasi from './TempatDiklatRealisasi.jsx';
import AlertModal from '../../components/AlertModal.jsx';
import { trainingProposalAPI, userProfileAPI, updateProposalStatusAPI } from '../../utils/api';
import AdminProfile from './AdminProfile';
import danantaraLogo from '../../assets/Danantara2.png';
import pelindoLogo from '../../assets/LogoFixx.png';
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
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

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

  const handleUpdateProfile = (updatedUser) => {
    // Update user data in parent component if needed
    console.log('Profile updated:', updatedUser);
    // You might want to update the user in your global state here
  };

  const handleApproveProposal = async (proposalId) => {
    try {
      console.log('AdminDashboard: Approving proposal:', proposalId);
      
      // Call API to update status to APPROVE_ADMIN
      const data = await updateProposalStatusAPI(proposalId, 'APPROVE_ADMIN');
      
      if (data.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil',
          message: 'Proposal berhasil disetujui! Notifikasi telah dikirim ke superadmin untuk approval final.',
          type: 'success'
        });
        // Refresh data from database
        fetchProposals();
      } else {
        setAlertModal({
          open: true,
          title: 'Error',
          message: data.message || 'Gagal menyetujui proposal',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('AdminDashboard: Error approving proposal:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: error.message || 'Terjadi kesalahan saat menyetujui proposal',
        type: 'error'
      });
    }
  };

  const handleRejectProposal = async (proposalId) => {
    // Admin tidak bisa reject proposal, hanya superadmin yang bisa
    setAlertModal({
      open: true,
      title: 'Akses Ditolak',
      message: 'Admin tidak dapat menolak proposal. Hanya superadmin yang dapat menolak proposal.',
      type: 'warning'
    });
    return;
  };

  const handleConfirmToUser = async (proposalId) => {
    // Admin konfirmasi ke user bahwa proposal sudah disetujui
    try {
      console.log('AdminDashboard: Confirming to User:', proposalId);
      
      // Update status ke APPROVE_ADMIN untuk menandai sudah dikonfirmasi ke user
      const data = await updateProposalStatusAPI(proposalId, 'APPROVE_ADMIN');
      
      if (data.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil',
          message: 'User telah dikonfirmasi bahwa request mereka diterima!',
          type: 'success'
        });
        fetchProposals();
      } else {
        setAlertModal({
          open: true,
          title: 'Error',
          message: data.message || 'Gagal mengkonfirmasi ke user',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('AdminDashboard: Error confirming to user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: error.message || 'Terjadi kesalahan saat mengkonfirmasi ke user',
        type: 'error'
      });
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
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal(proposal);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'MENUNGGU': 'Menunggu',
      'APPROVE_ADMIN': 'Disetujui Admin',
      'APPROVE_SUPERADMIN': 'Disetujui Superadmin',
      'DITOLAK': 'Ditolak'
    };
    return statusTexts[status] || status;
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
            onNavigate={handleMenuChange}
          />
        );
      case 'user-create':
        return (
          <UserCreateForAdmin 
            currentUser={user}
            onNavigate={handleMenuChange}
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
            onConfirmToUser={handleConfirmToUser}
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
      
      case 'draft-tna-2026':
        return (
          <DraftTNA2026 
            user={user}
            currentUserRole="admin"
            onNavigate={handleMenuChange}
          />
        );
      
      case 'profile':
        return (
          <AdminProfile 
            user={user}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      
      default:
        return (
          <AdminDashboardOverview 
            users={users}
            proposals={proposals}
            user={user}
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
          <div className="topbar-logos">
            <img src={danantaraLogo} alt="Danantara" className="topbar-logo" />
            <div className="topbar-divider"></div>
            <img src={pelindoLogo} alt="Pelindo" className="topbar-logo" />
          </div>
          <div className="topbar-title">
            {activeMenu === 'dashboard' && ''}
            {activeMenu === 'user-management' && ''}
            {activeMenu === 'user-create' && ''}
            {activeMenu === 'proposal-approval' && ''}
            {activeMenu === 'approved-proposals' && ''}
            {activeMenu === 'reports' && ''}
          </div>
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

      {/* Modal Detail Proposal */}
      {isModalOpen && selectedProposal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{selectedProposal.Uraian || 'Detail Usulan'}</h2>
                <span className="status-badge">{getStatusText(selectedProposal.status)}</span>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info-list">
                <div className="modal-info-item">
                  <span className="info-label">Waktu Pelaksanaan</span>
                  <span className="info-value">{formatDate(selectedProposal.WaktuPelaksanan)}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">Jumlah Peserta</span>
                  <span className="info-value">{selectedProposal.JumlahPeserta || '-'} orang</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">Hari Peserta Pelatihan</span>
                  <span className="info-value">{selectedProposal.JumlahHariPesertaPelatihan || '-'} hari</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">Level Tingkatan</span>
                  <span className="info-value">{selectedProposal.LevelTingkatan || '-'}</span>
                </div>
                <div className="modal-info-item">
                  <span className="info-label">Tanggal Dibuat</span>
                  <span className="info-value">{formatDate(selectedProposal.created_at)}</span>
                </div>
              </div>

              <div className="modal-divider"></div>

              <div className="modal-costs-list">
                <div className="modal-cost-row">
                  <span>Beban</span>
                  <strong>{selectedProposal.Beban ? `Rp ${parseFloat(selectedProposal.Beban).toLocaleString('id-ID')}` : '-'}</strong>
                </div>
                <div className="modal-cost-row">
                  <span>Beban Transportasi</span>
                  <strong>{selectedProposal.BebanTranportasi ? `Rp ${parseFloat(selectedProposal.BebanTranportasi).toLocaleString('id-ID')}` : '-'}</strong>
                </div>
                <div className="modal-cost-row">
                  <span>Beban Akomodasi</span>
                  <strong>{selectedProposal.BebanAkomodasi ? `Rp ${parseFloat(selectedProposal.BebanAkomodasi).toLocaleString('id-ID')}` : '-'}</strong>
                </div>
                <div className="modal-cost-row">
                  <span>Beban Uang Saku</span>
                  <strong>{selectedProposal.BebanUangSaku ? `Rp ${parseFloat(selectedProposal.BebanUangSaku).toLocaleString('id-ID')}` : '-'}</strong>
                </div>
                <div className="modal-cost-row total">
                  <span>Total Usulan</span>
                  <strong>{selectedProposal.TotalUsulan ? `Rp ${parseFloat(selectedProposal.TotalUsulan).toLocaleString('id-ID')}` : '-'}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-close" onClick={closeModal}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />
    </div>
  );
};

export default AdminDashboard;
