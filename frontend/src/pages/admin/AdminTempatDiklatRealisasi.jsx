import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { tempatDiklatRealisasiAPI } from '../../utils/api';
import { LuRefreshCw, LuAlertTriangle } from 'react-icons/lu';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AlertModal from '../../components/AlertModal';
import './TempatDiklatRealisasi.css';

// Memoized table row component untuk performa
const RealisasiRow = React.memo(({ item, index, selectedYear, formatCurrency }) => (
  <tr key={item.id}>
    <td>{index + 1}</td>
    <td>{item.branch?.nama || 'N/A'}</td>
    <td>{item.namaTempat}</td>
    <td>
      {new Date(selectedYear, item.bulan - 1).toLocaleString('id-ID', { month: 'long' })}
    </td>
    <td>{item.jumlahKegiatan}</td>
    <td>{item.totalPeserta}</td>
    <td>{formatCurrency(item.totalBiaya)}</td>
  </tr>
));

RealisasiRow.displayName = 'RealisasiRow';

const AdminTempatDiklatRealisasi = ({ user }) => {
  const [data, setData] = useState([]);
  const [rekapPerBulan, setRekapPerBulan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { tahun: selectedYear };
      if (selectedMonth !== 'all') {
        filters.bulan = selectedMonth;
      }
      const result = await tempatDiklatRealisasiAPI.getAll(filters);
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.message || 'Gagal memuat data');
      }
    } catch (err) {
      const errorString = String(err || '');
      const errorMessage = err?.message || errorString;
      const isTimeout = err?.isTimeout || 
                        err?.name === 'TimeoutError' || 
                        errorMessage?.includes('timeout') || 
                        errorMessage?.includes('Timeout');
      
      const isNetworkError = err?.isNetworkError || 
                             err?.name === 'NetworkError' ||
                             errorMessage?.includes('Failed to fetch') || 
                             errorMessage?.includes('NetworkError');
      
      if (isTimeout) {
        setError('Request timeout: Server tidak merespons. Silakan coba lagi.');
        setAlertModal({
          open: true,
          title: 'Timeout',
          message: 'Server tidak merespons. Silakan coba lagi.',
          type: 'warning'
        });
      } else if (isNetworkError) {
        setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
        setAlertModal({
          open: true,
          title: 'Koneksi Error',
          message: 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.',
          type: 'error'
        });
      } else {
        setError(errorMessage || 'Terjadi kesalahan saat mengambil data');
        setAlertModal({
          open: true,
          title: 'Terjadi Kesalahan',
          message: errorMessage || 'Terjadi kesalahan saat mengambil data',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  const fetchRekapPerBulan = useCallback(async () => {
    try {
      const result = await tempatDiklatRealisasiAPI.getRekapPerBulan(selectedYear);
      if (result.success) {
        setRekapPerBulan(result.rekap || []);
      }
    } catch (error) {
      // Silently handle errors for rekap
      console.error('Error fetching rekap:', error);
    }
  }, [selectedYear]);

  // Debounced fetch data
  const debouncedFetchData = useMemo(
    () => debounce(() => fetchData(), 300),
    [debounce, fetchData]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchData();
      fetchRekapPerBulan();
    }
  }, [fetchData, fetchRekapPerBulan]);

  // Handle filter changes with debounce
  useEffect(() => {
    if (!isInitialMount.current) {
      debouncedFetchData();
      fetchRekapPerBulan();
    }
  }, [selectedYear, selectedMonth, debouncedFetchData, fetchRekapPerBulan]);

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

  // Memoized chart data
  const chartData = useMemo(() => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    return months.map((month, index) => {
      const monthData = rekapPerBulan.find(r => r.bulan === index + 1);
      return {
        name: month,
        'Total Kegiatan': monthData?.totalKegiatan || 0,
        'Total Peserta': monthData?.totalPeserta || 0,
        'Total Biaya (Juta)': monthData?.totalBiaya ? (monthData.totalBiaya / 1000000).toFixed(2) : 0
      };
    });
  }, [rekapPerBulan]);

  const bulanOptions = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  if (loading) {
    return (
      <div className="realisasi-container">
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          <LuRefreshCw className="spinning" size={48} />
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="realisasi-container">
      <div className="content-header">
        <div>
          <h2>Tempat Diklat Realisasi</h2>
          <p>Rekap tempat diklat yang sudah terealisasi per bulan per branch (Mode Read-Only)</p>
        </div>
        <div>
          <button 
            className="btn-refresh" 
            onClick={() => {
              fetchData();
              fetchRekapPerBulan();
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#0271B6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <LuRefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Tahun:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Bulan:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {bulanOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="error-state" style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#fee',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <LuAlertTriangle size={48} style={{ color: '#f44336', marginBottom: '16px' }} />
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              fetchData();
              fetchRekapPerBulan();
            }}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#0271B6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <LuRefreshCw size={16} style={{ marginRight: '8px' }} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Charts */}
      {!error && (
        <div className="charts-section">
          <h3>Grafik Rekap Per Bulan ({selectedYear})</h3>
          <div className="charts-grid">
            <div className="chart-card chart-full-width">
              <h4>Total Kegiatan dan Peserta Per Bulan</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Total Kegiatan" stroke="#8884d8" />
                  <Line type="monotone" dataKey="Total Peserta" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card chart-full-width">
              <h4>Total Biaya Realisasi Per Bulan (Juta Rupiah)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Total Biaya (Juta)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!error && (
        <div className="data-section">
          <h3>Data Realisasi ({data.length} entri)</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Branch</th>
                  <th>Nama Tempat</th>
                  <th>Bulan</th>
                  <th>Jumlah Kegiatan</th>
                  <th>Total Peserta</th>
                  <th>Total Biaya</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      Tidak ada data realisasi
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <RealisasiRow
                      key={item.id}
                      item={item}
                      index={index}
                      selectedYear={selectedYear}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
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

export default AdminTempatDiklatRealisasi;

