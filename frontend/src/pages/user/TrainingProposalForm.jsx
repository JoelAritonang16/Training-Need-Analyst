import React, { useState } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import './TrainingProposalForm.css';

const TrainingProposalForm = ({ user, proposal = null, onSuccess }) => {
  // State untuk form data sesuai dengan database schema
  const [formData, setFormData] = useState({
    Uraian: proposal?.Uraian || '',
    WaktuPelaksanan: proposal?.WaktuPelaksanan || '',
    JumlahPeserta: proposal?.JumlahPeserta || '',
    JumlahHariPesertaPelatihan: proposal?.JumlahHariPesertaPelatihan || '',
    LevelTingkatan: proposal?.LevelTingkatan || 'NON STRUKTURAL',
    Beban: proposal?.Beban || '',
    BebanTransportasi: proposal?.BebanTransportasi || '',
    BebanAkomodasi: proposal?.BebanAkomodasi || '',
    BebanUangSaku: proposal?.BebanUangSaku || '',
    TotalUsulan: proposal?.TotalUsulan || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handler untuk perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error saat user mulai mengetik
    if (error) {
      setError('');
    }
  };

  // Fungsi untuk menghitung total usulan
  const calculateTotalUsulan = () => {
    const beban = parseFloat(formData.Beban) || 0;
    const bebanTransportasi = parseFloat(formData.BebanTransportasi) || 0;
    const bebanAkomodasi = parseFloat(formData.BebanAkomodasi) || 0;
    const bebanUangSaku = parseFloat(formData.BebanUangSaku) || 0;

    return beban + bebanTransportasi + bebanAkomodasi + bebanUangSaku;
  };

  // Validasi form sesuai dengan controller
  const validateForm = () => {
    const errors = [];
    
    // Field wajib sesuai controller validation
    if (!formData.Uraian.trim()) {
      errors.push('Uraian pelatihan harus diisi');
    }
    
    if (!formData.WaktuPelaksanan.trim()) {
      errors.push('Waktu pelaksanaan harus diisi');
    }
    
    if (!formData.JumlahPeserta || parseInt(formData.JumlahPeserta) <= 0) {
      errors.push('Jumlah peserta harus diisi dan lebih dari 0');
    }
    
    if (!formData.LevelTingkatan) {
      errors.push('Level tingkatan harus dipilih');
    }
    
    return errors;
  };

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('=== FORM SUBMISSION START ===');
      console.log('User:', user);
      console.log('Token:', localStorage.getItem('token'));
      console.log('Form data:', formData);

      // Validasi form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        setIsSubmitting(false);
        return;
      }

      // Hitung total usulan
      const totalUsulan = calculateTotalUsulan();
      
      // Siapkan data sesuai dengan controller dan database
      const proposalData = {
        Uraian: formData.Uraian.trim(),
        WaktuPelaksanan: formData.WaktuPelaksanan,
        JumlahPeserta: parseInt(formData.JumlahPeserta),
        JumlahHariPesertaPelatihan: parseInt(formData.JumlahHariPesertaPelatihan),
        LevelTingkatan: formData.LevelTingkatan,
        Beban: parseFloat(formData.Beban) || 0,
        BebanTransportasi: parseFloat(formData.BebanTransportasi) || 0,
        BebanAkomodasi: parseFloat(formData.BebanAkomodasi) || 0,
        BebanUangSaku: parseFloat(formData.BebanUangSaku) || 0,
        TotalUsulan: totalUsulan
      };

      console.log('Processed proposal data:', proposalData);
      
      // Cek token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
      }

      console.log('Calling API...');
      
      // Panggil API sesuai dengan proposal (create atau update)
      const result = proposal 
        ? await trainingProposalAPI.update(proposal.id, proposalData)
        : await trainingProposalAPI.create(proposalData);
      
      console.log('API Response:', result);
      
      if (result && result.success) {
        console.log('✅ Success! Proposal created/updated:', result.proposal);
        alert(proposal ? 'Usulan pelatihan berhasil diupdate!' : 'Usulan pelatihan berhasil diajukan!');
        
        if (onSuccess) {
          onSuccess(result.proposal);
        }
        
        // Reset form jika membuat proposal baru
        if (!proposal) {
          console.log('Resetting form for new submission...');
          setFormData({
            Uraian: '',
            WaktuPelaksanan: '',
            JumlahPeserta: '',
            JumlahHariPesertaPelatihan: '',
            LevelTingkatan: 'NON STRUKTURAL',
            Beban: '',
            BebanTransportasi: '',
            BebanAkomodasi: '',
            BebanUangSaku: '',
            TotalUsulan: ''
          });
          setError('');
        }
      } else {
        throw new Error(result?.message || 'Gagal menyimpan usulan pelatihan');
      }

    } catch (error) {
      console.error('❌ Form submission error:', error);
      setError(error.message || 'Terjadi kesalahan saat menyimpan usulan pelatihan');
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
      console.log('=== FORM SUBMISSION END ===');
    }
  };

  // Handler untuk reset form
  const handleReset = () => {
    if (!proposal) {
      setFormData({
        Uraian: '',
        WaktuPelaksanan: '',
        JumlahPeserta: '',
        JumlahHariPesertaPelatihan: '',
        LevelTingkatan: 'NON STRUKTURAL',
        Beban: '',
        BebanTransportasi: '',
        BebanAkomodasi: '',
        BebanUangSaku: '',
        TotalUsulan: ''
      });
    }
    setError('');
  };

  const totalUsulan = calculateTotalUsulan();

  return (
    <div className="proposal-form-container">
      <div className="form-header">
        <h2>{proposal ? 'Edit Usulan Pelatihan' : 'Buat Usulan Pelatihan Baru'}</h2>
        <p>{proposal ? 'Edit data usulan pelatihan yang sudah ada' : 'Isi formulir di bawah ini untuk mengajukan usulan pelatihan baru'}</p>
      </div>

      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          color: '#c33'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="proposal-form">
        <div className="form-section">
          <h3>Formulir Usulan Pelatihan</h3>
          <p>Silakan lengkapi form berikut untuk mengajukan usulan pelatihan</p>
          
          <div className="form-grid">
            {/* Uraian - Field wajib */}
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
                style={{ borderColor: formData.Uraian ? '#28a745' : '#dc3545' }}
              />
            </div>

            {/* WaktuPelaksanan - Field wajib */}
            <div className="form-group">
              <label htmlFor="WaktuPelaksanan">Waktu Pelaksanaan *</label>
              <input
                type="date"
                id="WaktuPelaksanan"
                name="WaktuPelaksanan"
                value={formData.WaktuPelaksanan}
                onChange={handleInputChange}
                required
                style={{ borderColor: formData.WaktuPelaksanan ? '#28a745' : '#dc3545' }}
              />
            </div>

            {/* JumlahPeserta - Field wajib */}
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
                style={{ borderColor: formData.JumlahPeserta ? '#28a745' : '#dc3545' }}
              />
            </div>

            {/* JumlahHariPesertaPelatihan - Field wajib */}
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
                style={{ borderColor: formData.JumlahHariPesertaPelatihan ? '#28a745' : '#dc3545' }}
              />
            </div>

            {/* LevelTingkatan - Field wajib */}
            <div className="form-group">
              <label htmlFor="LevelTingkatan">Level Tingkatan *</label>
              <select
                id="LevelTingkatan"
                name="LevelTingkatan"
                value={formData.LevelTingkatan}
                onChange={handleInputChange}
                required
                style={{ borderColor: formData.LevelTingkatan ? '#28a745' : '#dc3545' }}
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
            {/* Beban - Field wajib */}
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

            {/* BebanTransportasi - Field wajib */}
            <div className="form-group">
              <label htmlFor="BebanTransportasi">Beban Transportasi (Rp) *</label>
              <input
                type="number"
                id="BebanTransportasi"
                name="BebanTransportasi"
                value={formData.BebanTransportasi}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            {/* BebanAkomodasi - Field wajib */}
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

            {/* BebanUangSaku - Field wajib */}
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
              <span className="cost-value">Rp {parseFloat(formData.BebanTransportasi || 0).toLocaleString('id-ID')}</span>
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
            onClick={handleReset}
            disabled={isSubmitting}
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
