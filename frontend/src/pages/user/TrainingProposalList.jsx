import React, { useState } from 'react';
import { useDatabaseData } from '../../components/DatabaseDataProvider';
import { trainingProposalAPI, updateImplementationStatusAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import EvaluationModal from '../../components/EvaluationModal';
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
  const [evaluationModal, setEvaluationModal] = useState(null);
  const [isUpdatingImplementation, setIsUpdatingImplementation] = useState(false);
  const itemsPerPage = 6;


  // Filter proposals berdasarkan search term dan status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.Uraian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.LevelTingkatan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map filter values to actual database status values
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      const statusMap = {
        'MENUNGGU': 'MENUNGGU',
        'APPROVE_ADMIN': 'APPROVE_ADMIN',
        'APPROVE_SUPERADMIN': 'APPROVE_SUPERADMIN',
        'DITOLAK': 'DITOLAK'
      };
      const targetStatus = statusMap[statusFilter];
      matchesStatus = proposal.status === targetStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (id) => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleViewDetail = async (proposal) => {
    // Jika proposal tidak ada items, fetch ulang dari API
    if (proposal && (!proposal.items || proposal.items.length === 0)) {
      try {
        const data = await trainingProposalAPI.getById(proposal.id);
        if (data.success && data.proposal) {
          proposal = data.proposal;
        }
      } catch (error) {
        console.error('Error fetching proposal details:', error);
      }
    }
    
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
    setEvaluationModal({
      open: true,
      title: 'Konfirmasi Realisasi',
      message: 'Silakan isi evaluasi realisasi sebelum mengkonfirmasi. Setelah dikonfirmasi, draft TNA akan otomatis dibuat dan dapat dilihat oleh admin dan superadmin.',
      onConfirm: async (evaluasiRealisasi) => {
        setIsUpdatingImplementation(true);
        try {
          const result = await updateImplementationStatusAPI(proposal.id, 'SUDAH_IMPLEMENTASI', evaluasiRealisasi);
          if (result.success) {
            refreshData(); // Refresh data untuk update status
            setEvaluationModal(null);
            setAlertModal({
              open: true,
              type: 'success',
              title: 'Berhasil Dikonfirmasi!',
              message: 'Proposal telah dikonfirmasi sebagai sudah direalisasikan. Draft TNA telah otomatis dibuat dan dapat dilihat oleh admin dan superadmin di halaman Draft TNA.'
            });
          } else {
            throw new Error(result.message || 'Gagal mengupdate status implementasi');
          }
        } catch (err) {
          let errorMessage = 'Gagal mengupdate status implementasi';
          
          if (err?.isTimeout || err?.name === 'TimeoutError') {
            errorMessage = 'Request timeout: Server tidak merespons. Silakan coba lagi.';
          } else if (err?.isNetworkError || err?.name === 'NetworkError') {
            errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
          } else {
            errorMessage = err.message || errorMessage;
          }
          
          setEvaluationModal(null);
          setAlertModal({
            open: true,
            type: 'error',
            title: 'Error',
            message: errorMessage
          });
        } finally {
          setIsUpdatingImplementation(false);
        }
      },
      onCancel: () => setEvaluationModal(null)
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Rp 0';
    return `Rp ${numValue.toLocaleString('id-ID')}`;
  };

  // Helper function to calculate totals from items or use header values
  const getProposalCosts = (proposal) => {
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
            <option value="MENUNGGU">Menunggu</option>
            <option value="APPROVE_ADMIN">Disetujui Admin</option>
            <option value="APPROVE_SUPERADMIN">Disetujui Superadmin</option>
            <option value="DITOLAK">Ditolak</option>
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
                  <p><strong>Total Usulan:</strong> {formatCurrency(proposal.TotalUsulan)}</p>
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
                  
                  {/* Alasan Penolakan - untuk proposal yang ditolak */}
                  {proposal.status === 'DITOLAK' && proposal.alasan && (
                    <div className="rejection-reason-box" style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '6px',
                      borderLeft: '4px solid #ff9800'
                    }}>
                      <strong style={{ color: '#856404', display: 'block', marginBottom: '8px' }}>
                        ⚠️ Alasan Penolakan:
                      </strong>
                      <p style={{ color: '#856404', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {proposal.alasan}
                      </p>
                      <p style={{ color: '#856404', marginTop: '8px', marginBottom: 0, fontSize: '0.9em', fontStyle: 'italic' }}>
                        Silakan lakukan revisi sesuai feedback di atas dan submit ulang proposal.
                      </p>
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
      {evaluationModal && evaluationModal.open && (
        <EvaluationModal
          open={evaluationModal.open}
          title={evaluationModal.title}
          message={evaluationModal.message}
          confirmText={evaluationModal.confirmText}
          cancelText={evaluationModal.cancelText}
          onConfirm={evaluationModal.onConfirm}
          onCancel={evaluationModal.onCancel}
        />
      )}
    </div>
  );
};

export default TrainingProposalList;
