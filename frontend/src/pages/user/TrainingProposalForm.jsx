import React, { useState } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import './TrainingProposalForm.css';

const TrainingProposalForm = ({ user, proposal = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    Uraian: proposal?.Uraian || '',
    WaktuPelaksanan: proposal?.WaktuPelaksanan || '',
    JumlahPeserta: proposal?.JumlahPeserta || '',
    JumlahHariPesertaPelatihan: proposal?.JumlahHariPesertaPelatihan || '',
    LevelTingkatan: proposal?.LevelTingkatan || 'NON STRUKTURAL',
    Beban: proposal?.Beban || '',
    BebanTranportasi: proposal?.BebanTranportasi || '',
    BebanAkomodasi: proposal?.BebanAkomodasi || '',
    BebanUangSaku: proposal?.BebanUangSaku || '',
    TotalUsulan: proposal?.TotalUsulan || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalUsulan = () => {
    const beban = parseFloat(formData.Beban) || 0;
    const bebanTransportasi = parseFloat(formData.BebanTranportasi) || 0;
    const bebanAkomodasi = parseFloat(formData.BebanAkomodasi) || 0;
    const bebanUangSaku = parseFloat(formData.BebanUangSaku) || 0;

    const totalUsulan = beban + bebanTransportasi + bebanAkomodasi + bebanUangSaku;

    return totalUsulan;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const totalUsulan = calculateTotalUsulan();
      
      const proposalData = {
        ...formData,
        TotalUsulan: totalUsulan
      };

      const result = proposal 
        ? await trainingProposalAPI.update(proposal.id, proposalData)
        : await trainingProposalAPI.create(proposalData);
      
      alert(proposal ? 'Usulan pelatihan berhasil diupdate!' : 'Usulan pelatihan berhasil diajukan!');
      
      if (onSuccess) {
        onSuccess(result.proposal);
      }
      
      // Reset form if creating new proposal
      if (!proposal) {
        setFormData({
          Uraian: '',
          WaktuPelaksanan: '',
          JumlahPeserta: '',
          JumlahHariPesertaPelatihan: '',
          LevelTingkatan: 'NON STRUKTURAL',
          Beban: '',
          BebanTranportasi: '',
          BebanAkomodasi: '',
          BebanUangSaku: '',
          TotalUsulan: ''
        });
      }

    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUsulan = calculateTotalUsulan();

  return (
    <div className="proposal-form-container">
      <div className="form-header">
        <h2>{proposal ? 'Edit Usulan Pelatihan' : 'Formulir Usulan Pelatihan'}</h2>
        <p>{proposal ? 'Edit data usulan pelatihan yang sudah ada' : 'Silakan lengkapi form berikut untuk mengajukan usulan pelatihan'}</p>
      </div>

      <form onSubmit={handleSubmit} className="proposal-form">
        <div className="form-section">
          <h3>Informasi Pelatihan</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="Uraian">Uraian Pelatihan *</label>
              <textarea
                id="Uraian"
                name="Uraian"
                value={formData.Uraian}
                onChange={handleInputChange}
                placeholder="Masukkan nama/deskripsi pelatihan"
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="WaktuPelaksanan">Waktu Pelaksanaan *</label>
              <input
                type="date"
                id="WaktuPelaksanan"
                name="WaktuPelaksanan"
                value={formData.WaktuPelaksanan}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="JumlahPeserta">Jumlah Peserta *</label>
              <input
                type="number"
                id="JumlahPeserta"
                name="JumlahPeserta"
                value={formData.JumlahPeserta}
                onChange={handleInputChange}
                placeholder="Jumlah peserta"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="JumlahHariPesertaPelatihan">Jumlah Hari Pelaksanaan *</label>
              <input
                type="number"
                id="JumlahHariPesertaPelatihan"
                name="JumlahHariPesertaPelatihan"
                value={formData.JumlahHariPesertaPelatihan}
                onChange={handleInputChange}
                placeholder="Durasi pelatihan (hari)"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="LevelTingkatan">Level Tingkatan *</label>
              <select
                id="LevelTingkatan"
                name="LevelTingkatan"
                value={formData.LevelTingkatan}
                onChange={handleInputChange}
                required
              >
                <option value="NON STRUKTURAL">NON STRUKTURAL</option>
                <option value="STRUKTURAL">STRUKTURAL</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Rincian Biaya</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="Beban">Beban (Rp) *</label>
              <input
                type="number"
                id="Beban"
                name="Beban"
                value={formData.Beban}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="BebanTranportasi">Beban Transportasi (Rp) *</label>
              <input
                type="number"
                id="BebanTranportasi"
                name="BebanTranportasi"
                value={formData.BebanTranportasi}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="BebanAkomodasi">Beban Akomodasi (Rp) *</label>
              <input
                type="number"
                id="BebanAkomodasi"
                name="BebanAkomodasi"
                value={formData.BebanAkomodasi}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="BebanUangSaku">Beban Uang Saku (Rp) *</label>
              <input
                type="number"
                id="BebanUangSaku"
                name="BebanUangSaku"
                value={formData.BebanUangSaku}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Ringkasan Biaya</h3>
          <div className="cost-summary">
            <div className="cost-item">
              <span>Beban:</span>
              <span className="cost-value">Rp {parseFloat(formData.Beban || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item">
              <span>Beban Transportasi:</span>
              <span className="cost-value">Rp {parseFloat(formData.BebanTranportasi || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item">
              <span>Beban Akomodasi:</span>
              <span className="cost-value">Rp {parseFloat(formData.BebanAkomodasi || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item">
              <span>Beban Uang Saku:</span>
              <span className="cost-value">Rp {parseFloat(formData.BebanUangSaku || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item total">
              <span>Total Usulan:</span>
              <span className="cost-value">Rp {totalUsulan.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              if (!proposal) {
                setFormData({
                  Uraian: '',
                  WaktuPelaksanan: '',
                  JumlahPeserta: '',
                  JumlahHariPesertaPelatihan: '',
                  LevelTingkatan: 'NON STRUKTURAL',
                  Beban: '',
                  BebanTranportasi: '',
                  BebanAkomodasi: '',
                  BebanUangSaku: '',
                  TotalUsulan: ''
                });
              }
            }}
          >
            Reset
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (proposal ? 'Mengupdate...' : 'Mengajukan...') : (proposal ? 'Update Usulan' : 'Ajukan Usulan')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainingProposalForm;
