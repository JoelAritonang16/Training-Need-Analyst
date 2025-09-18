import React, { useState, useEffect } from 'react';
import './TrainingProposalList.css';

const TrainingProposalList = () => {
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

      // Check if we're in development mode and backend is not available
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseURL = isDevelopment ? 'http://localhost:5000' : '';
      
      const response = await fetch(`${baseURL}/api/proposals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint tidak ditemukan. Pastikan backend berjalan di port 5000.');
        } else if (response.status === 401) {
          throw new Error('Tidak terotorisasi. Silakan login kembali.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server mengembalikan response yang tidak valid. Pastikan backend berjalan dengan benar.');
      }

      const data = await response.json();
      setProposals(data.proposals || data.data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000');
      } else if (err.message.includes('Unexpected token')) {
        setError('Server mengembalikan response yang tidak valid. Pastikan backend berjalan dengan benar.');
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
        const isDevelopment = process.env.NODE_ENV === 'development';
        const baseURL = isDevelopment ? 'http://localhost:5000' : '';
        
        const response = await fetch(`${baseURL}/api/proposals/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          setProposals(proposals.filter(p => p.id !== id));
          alert('Usulan pelatihan berhasil dihapus');
        } else {
          throw new Error('Gagal menghapus usulan pelatihan');
        }
      } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          alert('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
        } else {
          alert('Error: ' + err.message);
        }
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
          <button className="btn-retry" onClick={fetchProposals}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="proposals-container">
      <div className="content-header">
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
