import React, { useState } from 'react';
import './Reports.css';

const Reports = ({ proposals, users, onGenerateReport }) => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleGenerateReport = (reportType) => {
    onGenerateReport(reportType, dateRange);
  };

  const totalBudget = proposals.reduce((sum, p) => sum + p.totalBiaya, 0);
  const approvedBudget = proposals.filter(p => p.status === 'FINAL_APPROVED').reduce((sum, p) => sum + p.totalBiaya, 0);

  return (
    <div className="reports-container">
      <div className="content-header">
        <h2>Laporan</h2>
        <p>Laporan dan statistik sistem pelatihan</p>
      </div>

      <div className="reports-summary">
        <div className="summary-card">
          <h3>Ringkasan Statistik</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Usulan:</span>
              <span className="summary-value">{proposals.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Pengguna:</span>
              <span className="summary-value">{users.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Anggaran:</span>
              <span className="summary-value">Rp {totalBudget.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Anggaran Disetujui:</span>
              <span className="summary-value">Rp {approvedBudget.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-icon">STATS</div>
          <h3>Laporan Bulanan</h3>
          <p>Ringkasan usulan pelatihan bulan ini termasuk status persetujuan dan anggaran</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('monthly')}
          >
            Generate Laporan
          </button>
        </div>
        
        <div className="report-card">
          <div className="report-icon">📈</div>
          <h3>Laporan Tahunan</h3>
          <p>Statistik pelatihan sepanjang tahun dengan analisis tren dan performa</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('yearly')}
          >
            Generate Laporan
          </button>
        </div>
        
        <div className="report-card">
          <div className="report-icon">💰</div>
          <h3>Laporan Budget</h3>
          <p>Analisis anggaran pelatihan, alokasi dana, dan efisiensi penggunaan</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('budget')}
          >
            Generate Laporan
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">USERS</div>
          <h3>Laporan Pengguna</h3>
          <p>Statistik pengguna sistem, aktivitas, dan tingkat partisipasi</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('users')}
          >
            Generate Laporan
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">LIST</div>
          <h3>Laporan Status Usulan</h3>
          <p>Breakdown status usulan pelatihan dan waktu pemrosesan</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('status')}
          >
            Generate Laporan
          </button>
        </div>

        <div className="report-card">
          <div className="report-icon">BRANCH</div>
          <h3>Laporan per Unit</h3>
          <p>Analisis usulan pelatihan berdasarkan unit/divisi</p>
          <button 
            className="btn-primary"
            onClick={() => handleGenerateReport('unit')}
          >
            Generate Laporan
          </button>
        </div>
      </div>

      <div className="custom-report">
        <h3>Laporan Kustom</h3>
        <div className="custom-report-form">
          <div className="form-group">
            <label>Rentang Tanggal:</label>
            <div className="date-range">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="Tanggal Mulai"
              />
              <span>sampai</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                placeholder="Tanggal Akhir"
              />
            </div>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => handleGenerateReport('custom')}
            disabled={!dateRange.startDate || !dateRange.endDate}
          >
            Generate Laporan Kustom
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
