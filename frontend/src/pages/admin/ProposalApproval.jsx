import React from 'react';
import './ProposalApproval.css';

const ProposalApproval = ({ proposals, onApprove, onReject, onViewDetail }) => {
  const pendingProposals = proposals.filter(p => p.status === 'PENDING');

  return (
    <div className="proposals-container">
      <div className="content-header">
        <h2>Persetujuan Usulan Pelatihan</h2>
        <p>Review dan setujui usulan pelatihan dari pengguna</p>
      </div>
      
      <div className="proposals-grid">
        {pendingProposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.uraian}</h3>
              <span className={`status-badge ${proposal.status.toLowerCase()}`}>
                {proposal.status}
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> {proposal.pengaju}</p>
              <p><strong>Unit/Divisi:</strong> {proposal.unit}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {proposal.waktuPelaksanaan}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.jumlahPeserta} orang</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.totalBiaya.toLocaleString('id-ID')}</p>
              <p><strong>Tanggal Pengajuan:</strong> {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-approve"
                onClick={() => onApprove(proposal.id)}
              >
                Setujui
              </button>
              <button 
                className="btn-reject"
                onClick={() => onReject(proposal.id)}
              >
                Tolak
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

      {pendingProposals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>Tidak Ada Usulan Pending</h3>
          <p>Semua usulan pelatihan telah diproses. Tidak ada usulan yang menunggu persetujuan.</p>
        </div>
      )}
    </div>
  );
};

export default ProposalApproval;
