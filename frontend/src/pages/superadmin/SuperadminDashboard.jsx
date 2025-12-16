import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import TrainingProposalForm from '../user/TrainingProposalForm.jsx';
import SuperAdminDashboardOverview from './SuperAdminDashboardOverview.jsx';
import FinalApproval from './FinalApproval.jsx';
import AllProposals from './AllProposals.jsx';
import ProposalApproval from './ProposalApproval.jsx';
import UserManagement from '../admin/UserManagement.jsx';
import UserCreate from '../admin/UserCreate.jsx';
import UserEdit from '../admin/UserEdit.jsx';
import DivisiManagement from './DivisiManagement.jsx';
import BranchManagement from './BranchManagement.jsx';
import AnakPerusahaanManagement from './AnakPerusahaanManagement.jsx';
import DraftTNA2026 from '../admin/DraftTNA2026.jsx';
import TempatDiklatRealisasi from '../admin/TempatDiklatRealisasi.jsx';
import RekapGabungan from './RekapGabungan.jsx';
import SuperadminReports from './SuperadminReports.jsx';
import AlertModal from '../../components/AlertModal.jsx';
import { trainingProposalAPI, updateProposalStatusAPI } from '../../utils/api';
import SuperAdminProfile from './SuperAdminProfile';
import danantaraLogo from '../../assets/Danantara2.png';
import pelindoLogo from '../../assets/LogoFixx.png';
import './SuperadminDashboard.css';

const SuperadminDashboard = ({ user, onLogout, onUserUpdate }) => {
  const [currentUser, setCurrentUser] = useState(user);
  
  // Update currentUser when user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);
  
  // Handler untuk update profil
  const handleUserUpdate = (updatedUserData) => {
    // Update state lokal dengan data terbaru
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUserData
    }));
    
    // Panggil onUserUpdate untuk mengupdate state di App.jsx
    if (onUserUpdate) {
      onUserUpdate(updatedUserData);
    }
  };
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Alert Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info' // 'success', 'error', 'warning', 'info'
  });

  // Proposal filters state - harus dideklarasikan sebelum useEffect yang menggunakannya
  const [proposalFilters, setProposalFilters] = useState({});
  const filtersRef = useRef({});
  const isInitialMount = useRef(true);

  // Fetch proposals function - harus dideklarasikan sebelum useEffect yang menggunakannya
  const fetchProposals = useCallback(async (filters = {}) => {
    try {
      const data = await trainingProposalAPI.getAll(filters);
      
      if (data.success) {
        setProposals(data.proposals || []);
      }
    } catch (err) {
      // Error fetching proposals - handle timeout and network errors gracefully
      if (err?.isTimeout || err?.name === 'TimeoutError' || err?.isNetworkError || err?.name === 'NetworkError') {
        // Don't update proposals on timeout/network error
      }
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5000/api/users?currentUserRole=superadmin`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      // Error fetching users - handle timeout and network errors gracefully
      if (error?.isTimeout || error?.name === 'TimeoutError' || error?.isNetworkError || error?.name === 'NetworkError') {
        // Don't update users on timeout/network error
      }
    }
  }, []);
  
  const handleProposalFilterChange = useCallback((filters) => {
    // Compare filters to prevent unnecessary updates
    const filtersString = JSON.stringify(filters);
    const currentFiltersString = JSON.stringify(filtersRef.current);
    
    if (filtersString !== currentFiltersString) {
      filtersRef.current = filters;
      setProposalFilters(filters);
      fetchProposals(filters);
    }
  }, [fetchProposals]);

  // Fetch proposals and users from database - only on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchProposals();
      fetchUsers();
    }
  }, [fetchProposals, fetchUsers]);
  
  // Fetch proposals when filters change (but only if filters actually changed)
  useEffect(() => {
    if (!isInitialMount.current) {
      const filtersString = JSON.stringify(proposalFilters);
      const currentFiltersString = JSON.stringify(filtersRef.current);
      
      if (filtersString !== currentFiltersString) {
        filtersRef.current = proposalFilters;
        fetchProposals(proposalFilters);
      }
    }
  }, [proposalFilters, fetchProposals]);


  const handleMenuChange = useCallback((menuId) => {
    setActiveMenu(menuId);
  }, []);

  const handleFinalApprove = useCallback(async (proposalId) => {
    try {
      const data = await updateProposalStatusAPI(proposalId, 'APPROVE_SUPERADMIN');
      
      if (data.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil',
          message: 'Proposal berhasil disetujui! Notifikasi telah dikirim ke admin untuk konfirmasi ke user.',
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
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: error.message || 'Terjadi kesalahan saat menyetujui proposal',
        type: 'error'
      });
    }
  }, [fetchProposals]);

  const handleApproveProposal = handleFinalApprove;

  const handleFinalReject = useCallback(async (proposalId, alasan) => {
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
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: error.message || 'Terjadi kesalahan saat menolak proposal',
        type: 'error'
      });
    }
  }, [fetchProposals]);

  const handleRejectProposal = handleFinalReject;

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

  const handleStartEditUser = useCallback((user) => {
    setSelectedUserForEdit(user);
    setActiveMenu('user-edit');
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

  const handleEditProposal = useCallback((proposalId) => {
    // Edit proposal handler
  }, []);

  const handleNavigate = useCallback((menuId) => {
    setActiveMenu(menuId);
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case 'proposal-form':
        return <TrainingProposalForm user={user} />;
      
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
          <AllProposals
            proposals={proposals}
            onFinalApprove={handleFinalApprove}
            onFinalReject={handleFinalReject}
            onViewDetail={handleViewDetail}
            onEditProposal={handleEditProposal}
            onNavigate={handleNavigate}
            onFilterChange={handleProposalFilterChange}
            initialStatusFilter="approved"
            headerTitle="Usulan Disetujui"
          />
        );

      case 'user-management':
        return (
          <UserManagement 
            users={users}
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
        // Validasi: pastikan user sudah dipilih untuk di-edit
        if (!selectedUserForEdit) {
          // Jika user belum dipilih, redirect ke user-management
          setTimeout(() => {
            setActiveMenu('user-management');
          }, 0);
          return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Memuat halaman edit user...</p>
            </div>
          );
        }
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
            onFilterChange={handleProposalFilterChange}
          />
        );
      
      case 'divisi-management':
        return <DivisiManagement />;
      
      case 'branch-management':
        return <BranchManagement />;
      
      case 'anak-perusahaan-management':
        return <AnakPerusahaanManagement />;
      
      case 'draft-tna-2026':
        return (
          <DraftTNA2026 
            user={user}
            currentUserRole="superadmin"
            onNavigate={handleNavigate}
          />
        );
      
      case 'tempat-diklat-realisasi':
        return (
          <TempatDiklatRealisasi 
            user={user}
            currentUserRole="superadmin"
            onNavigate={handleNavigate}
          />
        );
      
      case 'rekap-gabungan':
        return <RekapGabungan />;
      
      case 'reports':
        return (
          <SuperadminReports />
        );
      
      case 'profile':
        return (
          <SuperAdminProfile 
            user={currentUser} 
            onLogout={onLogout}
            onUpdateProfile={handleUserUpdate}
          />
        );
      
      default:
        return (
          <SuperAdminDashboardOverview 
            users={users}
            proposals={proposals}
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
          <div className="topbar-logos">
            <img src={danantaraLogo} alt="Danantara" className="topbar-logo" loading="eager" />
            <div className="topbar-divider"></div>
            <img src={pelindoLogo} alt="Pelindo" className="topbar-logo" loading="eager" />
          </div>
          <div className="topbar-title">
            {activeMenu === 'dashboard' && ''}
            {activeMenu === 'proposal-form' && ''}
            {activeMenu === 'proposal-approval' && ''}
            {activeMenu === 'approved-proposals' && ''}
            {activeMenu === 'user-management' && ''}
            {activeMenu === 'user-create' && ''}
            {activeMenu === 'user-edit' && ''}
            {activeMenu === 'final-approval' && ''}
            {activeMenu === 'all-proposals' && ''}
            {activeMenu === 'divisi-management' && ''}
            {activeMenu === 'branch-management' && ''}
            {activeMenu === 'anak-perusahaan-management' && ''}
          </div>
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
            >
              <span className="user-avatar">
                {currentUser?.profilePhoto ? (
                  <img 
                    key={`avatar-${currentUser.profilePhoto}`}
                    src={`http://localhost:5000/${currentUser.profilePhoto}?t=${new Date().getTime()}`} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=random`;
                    }}
                  />
                ) : (
                  currentUser?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </span>
              <span className="user-name">{currentUser?.username || 'User'}</span>
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

export default SuperadminDashboard;
