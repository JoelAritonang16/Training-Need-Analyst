import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import AdminDashboardOverview from './AdminDashboardOverview.jsx';
import UserManagement from './UserManagement.jsx';
import ProposalApproval from './ProposalApproval.jsx';
import ApprovedProposals from './ApprovedProposals.jsx';
import Reports from './Reports.jsx';
import AdminReports from './AdminReports.jsx';
import AdminTempatDiklatRealisasi from './AdminTempatDiklatRealisasi.jsx';
import UserCreateForAdmin from './UserCreateForAdmin.jsx';
import DraftTNA2026 from './DraftTNA2026.jsx';
import AlertModal from '../../components/AlertModal.jsx';
import { trainingProposalAPI, updateProposalStatusAPI } from '../../utils/api';
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
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  const fetchProposals = useCallback(async () => {
    try {
      const data = await trainingProposalAPI.getAll();
      
      if (data.success) {
        setProposals(data.proposals || []);
      }
    } catch (err) {
      // Handle timeout errors gracefully
      if (err.isTimeout || err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        return;
      }
      
      // Handle network errors
      if (err.isNetworkError || err.name === 'NetworkError') {
        return;
      }
    }
  }, []);

  // Fetch proposals from database
  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleMenuChange = useCallback((menuId) => {
    setActiveMenu(menuId);
  }, []);

  const handleUpdateProfile = useCallback((updatedUser) => {
    // Update user data in parent component if needed
  }, []);

  const handleApproveProposal = useCallback(async (proposalId) => {
    try {
      
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
      // Handle timeout errors gracefully
      let errorMessage = error.message || 'Terjadi kesalahan saat menyetujui proposal';
      if (error.isTimeout || error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        errorMessage = 'Request timeout: Server tidak merespons. Silakan coba lagi.';
      } else if (error.isNetworkError || error.name === 'NetworkError') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
      }
      
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: errorMessage,
        type: 'error'
      });
    }
  }, [fetchProposals]);

  const handleRejectProposal = useCallback(async (proposalId, alasan) => {
    if (!alasan || alasan.trim() === '') {
      setAlertModal({
        open: true,
        title: 'Peringatan',
        message: 'Alasan penolakan harus diisi',
        type: 'warning'
      });
      return;
    }
    
    try {
      const data = await updateProposalStatusAPI(proposalId, 'DITOLAK', alasan);
      
      if (data.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil',
          message: 'Proposal berhasil ditolak. Notifikasi dengan alasan telah dikirim langsung ke user untuk revisi.',
          type: 'success'
        });
        // Refresh data from database
        fetchProposals();
      } else {
        setAlertModal({
          open: true,
          title: 'Error',
          message: data.message || 'Gagal menolak proposal',
          type: 'error'
        });
      }
    } catch (error) {
      // Handle timeout errors gracefully
      let errorMessage = error.message || 'Terjadi kesalahan saat menolak proposal';
      if (error.isTimeout || error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        errorMessage = 'Request timeout: Server tidak merespons. Silakan coba lagi.';
      } else if (error.isNetworkError || error.name === 'NetworkError') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
      }
      
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: errorMessage,
        type: 'error'
      });
    }
  }, [fetchProposals]);

  const handleConfirmToUser = useCallback(async (proposalId) => {
    // Admin konfirmasi ke user bahwa proposal sudah disetujui
    try {
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
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: error.message || 'Terjadi kesalahan saat mengkonfirmasi ke user',
        type: 'error'
      });
    }
  }, [fetchProposals]);

  const handleAddUser = useCallback(() => {
    setActiveMenu('user-create');
  }, []);

  const handleEditUser = useCallback((userId) => {
    // Edit user
  }, []);

  const handleDeleteUser = useCallback((userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleToggleUserStatus = useCallback((userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
  }, []);

  const handleViewDetail = useCallback(async (proposalId) => {
    // Cari proposal dari list terlebih dahulu
    let proposal = proposals.find(p => p.id === proposalId);
    
    // Jika proposal ditemukan tapi tidak ada items, atau items tidak lengkap, fetch ulang dari API
    if (proposal && (!proposal.items || proposal.items.length === 0)) {
      try {
        const data = await trainingProposalAPI.getById(proposalId);
        if (data.success && data.proposal) {
          proposal = data.proposal;
        }
      } catch (error) {
        // Error fetching proposal details
      }
    }
    
    if (proposal) {
      setSelectedProposal(proposal);
      setIsModalOpen(true);
    }
  }, [proposals]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Rp 0';
    return `Rp ${numValue.toLocaleString('id-ID')}`;
  }, []);

  const getProposalCosts = useCallback((proposal) => {
    if (!proposal) {
      return { beban: 0, transportasi: 0, akomodasi: 0, uangSaku: 0, total: 0 };
    }

    // Jika ada items, aggregate dari items
    if (proposal.items && Array.isArray(proposal.items) && proposal.items.length > 0) {
      const totals = proposal.items.reduce((acc, item) => {
        acc.beban += parseFloat(item.Beban) || 0;
        acc.transportasi += parseFloat(item.BebanTransportasi) || 0;
        acc.akomodasi += parseFloat(item.BebanAkomodasi) || 0;
        acc.uangSaku += parseFloat(item.BebanUangSaku) || 0;
        acc.total += parseFloat(item.TotalUsulan) || 0;
        return acc;
      }, { beban: 0, transportasi: 0, akomodasi: 0, uangSaku: 0, total: 0 });
      return totals;
    }

    // Jika tidak ada items, gunakan nilai dari header
    return {
      beban: parseFloat(proposal.Beban) || 0,
      transportasi: parseFloat(proposal.BebanTranportasi) || 0,
      akomodasi: parseFloat(proposal.BebanAkomodasi) || 0,
      uangSaku: parseFloat(proposal.BebanUangSaku) || 0,
      total: parseFloat(proposal.TotalUsulan) || 0
    };
  }, []);

  const getStatusText = useCallback((status) => {
    const statusTexts = {
      'MENUNGGU': 'Menunggu',
      'APPROVE_ADMIN': 'Disetujui Admin',
      'APPROVE_SUPERADMIN': 'Disetujui Superadmin',
      'DITOLAK': 'Ditolak'
    };
    return statusTexts[status] || status;
  }, []);

  const handleGenerateReport = useCallback((reportType, dateRange) => {
  }, []);

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
            onViewDetail={handleViewDetail}
          />
        );
      
      case 'reports':
        return (
          <AdminReports user={user} />
        );
      
      case 'tempat-diklat-realisasi':
        return (
          <AdminTempatDiklatRealisasi user={user} />
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
            <img src={danantaraLogo} alt="Danantara" className="topbar-logo" loading="eager" />
            <div className="topbar-divider"></div>
            <img src={pelindoLogo} alt="Pelindo" className="topbar-logo" loading="eager" />
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

              {/* Evaluasi Realisasi - hanya untuk proposal yang sudah direalisasikan */}
              {selectedProposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' && selectedProposal.evaluasiRealisasi && (
                <>
                  <div className="modal-divider"></div>
                  <div className="modal-evaluation-section">
                    <h3 className="modal-section-title">Evaluasi Realisasi</h3>
                    <div className="modal-evaluation-content">
                      <p>{selectedProposal.evaluasiRealisasi}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="modal-divider"></div>

              <div className="modal-costs-list">
                {(() => {
                  const costs = getProposalCosts(selectedProposal);
                  return (
                    <>
                      <div className="modal-cost-row">
                        <span>Beban</span>
                        <strong>{formatCurrency(costs.beban)}</strong>
                      </div>
                      <div className="modal-cost-row">
                        <span>Beban Transportasi</span>
                        <strong>{formatCurrency(costs.transportasi)}</strong>
                      </div>
                      <div className="modal-cost-row">
                        <span>Beban Akomodasi</span>
                        <strong>{formatCurrency(costs.akomodasi)}</strong>
                      </div>
                      <div className="modal-cost-row">
                        <span>Beban Uang Saku</span>
                        <strong>{formatCurrency(costs.uangSaku)}</strong>
                      </div>
                      <div className="modal-cost-row total">
                        <span>Total Usulan</span>
                        <strong>{formatCurrency(costs.total || selectedProposal.TotalUsulan)}</strong>
                      </div>
                    </>
                  );
                })()}
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
