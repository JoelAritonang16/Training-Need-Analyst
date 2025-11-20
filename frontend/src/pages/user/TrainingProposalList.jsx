import React, { useState } from 'react';
import { useDatabaseData } from '../../components/DatabaseDataProvider';
import { trainingProposalAPI, updateImplementationStatusAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import './TrainingProposalList.css';

const TrainingProposalList = ({ onCreateNew, onEdit, onViewDetail }) => {
  const { 
    proposals, 
    isLoading, 
    error, 
    refreshData
  } = useDatabaseData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState(null);
  const [isUpdatingImplementation, setIsUpdatingImplementation] = useState(false);
  const itemsPerPage = 6;


  // Filter proposals berdasarkan search term dan status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.Uraian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.LevelTingkatan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (id) => {
    console.log('Edit proposal with ID:', id);
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleViewDetail = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const handleDelete = (id) => {
    setConfirmModal({
      open: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus usulan pelatihan ini?',
      onConfirm: async () => {
        try {
          await trainingProposalAPI.delete(id);
          refreshData(); // Refresh data dari context
          setConfirmModal(null);
          setAlertModal({
            open: true,
            type: 'success',
            title: 'Berhasil',
            message: 'Usulan pelatihan berhasil dihapus'
          });
        } catch (err) {
          setConfirmModal(null);
          setAlertModal({
            open: true,
            type: 'error',
            title: 'Error',
            message: err.message || 'Gagal menghapus usulan pelatihan'
          });
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleConfirmRealisasi = (proposal) => {
    setConfirmModal({
      open: true,
      title: 'Konfirmasi Realisasi',
      message: 'Apakah Anda yakin proposal ini sudah direalisasikan? Setelah dikonfirmasi, draft TNA akan otomatis dibuat dan dapat dilihat oleh admin dan superadmin.',
      onConfirm: async () => {
        setIsUpdatingImplementation(true);
        try {
          const result = await updateImplementationStatusAPI(proposal.id, 'SUDAH_IMPLEMENTASI');
          if (result.success) {
            refreshData(); // Refresh data untuk update status
            setConfirmModal(null);
            setAlertModal({
              open: true,
              type: 'success',
              title: 'Berhasil Dikonfirmasi!',
              message: 'Proposal telah dikonfirmasi sebagai sudah direalisasikan. Draft TNA telah otomatis dibuat dan dapat dilihat oleh admin dan superadmin di halaman Draft TNA 2026.'
            });
          } else {
            throw new Error(result.message || 'Gagal mengupdate status implementasi');
          }
        } catch (err) {
          console.error('Error updating implementation status:', err);
          setConfirmModal(null);
          setAlertModal({
            open: true,
            type: 'error',
            title: 'Error',
            message: err.message || 'Gagal mengupdate status implementasi'
          });
        } finally {
          setIsUpdatingImplementation(false);
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'MENUNGGU': 'pending',
      'APPROVE_ADMIN': 'approved-admin',
      'APPROVE_SUPERADMIN': 'approved-superadmin',
      'DITOLAK': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'MENUNGGU': 'Menunggu',
      'APPROVE_ADMIN': 'Approve Admin',
      'APPROVE_SUPERADMIN': 'Approve Superadmin',
      'DITOLAK': 'Ditolak'
    };
    return statusTexts[status] || 'Menunggu';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="proposals-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data usulan pelatihan...</p>
        </div>
      </div>
    );
  }

  if (error && proposals.length === 0) {
    return (
      <div className="proposals-container">
        <div className="error-state">
          <div className="error-icon">!</div>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <div className="error-suggestions">
            <h4>Solusi yang dapat dicoba:</h4>
            <ul>
              <li>Pastikan backend server berjalan di <code>http://localhost:5000</code></li>
              <li>Periksa koneksi internet Anda</li>
              <li>Pastikan Anda sudah login dengan benar</li>
              <li>Coba refresh halaman</li>
            </ul>
          </div>
          <div className="error-actions">
            <button className="btn-retry" onClick={refreshData}>
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proposals-container">
      <div className="proposals-header">
        <h2>Daftar Usulan Pelatihan</h2>
        <p>Kelola dan pantau status usulan pelatihan Anda</p>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari berdasarkan uraian atau level tingkatan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <span className="search-icon">Search</span>
        </div>
        
        <div className="filter-dropdown">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="all">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">-</div>
          <h3>Tidak Ada Usulan Pelatihan</h3>
          <p>
            {searchTerm || statusFilter !== 'all' 
              ? 'Tidak ada usulan yang sesuai dengan filter yang dipilih.'
              : 'Belum ada usulan pelatihan yang dibuat. Mulai buat usulan pelatihan pertama Anda.'}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <button 
              className="btn-clear-filter"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              Hapus Filter
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="proposals-grid">
            {paginatedProposals.map((proposal) => (
              <div key={proposal.id} className="proposal-card">
                <div className="proposal-header">
                  <h3>{proposal.Uraian || 'Uraian Tidak Tersedia'}</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`status-badge ${getStatusBadgeClass(proposal.status || 'PENDING')}`}>
                      {getStatusText(proposal.status || 'PENDING')}
                    </span>
                    {proposal.isRevision && (
                      <span className="status-badge" style={{ 
                        backgroundColor: '#ff9800', 
                        color: 'white',
                        fontSize: '0.75em',
                        padding: '2px 8px'
                      }}>
                        ⚠️ REVISI
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="proposal-details">
                  <p><strong>Waktu Pelaksanaan:</strong> {formatDate(proposal.WaktuPelaksanan)}</p>
                  <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta || '-'} orang</p>
                  <p><strong>Hari Peserta Pelatihan:</strong> {proposal.JumlahHariPesertaPelatihan || '-'} hari</p>
                  <p><strong>Level Tingkatan:</strong> {proposal.LevelTingkatan || '-'}</p>
                  <p><strong>Total Usulan:</strong> {proposal.TotalUsulan ? `Rp ${parseFloat(proposal.TotalUsulan).toLocaleString('id-ID')}` : '-'}</p>
                  <p><strong>Tanggal Dibuat:</strong> {formatDate(proposal.created_at)}</p>
                  
                  {/* Status Realisasi - untuk proposal yang sudah disetujui */}
                  {(proposal.status === 'APPROVE_ADMIN' || proposal.status === 'APPROVE_SUPERADMIN') && (
                    <div className="realisasi-status-indicator">
                      <strong>Status Realisasi:</strong>
                      <span className={`realisasi-badge ${proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' ? 'implemented' : proposal.implementasiStatus === 'BELUM_IMPLEMENTASI' ? 'not-implemented' : 'pending'}`}>
                        {proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' 
                          ? '✓ Sudah Direalisasikan' 
                          : proposal.implementasiStatus === 'BELUM_IMPLEMENTASI'
                          ? '⏳ Belum Direalisasikan'
                          : '❓ Belum Dikonfirmasi'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="proposal-actions">
                  <button 
                    className="btn-detail"
                    onClick={() => handleViewDetail(proposal)}
                  >
                    Lihat Detail
                  </button>
                  {(proposal.status === 'MENUNGGU' || proposal.status === 'DITOLAK') && (
                    <>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(proposal.id)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(proposal.id)}
                      >
                        Hapus
                      </button>
                    </>
                  )}
                  {/* Quick action untuk konfirmasi realisasi */}
                  {(proposal.status === 'APPROVE_ADMIN' || proposal.status === 'APPROVE_SUPERADMIN') && 
                   proposal.implementasiStatus !== 'SUDAH_IMPLEMENTASI' && (
                    <button 
                      className="btn-confirm-realisasi"
                      onClick={() => handleConfirmRealisasi(proposal)}
                      disabled={isUpdatingImplementation}
                      title="Konfirmasi Realisasi"
                    >
                      {isUpdatingImplementation ? 'Memproses...' : '✓ Konfirmasi Realisasi'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Sebelumnya
              </button>
              
              <div className="pagination-info">
                Halaman {currentPage} dari {totalPages} 
                ({filteredProposals.length} total usulan)
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Detail */}
      {isModalOpen && selectedProposal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{selectedProposal.Uraian || 'Detail Usulan'}</h2>
                <span className={`status-badge ${getStatusBadgeClass(selectedProposal.status || 'PENDING')}`}>
                  {getStatusText(selectedProposal.status || 'PENDING')}
                </span>
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
              {(!selectedProposal.status || selectedProposal.status === 'PENDING' || selectedProposal.status === 'REJECTED') && (
                <>
                  <button className="btn-modal-edit" onClick={() => { closeModal(); handleEdit(selectedProposal.id); }}>
                    Edit
                  </button>
                  <button className="btn-modal-delete" onClick={() => { closeModal(); handleDelete(selectedProposal.id); }}>
                    Hapus
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />

      {/* Confirm Modal */}
      {confirmModal && confirmModal.open && (
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Ya"
          cancelText="Batal"
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
  );
};

export default TrainingProposalList;
