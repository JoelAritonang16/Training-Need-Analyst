import React, { useState, useEffect } from 'react';
import { draftTNA2026API } from '../../utils/api';
import { LuBarChart3, LuDownload } from 'react-icons/lu';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AlertModal from '../../components/AlertModal';
import './RekapGabungan.css';

const RekapGabungan = ({ onNavigate }) => {
  const [rekap, setRekap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('branches'); // 'branches' or 'divisi'
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchRekap();
  }, []);

  const fetchRekap = async () => {
    try {
      setLoading(true);
      const result = await draftTNA2026API.getRekapGabungan();
      if (result.success) {
        setRekap(result.rekap);
      } else {
        setError(result.message || 'Gagal memuat rekap');
      }
    } catch (err) {
      console.error('Error fetching rekap:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleExport = () => {
    setAlertModal({
      open: true,
      title: 'Informasi',
      message: 'Fitur export akan segera tersedia. Terima kasih atas kesabaran Anda.',
      type: 'info'
    });
  };

  if (loading) {
    return <div className="rekap-container"><p>Memuat data rekap...</p></div>;
  }

  if (error) {
    return <div className="rekap-container"><p className="error">{error}</p></div>;
  }

  if (!rekap) {
    return <div className="rekap-container"><p>Tidak ada data rekap</p></div>;
  }

  // Prepare chart data
  const branchesChartData = rekap.branches
    .sort((a, b) => b.totalBiaya - a.totalBiaya)
    .slice(0, 10)
    .map(b => ({
      name: b.nama.length > 15 ? b.nama.substring(0, 15) + '...' : b.nama,
      'Total Draft': b.totalDraft,
      'Total Biaya (Miliar)': (b.totalBiaya / 1000000000).toFixed(2),
      'Total Peserta': b.totalPeserta,
    }));

  const divisiChartData = rekap.divisi
    .sort((a, b) => b.totalBiaya - a.totalBiaya)
    .slice(0, 10)
    .map(d => ({
      name: d.nama.length > 15 ? d.nama.substring(0, 15) + '...' : d.nama,
      'Total Draft': d.totalDraft,
      'Total Biaya (Miliar)': (d.totalBiaya / 1000000000).toFixed(2),
      'Total Peserta': d.totalPeserta,
    }));

  const branchesPieData = rekap.branches
    .filter(b => b.totalDraft > 0)
    .sort((a, b) => b.totalDraft - a.totalDraft)
    .slice(0, 5)
    .map(b => ({
      name: b.nama.length > 12 ? b.nama.substring(0, 12) + '...' : b.nama,
      value: b.totalDraft,
    }));

  const divisiPieData = rekap.divisi
    .filter(d => d.totalDraft > 0)
    .sort((a, b) => b.totalDraft - a.totalDraft)
    .slice(0, 5)
    .map(d => ({
      name: d.nama.length > 12 ? d.nama.substring(0, 12) + '...' : d.nama,
      value: d.totalDraft,
    }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="rekap-container">
      <div className="content-header">
        <div>
          <h2>Rekap Gabungan TNA 2026</h2>
          <p>Rekap usulan gabungan dari 20 Cabang dan 18 Divisi Korporat</p>
        </div>
        <button className="btn-export" onClick={handleExport}>
          <LuDownload size={18} />
          Export Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Draft</h3>
          <div className="summary-value">{rekap.total.totalDraft}</div>
          <small>20 Cabang + 18 Divisi</small>
        </div>
        <div className="summary-card">
          <h3>Total Biaya</h3>
          <div className="summary-value">
            {formatCurrency(rekap.total.totalBiaya)}
          </div>
          <small>Total anggaran usulan</small>
        </div>
        <div className="summary-card">
          <h3>Total Peserta</h3>
          <div className="summary-value">{rekap.total.totalPeserta}</div>
          <small>Total peserta pelatihan</small>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'branches' ? 'active' : ''}`}
            onClick={() => setActiveTab('branches')}
          >
            20 Cabang
          </button>
          <button
            className={`tab ${activeTab === 'divisi' ? 'active' : ''}`}
            onClick={() => setActiveTab('divisi')}
          >
            18 Divisi Korporat
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <h3>Grafik Analisis</h3>
        <div className="charts-grid">
          {activeTab === 'branches' ? (
            <>
              <div className="chart-card chart-full-width">
                <h4>Top 10 Cabang - Total Draft dan Biaya</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={branchesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Total Draft" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="Total Biaya (Miliar)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h4>Top 5 Cabang - Distribusi Draft</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={branchesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {branchesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <>
              <div className="chart-card chart-full-width">
                <h4>Top 10 Divisi Korporat - Total Draft dan Biaya</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={divisiChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Total Draft" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="Total Biaya (Miliar)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h4>Top 5 Divisi - Distribusi Draft</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={divisiPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {divisiPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Data Tables */}
      <div className="data-section">
        <h3>Data Detail {activeTab === 'branches' ? '20 Cabang' : '18 Divisi Korporat'}</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Total Draft</th>
                <th>Total Peserta</th>
                <th>Total Biaya</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'branches' ? rekap.branches : rekap.divisi).map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.nama}</strong></td>
                  <td>{item.totalDraft}</td>
                  <td>{item.totalPeserta}</td>
                  <td>{formatCurrency(item.totalBiaya)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

export default RekapGabungan;

