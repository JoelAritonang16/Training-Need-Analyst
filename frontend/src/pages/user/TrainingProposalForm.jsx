import React, { useState } from 'react';
import { trainingProposalAPI } from '../../utils/api';
import './TrainingProposalForm.css';
import TrainingProposalItemsTable, { makeEmptyItem } from './TrainingProposalItemsTable.jsx';

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

  // Items state: inisialisasi dari proposal.items jika tersedia, jika tidak fallback dari header
  const initialItems = (() => {
    if (proposal && Array.isArray(proposal.items) && proposal.items.length > 0) {
      return proposal.items.map(it => ({
        Uraian: it.Uraian || '',
        WaktuPelaksanan: it.WaktuPelaksanan ? String(it.WaktuPelaksanan).slice(0,10) : '',
        JumlahPeserta: it.JumlahPeserta ?? '',
        JumlahHariPesertaPelatihan: it.JumlahHariPesertaPelatihan ?? '',
        LevelTingkatan: it.LevelTingkatan || 'NON STRUKTURAL',
        Beban: it.Beban ?? '',
        BebanTransportasi: it.BebanTransportasi ?? '',
        BebanAkomodasi: it.BebanAkomodasi ?? '',
        BebanUangSaku: it.BebanUangSaku ?? '',
      }));
    }
    if (proposal) {
      return [{
        Uraian: proposal.Uraian || '',
        WaktuPelaksanan: proposal.WaktuPelaksanan ? String(proposal.WaktuPelaksanan).slice(0,10) : '',
        JumlahPeserta: proposal.JumlahPeserta ?? '',
        JumlahHariPesertaPelatihan: proposal.JumlahHariPesertaPelatihan ?? '',
        LevelTingkatan: proposal.LevelTingkatan || 'NON STRUKTURAL',
        Beban: proposal.Beban ?? '',
        BebanTransportasi: proposal.BebanTransportasi ?? '',
        BebanAkomodasi: proposal.BebanAkomodasi ?? '',
        BebanUangSaku: proposal.BebanUangSaku ?? '',
      }];
    }
    return [makeEmptyItem()];
  })();
  const [items, setItems] = useState(initialItems);

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
    
    // Field wajib minimal: ada minimal 1 item dengan uraian
    const atLeastOne = items.some(r => (r.Uraian || '').trim().length > 0);
    if (!atLeastOne) errors.push('Minimal satu uraian harus diisi');
    
    // Validasi wajib per baris: Waktu & Level untuk setiap baris yang memiliki Uraian
    items.forEach((r, idx) => {
      if ((r.Uraian || '').trim().length === 0) return; // skip baris kosong
      if (!r.WaktuPelaksanan) errors.push(`Waktu pelaksanaan wajib di baris ${idx + 1}`);
      if (!r.LevelTingkatan) errors.push(`Level tingkatan wajib di baris ${idx + 1}`);
    });
    
    return errors;
  };

  const addItem = () => setItems(prev => [...prev, makeEmptyItem()]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

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

      // Total usulan dari seluruh item
      const rowTotal = (r) => (parseFloat(r.Beban)||0) + (parseFloat(r.BebanTransportasi)||0) + (parseFloat(r.BebanAkomodasi)||0) + (parseFloat(r.BebanUangSaku)||0);
      const grandTotal = items.reduce((acc, r) => acc + rowTotal(r), 0);

      // Payload: kirim items[] ke backend
      const normalizedItems = items
        .filter(r => (r.Uraian || '').trim().length > 0)
        .map(r => ({
          Uraian: r.Uraian.trim(),
          WaktuPelaksanan: r.WaktuPelaksanan || null,
          JumlahPeserta: r.JumlahPeserta === '' ? null : parseInt(r.JumlahPeserta),
          JumlahHariPesertaPelatihan: r.JumlahHariPesertaPelatihan === '' ? null : parseInt(r.JumlahHariPesertaPelatihan),
          LevelTingkatan: r.LevelTingkatan || null,
          Beban: r.Beban === '' ? null : parseFloat(r.Beban),
          BebanTransportasi: r.BebanTransportasi === '' ? null : parseFloat(r.BebanTransportasi),
          BebanAkomodasi: r.BebanAkomodasi === '' ? null : parseFloat(r.BebanAkomodasi),
          BebanUangSaku: r.BebanUangSaku === '' ? null : parseFloat(r.BebanUangSaku),
          TotalUsulan: rowTotal(r),
        }));

      const proposalData = {
        // Header fields dibiarkan untuk kompatibilitas namun tidak wajib saat items digunakan
        Uraian: formData.Uraian?.trim() || (normalizedItems[0]?.Uraian ?? ''),
        WaktuPelaksanan: formData.WaktuPelaksanan || normalizedItems[0]?.WaktuPelaksanan || '',
        JumlahPeserta: formData.JumlahPeserta || normalizedItems[0]?.JumlahPeserta || 0,
        JumlahHariPesertaPelatihan: formData.JumlahHariPesertaPelatihan || normalizedItems[0]?.JumlahHariPesertaPelatihan || 0,
        LevelTingkatan: formData.LevelTingkatan || normalizedItems[0]?.LevelTingkatan || 'NON STRUKTURAL',
        Beban: formData.Beban || 0,
        BebanTransportasi: formData.BebanTransportasi || 0,
        BebanAkomodasi: formData.BebanAkomodasi || 0,
        BebanUangSaku: formData.BebanUangSaku || 0,
        TotalUsulan: grandTotal,
        items: normalizedItems,
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
          setItems([makeEmptyItem()]);
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
            {/* Daftar Uraian (multi baris) */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Daftar Uraian </label>
              <TrainingProposalItemsTable
                items={items}
                onChange={setItems}
                onAdd={addItem}
                onRemove={removeItem}
              />
            </div>
          </div>
        </div>

        {/* Bagian Rincian Biaya diambil dari tabel items di atas */}
        <div className="form-section">
          <h3>Ringkasan Biaya</h3>
          <div className="cost-summary">
            {(() => {
              const n = (v) => (v === '' || v === null || v === undefined ? 0 : parseFloat(v) || 0);
              const subBeban = items.reduce((acc, r) => acc + n(r.Beban), 0);
              const subTransport = items.reduce((acc, r) => acc + n(r.BebanTransportasi), 0);
              const subAkomodasi = items.reduce((acc, r) => acc + n(r.BebanAkomodasi), 0);
              const subUangSaku = items.reduce((acc, r) => acc + n(r.BebanUangSaku), 0);
              const grand = subBeban + subTransport + subAkomodasi + subUangSaku;
              return (
                <>
                  <div className="cost-item">
                    <span>Subtotal Beban</span>
                    <span className="cost-value">Rp {subBeban.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-item">
                    <span>Subtotal Transport</span>
                    <span className="cost-value">Rp {subTransport.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-item">
                    <span>Subtotal Akomodasi</span>
                    <span className="cost-value">Rp {subAkomodasi.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-item">
                    <span>Subtotal Uang Saku</span>
                    <span className="cost-value">Rp {subUangSaku.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="cost-item total">
                    <span>Total Usulan (semua baris)</span>
                    <span className="cost-value">Rp {grand.toLocaleString('id-ID')}</span>
                  </div>
                </>
              );
            })()}
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
