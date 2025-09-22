import React, { useState, useEffect } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import './TrainingProposalList.css';
import './TrainingProposalList-additional.css';

const TrainingProposalList = ({ onCreateNew }) => {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fungsi untuk mengambil data dari API
  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }

      const data = await trainingProposalAPI.getAll();
      setProposals(data.proposals || data.data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      
      // Set appropriate error message
      if (err.message.includes('login')) {
        setError(err.message);
      } else if (err.message.includes('500')) {
        setError('Server sedang mengalami masalah. Silakan coba lagi nanti.');
      } else {
        setError(err.message);
      }
      
      // Set mock data for development if API fails
      if (process.env.NODE_ENV === 'development') {
        setProposals([
          {
            id: 1,
            Uraian: 'Pelatihan Manajemen Proyek',
            WaktuPelaksanan: '2024-01-15',
            JumlahPeserta: 25,
            JumlahHariPesertaPelatihan: 3,
            LevelTingkatan: 'STRUKTURAL',
            TotalUsulan: 15000000,
            status: 'PENDING',
            created_at: '2024-01-01'
          },
          {
            id: 2,
            Uraian: 'Pelatihan Kepemimpinan',
            WaktuPelaksanan: '2024-02-20',
            JumlahPeserta: 30,
            JumlahHariPesertaPelatihan: 5,
            LevelTingkatan: 'NON STRUKTURAL',
            TotalUsulan: 25000000,
            status: 'APPROVED',
            created_at: '2024-01-05'
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

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
    // Implementasi navigasi ke halaman edit
    // window.location.href = `/training-proposals/edit/${id}`;
  };

  const handleViewDetail = (id) => {
    console.log('View detail for proposal with ID:', id);
    // Implementasi navigasi ke halaman detail
    // window.location.href = `/training-proposals/detail/${id}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus usulan pelatihan ini?')) {
      try {
        await trainingProposalAPI.delete(id);
        setProposals(proposals.filter(p => p.id !== id));
        alert('Usulan pelatihan berhasil dihapus');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
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
      'PENDING': 'Menunggu',
      'APPROVED': 'Disetujui',
      'REJECTED': 'Ditolak'
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
          <div className="error-icon">⚠️</div>
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
            <button className="btn-retry" onClick={fetchProposals}>
              Coba Lagi
            </button>
            <button 
              className="btn-mock-data" 
              onClick={() => {
                setError(null);
                setProposals([
                  {
                    id: 1,
                    Uraian: 'Pelatihan Manajemen Proyek',
                    WaktuPelaksanan: '2024-01-15',
                    JumlahPeserta: 25,
                    JumlahHariPesertaPelatihan: 3,
                    LevelTingkatan: 'STRUKTURAL',
                    TotalUsulan: 15000000,
                    status: 'PENDING',
                    created_at: '2024-01-01'
                  },
                  {
                    id: 2,
                    Uraian: 'Pelatihan Kepemimpinan',
                    WaktuPelaksanan: '2024-02-20',
                    JumlahPeserta: 30,
                    JumlahHariPesertaPelatihan: 5,
                    LevelTingkatan: 'NON STRUKTURAL',
                    TotalUsulan: 25000000,
                    status: 'APPROVED',
                    created_at: '2024-01-05'
                  }
                ]);
              }}
            >
              Gunakan Data Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div className="header-content">
          <div className="header-text">
            <h2>Daftar Usulan Pelatihan</h2>
            <p>Kelola dan pantau status usulan pelatihan Anda</p>
            {isUsingMockData && (
              <div className="mock-data-indicator">
                <span className="mock-icon">⚠️</span>
                <span>Menggunakan data demo</span>
              </div>
            )}
          </div>
          {onCreateNew && (
            <button 
              className="btn-create-new"
              onClick={onCreateNew}
            >
              <span className="btn-icon">📝</span>
              Buat Usulan Baru
            </button>
          )}
        </div>
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
          <span className="search-icon">🔍</span>
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
          <div className="empty-icon">📋</div>
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
                    onClick={() => handleViewDetail(proposal.id)}
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
    </div>
  );
};

export default TrainingProposalList;
