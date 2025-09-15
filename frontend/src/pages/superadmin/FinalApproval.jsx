import React from 'react';
import './FinalApproval.css';

const FinalApproval = ({ proposals, onFinalApprove, onFinalReject, onViewDetail }) => {
  const waitingFinalApproval = proposals.filter(p => p.status === 'WAITING_SUPERADMIN_APPROVAL');

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
              <h3>{proposal.uraian}</h3>
              <span className="status-badge waiting">
                MENUNGGU PERSETUJUAN AKHIR
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> {proposal.pengaju}</p>
              <p><strong>Unit/Divisi:</strong> {proposal.unit}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {proposal.waktuPelaksanaan}</p>
              <p><strong>Level:</strong> {proposal.level}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.jumlahPeserta} orang</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.totalBiaya.toLocaleString('id-ID')}</p>
              <p><strong>Tanggal Pengajuan:</strong> {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}</p>
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
