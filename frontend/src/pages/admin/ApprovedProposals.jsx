import React from 'react';
import './ApprovedProposals.css';

const ApprovedProposals = ({ proposals, onConfirmToUser, onViewDetail }) => {
  // Proposal yang sudah disetujui superadmin dan perlu dikonfirmasi ke user
  const approvedProposals = proposals.filter(p => p.status === 'APPROVE_SUPERADMIN');

  return (
    <div className="proposals-container">
      <div className="content-header">
        <h2>Usulan yang Disetujui Superadmin</h2>
        <p>Usulan yang telah disetujui superadmin dan perlu dikonfirmasi ke user</p>
      </div>
      
      <div className="proposals-grid">
        {approvedProposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.Uraian}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="status-badge approved">
                  DISETUJUI SUPERADMIN
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
              <p><strong>Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Level Tingkatan:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.TotalUsulan.toLocaleString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-confirm"
                onClick={() => onConfirmToUser(proposal.id)}
              >
                Konfirmasi ke User
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
          <div className="empty-icon">-</div>
          <h3>Tidak Ada Usulan Disetujui</h3>
          <p>Belum ada usulan yang disetujui superadmin untuk dikonfirmasi ke user.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovedProposals;
