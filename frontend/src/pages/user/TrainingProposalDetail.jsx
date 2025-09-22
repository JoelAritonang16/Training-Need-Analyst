import React, { useState, useEffect } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import './TrainingProposalDetail.css';

const TrainingProposalDetail = ({ proposalId, onEdit, onBack }) => {
  const id = proposalId;
  const [proposal, setProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProposal();
  }, [id]);

  const fetchProposal = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await trainingProposalAPI.getById(id);
      setProposal(data.proposal);
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus usulan pelatihan ini?')) {
      try {
        await trainingProposalAPI.delete(id);
        alert('Usulan pelatihan berhasil dihapus');
        if (onBack) {
          onBack();
        }
      } catch (err) {
        console.error('Error deleting proposal:', err);
        alert('Error: ' + err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `Rp ${parseFloat(amount).toLocaleString('id-ID')}`;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected'
    };
    return statusMap[status] || 'pending';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'PENDING': 'Menunggu',
      'APPROVED': 'Disetujui',
      'REJECTED': 'Ditolak'
    };
    return statusTexts[status] || 'Menunggu';
  };

  if (isLoading) {
    return (
      <div className="training-proposal-detail">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data usulan pelatihan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="training-proposal-detail">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <div className="error-suggestions">
            <h4>Solusi yang dapat dicoba:</h4>
            <ul>
              <li>Pastikan backend server berjalan di <code>http://localhost:5000</code></li>
              <li>Periksa koneksi internet Anda</li>
              <li>Pastikan Anda sudah login dengan benar</li>
              <li>Coba refresh halaman</li>
            </ul>
          </div>
          <button className="btn-retry" onClick={fetchProposal}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="training-proposal-detail">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Usulan Tidak Ditemukan</h3>
          <p>Usulan pelatihan dengan ID {id} tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="training-proposal-detail">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <h1>{proposal.Uraian || 'Uraian Tidak Tersedia'}</h1>
            <p>Detail usulan pelatihan</p>
          </div>
          <div className="header-actions">
            <span className={`status-badge ${getStatusBadgeClass(proposal.status || 'PENDING')}`}>
              {getStatusText(proposal.status || 'PENDING')}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Informasi Pelatihan</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Uraian Pelatihan</label>
              <p>{proposal.Uraian || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Waktu Pelaksanaan</label>
              <p>{formatDate(proposal.WaktuPelaksanan)}</p>
            </div>
            <div className="detail-item">
              <label>Jumlah Peserta</label>
              <p>{proposal.JumlahPeserta || '-'} orang</p>
            </div>
            <div className="detail-item">
              <label>Jumlah Hari Pelaksanaan</label>
              <p>{proposal.JumlahHariPesertaPelatihan || '-'} hari</p>
            </div>
            <div className="detail-item">
              <label>Level Tingkatan</label>
              <p>{proposal.LevelTingkatan || '-'}</p>
            </div>
            <div className="detail-item">
              <label>Tanggal Dibuat</label>
              <p>{formatDate(proposal.created_at)}</p>
            </div>
            <div className="detail-item">
              <label>Tanggal Diupdate</label>
              <p>{formatDate(proposal.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Rincian Biaya</h3>
          <div className="cost-details">
            <div className="cost-item">
              <label>Beban</label>
              <span className="cost-value">{formatCurrency(proposal.Beban)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Transportasi</label>
              <span className="cost-value">{formatCurrency(proposal.BebanTranportasi)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Akomodasi</label>
              <span className="cost-value">{formatCurrency(proposal.BebanAkomodasi)}</span>
            </div>
            <div className="cost-item">
              <label>Beban Uang Saku</label>
              <span className="cost-value">{formatCurrency(proposal.BebanUangSaku)}</span>
            </div>
            <div className="cost-item total">
              <label>Total Usulan</label>
              <span className="cost-value">{formatCurrency(proposal.TotalUsulan)}</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            className="btn-secondary"
            onClick={onBack}
          >
            ← Kembali ke Daftar
          </button>
          
          {(!proposal.status || proposal.status === 'PENDING' || proposal.status === 'REJECTED') && (
            <>
              <button 
                className="btn-primary"
                onClick={handleEdit}
              >
                Edit Usulan
              </button>
              <button 
                className="btn-danger"
                onClick={handleDelete}
              >
                Hapus Usulan
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingProposalDetail;
