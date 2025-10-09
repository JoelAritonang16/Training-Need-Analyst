import React from 'react';
import { API_BASE_URL } from '../../utils/api';
import './ProposalApproval.css';

const ProposalApproval = ({ proposals, onApprove, onReject, onViewDetail }) => {
  const pendingProposals = proposals.filter(p => p.status === 'MENUNGGU');

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : undefined;
      const res = await fetch(`${API_BASE_URL}/api/training-proposals/export.xlsx`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(userId ? { 'X-User-Id': String(userId) } : {}),
        }
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
      alert(e.message || 'Export gagal');
    }
  };

  const handleExportOne = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : undefined;
      const res = await fetch(`${API_BASE_URL}/api/training-proposals/${id}/export.xlsx`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(userId ? { 'X-User-Id': String(userId) } : {}),
        }
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
      alert(e.message || 'Export gagal');
    }
  };

  return (
    <div className="proposals-container">
      <div className="content-header">
        <div>
          <h2>Persetujuan Usulan Pelatihan</h2>
          <p>Review dan setujui usulan pelatihan dari pengguna</p>
        </div>
       
      </div>
      
      <div className="proposals-grid">
        {pendingProposals.map(proposal => (
          <div key={proposal.id} className="proposal-card">
            <div className="proposal-header">
              <h3>{proposal.Uraian}</h3>
              <span className={`status-badge ${proposal.status.toLowerCase()}`}>
                {proposal.status}
              </span>
            </div>
            <div className="proposal-details">
              <p><strong>Pengaju:</strong> User ID {proposal.userId}</p>
              <p><strong>Waktu Pelaksanaan:</strong> {new Date(proposal.WaktuPelaksanan).toLocaleDateString('id-ID')}</p>
              <p><strong>Jumlah Peserta:</strong> {proposal.JumlahPeserta} orang</p>
              <p><strong>Level Tingkatan:</strong> {proposal.LevelTingkatan}</p>
              <p><strong>Total Biaya:</strong> Rp {proposal.TotalUsulan.toLocaleString('id-ID')}</p>
              <p><strong>Tanggal Pengajuan:</strong> {new Date(proposal.created_at).toLocaleDateString('id-ID')}</p>
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
              <button
                className="btn-detail"
                onClick={() => handleExportOne(proposal.id)}
              >
                Export CSV
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
