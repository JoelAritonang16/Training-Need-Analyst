import React, { useState, useEffect } from 'react';
import { API_BASE_URL, branchAPI, divisiAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import './AllProposals.css';

const AllProposals = ({ proposals, onFinalApprove, onFinalReject, onViewDetail, onEditProposal, onNavigate, initialStatusFilter, headerTitle, onFilterChange }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [divisiFilter, setDivisiFilter] = useState('all');
  const [branchList, setBranchList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'error'
  });
  
  useEffect(() => {
    fetchBranchAndDivisi();
  }, []);
  
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

  // Apply initial status filter if provided
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

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
      console.error('Export error:', e);
      setAlertModal({
        open: true,
        title: 'Export Gagal',
        message: e.message || 'Gagal mengekspor data. Silakan coba lagi.',
        type: 'error'
      });
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
      console.error('Export error:', e);
      setAlertModal({
        open: true,
        title: 'Export Gagal',
        message: e.message || 'Gagal mengekspor data. Silakan coba lagi.',
        type: 'error'
      });
    }
  };

  // Handle filter changes and notify parent
  useEffect(() => {
    if (onFilterChange) {
      const filters = {
        ...(branchFilter !== 'all' && { branchId: branchFilter }),
        ...(divisiFilter !== 'all' && { divisiId: divisiFilter }),
        ...(statusFilter !== 'all' && { 
          status: statusFilter === 'pending' ? 'MENUNGGU' :
                  statusFilter === 'approved' ? 'APPROVE_ADMIN' :
                  statusFilter === 'waiting' ? 'APPROVE_ADMIN' :
                  statusFilter === 'final_approved' ? 'APPROVE_SUPERADMIN' :
                  statusFilter === 'rejected' ? 'DITOLAK' : undefined
        })
      };
      onFilterChange(filters);
    }
  }, [branchFilter, divisiFilter, statusFilter, onFilterChange]);

  const filteredProposals = proposals.filter(proposal => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'pending' && proposal.status === 'MENUNGGU') ||
      (statusFilter === 'approved' && proposal.status === 'APPROVE_ADMIN') ||
      (statusFilter === 'waiting' && proposal.status === 'APPROVE_ADMIN') ||
      (statusFilter === 'final_approved' && proposal.status === 'APPROVE_SUPERADMIN') ||
      (statusFilter === 'rejected' && proposal.status === 'DITOLAK');
    
    const unitMatch = unitFilter === 'all' || proposal.LevelTingkatan === unitFilter;
    
    const branchMatch = branchFilter === 'all' || 
      (proposal.branchId && Number(proposal.branchId) === Number(branchFilter)) ||
      (proposal.branch && Number(proposal.branch.id) === Number(branchFilter));
    
    const divisiMatch = divisiFilter === 'all' || 
      (proposal.user?.divisiId && Number(proposal.user.divisiId) === Number(divisiFilter)) ||
      (proposal.user?.divisi && Number(proposal.user.divisi.id) === Number(divisiFilter));
    
    return statusMatch && unitMatch && branchMatch && divisiMatch;
  });

  const uniqueUnits = [...new Set(proposals.map(p => p.LevelTingkatan))];

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div className="header-left">
          <h2>{headerTitle || 'Persetujuan Usulan'}</h2>
          <p>Overview lengkap semua usulan pelatihan dalam sistem</p>
        </div>
      </div>
      
      <div className="proposals-filter">
        <select 
          className="filter-select"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
        >
          <option value="all">Semua Branch</option>
          {branchList.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.nama}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={divisiFilter}
          onChange={(e) => setDivisiFilter(e.target.value)}
        >
          <option value="all">Semua Divisi</option>
          {divisiList.map(divisi => (
            <option key={divisi.id} value={divisi.id}>{divisi.nama}</option>
          ))}
        </select>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`status-badge ${proposal.status.toLowerCase().replace(/_/g, '-')}`}>
                  {proposal.status.replace(/_/g, ' ')}
                </span>
                {proposal.isRevision && (
                  <span className="status-badge" style={{ 
                    backgroundColor: '#ff9800', 
                    color: 'white',
                    fontSize: '0.75em',
                    padding: '2px 8px'
                  }}>
                    ⚠️ REVISI
                  </span>
                )}
              </div>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> {proposal.user?.username || proposal.user?.fullName || `User ID ${proposal.userId}`}</p>
              {proposal.branch && <p><strong>Branch:</strong> {proposal.branch.nama}</p>}
              {proposal.user?.divisi && <p><strong>Divisi:</strong> {proposal.user.divisi.nama}</p>}
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Level:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Total Biaya:</strong> {(() => {
                const numValue = parseFloat(proposal.TotalUsulan) || 0;
                if (numValue === 0) return 'Rp 0';
                const inMillions = numValue / 1000000;
                const formatted = inMillions % 1 === 0 
                  ? inMillions.toLocaleString('id-ID', { maximumFractionDigits: 0 })
                  : inMillions.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                return `Rp ${formatted} Juta`;
              })()}</p>
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
                className="btn-export"
                onClick={() => handleExportOne(proposal.id)}
                title="Export Excel untuk usulan ini"
              >
                ↥ Export
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
          <div className="empty-icon">-</div>
          <h3>Tidak Ada Usulan Ditemukan</h3>
          <p>Tidak ada usulan yang sesuai dengan filter yang dipilih.</p>
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

export default AllProposals;
