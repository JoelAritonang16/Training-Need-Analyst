import React, { useState, useEffect } from 'react';
import { trainingProposalAPI, branchAPI, divisiAPI } from '../../utils/api';
import { LuDownload, LuRefreshCw, LuFileBarChart, LuCheckCircle2, LuCalendar, LuUsers, LuDollarSign, LuFilter, LuAlertTriangle, LuCheckSquare, LuSquare } from 'react-icons/lu';
import AlertModal from '../../components/AlertModal';
import './SuperadminReports.css';

const SuperadminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [branchFilter, setBranchFilter] = useState('all');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [branchList, setBranchList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchBranchAndDivisi();
    fetchReports();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [branchFilter, divisiFilter]);

  const fetchBranchAndDivisi = async () => {
    try {
      const [branchResult, divisiResult] = await Promise.all([
        branchAPI.getAll(),
        divisiAPI.getAll()
      ]);
      
      if (branchResult.success) {
        setBranchList(branchResult.branch || []);
      }
      if (divisiResult.success) {
        setDivisiList(divisiResult.divisi || []);
      }
    } catch (error) {
      console.error('Error fetching branch and divisi:', error);
    }
  };

  const fetchReports = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const filters = {};
      if (branchFilter !== 'all') filters.branchId = branchFilter;
      if (divisiFilter !== 'all') filters.divisiId = divisiFilter;
      
      console.log('[Reports Frontend] Fetching reports with filters:', filters);
      const result = await trainingProposalAPI.getReportsData(filters);
      console.log('[Reports Frontend] API response:', result);
      
      if (result && result.success) {
        setReports(result.reports || []);
        setLastUpdated(new Date());
        setError(null); // Clear any previous errors
        console.log(`[Reports Frontend] Loaded ${result.reports?.length || 0} reports`);
      } else {
        const errorMsg = result?.message || result?.error || 'Gagal memuat data laporan';
        console.error('[Reports Frontend] API returned error:', errorMsg);
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
      console.error('[Reports Frontend] Error fetching reports:', err);
      console.error('[Reports Frontend] Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      let errorMessage = 'Terjadi kesalahan saat mengambil data';
      
      if (err.message) {
        if (err.message.includes('Not Found') || err.message.includes('404')) {
          errorMessage = 'Endpoint tidak ditemukan. Pastikan server berjalan dengan benar dan route sudah terdaftar.';
        } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      if (!silent) {
        setAlertModal({
          open: true,
          title: 'Terjadi Kesalahan',
          message: errorMessage,
          type: 'error'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Handle individual checkbox selection
  const handleSelectReport = (reportId) => {
    setSelectedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Handle select all/deselect all
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedReports(new Set());
      setIsSelectAll(false);
    } else {
      const allIds = new Set(reports.map(r => r.id));
      setSelectedReports(allIds);
      setIsSelectAll(true);
    }
  };

  // Update select all state when individual selections change
  useEffect(() => {
    if (reports.length > 0) {
      const allSelected = reports.every(r => selectedReports.has(r.id));
      setIsSelectAll(allSelected && selectedReports.size === reports.length);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedReports, reports]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedReports(new Set());
    setIsSelectAll(false);
  }, [branchFilter, divisiFilter]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // If items are selected, filter the reports
      let reportsToExport = reports;
      if (selectedReports.size > 0) {
        reportsToExport = reports.filter(r => selectedReports.has(r.id));
      }
      
      if (reportsToExport.length === 0) {
        setAlertModal({
          open: true,
          title: 'Peringatan',
          message: 'Tidak ada data yang dipilih untuk diexport',
          type: 'warning'
        });
        setIsExporting(false);
        return;
      }

      // Create Excel file client-side
      let ExcelJS;
      try {
        ExcelJS = (await import('exceljs')).default;
      } catch (importError) {
        console.error('Error importing exceljs:', importError);
        setAlertModal({
          open: true,
          title: 'Error',
          message: 'Gagal memuat library Excel. Silakan refresh halaman dan coba lagi.',
          type: 'error'
        });
        setIsExporting(false);
        return;
      }
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Laporan Pelatihan Terlaksana');

      // Define columns
      worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Uraian', key: 'uraian', width: 40 },
        { header: 'Waktu Pelaksanaan', key: 'waktuPelaksanaan', width: 20 },
        { header: 'Jumlah Peserta', key: 'jumlahPeserta', width: 15 },
        { header: 'Jumlah Hari', key: 'jumlahHari', width: 15 },
        { header: 'Level Tingkatan', key: 'levelTingkatan', width: 18 },
        { header: 'Beban (Juta Rp)', key: 'beban', width: 18 },
        { header: 'Transportasi (Juta Rp)', key: 'transportasi', width: 18 },
        { header: 'Akomodasi (Juta Rp)', key: 'akomodasi', width: 18 },
        { header: 'Uang Saku (Juta Rp)', key: 'uangSaku', width: 18 },
        { header: 'Total Usulan (Juta Rp)', key: 'totalUsulan', width: 20 },
        { header: 'Branch', key: 'branch', width: 20 },
        { header: 'Divisi', key: 'divisi', width: 20 },
        { header: 'Pembuat', key: 'pembuat', width: 20 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Tanggal Dibuat', key: 'tanggalDibuat', width: 20 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0271B6' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Add data
      reportsToExport.forEach((report, index) => {
        // Format currency values to millions for Excel
        const formatToMillions = (value) => {
          const numValue = parseFloat(value) || 0;
          if (numValue === 0) return 0;
          return numValue / 1000000;
        };

        const row = worksheet.addRow({
          no: index + 1,
          uraian: report.Uraian || '-',
          waktuPelaksanaan: report.WaktuPelaksanan ? formatDate(report.WaktuPelaksanan) : '-',
          jumlahPeserta: report.JumlahPeserta || 0,
          jumlahHari: report.JumlahHariPesertaPelatihan || 0,
          levelTingkatan: report.LevelTingkatan || '-',
          beban: formatToMillions(report.Beban),
          transportasi: formatToMillions(report.BebanTransportasi),
          akomodasi: formatToMillions(report.BebanAkomodasi),
          uangSaku: formatToMillions(report.BebanUangSaku),
          totalUsulan: formatToMillions(report.TotalUsulan),
          branch: report.branch?.nama || report.user?.branch?.nama || '-',
          divisi: report.user?.divisi?.nama || '-',
          pembuat: report.user?.fullName || report.user?.username || '-',
          status: getStatusText(report.status),
          tanggalDibuat: report.created_at ? formatDate(report.created_at) : '-'
        });

        // Format number columns
        ['jumlahPeserta', 'jumlahHari'].forEach(key => {
          const cell = row.getCell(key);
          cell.numFmt = '#,##0';
        });
        
        // Format currency columns (in millions) with 2 decimal places
        ['beban', 'transportasi', 'akomodasi', 'uangSaku', 'totalUsulan'].forEach(key => {
          const cell = row.getCell(key);
          cell.numFmt = '#,##0.00';
        });
      });

      // Generate filename
      let filename = `Laporan_Pelatihan_Terlaksana_${new Date().toISOString().split('T')[0]}`;
      if (selectedReports.size > 0) {
        filename += `_${selectedReports.size}Item`;
      }
      filename += '.xlsx';

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setAlertModal({
        open: true,
        title: 'Berhasil!',
        message: `Laporan berhasil diexport ke Excel (${reportsToExport.length} item)`,
        type: 'success'
      });

      // Clear selection after export
      setSelectedReports(new Set());
      setIsSelectAll(false);
    } catch (err) {
      console.error('Error exporting reports:', err);
      setAlertModal({
        open: true,
        title: 'Gagal Export',
        message: err.message || 'Gagal mengexport laporan',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return 'Rp 0';
    
    // Convert to millions (Juta)
    const inMillions = numValue / 1000000;
    
    // Format with 2 decimal places if needed, otherwise no decimals
    const formatted = inMillions % 1 === 0 
      ? inMillions.toLocaleString('id-ID', { maximumFractionDigits: 0 })
      : inMillions.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    
    return `Rp ${formatted} Juta`;
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
    const statusMap = {
      'APPROVE_ADMIN': 'Disetujui Admin',
      'APPROVE_SUPERADMIN': 'Disetujui Superadmin'
    };
    return statusMap[status] || status;
  };

  // Calculate statistics
  const totalProposals = reports.length;
  const totalBudget = reports.reduce((sum, r) => sum + (r.TotalUsulan || 0), 0);
  const totalParticipants = reports.reduce((sum, r) => sum + (r.JumlahPeserta || 0), 0);
  const totalDays = reports.reduce((sum, r) => sum + (r.JumlahHariPesertaPelatihan || 0), 0);

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
            </div>
            <div className="header-controls">
              {selectedReports.size > 0 && (
                <div className="selection-badge">
                  <span>{selectedReports.size} item dipilih</span>
                  <button 
                    className="btn-clear-selection"
                    onClick={() => {
                      setSelectedReports(new Set());
                      setIsSelectAll(false);
                    }}
                    title="Hapus Pilihan"
                  >
                    ×
                  </button>
                </div>
              )}
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
              <button 
                className="btn-export" 
                onClick={handleExport}
                disabled={isExporting || reports.length === 0}
              >
                <LuDownload size={18} />
                {isExporting 
                  ? 'Mengexport...' 
                  : selectedReports.size > 0 
                    ? `Download (${selectedReports.size})` 
                    : 'Download Excel'}
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
                <label>Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">Semua Branch</option>
                  {branchList.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.nama}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>
            <div className="filter-actions">
              <button 
                className="btn-clear-filter"
                onClick={() => {
                  setBranchFilter('all');
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
            <div className="stat-value">{totalProposals}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <LuUsers size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Peserta</div>
            <div className="stat-value">{totalParticipants.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <LuCalendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Hari</div>
            <div className="stat-value">{totalDays.toLocaleString('id-ID')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <LuDollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Anggaran</div>
            <div className="stat-value">{formatCurrency(totalBudget)}</div>
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
          <p>
            {error.includes('Not Found') || error.includes('404') 
              ? 'Endpoint tidak ditemukan. Pastikan server backend berjalan dengan benar dan route sudah terdaftar.' 
              : error.includes('Network') || error.includes('Failed to fetch')
              ? 'Tidak dapat terhubung ke server. Pastikan server backend berjalan di port yang benar.'
              : error}
          </p>
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
          {(branchFilter !== 'all' || divisiFilter !== 'all') && (
            <p className="empty-hint filter-active">
              Filter aktif: {branchFilter !== 'all' && `Branch: ${branchList.find(b => b.id === parseInt(branchFilter))?.nama || branchFilter}`}
              {branchFilter !== 'all' && divisiFilter !== 'all' && ' | '}
              {divisiFilter !== 'all' && `Divisi: ${divisiList.find(d => d.id === parseInt(divisiFilter))?.nama || divisiFilter}`}
            </p>
          )}
          <p className="empty-hint">Data akan muncul setelah ada proposal yang disetujui dan dikonfirmasi sudah direalisasikan</p>
        </div>
      )}

      {!error && !loading && reports.length > 0 && (
        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th className="checkbox-header">
                  <button 
                    className="checkbox-select-all"
                    onClick={handleSelectAll}
                    title={isSelectAll ? "Hapus Semua Pilihan" : "Pilih Semua"}
                  >
                    {isSelectAll ? (
                      <LuCheckSquare size={20} className="checkbox-icon checked" />
                    ) : (
                      <LuSquare size={20} className="checkbox-icon" />
                    )}
                  </button>
                </th>
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
              {reports.map((report, index) => {
                const isSelected = selectedReports.has(report.id);
                return (
                  <tr 
                    key={report.id} 
                    className={isSelected ? 'row-selected' : ''}
                    onClick={(e) => {
                      // Only toggle if clicking on checkbox or row (not on buttons/links)
                      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                        handleSelectReport(report.id);
                      }
                    }}
                  >
                    <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="checkbox-item"
                        onClick={() => handleSelectReport(report.id)}
                        title={isSelected ? "Hapus Pilihan" : "Pilih Item"}
                      >
                        {isSelected ? (
                          <LuCheckSquare size={18} className="checkbox-icon checked" />
                        ) : (
                          <LuSquare size={18} className="checkbox-icon" />
                        )}
                      </button>
                    </td>
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
                );
              })}
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

export default SuperadminReports;

