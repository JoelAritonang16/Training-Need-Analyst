import React, { useState, useEffect } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import TrainingProposalForm from './TrainingProposalForm';
import './TrainingProposalEdit.css';

const TrainingProposalEdit = ({ proposalId, onSuccess, onBack }) => {
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

  const handleSuccess = (updatedProposal) => {
    console.log('Proposal updated successfully:', updatedProposal);
    // You can add navigation logic here
    // window.location.href = '/training-proposals';
  };

  if (isLoading) {
    return (
      <div className="training-proposal-edit">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data usulan pelatihan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="training-proposal-edit">
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
      <div className="training-proposal-edit">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Usulan Tidak Ditemukan</h3>
          <p>Usulan pelatihan dengan ID {id} tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="training-proposal-edit">
      <div className="page-header">
        <h1>Edit Usulan Pelatihan</h1>
        <p>Edit data usulan pelatihan: <strong>{proposal.Uraian}</strong></p>
      </div>
      
      <TrainingProposalForm 
        proposal={proposal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default TrainingProposalEdit;
