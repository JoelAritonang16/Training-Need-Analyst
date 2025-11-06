import React, { useState } from 'react';
import { useDatabaseData } from '../../components/DatabaseDataProvider';
import { trainingProposalAPI } from '../../utils/api';
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

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus usulan pelatihan ini?')) {
      try {
        await trainingProposalAPI.delete(id);
        refreshData(); // Refresh data dari context
        alert('Usulan pelatihan berhasil dihapus');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
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
                  <span className={`status-badge ${getStatusBadgeClass(proposal.status || 'PENDING')}`}>
                    {getStatusText(proposal.status || 'PENDING')}
                  </span>
                </div>
                
                <div className="proposal-details">
                  <p><strong>Waktu Pelaksanaan:</strong> {formatDate(proposal.WaktuPelaksanan)}</p>
                  <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta || '-'} orang</p>
                  <p><strong>Hari Peserta Pelatihan:</strong> {proposal.JumlahHariPesertaPelatihan || '-'} hari</p>
                  <p><strong>Level Tingkatan:</strong> {proposal.LevelTingkatan || '-'}</p>
                  <p><strong>Total Usulan:</strong> {proposal.TotalUsulan ? `Rp ${parseFloat(proposal.TotalUsulan).toLocaleString('id-ID')}` : '-'}</p>
                  <p><strong>Tanggal Dibuat:</strong> {formatDate(proposal.created_at)}</p>
                </div>
                
                <div className="proposal-actions">
                  <button 
                    className="btn-detail"
                    onClick={() => handleViewDetail(proposal)}
                  >
                    Lihat Detail
                  </button>
                  {(!proposal.status || proposal.status === 'PENDING' || proposal.status === 'REJECTED') && (
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
    </div>
  );
};

export default TrainingProposalList;
