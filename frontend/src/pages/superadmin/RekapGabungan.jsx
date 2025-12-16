import React, { useState, useEffect, useRef } from 'react';
import {
  LuUsers,
  LuCheckCircle2,
  LuClipboardList,
  LuFileText,
  LuMapPin,
  LuWallet,
  LuDownload,
  LuPrinter,
} from 'react-icons/lu';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { demografiAPI, branchAPI, divisiAPI } from '../../utils/api';
import './RekapGabungan.css';

const RekapGabungan = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchList, setBranchList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDivisi, setSelectedDivisi] = useState('all');
  const dashboardRef = useRef(null);
  const [printOrientation, setPrintOrientation] = useState('portrait');

  useEffect(() => {
    fetchBranchAndDivisi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, selectedDivisi]);

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
    } catch (err) {
      console.error('Error fetching branch/divisi:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (selectedBranch !== 'all') filters.branchId = selectedBranch;
      if (selectedDivisi !== 'all') filters.divisiId = selectedDivisi;

      const result = await demografiAPI.getData(filters);
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.message || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      if (!dashboardData) {
        alert('Tidak ada data untuk diexport');
        return;
      }

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Dashboard Demografi SDM');

      // Title
      worksheet.mergeCells('A1:D1');
      worksheet.getCell('A1').value = 'DASHBOARD DEMOGRAFI SDM - KONSOLIDASI SPMT';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

      // Filter info
      worksheet.getCell('A2').value = 'Filter:';
      worksheet.getCell('B2').value = getFilterLabel();
      worksheet.getCell('A2').font = { bold: true };

      let row = 4;
      
      // Stats Summary
      worksheet.getCell(`A${row}`).value = 'RINGKASAN STATISTIK';
      worksheet.getCell(`A${row}`).font = { size: 14, bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Total Pengguna';
      worksheet.getCell(`B${row}`).value = dashboardData.totalUsers || 0;
      row++;
      worksheet.getCell(`A${row}`).value = 'Total Usulan';
      worksheet.getCell(`B${row}`).value = dashboardData.totalProposals || 0;
      row++;
      worksheet.getCell(`A${row}`).value = 'Total Anggaran Disetujui';
      worksheet.getCell(`B${row}`).value = `Rp ${((dashboardData.totalBudgetAllApproved || 0) / 1000000).toFixed(2)} Juta`;
      row += 2;

      // Jenis Pekerja
      worksheet.getCell(`A${row}`).value = 'JENIS PEKERJA';
      worksheet.getCell(`A${row}`).font = { size: 14, bold: true };
      row++;
      worksheet.getCell(`A${row}`).value = 'Kategori';
      worksheet.getCell(`B${row}`).value = 'Jumlah Usulan';
      worksheet.getRow(row).font = { bold: true };
      row++;
      Object.entries(dashboardData.jenisPekerja || {}).forEach(([key, value]) => {
        worksheet.getCell(`A${row}`).value = key;
        worksheet.getCell(`B${row}`).value = value;
        row++;
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 25;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dashboard_Demografi_SDM_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Gagal mengexport ke Excel. Pastikan library ExcelJS sudah terinstall.');
    }
  };

  const handlePrint = () => {
      if (!dashboardData) {
      alert('Tidak ada data untuk dicetak');
        return;
      }

    // Create or update dynamic style for print orientation
    let printStyle = document.getElementById('print-orientation-style');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'print-orientation-style';
      document.head.appendChild(printStyle);
    }

    const pageSize = printOrientation === 'landscape' ? 'A4 landscape' : 'A4 portrait';
    printStyle.textContent = `
      @media print {
        @page { size: ${pageSize}; }
      }
    `;

    setTimeout(() => {
      window.print();
      const cleanup = () => {
        if (printStyle && printStyle.parentNode) {
          printStyle.parentNode.removeChild(printStyle);
        }
        window.removeEventListener('afterprint', cleanup);
      };
      window.addEventListener('afterprint', cleanup);
    }, 200);
  };

  const getFilterLabel = () => {
    if (selectedBranch !== 'all' && selectedDivisi !== 'all') {
      const branch = branchList.find(b => b.id === parseInt(selectedBranch));
      const divisi = divisiList.find(d => d.id === parseInt(selectedDivisi));
      return `${branch?.nama || ''} - ${divisi?.nama || ''}`;
    } else if (selectedBranch !== 'all') {
      const branch = branchList.find(b => b.id === parseInt(selectedBranch));
      return branch?.nama || 'Branch Terpilih';
    } else if (selectedDivisi !== 'all') {
      const divisi = divisiList.find(d => d.id === parseInt(selectedDivisi));
      return divisi?.nama || 'Divisi Terpilih';
    }
    return 'Rekap Gabungan SPMT (Semua Branch)';
  };

  // Prepare chart data
  const proposalStatusData = dashboardData ? [
    { name: 'Menunggu', value: dashboardData.pendingCount || 0, color: '#FFA500' },
    { name: 'Disetujui Admin', value: dashboardData.waitingFinalCount || 0, color: '#4CAF50' },
    { name: 'Disetujui Superadmin', value: dashboardData.finalApprovedCount || 0, color: '#2196F3' },
    { name: 'Ditolak', value: dashboardData.rejectedCount || 0, color: '#F44336' },
  ].filter(item => item.value > 0) : [];

  const budgetByStatusData = dashboardData ? [
    { name: 'Menunggu', value: dashboardData.totalBudgetRequested || 0, color: '#FFA500' },
    { name: 'Disetujui Admin', value: dashboardData.totalBudgetApprovedAdmin || 0, color: '#4CAF50' },
    { name: 'Disetujui Superadmin', value: dashboardData.totalBudgetApprovedFinal || 0, color: '#2196F3' },
  ].filter(item => item.value > 0) : [];

// Dipakai untuk chart Rincian Biaya (print) agar sesuai tampilan dashboard
const costBreakdownData = budgetByStatusData;

// Tambahan chart: Anggaran vs Realisasi
const anggaranRealisasiData = dashboardData ? [
  { name: 'Anggaran Disetujui', value: dashboardData.totalBudgetAllApproved || 0, color: '#3b82f6' },
  { name: 'Biaya Realisasi', value: dashboardData.totalBiayaRealisasi || 0, color: '#10b981' },
].filter(item => item.value > 0) : [];

// Tambahan chart: Peserta Realisasi vs Disetujui
const pesertaRealisasiData = dashboardData ? [
  { name: 'Peserta Realisasi', value: dashboardData.totalPesertaRealisasi || 0, color: '#3b82f6' },
  { name: 'Peserta Disetujui', value: dashboardData.totalParticipantsApproved || 0, color: '#f97316' },
  ].filter(item => item.value > 0) : [];

  const draftStatusData = dashboardData ? [
    { name: 'Draft', value: dashboardData.draftStatus?.Draft || 0, color: '#2196F3' },
    { name: 'Submitted', value: dashboardData.draftStatus?.Submitted || 0, color: '#FF9800' },
    { name: 'Approved', value: dashboardData.draftStatus?.Approved || 0, color: '#4CAF50' },
  ].filter(d => d.value > 0) : [];

  const jenisPekerjaData = dashboardData ? [
    { name: 'Struktural', value: dashboardData.jenisPekerja?.Struktural || 0 },
    { name: 'Non Struktural', value: dashboardData.jenisPekerja?.['Non Struktural'] || 0 }
  ].filter(item => item.value > 0 || true) : [];

  // Data untuk print format tabel
  const getPrintData = () => {
    if (!dashboardData) return null;
    
    const jenisPekerjaUser = dashboardData.jenisPekerjaUser || {};
    const pusatPelayanan = dashboardData.pusatPelayanan || {};
    const jenisKelamin = dashboardData.jenisKelamin || {};
    const pendidikan = dashboardData.pendidikan || {};

    return {
      jenisPekerja: {
        organik: jenisPekerjaUser['Organik'] || 0,
        nonOrganik: jenisPekerjaUser['Non Organik'] || 0,
        total: jenisPekerjaUser.total || 0
      },
      pusatPelayanan: {
        operasional: pusatPelayanan['Operasional'] || 0,
        nonOperasional: pusatPelayanan['Non Operasional'] || 0,
        total: pusatPelayanan.total || 0
      },
      jenisKelamin: {
        lakiLaki: jenisKelamin['Laki-laki'] || 0,
        perempuan: jenisKelamin['Perempuan'] || 0,
        total: jenisKelamin.total || 0
      },
      pendidikan: {
        s3: pendidikan['S3'] || 0,
        s2: pendidikan['S2'] || 0,
        s1: pendidikan['S1'] || 0,
        diploma: pendidikan['Diploma'] || 0,
        sma: pendidikan['SMA'] || 0,
        total: pendidikan.total || 0
      }
    };
  };

  const printData = getPrintData();

  if (loading && !dashboardData) {
    return (
      <div className="rekap-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rekap-container">
        <div className="error-state">
          <div className="error-icon">!</div>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchDashboardData}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const isLoadingFilter = loading && dashboardData;

  return (
    <div className="rekap-container" ref={dashboardRef}>
      {/* Print-Only Section - Format sesuai SPMT.pdf */}
      <div className="print-only-section">
        {/* Header Kuning */}
        <div className="print-header-yellow">
          <h1 className="print-title-main">DAERAH : {selectedBranch === 'all' ? 'ALL' : branchList.find(b => b.id === parseInt(selectedBranch))?.nama || 'ALL'} - Konsolidasi SPMT ({selectedBranch === 'all' ? 'Semua Daerah' : branchList.find(b => b.id === parseInt(selectedBranch))?.nama || 'Semua Daerah'})</h1>
          <h2 className="print-title-sub">DEMOGRAFI SDM - Konsolidasi SPMT ({selectedBranch === 'all' ? 'Semua Daerah' : branchList.find(b => b.id === parseInt(selectedBranch))?.nama || 'Semua Daerah'})</h2>
          <h3 className="print-title-company">PT PELINDO MULTI TERMINAL GRUP</h3>
        </div>

        {printData && (
          <>
            {/* Charts Section Biru - 4 Charts Horizontal (menggunakan data tampilan dashboard) */}
            <div className="print-charts-section-blue">
              <h4 className="print-section-title">KONSOLIDASI SPMT-ALL</h4>
              <div className="print-charts-grid-horizontal">
                {/* Chart Jenis Pekerja (Struktural / Non Struktural) */}
                {jenisPekerjaData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">JENIS PEKERJA</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={jenisPekerjaData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {jenisPekerjaData.map((entry, index) => (
                                <Cell key={`cell-jp-${index}`} fill={entry.color || (index === 0 ? '#1e40af' : '#60a5fa')} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} Usulan`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {jenisPekerjaData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">{item.value} Usulan</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Status Usulan */}
                {proposalStatusData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">STATUS USULAN</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={proposalStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {proposalStatusData.map((entry, index) => (
                                <Cell key={`cell-su-${index}`} fill={entry.color || '#3b82f6'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} Usulan`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {proposalStatusData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">{item.value} Usulan</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Rincian Biaya */}
                {costBreakdownData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">RINCIAN BIAYA</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={costBreakdownData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {costBreakdownData.map((entry, index) => (
                                <Cell key={`cell-rb-${index}`} fill={entry.color || '#3b82f6'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')} Juta`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {costBreakdownData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">Rp {item.value.toLocaleString('id-ID')} Juta</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Status Draft TNA */}
                {draftStatusData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">STATUS DRAFT TNA</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={draftStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {draftStatusData.map((entry, index) => (
                                <Cell key={`cell-ds-${index}`} fill={entry.color || '#3b82f6'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} Draft`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {draftStatusData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">{item.value} Draft</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Anggaran vs Realisasi */}
                {anggaranRealisasiData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">ANGGARAN VS REALISASI</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={anggaranRealisasiData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {anggaranRealisasiData.map((entry, index) => (
                                <Cell key={`cell-ar-${index}`} fill={entry.color || (index === 0 ? '#3b82f6' : '#10b981')} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')} Juta`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {anggaranRealisasiData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">Rp {item.value.toLocaleString('id-ID')} Juta</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chart Peserta Realisasi */}
                {pesertaRealisasiData.length > 0 && (
                  <div className="print-chart-card">
                    <h4 className="print-chart-title">PESERTA REALISASI</h4>
                    <div className="print-chart-wrapper">
                      <div className="print-chart-visualization">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pesertaRealisasiData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                              outerRadius={70}
                              innerRadius={40}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {pesertaRealisasiData.map((entry, index) => (
                                <Cell key={`cell-pr-${index}`} fill={entry.color || (index === 0 ? '#3b82f6' : '#f97316')} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} Peserta`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="print-chart-legend">
                        {pesertaRealisasiData.map(item => (
                          <div key={item.name} className="print-legend-item">
                            <span className="print-legend-label">{item.name}</span>
                            <span className="print-legend-value">{item.value} Peserta</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabel Demografi - Format sesuai data project */}
            <div className="print-table-section">
              <table className="print-demografi-table">
                <thead>
                  <tr>
                    <th><strong>KONSOLIDASI SPMT - ALL</strong></th>
                    <th><strong>PUSAT PELAYANAN</strong></th>
                    <th><strong>JENIS KELAMIN</strong></th>
                    <th><strong>PENDIDIKAN</strong></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{printData.jenisPekerja.organik.toFixed(2)}</td>
                    <td>{printData.pusatPelayanan.operasional.toFixed(2)}</td>
                    <td>{printData.jenisKelamin.lakiLaki.toFixed(2)}</td>
                    <td>{printData.pendidikan.s3.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>{printData.jenisPekerja.nonOrganik.toFixed(2)}</td>
                    <td>{printData.pusatPelayanan.nonOperasional.toFixed(2)}</td>
                    <td>{printData.jenisKelamin.perempuan.toFixed(2)}</td>
                    <td>{printData.pendidikan.s2.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td><strong>Total</strong></td>
                    <td><strong>Total</strong></td>
                    <td>{printData.pendidikan.s1.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>{printData.jenisPekerja.total.toFixed(2)}</td>
                    <td>{printData.pusatPelayanan.total.toFixed(2)}</td>
                    <td>{printData.jenisKelamin.total.toFixed(2)}</td>
                    <td>{printData.pendidikan.diploma.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{printData.pendidikan.sma.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><strong>Total</strong></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{printData.pendidikan.total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tabel Jumlah - Format sesuai data project */}
            <div className="print-table-section">
              <table className="print-jumlah-table">
                <thead>
                  <tr>
                    <th><strong>JUMLAH - ALL</strong></th>
                    <th><strong>Rp {((dashboardData?.produktivitas || 0) / 1000000).toFixed(0)}.000.000</strong></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>PENDIDIKAN</strong></td>
                    <td>{(dashboardData?.bopo || 0).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td><strong>KONSOLIDASI SPMT</strong></td>
                    <td>{(dashboardData?.rasioBeban || 0).toFixed(0)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {isLoadingFilter && (
        <div className="loading-overlay">
          <div className="loading-spinner-small"></div>
        </div>
      )}

      {/* Header with Filters */}
      <div className="demografi-header">
        <div className="header-filters">
          <select
            className="filter-dropdown"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">Rekap Gabungan SPMT () (ALL)</option>
            {branchList.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.nama}
              </option>
            ))}
          </select>

          <select
            className="filter-dropdown"
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
          >
            <option value="all">
              Rekap Gabungan all {dashboardData ? `(${dashboardData.totalUsers || 0} data)` : ''}
            </option>
            {divisiList.map(divisi => (
              <option key={divisi.id} value={divisi.id}>
                {divisi.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Banner */}
      <div className="demografi-banner">
        <h2>
          {selectedBranch === 'all' && selectedDivisi === 'all' 
            ? 'REKAP GABUNGAN SPMT - ALL' 
            : `REKAP GABUNGAN SPMT - ${getFilterLabel().toUpperCase()}`}
        </h2>
      </div>

      {/* Stats Grid - Sama seperti dashboard utama */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.totalUsers || 0}</h3>
            <p>Total Pengguna</p>
            <small>{dashboardData?.activeUsers || 0} aktif</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuClipboardList size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.totalProposals || 0}</h3>
            <p>Total Usulan</p>
            <small>{dashboardData?.pendingCount || 0} menunggu</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuCheckCircle2 size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.finalApprovedCount || 0}</h3>
            <p>Disetujui Final</p>
            <small>Filter: {getFilterLabel()}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={18} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {((dashboardData?.totalBudgetAllApproved || 0) / 1000000).toFixed(2)} Juta
            </h3>
            <p>Total Anggaran Disetujui</p>
            <small>Admin + Superadmin</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuWallet size={18} /></div>
          <div className="stat-content">
            <h3>
              Rp{" "}
              {((dashboardData?.totalBiayaRealisasi || 0) / 1000000).toFixed(2)} Juta
            </h3>
            <p>Total Biaya Realisasi</p>
            <small>Diklat yang telah terlaksana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuUsers size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.totalPesertaRealisasi || 0}</h3>
            <p>Total Peserta Realisasi</p>
            <small>Diklat yang telah terlaksana</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuFileText size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.totalDrafts || 0}</h3>
            <p>Draft TNA</p>
            <small>Filter: {getFilterLabel()}</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><LuMapPin size={18} /></div>
          <div className="stat-content">
            <h3>{dashboardData?.totalRealisasi || 0}</h3>
            <p>Tempat Diklat Realisasi</p>
            <small>Per bulan</small>
          </div>
        </div>
      </div>

      {/* Export Buttons - Positioned after stats grid */}
      <div className="export-actions-container">
        <button className="btn-export-excel" onClick={handleExportExcel} disabled={loading || !dashboardData}>
          <LuDownload size={16} style={{ marginRight: '8px' }} />
          Export Excel
        </button>
        <div className="print-actions-group">
          <select
            className="print-orientation-select"
            value={printOrientation}
            onChange={(e) => setPrintOrientation(e.target.value)}
            disabled={loading || !dashboardData}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
          <button className="btn-export-pdf" onClick={handlePrint} disabled={loading || !dashboardData}>
            <LuPrinter size={16} style={{ marginRight: '8px' }} />
            Print
        </button>
        </div>
      </div>

      {/* Charts Section - Style seperti referensi */}
      <div className="charts-section">
        <h3>Grafik dan Analisis</h3>
        
        <div className="charts-grid-donut">

          {/* Jenis Pekerja Chart - Style seperti referensi */}
          <div className="chart-card-donut">
            <h4 className="chart-title-donut">JENIS PEKERJA</h4>
            <div className="chart-donut-wrapper">
              <div className="chart-donut-visualization">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jenisPekerjaData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={90}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {jenisPekerjaData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : '#60a5fa'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} Usulan`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-donut-table">
                <table>
                  <tbody>
                    {jenisPekerjaData.map((item, index) => (
                      <tr key={item.name}>
                        <td className="table-label-donut">{item.name}</td>
                        <td className="table-value-donut">
                          <div className="table-bar-container-donut">
                            <div
                              className="table-bar-donut"
                              style={{
                                width: `${Math.max(10, (item.value / (jenisPekerjaData.reduce((sum, d) => sum + d.value, 0) || 1)) * 100)}%`,
                                backgroundColor: index === 0 ? '#1e40af' : '#60a5fa'
                              }}
                            ></div>
                            <span className="table-value-text-donut">{item.value} Usulan</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Status Usulan Chart - Style seperti referensi */}
          {proposalStatusData.length > 0 && (
            <div className="chart-card-donut">
              <h4 className="chart-title-donut">STATUS USULAN</h4>
              <div className="chart-donut-wrapper">
                <div className="chart-donut-visualization">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={proposalStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={90}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {proposalStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} Usulan`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-donut-table">
                  <table>
                    <tbody>
                      {proposalStatusData.map((item, index) => (
                        <tr key={item.name}>
                          <td className="table-label-donut">{item.name}</td>
                          <td className="table-value-donut">
                            <div className="table-bar-container-donut">
                              <div
                                className="table-bar-donut"
                                style={{
                                  width: `${Math.max(10, (item.value / (proposalStatusData.reduce((sum, d) => sum + d.value, 0) || 1)) * 100)}%`,
                                  backgroundColor: item.color
                                }}
                              ></div>
                              <span className="table-value-text-donut">{item.value} Usulan</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Budget Status Chart - Style seperti referensi */}
          {budgetByStatusData.length > 0 && (
            <div className="chart-card-donut">
              <h4 className="chart-title-donut">RINCIAN BIAYA</h4>
              <div className="chart-donut-wrapper">
                <div className="chart-donut-visualization">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={budgetByStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={90}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {budgetByStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rp ${(value / 1000000).toFixed(2)} Juta`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-donut-table">
                  <table>
                    <tbody>
                      {budgetByStatusData.map((item, index) => (
                        <tr key={item.name}>
                          <td className="table-label-donut">{item.name}</td>
                          <td className="table-value-donut">
                            <div className="table-bar-container-donut">
                              <div
                                className="table-bar-donut"
                                style={{
                                  width: `${Math.max(10, (item.value / (budgetByStatusData.reduce((sum, d) => sum + d.value, 0) || 1)) * 100)}%`,
                                  backgroundColor: item.color
                                }}
                              ></div>
                              <span className="table-value-text-donut">Rp {((item.value || 0) / 1000000).toFixed(2)} Juta</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Draft Status Chart - Style seperti referensi */}
          {draftStatusData.length > 0 && (
            <div className="chart-card-donut">
              <h4 className="chart-title-donut">STATUS DRAFT TNA</h4>
              <div className="chart-donut-wrapper">
                <div className="chart-donut-visualization">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={draftStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={90}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {draftStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} Draft`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-donut-table">
                  <table>
                    <tbody>
                      {draftStatusData.map((item, index) => (
                        <tr key={item.name}>
                          <td className="table-label-donut">{item.name}</td>
                          <td className="table-value-donut">
                            <div className="table-bar-container-donut">
                              <div
                                className="table-bar-donut"
                                style={{
                                  width: `${Math.max(10, (item.value / (draftStatusData.reduce((sum, d) => sum + d.value, 0) || 1)) * 100)}%`,
                                  backgroundColor: item.color
                                }}
                              ></div>
                              <span className="table-value-text-donut">{item.value} Draft</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default RekapGabungan;
