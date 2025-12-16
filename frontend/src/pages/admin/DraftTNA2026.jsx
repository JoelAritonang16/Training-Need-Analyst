import React, { useState, useEffect, useCallback } from 'react';
import { draftTNA2026API, branchAPI, divisiAPI } from '../../utils/api';
import { LuFileText, LuPencil, LuTrash2, LuEye } from 'react-icons/lu';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import './DraftTNA2026.css';

const DraftTNA2026 = ({ user, currentUserRole, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [branches, setBranches] = useState([]);
  const [divisi, setDivisi] = useState([]);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    draftId: null
  });

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const result = await draftTNA2026API.getAll();
        if (result && result.success) {
          setDrafts(result.drafts || []);
          setError(null);
        } else {
          const errorMsg = result?.message || 'Gagal memuat data draft';
          setError(errorMsg);
          setAlertModal({
            open: true,
            title: 'Error',
            message: errorMsg,
            type: 'error'
          });
        }
      } catch (apiError) {
        throw apiError;
      }
    } catch (err) {
      let errorMessage = 'Terjadi kesalahan saat mengambil data';
      const errString = String(err || '');
      const errMessage = err?.message || errString || '';
      
      if (err?.isTimeout || 
          err?.name === 'TimeoutError' || 
          errString === 'Timeout' ||
          errMessage?.includes('timeout') || 
          errMessage?.includes('Timeout') ||
          errMessage?.includes('Request timeout') ||
          errMessage?.includes('Server tidak merespons')) {
        errorMessage = 'Request timeout: Server tidak merespons saat memuat data draft. Silakan coba lagi.';
        setError(errorMessage);
        setAlertModal({
          open: true,
          title: 'Timeout',
          message: errorMessage,
          type: 'warning'
        });
      } else if (err?.isNetworkError || 
                 err?.name === 'NetworkError' || 
                 errMessage?.includes('Failed to fetch') ||
                 errMessage?.includes('NetworkError') ||
                 errMessage?.includes('network') ||
                 errMessage?.includes('Tidak dapat terhubung ke server')) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan server backend berjalan.';
        setError(errorMessage);
        setAlertModal({
          open: true,
          title: 'Koneksi Error',
          message: errorMessage,
          type: 'error'
        });
      } else {
        errorMessage = errMessage || errorMessage;
        setError(errorMessage);
        setAlertModal({
          open: true,
          title: 'Error',
          message: errorMessage,
          type: 'error'
        });
      }
      
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBranchesAndDivisi = useCallback(async () => {
    try {
      const [branchResult, divisiResult] = await Promise.all([
        branchAPI.getAll(),
        divisiAPI.getAll()
      ]);
      
      if (branchResult.success) {
        setBranches(branchResult.branch || []);
      }
      if (divisiResult.success) {
        setDivisi(divisiResult.divisi || []);
      }
    } catch (error) {
      if (error?.isTimeout || error?.name === 'TimeoutError' || error?.isNetworkError || error?.name === 'NetworkError') {
        // Silently fail for branch/divisi fetch - not critical
      }
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
    if (currentUserRole === 'superadmin') {
      fetchBranchesAndDivisi();
    }
  }, [currentUserRole, fetchDrafts, fetchBranchesAndDivisi]);

  const handleView = async (draft) => {
    try {
      // Fetch draft detail untuk mendapatkan evaluasi realisasi
      const result = await draftTNA2026API.getById(draft.id);
      if (result.success && result.draft) {
        setSelectedDraft(result.draft);
      } else {
        setSelectedDraft(draft);
      }
    } catch (err) {
      setSelectedDraft(draft);
    }
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (draft) => {
    if (currentUserRole !== 'superadmin') {
      setAlertModal({
        open: true,
        title: 'Akses Ditolak',
        message: 'Hanya superadmin yang dapat mengedit draft',
        type: 'warning'
      });
      return;
    }
    setSelectedDraft(draft);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (currentUserRole !== 'superadmin') {
      setAlertModal({
        open: true,
        title: 'Akses Ditolak',
        message: 'Hanya superadmin yang dapat menghapus draft',
        type: 'warning'
      });
      return;
    }
    setConfirmDelete({
      open: true,
      draftId: id
    });
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete.draftId;
    if (!id) return;

    try {
      const result = await draftTNA2026API.delete(id);
      if (result.success) {
        fetchDrafts();
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: 'Draft berhasil dihapus dari sistem.',
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menghapus',
          message: result.message || 'Gagal menghapus draft. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus draft. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setConfirmDelete({ open: false, draftId: null });
    }
  };


  const handleSave = async (draftData) => {
    // Hanya bisa edit, tidak bisa create (draft dibuat otomatis dari database)
    if (!isEditMode || !selectedDraft) {
      setAlertModal({
        open: true,
        title: 'Akses Ditolak',
        message: 'Draft TNA dibuat otomatis dari proposal yang sudah direalisasikan. Hanya dapat mengedit draft yang sudah ada.',
        type: 'warning'
      });
      return;
    }

    try {
      const result = await draftTNA2026API.update(selectedDraft.id, draftData);

      if (result.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: 'Draft berhasil diperbarui.',
          type: 'success'
        });
        setIsModalOpen(false);
        setSelectedDraft(null);
        fetchDrafts();
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menyimpan',
          message: result.message || 'Gagal menyimpan draft. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menyimpan draft. Silakan coba lagi.',
        type: 'error'
      });
    }
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return 'Rp 0';
    
    // Convert to millions (Juta)
    const inMillions = numValue / 1000000;
    
    // Format with 2 decimal places if needed, otherwise no decimals
    const formatted = inMillions % 1 === 0 
      ? inMillions.toLocaleString('id-ID', { maximumFractionDigits: 0 })
      : inMillions.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    
    return `Rp ${formatted} Juta`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="draft-container">
        <div className="content-header">
          <div>
            <h2>Draft TNA</h2>
            <p>Manajemen draft usulan Training Need Analysis</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="draft-container">
      <div className="content-header">
        <div>
          <h2>Draft TNA</h2>
          <p>Manajemen draft usulan Training Need Analysis</p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="empty-state">
          <LuFileText size={48} />
          <p>Tidak ada draft TNA</p>
        </div>
      ) : (
        <div className="draft-table-container">
          <table className="draft-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Uraian</th>
                <th>Branch</th>
                <th>Divisi</th>
                <th>Waktu Pelaksanaan</th>
                <th>Jumlah Peserta</th>
                <th>Jumlah Hari</th>
                <th>Level</th>
                <th>Beban</th>
                <th>Transportasi</th>
                <th>Akomodasi</th>
                <th>Uang Saku</th>
                <th>Total Usulan</th>
                <th>Status</th>
                <th>Dibuat Oleh</th>
                <th>Diupdate Oleh</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft, index) => (
                <tr key={draft.id}>
                  <td>{index + 1}</td>
                  <td className="uraian-cell">
                    <strong>{draft.uraian || 'N/A'}</strong>
                  </td>
                  <td>{draft.branch?.nama || 'N/A'}</td>
                  <td>{draft.divisi?.nama || '-'}</td>
                  <td>{formatDate(draft.waktuPelaksanaan)}</td>
                  <td className="text-center">{draft.jumlahPeserta || 0}</td>
                  <td className="text-center">{draft.jumlahHari || 0}</td>
                  <td className="text-center">{draft.levelTingkatan || 'N/A'}</td>
                  <td className="text-right">{formatCurrency(draft.beban || 0)}</td>
                  <td className="text-right">{formatCurrency(draft.bebanTransportasi || 0)}</td>
                  <td className="text-right">{formatCurrency(draft.bebanAkomodasi || 0)}</td>
                  <td className="text-right">{formatCurrency(draft.bebanUangSaku || 0)}</td>
                  <td className="text-right total-cell">
                    <strong>{formatCurrency(draft.totalUsulan || 0)}</strong>
                  </td>
                  <td>
                    <span className={`status-badge ${draft.status?.toLowerCase() || 'draft'}`}>
                      {draft.status || 'DRAFT'}
                    </span>
                  </td>
                  <td>{draft.creator?.username || draft.creator?.fullName || 'N/A'}</td>
                  <td>{draft.updater?.username || draft.updater?.fullName || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-view" onClick={() => handleView(draft)} title="Lihat">
                        <LuEye size={14} />
                      </button>
                      {currentUserRole === 'superadmin' && (
                        <>
                          <button className="btn-edit" onClick={() => handleEdit(draft)} title="Edit">
                            <LuPencil size={14} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(draft.id)} title="Hapus">
                            <LuTrash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <DraftModal
          draft={selectedDraft}
          isEditMode={isEditMode}
          isSuperadmin={currentUserRole === 'superadmin'}
          isAdmin={currentUserRole === 'admin'}
          branches={branches}
          divisi={divisi}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDraft(null);
          }}
        />
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus draft ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, draftId: null })}
      />

      <AlertModal
        open={alertModal.open}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />
    </div>
  );
};

const DraftModal = ({ draft, isEditMode, isSuperadmin, isAdmin, branches, divisi, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    branchId: draft?.branchId || '',
    divisiId: draft?.divisiId || '',
    uraian: draft?.uraian || '',
    waktuPelaksanaan: draft?.waktuPelaksanaan ? new Date(draft.waktuPelaksanaan).toISOString().split('T')[0] : '',
    jumlahPeserta: draft?.jumlahPeserta || 0,
    jumlahHari: draft?.jumlahHari || 0,
    levelTingkatan: draft?.levelTingkatan || 'STRUKTURAL',
    beban: draft?.beban || 0,
    bebanTransportasi: draft?.bebanTransportasi || 0,
    bebanAkomodasi: draft?.bebanAkomodasi || 0,
    bebanUangSaku: draft?.bebanUangSaku || 0,
    totalUsulan: draft?.totalUsulan || 0,
    status: draft?.status || 'DRAFT',
  });
  
  const [focusedField, setFocusedField] = useState(null);

  // Helper function to calculate total
  const calculateTotal = useCallback((data) => {
    const beban = parseFloat(data.beban) || 0;
    const transportasi = parseFloat(data.bebanTransportasi) || 0;
    const akomodasi = parseFloat(data.bebanAkomodasi) || 0;
    const uangSaku = parseFloat(data.bebanUangSaku) || 0;
    return beban + transportasi + akomodasi + uangSaku;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate totalUsulan
      if (['beban', 'bebanTransportasi', 'bebanAkomodasi', 'bebanUangSaku'].includes(name)) {
        newData.totalUsulan = calculateTotal(newData);
      }
      
      return newData;
    });
  };

  // Format currency untuk display (Rp 1.500.000)
  const formatCurrencyDisplay = (value) => {
    if (value === null || value === undefined || value === '') return 'Rp 0';
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return 'Rp 0';
    // Pastikan format selalu lengkap dengan toLocaleString
    const formatted = numValue.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `Rp ${formatted}`;
  };

  // Format currency untuk input (tanpa Rp, hanya angka)
  const formatCurrencyInput = (value) => {
    if (!value && value !== 0) return '';
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return '';
    return numValue.toLocaleString('id-ID');
  };

  // Parse currency dari string ke number
  const parseCurrency = (value) => {
    if (!value) return 0;
    // Hapus semua karakter non-digit kecuali koma dan titik
    const cleaned = value.toString().replace(/[^\d]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pastikan semua nilai numerik dikirim sebagai number, bukan string
    const submitData = {
      ...formData,
      beban: parseFloat(formData.beban) || 0,
      bebanTransportasi: parseFloat(formData.bebanTransportasi) || 0,
      bebanAkomodasi: parseFloat(formData.bebanAkomodasi) || 0,
      bebanUangSaku: parseFloat(formData.bebanUangSaku) || 0,
      totalUsulan: parseFloat(formData.totalUsulan) || 0,
      jumlahPeserta: parseInt(formData.jumlahPeserta) || 0,
      jumlahHari: parseInt(formData.jumlahHari) || 0,
    };
    onSave(submitData);
  };

  // Admin can only view, superadmin can create/edit
  // If admin viewing, always view only. If superadmin creating new, allow edit. If superadmin editing existing, allow edit.
  const isViewOnly = isAdmin || (draft && !isEditMode);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isViewOnly ? 'Detail Draft TNA' : 'Edit Draft TNA'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-ultra-compact">
            {/* Row 1: Branch, Divisi, Uraian (full width) */}
            <div className="form-group form-span-1">
              <label>Branch *</label>
              <input
                type="text"
                value={draft?.branch?.nama || branches.find(b => b.id === formData.branchId)?.nama || ''}
                readOnly
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Divisi</label>
              <input
                type="text"
                value={draft?.divisi?.nama || divisi.find(d => d.id === formData.divisiId)?.nama || '-'}
                readOnly
                disabled
                className="readonly-field"
              />
            </div>

            <div className="form-group form-span-2">
              <label>Uraian *</label>
              <input
                type="text"
                name="uraian"
                value={formData.uraian}
                onChange={handleChange}
                required
                disabled={isViewOnly}
                placeholder="Masukkan uraian"
              />
            </div>

            {/* Row 2: Waktu, Peserta, Hari, Level */}
            <div className="form-group form-span-1">
              <label>Waktu Pelaksanaan *</label>
              <input
                type="date"
                name="waktuPelaksanaan"
                value={formData.waktuPelaksanaan}
                onChange={handleChange}
                required
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group form-span-1">
              <label>Jumlah Peserta *</label>
              <input
                type="text"
                name="jumlahPeserta"
                value={formData.jumlahPeserta}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  handleChange({ target: { name: 'jumlahPeserta', value: numericValue } });
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Jumlah Hari *</label>
              <input
                type="text"
                name="jumlahHari"
                value={formData.jumlahHari}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  handleChange({ target: { name: 'jumlahHari', value: numericValue } });
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Level Tingkatan *</label>
              <select
                name="levelTingkatan"
                value={formData.levelTingkatan}
                onChange={handleChange}
                required
                disabled={isViewOnly}
              >
                <option value="STRUKTURAL">STRUKTURAL</option>
                <option value="NON STRUKTURAL">NON STRUKTURAL</option>
              </select>
            </div>

            {/* Row 3: Biaya - Beban, Transportasi, Akomodasi, Uang Saku */}
            <div className="form-group form-span-1">
              <label>Beban *</label>
              <input
                type="text"
                name="beban"
                value={isViewOnly || focusedField !== 'beban' ? formatCurrencyDisplay(formData.beban) : formatCurrencyInput(formData.beban)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setFormData(prev => {
                    const newData = { ...prev, beban: parsed };
                    const beban = parseFloat(newData.beban) || 0;
                    const transportasi = parseFloat(newData.bebanTransportasi) || 0;
                    const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
                    const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
                    newData.totalUsulan = beban + transportasi + akomodasi + uangSaku;
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('beban')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly && formData.beban) {
                    setFormData(prev => ({ ...prev, beban: parseFloat(prev.beban) || 0 }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="Rp 0"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Transportasi *</label>
              <input
                type="text"
                name="bebanTransportasi"
                value={isViewOnly || focusedField !== 'bebanTransportasi' ? formatCurrencyDisplay(formData.bebanTransportasi) : formatCurrencyInput(formData.bebanTransportasi)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setFormData(prev => {
                    const newData = { ...prev, bebanTransportasi: parsed };
                    newData.totalUsulan = calculateTotal(newData);
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanTransportasi')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly && formData.bebanTransportasi) {
                    setFormData(prev => ({ ...prev, bebanTransportasi: parseFloat(prev.bebanTransportasi) || 0 }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="Rp 0"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Akomodasi *</label>
              <input
                type="text"
                name="bebanAkomodasi"
                value={isViewOnly || focusedField !== 'bebanAkomodasi' ? formatCurrencyDisplay(formData.bebanAkomodasi) : formatCurrencyInput(formData.bebanAkomodasi)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setFormData(prev => {
                    const newData = { ...prev, bebanAkomodasi: parsed };
                    newData.totalUsulan = calculateTotal(newData);
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanAkomodasi')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly && formData.bebanAkomodasi) {
                    setFormData(prev => ({ ...prev, bebanAkomodasi: parseFloat(prev.bebanAkomodasi) || 0 }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="Rp 0"
              />
            </div>

            <div className="form-group form-span-1">
              <label>Uang Saku *</label>
              <input
                type="text"
                name="bebanUangSaku"
                value={isViewOnly || focusedField !== 'bebanUangSaku' ? formatCurrencyDisplay(formData.bebanUangSaku) : formatCurrencyInput(formData.bebanUangSaku)}
                onChange={(e) => {
                  const parsed = parseCurrency(e.target.value);
                  setFormData(prev => {
                    const newData = { ...prev, bebanUangSaku: parsed };
                    newData.totalUsulan = calculateTotal(newData);
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanUangSaku')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly && formData.bebanUangSaku) {
                    setFormData(prev => ({ ...prev, bebanUangSaku: parseFloat(prev.bebanUangSaku) || 0 }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="Rp 0"
              />
            </div>

            {/* Status untuk Superadmin */}
            {isSuperadmin && (
              <div className="form-group form-span-1">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isViewOnly && !isEditMode}
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>
            )}
          </div>

          {/* Konfirmasi Realisasi - Full Width untuk Admin/Superadmin */}
          {(isAdmin || isSuperadmin) && (draft?.evaluasiRealisasi || draft?.relatedProposal) && (
            <div className="evaluation-section-compact">
              <div className="form-section-divider-compact"></div>
              
              {/* Header Section - Informasi Konfirmasi Realisasi */}
              <div className="confirmation-header-section">
                <div className="confirmation-header-icon">✅</div>
                <div className="confirmation-header-content">
                  <h4 className="confirmation-title">Konfirmasi Realisasi</h4>
                  <p className="confirmation-subtitle">Draft ini dibuat dari proposal yang telah dikonfirmasi sebagai sudah direalisasikan</p>
                </div>
              </div>

              {/* Informasi Proposal Terkait */}
              {draft?.relatedProposal && (
                <div className="related-proposal-info">
                  <div className="info-row">
                    <span className="info-label">Proposal ID:</span>
                    <span className="info-value">#{draft.relatedProposal.id}</span>
                  </div>
                  {draft.relatedProposal.confirmedBy && (
                    <div className="info-row">
                      <span className="info-label">Dikonfirmasi Oleh:</span>
                      <span className="info-value">
                        {draft.relatedProposal.confirmedBy.fullName || draft.relatedProposal.confirmedBy.username}
                        {draft.relatedProposal.confirmedBy.email && ` (${draft.relatedProposal.confirmedBy.email})`}
                      </span>
                    </div>
                  )}
                  {draft.relatedProposal.confirmedAt && (
                    <div className="info-row">
                      <span className="info-label">Tanggal Konfirmasi:</span>
                      <span className="info-value">
                        {new Date(draft.relatedProposal.confirmedAt).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {draft.relatedProposal.status && (
                    <div className="info-row">
                      <span className="info-label">Status Proposal:</span>
                      <span className="info-value status-badge-inline">{draft.relatedProposal.status}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Evaluasi Realisasi */}
              {draft?.evaluasiRealisasi && (
                <div className="form-group form-full-width">
                  <label className="evaluation-label">
                    <span className="evaluation-icon">📝</span>
                    Evaluasi Realisasi
                  </label>
                  <div className="evaluation-display-box">
                    <p className="evaluation-text">{draft.evaluasiRealisasi}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <div className="modal-actions-left">
              <span className="total-usulan-footer">
                <span className="total-label-footer">Total Usulan:</span>
                <span className="total-value-footer">{formatCurrencyDisplay(formData.totalUsulan)}</span>
              </span>
            </div>
            <div className="modal-actions-right">
              <button type="button" className="btn-cancel" onClick={onClose}>
                {isViewOnly ? 'Tutup' : 'Batal'}
              </button>
              {!isViewOnly && (
                <button type="submit" className="btn-save">
                  {isEditMode ? 'Update' : 'Simpan'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DraftTNA2026;

