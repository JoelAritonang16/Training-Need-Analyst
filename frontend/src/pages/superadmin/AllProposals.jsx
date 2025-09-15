import React, { useState } from 'react';
import './AllProposals.css';

const AllProposals = ({ proposals, onFinalApprove, onFinalReject, onViewDetail, onEditProposal }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  const filteredProposals = proposals.filter(proposal => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'pending' && proposal.status === 'PENDING') ||
      (statusFilter === 'approved' && proposal.status === 'APPROVED_BY_ADMIN') ||
      (statusFilter === 'waiting' && proposal.status === 'WAITING_SUPERADMIN_APPROVAL') ||
      (statusFilter === 'final_approved' && proposal.status === 'FINAL_APPROVED') ||
      (statusFilter === 'rejected' && (proposal.status === 'REJECTED' || proposal.status === 'FINAL_REJECTED'));
    
    const unitMatch = unitFilter === 'all' || proposal.unit === unitFilter;
    
    return statusMatch && unitMatch;
  });

  const uniqueUnits = [...new Set(proposals.map(p => p.unit))];

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div>
          <h2>Semua Usulan Pelatihan</h2>
          <p>Overview lengkap semua usulan pelatihan dalam sistem</p>
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
              <h3>{proposal.uraian}</h3>
              <span className={`status-badge ${proposal.status.toLowerCase().replace(/_/g, '-')}`}>
                {proposal.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> {proposal.pengaju}</p>
              <p><strong>Unit/Divisi:</strong> {proposal.unit}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {proposal.waktuPelaksanaan}</p>
              <p><strong>Level:</strong> {proposal.level}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.totalBiaya.toLocaleString('id-ID')}</p>
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
