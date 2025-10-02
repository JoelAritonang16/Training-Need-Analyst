import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import './AllProposals.css';

const AllProposals = ({ proposals, onFinalApprove, onFinalReject, onViewDetail, onEditProposal, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/training-proposals/export.xlsx`, {
        method: 'GET',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Gagal mengunduh CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training_proposals_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || 'Export gagal');
    }
  };

  const handleExportOne = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/training-proposals/${id}/export.xlsx`, {
        method: 'GET',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Gagal mengunduh CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training_proposal_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || 'Export gagal');
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'pending' && proposal.status === 'MENUNGGU') ||
      (statusFilter === 'approved' && proposal.status === 'APPROVE_ADMIN') ||
      (statusFilter === 'waiting' && proposal.status === 'APPROVE_ADMIN') ||
      (statusFilter === 'final_approved' && proposal.status === 'APPROVE_SUPERADMIN') ||
      (statusFilter === 'rejected' && proposal.status === 'DITOLAK');
    
    const unitMatch = unitFilter === 'all' || proposal.LevelTingkatan === unitFilter;
    
    return statusMatch && unitMatch;
  });

  const uniqueUnits = [...new Set(proposals.map(p => p.LevelTingkatan))];

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div className="header-left">
          <h2>Semua Usulan Pelatihan</h2>
          <p>Overview lengkap semua usulan pelatihan dalam sistem</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>Export CSV</button>
          <select className="filter-select" onChange={(e)=>{
            const v = e.target.value;
            if (!v) return;
            if (v === 'approval') onNavigate && onNavigate('proposal-approval');
            if (v === 'approved') onNavigate && onNavigate('approved-proposals');
            if (v === 'final') onNavigate && onNavigate('final-approval');
            e.target.value = '';
          }} defaultValue="">
            <option value="" disabled>Pintasan Halaman</option>
            <option value="approval">Persetujuan Usulan</option>
            <option value="approved">Usulan Disetujui</option>
            <option value="final">Persetujuan Akhir</option>
          </select>
        </div>
      </div>
      
      <div className="proposals-filter">
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Disetujui Admin</option>
          <option value="waiting">Menunggu Super Admin</option>
          <option value="final_approved">Disetujui Final</option>
          <option value="rejected">Ditolak</option>
        </select>
        <select 
          className="filter-select"
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
        >
          <option value="all">Semua Unit</option>
          {uniqueUnits.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>
      
      <div className="proposals-grid">
        {filteredProposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.Uraian}</h3>
              <span className={`status-badge ${proposal.status.toLowerCase().replace(/_/g, '-')}`}>
                {proposal.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Level:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.TotalUsulan?.toLocaleString('id-ID') || '0'}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-detail"
                onClick={() => onViewDetail(proposal.id)}
              >
                Detail
              </button>
              <button 
                className="btn-edit"
                onClick={() => onEditProposal(proposal.id)}
              >
                Edit
              </button>
              <button
                className="btn-detail"
                onClick={() => handleExportOne(proposal.id)}
              >
                Export CSV
              </button>
              {proposal.status === 'WAITING_SUPERADMIN_APPROVAL' && (
                <>
                  <button 
                    className="btn-final-approve"
                    onClick={() => onFinalApprove(proposal.id)}
                  >
                    Setujui
                  </button>
                  <button 
                    className="btn-final-reject"
                    onClick={() => onFinalReject(proposal.id)}
                  >
                    Tolak
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Tidak Ada Usulan Ditemukan</h3>
          <p>Tidak ada usulan yang sesuai dengan filter yang dipilih.</p>
        </div>
      )}
    </div>
  );
};

export default AllProposals;
