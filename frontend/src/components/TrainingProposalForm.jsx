import React, { useState } from 'react';
import './TrainingProposalForm.css';

const TrainingProposalForm = ({ user }) => {
  const [formData, setFormData] = useState({
    uraian: '',
    waktuPelaksanaan: '',
    jumlahPeserta: '',
    jumlahHari: '',
    level: 'NON STRUKTURAL',
    biayaObyek: '',
    biayaTransportasiDalam: '',
    biayaTransportasiLuar: '',
    biayaAkomodasiDalam: '',
    biayaAkomodasiLuar: '',
    sewaRuangDalam: '',
    sewaRuangLuar: '',
    keterangan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalBiaya = () => {
    const biayaObyek = parseFloat(formData.biayaObyek) || 0;
    const transportasiDalam = parseFloat(formData.biayaTransportasiDalam) || 0;
    const transportasiLuar = parseFloat(formData.biayaTransportasiLuar) || 0;
    const akomodasiDalam = parseFloat(formData.biayaAkomodasiDalam) || 0;
    const akomodasiLuar = parseFloat(formData.biayaAkomodasiLuar) || 0;
    const sewaRuangDalam = parseFloat(formData.sewaRuangDalam) || 0;
    const sewaRuangLuar = parseFloat(formData.sewaRuangLuar) || 0;

    const totalDalam = biayaObyek + transportasiDalam + akomodasiDalam + sewaRuangDalam;
    const totalLuar = transportasiLuar + akomodasiLuar + sewaRuangLuar;
    const grandTotal = totalDalam + totalLuar;

    return { totalDalam, totalLuar, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { totalDalam, totalLuar, grandTotal } = calculateTotalBiaya();
      
      const proposalData = {
        ...formData,
        totalBiayaDalam: totalDalam,
        totalBiayaLuar: totalLuar,
        totalBiaya: grandTotal,
        unitDivisi: user?.unit || '',
        pengaju: user?.username || '',
        status: 'PENDING',
        tanggalPengajuan: new Date().toISOString()
      };

      // Here you would typically send the data to your backend
      console.log('Proposal Data:', proposalData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Usulan pelatihan berhasil diajukan!');
      
      // Reset form
      setFormData({
        uraian: '',
        waktuPelaksanaan: '',
        jumlahPeserta: '',
        jumlahHari: '',
        level: 'NON STRUKTURAL',
        biayaObyek: '',
        biayaTransportasiDalam: '',
        biayaTransportasiLuar: '',
        biayaAkomodasiDalam: '',
        biayaAkomodasiLuar: '',
        sewaRuangDalam: '',
        sewaRuangLuar: '',
        keterangan: ''
      });

    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Terjadi kesalahan saat mengajukan usulan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { totalDalam, totalLuar, grandTotal } = calculateTotalBiaya();

  return (
    <div className="proposal-form-container">
      <div className="form-header">
        <h2>Formulir Usulan Pelatihan</h2>
        <p>Silakan lengkapi form berikut untuk mengajukan usulan pelatihan</p>
      </div>

      <form onSubmit={handleSubmit} className="proposal-form">
        <div className="form-section">
          <h3>Informasi Pelatihan</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="uraian">Uraian Pelatihan *</label>
              <textarea
                id="uraian"
                name="uraian"
                value={formData.uraian}
                onChange={handleInputChange}
                placeholder="Masukkan nama/deskripsi pelatihan"
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="waktuPelaksanaan">Waktu Pelaksanaan Tahun 2025 *</label>
              <input
                type="text"
                id="waktuPelaksanaan"
                name="waktuPelaksanaan"
                value={formData.waktuPelaksanaan}
                onChange={handleInputChange}
                placeholder="Contoh: Januari 2025, Q1 2025"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="jumlahPeserta">Jumlah Peserta *</label>
              <input
                type="number"
                id="jumlahPeserta"
                name="jumlahPeserta"
                value={formData.jumlahPeserta}
                onChange={handleInputChange}
                placeholder="Jumlah peserta"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="jumlahHari">Jumlah Hari Pelaksanaan *</label>
              <input
                type="number"
                id="jumlahHari"
                name="jumlahHari"
                value={formData.jumlahHari}
                onChange={handleInputChange}
                placeholder="Durasi pelatihan (hari)"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="level">Level Tingkatan *</label>
              <select
                id="level"
                name="level"
                value={formData.level}
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
              <label htmlFor="biayaObyek">Biaya Obyek (Rp)</label>
              <input
                type="number"
                id="biayaObyek"
                name="biayaObyek"
                value={formData.biayaObyek}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biayaTransportasiDalam">Biaya Transportasi Dalam (Rp)</label>
              <input
                type="number"
                id="biayaTransportasiDalam"
                name="biayaTransportasiDalam"
                value={formData.biayaTransportasiDalam}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biayaTransportasiLuar">Biaya Transportasi Luar (Rp)</label>
              <input
                type="number"
                id="biayaTransportasiLuar"
                name="biayaTransportasiLuar"
                value={formData.biayaTransportasiLuar}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biayaAkomodasiDalam">Biaya Akomodasi Dalam (Rp)</label>
              <input
                type="number"
                id="biayaAkomodasiDalam"
                name="biayaAkomodasiDalam"
                value={formData.biayaAkomodasiDalam}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biayaAkomodasiLuar">Biaya Akomodasi Luar (Rp)</label>
              <input
                type="number"
                id="biayaAkomodasiLuar"
                name="biayaAkomodasiLuar"
                value={formData.biayaAkomodasiLuar}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sewaRuangDalam">Sewa Ruang Dalam (Rp)</label>
              <input
                type="number"
                id="sewaRuangDalam"
                name="sewaRuangDalam"
                value={formData.sewaRuangDalam}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sewaRuangLuar">Sewa Ruang Luar (Rp)</label>
              <input
                type="number"
                id="sewaRuangLuar"
                name="sewaRuangLuar"
                value={formData.sewaRuangLuar}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="keterangan">Keterangan Tambahan</label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                placeholder="Keterangan atau catatan tambahan"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Ringkasan Biaya</h3>
          <div className="cost-summary">
            <div className="cost-item">
              <span>Total Biaya Dalam:</span>
              <span className="cost-value">Rp {totalDalam.toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item">
              <span>Total Biaya Luar:</span>
              <span className="cost-value">Rp {totalLuar.toLocaleString('id-ID')}</span>
            </div>
            <div className="cost-item total">
              <span>Total Keseluruhan:</span>
              <span className="cost-value">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary">
            Reset
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengajukan...' : 'Ajukan Usulan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrainingProposalForm;
