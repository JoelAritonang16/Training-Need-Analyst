import React from 'react';
import './ApprovedProposals.css';

const ApprovedProposals = ({ proposals, onConfirmToSuperAdmin, onViewDetail }) => {
  const approvedProposals = proposals.filter(p => p.status === 'APPROVED_BY_ADMIN');

  return (
    <div className="proposals-container">
      <div className="content-header">
        <h2>Usulan yang Disetujui</h2>
        <p>Usulan yang telah disetujui dan siap dikonfirmasi ke Super Admin</p>
      </div>
      
      <div className="proposals-grid">
        {approvedProposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.uraian}</h3>
              <span className="status-badge approved">
                DISETUJUI
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> {proposal.pengaju}</p>
              <p><strong>Unit/Divisi:</strong> {proposal.unit}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {proposal.waktuPelaksanaan}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.totalBiaya.toLocaleString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-confirm"
                onClick={() => onConfirmToSuperAdmin(proposal.id)}
              >
                Konfirmasi ke Super Admin
              </button>
              <button 
                className="btn-detail"
                onClick={() => onViewDetail(proposal.id)}
              >
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {approvedProposals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Tidak Ada Usulan Disetujui</h3>
          <p>Belum ada usulan yang disetujui untuk dikonfirmasi ke Super Admin.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovedProposals;
