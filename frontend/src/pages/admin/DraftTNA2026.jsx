import React, { useState, useEffect } from 'react';
import { draftTNA2026API, branchAPI, divisiAPI } from '../../utils/api';
import { LuFileText, LuPencil, LuTrash2, LuEye, LuPlus } from 'react-icons/lu';
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

  useEffect(() => {
    fetchDrafts();
    if (currentUserRole === 'superadmin') {
      fetchBranchesAndDivisi();
    }
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const result = await draftTNA2026API.getAll();
      if (result.success) {
        setDrafts(result.drafts || []);
      } else {
        setError(result.message || 'Gagal memuat data draft');
      }
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchesAndDivisi = async () => {
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
      console.error('Error fetching branches and divisi:', error);
    }
  };

  const handleView = (draft) => {
    setSelectedDraft(draft);
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
      console.error('Error deleting draft:', error);
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

  const handleCreate = () => {
    if (currentUserRole !== 'superadmin') {
      setAlertModal({
        open: true,
        title: 'Akses Ditolak',
        message: 'Hanya superadmin yang dapat membuat draft. Draft biasanya dibuat otomatis dari proposal yang sudah direalisasi.',
        type: 'warning'
      });
      return;
    }
    setSelectedDraft(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSave = async (draftData) => {
    try {
      let result;
      if (isEditMode && selectedDraft) {
        result = await draftTNA2026API.update(selectedDraft.id, draftData);
      } else {
        result = await draftTNA2026API.create(draftData);
      }

      if (result.success) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: isEditMode ? 'Draft berhasil diperbarui.' : 'Draft berhasil dibuat.',
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
      console.error('Error saving draft:', error);
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
    return <div className="draft-container"><p>Memuat data...</p></div>;
  }

  if (error) {
    return <div className="draft-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="draft-container">
      <div className="content-header">
        <div>
          <h2>Draft TNA 2026</h2>
          <p>Manajemen draft usulan Training Need Analysis 2026</p>
        </div>
        {currentUserRole === 'superadmin' && (
          <button className="btn-create" onClick={handleCreate}>
            <LuPlus size={18} />
            Buat Draft Baru
          </button>
        )}
      </div>

      {drafts.length === 0 ? (
        <div className="empty-state">
          <LuFileText size={48} />
          <p>Tidak ada draft TNA 2026</p>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate totalUsulan
      if (['beban', 'bebanTransportasi', 'bebanAkomodasi', 'bebanUangSaku'].includes(name)) {
        const beban = parseFloat(newData.beban) || 0;
        const transportasi = parseFloat(newData.bebanTransportasi) || 0;
        const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
        const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
        newData.totalUsulan = beban + transportasi + akomodasi + uangSaku;
      }
      
      return newData;
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0';
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return '0';
    
    // Convert to millions (Juta) for display in input fields
    const inMillions = numValue / 1000000;
    
    // Format with 2 decimal places if needed, otherwise no decimals
    const formatted = inMillions % 1 === 0 
      ? inMillions.toLocaleString('id-ID', { maximumFractionDigits: 0 })
      : inMillions.toLocaleString('id-ID', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    
    return `${formatted} Juta`;
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
          <h3>{isViewOnly ? 'Detail Draft TNA 2026' : isEditMode ? 'Edit Draft TNA 2026' : 'Buat Draft TNA 2026'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Branch *</label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                required
                disabled={isViewOnly}
              >
                <option value="">Pilih Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Divisi</label>
              <select
                name="divisiId"
                value={formData.divisiId}
                onChange={handleChange}
                disabled={isViewOnly}
              >
                <option value="">Pilih Divisi (Opsional)</option>
                {divisi.map(d => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>

            <div className="form-group form-full-width">
              <label>Uraian *</label>
              <textarea
                name="uraian"
                value={formData.uraian}
                onChange={handleChange}
                required
                disabled={isViewOnly}
                rows={1}
              />
            </div>

            <hr className="form-section-divider" />

            <div className="form-group form-span-2">
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

            <div className="form-group">
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
                min="1"
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group">
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
                min="1"
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group">
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

            <hr className="form-section-divider" />

            <div className="form-group">
              <label>Beban (Rp) *</label>
              <input
                type="text"
                name="beban"
                value={isViewOnly || focusedField !== 'beban' ? formatCurrency(formData.beban) : (formData.beban || '')}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => {
                    const newData = { ...prev, beban: numericValue || 0 };
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
                  if (!isViewOnly) {
                    setFormData(prev => ({ ...prev, beban: prev.beban || '0' }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Transportasi (Rp) *</label>
              <input
                type="text"
                name="bebanTransportasi"
                value={isViewOnly || focusedField !== 'bebanTransportasi' ? formatCurrency(formData.bebanTransportasi) : (formData.bebanTransportasi || '')}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => {
                    const newData = { ...prev, bebanTransportasi: numericValue || 0 };
                    const beban = parseFloat(newData.beban) || 0;
                    const transportasi = parseFloat(newData.bebanTransportasi) || 0;
                    const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
                    const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
                    newData.totalUsulan = beban + transportasi + akomodasi + uangSaku;
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanTransportasi')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly) {
                    setFormData(prev => ({ ...prev, bebanTransportasi: prev.bebanTransportasi || '0' }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Akomodasi (Rp) *</label>
              <input
                type="text"
                name="bebanAkomodasi"
                value={isViewOnly || focusedField !== 'bebanAkomodasi' ? formatCurrency(formData.bebanAkomodasi) : (formData.bebanAkomodasi || '')}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => {
                    const newData = { ...prev, bebanAkomodasi: numericValue || 0 };
                    const beban = parseFloat(newData.beban) || 0;
                    const transportasi = parseFloat(newData.bebanTransportasi) || 0;
                    const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
                    const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
                    newData.totalUsulan = beban + transportasi + akomodasi + uangSaku;
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanAkomodasi')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly) {
                    setFormData(prev => ({ ...prev, bebanAkomodasi: prev.bebanAkomodasi || '0' }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Uang Saku (Rp) *</label>
              <input
                type="text"
                name="bebanUangSaku"
                value={isViewOnly || focusedField !== 'bebanUangSaku' ? formatCurrency(formData.bebanUangSaku) : (formData.bebanUangSaku || '')}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                  setFormData(prev => {
                    const newData = { ...prev, bebanUangSaku: numericValue || 0 };
                    const beban = parseFloat(newData.beban) || 0;
                    const transportasi = parseFloat(newData.bebanTransportasi) || 0;
                    const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
                    const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
                    newData.totalUsulan = beban + transportasi + akomodasi + uangSaku;
                    return newData;
                  });
                }}
                onFocus={() => setFocusedField('bebanUangSaku')}
                onBlur={() => {
                  setFocusedField(null);
                  if (!isViewOnly) {
                    setFormData(prev => ({ ...prev, bebanUangSaku: prev.bebanUangSaku || '0' }));
                  }
                }}
                required
                disabled={isViewOnly}
                placeholder="0"
              />
            </div>

            <div className="form-group form-span-2">
              <label>Total Usulan (Rp) *</label>
              <input
                type="text"
                name="totalUsulan"
                value={formatCurrency(formData.totalUsulan)}
                onChange={handleChange}
                required
                disabled={true}
                readOnly
                style={{ 
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderColor: '#fbbf24',
                  color: '#92400e',
                  textAlign: 'left'
                }}
              />
            </div>

            {isSuperadmin && (
              <div className="form-group">
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

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {isViewOnly ? 'Tutup' : 'Batal'}
            </button>
            {!isViewOnly && (
              <button type="submit" className="btn-save">
                {isEditMode ? 'Update' : 'Simpan'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DraftTNA2026;

