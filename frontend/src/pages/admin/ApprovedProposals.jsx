import React from 'react';
import './ApprovedProposals.css';

const ApprovedProposals = ({ proposals, onConfirmToSuperAdmin, onViewDetail }) => {
  const approvedProposals = proposals.filter(p => p.status === 'APPROVE_ADMIN');

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
              <h3>{proposal.Uraian}</h3>
              <span className="status-badge approved">
                DISETUJUI ADMIN
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Level Tingkatan:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.TotalUsulan.toLocaleString('id-ID')}</p>
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
