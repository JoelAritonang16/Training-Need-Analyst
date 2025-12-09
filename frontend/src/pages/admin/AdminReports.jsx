import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { trainingProposalAPI, branchAPI, divisiAPI } from '../../utils/api';
import { LuRefreshCw, LuFileBarChart, LuCheckCircle2, LuCalendar, LuUsers, LuDollarSign, LuFilter, LuAlertTriangle } from 'react-icons/lu';
import AlertModal from '../../components/AlertModal';
import '../superadmin/SuperadminReports.css';

// Memoized table row component untuk performa
const ReportRow = React.memo(({ report, index, formatDate, formatCurrency, getStatusText }) => (
  <tr key={report.id}>
    <td>{index + 1}</td>
    <td className="uraian-cell">
      <strong>{report.Uraian || '-'}</strong>
    </td>
    <td>{formatDate(report.WaktuPelaksanan)}</td>
    <td className="text-center">{report.JumlahPeserta || 0}</td>
    <td className="text-center">{report.JumlahHariPesertaPelatihan || 0}</td>
    <td className="text-center">{report.LevelTingkatan || '-'}</td>
    <td>{report.branch?.nama || report.user?.branch?.nama || '-'}</td>
    <td>{report.user?.divisi?.nama || '-'}</td>
    <td className="text-right total-cell">
      <strong>{formatCurrency(report.TotalUsulan)}</strong>
    </td>
    <td>
      <span className={`status-badge ${report.status?.toLowerCase().replace('_', '-')}`}>
        <LuCheckCircle2 size={14} />
        {getStatusText(report.status)}
      </span>
    </td>
    <td>{report.user?.fullName || report.user?.username || '-'}</td>
  </tr>
));

ReportRow.displayName = 'ReportRow';

const AdminReports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [branchList, setBranchList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  const filtersRef = useRef({ divisiFilter: 'all' });
  const isInitialMount = useRef(true);
  const debounceTimerRef = useRef(null);

  // Debounce function untuk filter changes
  const debounce = useCallback((func, delay) => {
    return (...args) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => func(...args), delay);
    };
  }, []);

  const fetchBranchAndDivisi = useCallback(async () => {
    try {
      // Admin hanya perlu fetch divisi untuk filter
      // Branch sudah dihandle oleh backend berdasarkan user.branchId
      const divisiResult = await divisiAPI.getAll();
      
      if (divisiResult.success) {
        setDivisiList(divisiResult.divisi || []);
      }
      
      // Fetch branch hanya untuk display branch name (optional)
      if (user?.branchId) {
        try {
          const branchResult = await branchAPI.getAll();
          if (branchResult.success) {
            setBranchList(branchResult.branch || []);
          }
        } catch (error) {
          // Silently fail for branch fetch
        }
      }
    } catch (error) {
      // Handle timeout and network errors gracefully
      if (error?.isTimeout || error?.name === 'TimeoutError' || error?.isNetworkError || error?.name === 'NetworkError') {
        // Don't show error for timeout/network errors on initial load
      } else {
        console.error('Error fetching divisi:', error);
      }
    }
  }, [user?.branchId]);

  const fetchReports = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const filters = {};
      // Admin hanya bisa melihat data dari branch mereka sendiri (backend sudah handle)
      // Admin tidak bisa filter branch lain, hanya bisa filter divisi
      if (divisiFilter !== 'all') filters.divisiId = divisiFilter;
      
      // Check if filters actually changed
      const filtersString = JSON.stringify(filters);
      const currentFiltersString = JSON.stringify(filtersRef.current);
      
      // Skip if filters haven't changed (except on initial mount)
      if (!isInitialMount.current && filtersString === currentFiltersString) {
        if (!silent) setLoading(false);
        return;
      }
      
      filtersRef.current = filters;
      
      const result = await trainingProposalAPI.getReportsData(filters);
      
      if (result && result.success) {
        setReports(result.reports || []);
        setLastUpdated(new Date());
        setError(null);
      } else {
        const errorMsg = result?.message || result?.error || 'Gagal memuat data laporan';
        setError(errorMsg);
        if (!silent) {
          setAlertModal({
            open: true,
            title: 'Error',
            message: errorMsg,
            type: 'error'
          });
        }
      }
    } catch (err) {
      let errorMessage = 'Terjadi kesalahan saat mengambil data';
      
      // Handle timeout and network errors gracefully
      if (err?.isTimeout || err?.name === 'TimeoutError') {
        errorMessage = 'Request timeout: Server tidak merespons saat memuat laporan. Silakan coba lagi.';
        setError(errorMessage);
        if (!silent) {
          setAlertModal({
            open: true,
            title: 'Timeout',
            message: errorMessage,
            type: 'warning'
          });
        }
      } else if (err?.isNetworkError || err?.name === 'NetworkError' || 
                 err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
        setError(errorMessage);
        if (!silent) {
          setAlertModal({
            open: true,
            title: 'Koneksi Error',
            message: errorMessage,
            type: 'error'
          });
        }
      } else {
        errorMessage = err.message || errorMessage;
        setError(errorMessage);
        if (!silent) {
          setAlertModal({
            open: true,
            title: 'Terjadi Kesalahan',
            message: errorMessage,
            type: 'error'
          });
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [divisiFilter]);

  // Debounced fetch reports
  const debouncedFetchReports = useMemo(
    () => debounce(() => fetchReports(true), 300),
    [debounce, fetchReports]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchBranchAndDivisi();
      fetchReports();
    }
  }, [fetchBranchAndDivisi, fetchReports]);

  // Handle filter changes with debounce
  useEffect(() => {
    if (!isInitialMount.current) {
      debouncedFetchReports();
    }
  }, [divisiFilter, debouncedFetchReports]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const formatCurrency = useCallback((value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return 'Rp 0';
    
    // Convert to millions (Juta)
    const inMillions = numValue / 1000000;
    
    // Format with 2 decimal places if needed, otherwise no decimals
    const formatted = inMillions % 1 === 0 
      ? inMillions.toLocaleString('id-ID', { maximumFractionDigits: 0 })
      : inMillions.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    
    return `Rp ${formatted} Juta`;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const getStatusText = useCallback((status) => {
    const statusMap = {
      'APPROVE_ADMIN': 'Disetujui Admin',
      'APPROVE_SUPERADMIN': 'Disetujui Superadmin'
    };
    return statusMap[status] || status;
  }, []);

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    return {
      totalProposals: reports.length,
      totalBudget: reports.reduce((sum, r) => sum + (r.TotalUsulan || 0), 0),
      totalParticipants: reports.reduce((sum, r) => sum + (r.JumlahPeserta || 0), 0),
      totalDays: reports.reduce((sum, r) => sum + (r.JumlahHariPesertaPelatihan || 0), 0)
    };
  }, [reports]);

  // Filter branch list untuk admin (hanya branch mereka)
  const filteredBranchList = useMemo(() => {
    if (user?.branchId) {
      return branchList.filter(b => b.id === user.branchId);
    }
    return branchList;
  }, [branchList, user?.branchId]);

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <LuRefreshCw className="spinning" size={48} />
          <p>Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-card">
          <div className="header-card-content">
            <div className="header-title-section">
              <h2 className="header-title-text">Laporan Pelatihan Terlaksana</h2>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Mode Read-Only - Hanya untuk melihat data
              </p>
            </div>
            <div className="header-controls">
              <button 
                className="btn-filter" 
                onClick={() => setShowFilters(!showFilters)}
                title="Filter Data"
              >
                <LuFilter size={18} />
                Filter
              </button>
              <button 
                className="btn-refresh" 
                onClick={() => fetchReports()}
                title="Refresh Data"
              >
                <LuRefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>
        {lastUpdated && (
          <div className="last-updated">
            Terakhir diupdate: {lastUpdated.toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        )}
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="filter-section">
          <div className="filter-content">
            <h3>Filter Laporan</h3>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Divisi</label>
                <select
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value)}
                >
                  <option value="all">Semua Divisi</option>
                  {divisiList.map(divisi => (
                    <option key={divisi.id} value={divisi.id}>
                      {divisi.nama}
                    </option>
                  ))}
                </select>
              </div>
              {user?.branchId && (
                <div className="filter-group">
                  <label>Branch</label>
                  <input
                    type="text"
                    value={filteredBranchList.find(b => b.id === user.branchId)?.nama || 'N/A'}
                    disabled
                    style={{
                      padding: '10px',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa',
                      color: '#6c757d',
                      cursor: 'not-allowed'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#6c757d' }}>
                    Admin hanya dapat melihat data dari branch ini
                  </small>
                </div>
              )}
            </div>
            <div className="filter-actions">
              <button 
                className="btn-clear-filter"
                onClick={() => {
                  setDivisiFilter('all');
                }}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <LuFileBarChart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Pelatihan</div>
            <div className="stat-value">{statistics.totalProposals}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <LuUsers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Peserta</div>
            <div className="stat-value">{statistics.totalParticipants.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <LuCalendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Hari</div>
            <div className="stat-value">{statistics.totalDays.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <LuDollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Anggaran</div>
            <div className="stat-value">{formatCurrency(statistics.totalBudget)}</div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {error && !loading && (
        <div className="error-state">
          <div className="error-icon-wrapper">
            <LuAlertTriangle className="error-icon" size={56} />
          </div>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={() => fetchReports()}>
            <LuRefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      )}

      {!error && !loading && reports.length === 0 && (
        <div className="empty-state">
          <LuFileBarChart size={64} />
          <h3>Tidak Ada Data</h3>
          <p>Belum ada pelatihan yang telah disetujui dan terlaksana</p>
          {divisiFilter !== 'all' && (
            <p className="empty-hint filter-active">
              Filter aktif: Divisi: {divisiList.find(d => d.id === parseInt(divisiFilter))?.nama || divisiFilter}
            </p>
          )}
        </div>
      )}

      {!error && !loading && reports.length > 0 && (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Uraian</th>
                <th>Waktu Pelaksanaan</th>
                <th>Jumlah Peserta</th>
                <th>Jumlah Hari</th>
                <th>Level</th>
                <th>Branch</th>
                <th>Divisi</th>
                <th>Total Usulan</th>
                <th>Status</th>
                <th>Pembuat</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <ReportRow
                  key={report.id}
                  report={report}
                  index={index}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusText={getStatusText}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default AdminReports;

