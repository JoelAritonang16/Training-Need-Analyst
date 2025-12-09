import React, { useState, useEffect } from 'react';
import { trainingProposalAPI, updateImplementationStatusAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import EvaluationModal from '../../components/EvaluationModal';
import './TrainingProposalDetail.css';

const TrainingProposalDetail = ({ proposalId, onEdit, onBack }) => {
  const id = proposalId;
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState(null);
  const [evaluationModal, setEvaluationModal] = useState(null);
  const [isUpdatingImplementation, setIsUpdatingImplementation] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await trainingProposalAPI.getById(id);
      setProposal(data.proposal);
    } catch (err) {
      let errorMessage = 'Terjadi kesalahan saat mengambil data proposal';
      
      if (err?.isTimeout || err?.name === 'TimeoutError') {
        errorMessage = 'Request timeout: Server tidak merespons. Silakan coba lagi.';
      } else if (err?.isNetworkError || err?.name === 'NetworkError') {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = () => {
    setConfirmModal({
      open: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus usulan pelatihan ini?',
      onConfirm: async () => {
        try {
          await trainingProposalAPI.delete(id);
          setConfirmModal(null);
          setAlertModal({
            open: true,
            type: 'success',
            title: 'Berhasil',
            message: 'Usulan pelatihan berhasil dihapus'
          });
          setTimeout(() => {
            setAlertModal(prev => ({ ...prev, open: false }));
            if (onBack) {
              onBack();
            }
          }, 2000);
        } catch (err) {
          let errorMessage = 'Gagal menghapus usulan pelatihan';
          
          if (err?.isTimeout || err?.name === 'TimeoutError') {
            errorMessage = 'Request timeout: Server tidak merespons. Silakan coba lagi.';
          } else if (err?.isNetworkError || err?.name === 'NetworkError') {
            errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
          } else {
            errorMessage = err.message || errorMessage;
          }
          
          setConfirmModal(null);
          setAlertModal({
            open: true,
            type: 'error',
            title: 'Error',
            message: errorMessage
          });
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === '') return 'Rp 0';
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return 'Rp 0';
    return `Rp ${numValue.toLocaleString('id-ID')}`;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'MENUNGGU': 'Menunggu',
      'APPROVE_ADMIN': 'Disetujui Admin',
      'APPROVE_SUPERADMIN': 'Disetujui Superadmin',
      'DITOLAK': 'Ditolak'
    };
    return statusTexts[status] || 'Menunggu';
  };

  const getImplementationStatusText = (status) => {
    const statusTexts = {
      'BELUM_IMPLEMENTASI': 'Belum Diimplementasikan',
      'SUDAH_IMPLEMENTASI': 'Sudah Diimplementasikan'
    };
    return statusTexts[status] || '-';
  };

  const handleUpdateImplementationStatus = async (newStatus) => {
    if (!proposal) return;
    
    // Tampilkan modal evaluasi jika mengubah ke SUDAH_IMPLEMENTASI
    if (newStatus === 'SUDAH_IMPLEMENTASI' && proposal.implementasiStatus !== 'SUDAH_IMPLEMENTASI') {
      setEvaluationModal({
        open: true,
        title: 'Konfirmasi Realisasi',
        message: 'Silakan isi evaluasi realisasi sebelum mengkonfirmasi. Setelah dikonfirmasi, draft TNA akan otomatis dibuat dan dapat dilihat oleh admin dan superadmin.',
        onConfirm: async (evaluasiRealisasi) => {
          await updateImplementationStatus(newStatus, evaluasiRealisasi);
          setEvaluationModal(null);
        },
        onCancel: () => setEvaluationModal(null)
      });
      return;
    }
    
    await updateImplementationStatus(newStatus);
  };

  const updateImplementationStatus = async (newStatus, evaluasiRealisasi = null) => {
    if (!proposal) return;
    
    setIsUpdatingImplementation(true);
    try {
      const result = await updateImplementationStatusAPI(proposal.id, newStatus, evaluasiRealisasi);
      if (result.success) {
        // Refresh proposal data untuk mendapatkan data terbaru
        await fetchProposal();
        
        // Pesan khusus untuk SUDAH_IMPLEMENTASI
        if (newStatus === 'SUDAH_IMPLEMENTASI') {
          setAlertModal({
            open: true,
            type: 'success',
            title: 'Berhasil Dikonfirmasi!',
            message: `Proposal telah dikonfirmasi sebagai sudah direalisasikan. Draft TNA telah otomatis dibuat dan dapat dilihat oleh admin dan superadmin di halaman Draft TNA.`
          });
        } else {
          setAlertModal({
            open: true,
            type: 'success',
            title: 'Berhasil',
            message: `Status implementasi berhasil diupdate menjadi ${getImplementationStatusText(newStatus)}`
          });
        }
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
      
      setAlertModal({
        open: true,
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setIsUpdatingImplementation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="training-proposal-detail">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data usulan pelatihan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="training-proposal-detail">
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
          <button className="btn-retry" onClick={fetchProposal}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="training-proposal-detail">
        <div className="error-state">
          <div className="error-icon">X</div>
          <h3>Usulan Tidak Ditemukan</h3>
          <p>Usulan pelatihan dengan ID {id} tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="training-proposal-detail">
      <div className="page-title">
        <h2>Detail Usulan Pelatihan</h2>
        <p>Informasi lengkap mengenai usulan pelatihan Anda</p>
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>{proposal.Uraian || 'Uraian Tidak Tersedia'}</h1>
            <div className="header-meta">
              <span className={`status-badge ${getStatusBadgeClass(proposal.status || 'PENDING')}`}>
                {getStatusText(proposal.status || 'PENDING')}
              </span>
              {proposal.isRevision && (
                <span className="status-badge revision-badge" style={{ 
                  backgroundColor: '#ff9800', 
                  color: 'white',
                  marginLeft: '8px',
                  fontSize: '0.85em',
                  padding: '4px 12px'
                }}>
                  ⚠️ REVISI
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Klasifikasi Usulan</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Jenis</label>
              <p>{proposal.Jenis || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Program Inisiatif Strategis</label>
              <p>{proposal.ProgramInisiatifStrategis || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Cluster Utama</label>
              <p>{proposal.ClusterUtama || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Cluster Kecil</label>
              <p>{proposal.ClusterKecil || '-'}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Informasi Pelatihan</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Uraian Pelatihan</label>
              <p>{proposal.Uraian || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Waktu Pelaksanaan</label>
              <p>{formatDate(proposal.WaktuPelaksanan)}</p>
            </div>
            <div className="detail-item">
              <label>Jumlah Peserta</label>
              <p>{proposal.JumlahPeserta || '-'} orang</p>
            </div>
            <div className="detail-item">
              <label>Jumlah Hari Pelaksanaan</label>
              <p>{proposal.JumlahHariPesertaPelatihan || '-'} hari</p>
            </div>
            <div className="detail-item">
              <label>Level Tingkatan</label>
              <p>{proposal.LevelTingkatan || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Tanggal Dibuat</label>
              <p>{formatDate(proposal.created_at)}</p>
            </div>
            <div className="detail-item">
              <label>Tanggal Diupdate</label>
              <p>{formatDate(proposal.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Status Implementasi Section - hanya untuk proposal yang sudah disetujui */}
        {(proposal.status === 'APPROVE_ADMIN' || proposal.status === 'APPROVE_SUPERADMIN') && (
          <div className="detail-section implementation-section">
            <div className="section-header">
              <h3>Konfirmasi Realisasi Proposal</h3>
              <div className="section-badge">
                {proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' ? '✓ Sudah Direalisasikan' : '⏳ Belum Dikonfirmasi'}
              </div>
            </div>
            
            <div className="implementation-status-section">
              <div className="implementation-status-info">
                <div className="status-display">
                  <label>Status Realisasi Saat Ini:</label>
                  <span className={`implementation-status-badge ${proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' ? 'implemented' : 'not-implemented'}`}>
                    {getImplementationStatusText(proposal.implementasiStatus) || 'Belum Dikonfirmasi'}
                  </span>
                </div>
                {proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' && (
                  <div className="implementation-success-message">
                    <p>✓ Proposal ini telah dikonfirmasi sebagai sudah direalisasikan</p>
                    <p>✓ Draft TNA telah otomatis dibuat dan dapat dilihat oleh admin dan superadmin</p>
                    {proposal.evaluasiRealisasi && (
                      <div className="evaluation-display">
                        <h4>Evaluasi Realisasi:</h4>
                        <p>{proposal.evaluasiRealisasi}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {proposal.implementasiStatus !== 'SUDAH_IMPLEMENTASI' && (
                <div className="implementation-actions">
                  <div className="implementation-info-box">
                    <h4>Konfirmasi Realisasi</h4>
                    <p>Silakan konfirmasi apakah proposal pelatihan ini sudah direalisasikan atau belum. Setelah dikonfirmasi sebagai <strong>"Sudah Direalisasikan"</strong>, draft TNA akan otomatis dibuat dan dapat dilihat oleh admin dan superadmin.</p>
                  </div>
                  <div className="implementation-buttons">
                    <button
                      className={`btn-implementation btn-not-implemented ${proposal.implementasiStatus === 'BELUM_IMPLEMENTASI' ? 'active' : ''}`}
                      onClick={() => handleUpdateImplementationStatus('BELUM_IMPLEMENTASI')}
                      disabled={isUpdatingImplementation || proposal.implementasiStatus === 'BELUM_IMPLEMENTASI'}
                    >
                      {isUpdatingImplementation ? 'Memproses...' : 'Belum Direalisasikan'}
                    </button>
                    <button
                      className={`btn-implementation btn-implemented ${proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI' ? 'active' : ''}`}
                      onClick={() => handleUpdateImplementationStatus('SUDAH_IMPLEMENTASI')}
                      disabled={isUpdatingImplementation || proposal.implementasiStatus === 'SUDAH_IMPLEMENTASI'}
                    >
                      {isUpdatingImplementation ? 'Memproses...' : '✓ Sudah Direalisasikan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alasan Penolakan - jika proposal ditolak */}
        {proposal.status === 'DITOLAK' && proposal.alasan && (
          <div className="detail-section">
            <h3>Alasan Penolakan</h3>
            <div className="rejection-reason">
              <p>{proposal.alasan}</p>
              <p style={{ marginTop: '12px', color: '#666', fontSize: '0.9em' }}>
                <strong>Catatan:</strong> Anda dapat melakukan revisi pada proposal ini dengan mengklik tombol "Edit Usulan" di bawah.
              </p>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Rincian Biaya</h3>
          <div className="cost-details">
            <div className="cost-item">
              <label>Beban</label>
              <span className="cost-value">{formatCurrency(proposal.Beban)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Transportasi</label>
              <span className="cost-value">{formatCurrency(proposal.BebanTranportasi)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Akomodasi</label>
              <span className="cost-value">{formatCurrency(proposal.BebanAkomodasi)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Uang Saku</label>
              <span className="cost-value">{formatCurrency(proposal.BebanUangSaku)}</span>
            </div>
            <div className="cost-item total">
              <label>Total Usulan</label>
              <span className="cost-value">{formatCurrency(proposal.TotalUsulan)}</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            className="btn-secondary"
            onClick={onBack}
          >
            ← Kembali ke Daftar
          </button>
          
          {(proposal.status === 'MENUNGGU' || proposal.status === 'DITOLAK') && (
            <>
              <button 
                className="btn-primary"
                onClick={handleEdit}
              >
                Edit Usulan
              </button>
              <button 
                className="btn-danger"
                onClick={handleDelete}
              >
                Hapus Usulan
              </button>
            </>
          )}
        </div>
      </div>

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
      {/* Evaluation Modal */}
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

export default TrainingProposalDetail;
