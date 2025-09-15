import React from 'react';
import './TrainingProposalList.css';

const TrainingProposalList = ({ proposals, onEdit, onViewDetail }) => {
  return (
    <div className="proposals-container">
      <div className="content-header">
        <h2>Usulan Pelatihan Saya</h2>
        <p>Daftar usulan pelatihan yang telah Anda ajukan</p>
      </div>
      
      <div className="proposals-grid">
        {proposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.uraian}</h3>
              <span className={`status-badge ${proposal.status.toLowerCase()}`}>
                {proposal.status}
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Waktu Pelaksanaan:</strong> {proposal.waktuPelaksanaan}</p>
              <p><strong>Tanggal Pengajuan:</strong> {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.totalBiaya.toLocaleString('id-ID')}</p>
            </div>
            <div className="proposal-actions">
              <button 
                className="btn-detail"
                onClick={() => onViewDetail(proposal.id)}
              >
                Detail
              </button>
              {proposal.status === 'PENDING' && (
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(proposal.id)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {proposals.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Belum Ada Usulan Pelatihan</h3>
          <p>Anda belum mengajukan usulan pelatihan. Mulai ajukan usulan pelatihan pertama Anda.</p>
        </div>
      )}
    </div>
  );
};

export default TrainingProposalList;
