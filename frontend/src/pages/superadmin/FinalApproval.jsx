import React from 'react';
import './FinalApproval.css';

const FinalApproval = ({ proposals, onFinalApprove, onFinalReject, onViewDetail }) => {
  const waitingFinalApproval = proposals.filter(p => p.status === 'APPROVE_ADMIN');

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div>
          <h2>Persetujuan Akhir Super Admin</h2>
          <p>Review dan berikan persetujuan akhir untuk usulan pelatihan</p>
        </div>
      </div>
      
      <div className="proposals-grid">
        {waitingFinalApproval.map(proposal => (
          <div key={proposal.id} className="proposal-card final-approval">
            <div className="proposal-header">
              <h3>{proposal.Uraian}</h3>
              <span className="status-badge waiting">
                MENUNGGU PERSETUJUAN FINAL
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Level:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.TotalUsulan.toLocaleString('id-ID')}</p>
              <p><strong>Tanggal Pengajuan:</strong> {new Date(proposal.created_at).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-final-approve"
                onClick={() => onFinalApprove(proposal.id)}
              >
                Setujui Final
              </button>
              <button 
                className="btn-final-reject"
                onClick={() => onFinalReject(proposal.id)}
              >
                Tolak Final
              </button>
              <button 
                className="btn-detail"
                onClick={() => onViewDetail(proposal.id)}
              >
                Detail Lengkap
              </button>
            </div>
          </div>
        ))}
      </div>

      {waitingFinalApproval.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h3>Tidak Ada Usulan Menunggu Persetujuan</h3>
          <p>Semua usulan telah diproses. Tidak ada usulan yang menunggu persetujuan akhir Super Admin.</p>
        </div>
      )}
    </div>
  );
};

export default FinalApproval;
