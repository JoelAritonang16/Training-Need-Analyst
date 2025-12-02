import React from 'react';
import './ApprovedProposals.css';

const ApprovedProposals = ({ proposals, onViewDetail }) => {
  // Proposal yang sudah disetujui superadmin dan perlu dikonfirmasi ke user
  const approvedProposals = proposals.filter(p => p.status === 'APPROVE_SUPERADMIN');

  return (
    <div className="proposals-container">
      <div className="content-header">
        <h2>Usulan yang Disetujui Superadmin</h2>
        <p>Usulan yang telah disetujui superadmin</p>
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
                    backgroundColor: '#fff3e0', 
                    color: '#e65100',
                    border: '1px solid #ffb74d',
                    fontSize: '0.7rem',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    ⚠️ REVISI
                  </span>
                )}
              </div>
            </div>
            <div className="proposal-details">
              <p><strong>📋 Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>📅 Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
              <p><strong>👥 Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>📊 Level Tingkatan:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>💰 Total Biaya:</strong> Rp {proposal.TotalUsulan?.toLocaleString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-detail"
                onClick={() => onViewDetail(proposal.id)}
              >
                <i className="fas fa-eye"></i> Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {approvedProposals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Tidak Ada Usulan Disetujui</h3>
          <p>Belum ada usulan yang disetujui superadmin.</p>
        </div>
      )}
    </div>
  );
};

export default ApprovedProposals;
