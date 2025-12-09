import React, { useState, useEffect } from 'react';
import { draftTNA2026API } from '../../utils/api';
import { LuFileText, LuPlus, LuPencil, LuTrash2, LuEye, LuSend, LuSave } from 'react-icons/lu';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import './UserDraftTNA.css';

const UserDraftTNA = ({ user, onNavigate }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    uraian: '',
    waktuPelaksanaan: '',
    jumlahPeserta: '',
    jumlahHari: '',
    levelTingkatan: 'STRUKTURAL',
    beban: '0',
    bebanTransportasi: '0',
    bebanAkomodasi: '0',
    bebanUangSaku: '0',
    totalUsulan: '0'
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const result = await draftTNA2026API.getAll();
      if (result.success) {
        // Filter hanya draft milik user
        const userDrafts = (result.drafts || []).filter(d => d.createdBy === user?.id);
        setDrafts(userDrafts);
      } else {
        setError(result.message || 'Gagal memuat data draft');
      }
    } catch (err) {
      // Handle timeout and network errors gracefully
      if (err?.isTimeout || err?.name === 'TimeoutError') {
        setError('Request timeout: Server tidak merespons. Silakan coba lagi.');
      } else if (err?.isNetworkError || err?.name === 'NetworkError') {
        setError('Tidak dapat terhubung ke server. Pastikan server backend berjalan.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat mengambil data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate total
      if (name === 'beban' || name === 'bebanTransportasi' || name === 'bebanAkomodasi' || name === 'bebanUangSaku') {
        const beban = parseFloat(newData.beban) || 0;
        const transportasi = parseFloat(newData.bebanTransportasi) || 0;
        const akomodasi = parseFloat(newData.bebanAkomodasi) || 0;
        const uangSaku = parseFloat(newData.bebanUangSaku) || 0;
        newData.totalUsulan = (beban + transportasi + akomodasi + uangSaku).toString();
      }
      
      return newData;
    });
  };


  const handleEdit = (draft) => {
    if (draft.status !== 'DRAFT') {
      setAlertModal({
        open: true,
        title: 'Tidak Dapat Diedit',
        message: 'Draft yang sudah disubmit tidak dapat diedit',
        type: 'warning'
      });
      return;
    }
    setFormData({
      uraian: draft.uraian || '',
      waktuPelaksanaan: draft.waktuPelaksanaan ? new Date(draft.waktuPelaksanaan).toISOString().split('T')[0] : '',
      jumlahPeserta: draft.jumlahPeserta?.toString() || '',
      jumlahHari: draft.jumlahHari?.toString() || '',
      levelTingkatan: draft.levelTingkatan || 'STRUKTURAL',
      beban: draft.beban?.toString() || '0',
      bebanTransportasi: draft.bebanTransportasi?.toString() || '0',
      bebanAkomodasi: draft.bebanAkomodasi?.toString() || '0',
      bebanUangSaku: draft.bebanUangSaku?.toString() || '0',
      totalUsulan: draft.totalUsulan?.toString() || '0'
    });
    setSelectedDraft(draft);
    setIsEditMode(true);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (draft) => {
    setFormData({
      uraian: draft.uraian || '',
      waktuPelaksanaan: draft.waktuPelaksanaan ? new Date(draft.waktuPelaksanaan).toISOString().split('T')[0] : '',
      jumlahPeserta: draft.jumlahPeserta?.toString() || '',
      jumlahHari: draft.jumlahHari?.toString() || '',
      levelTingkatan: draft.levelTingkatan || 'STRUKTURAL',
      beban: draft.beban?.toString() || '0',
      bebanTransportasi: draft.bebanTransportasi?.toString() || '0',
      bebanAkomodasi: draft.bebanAkomodasi?.toString() || '0',
      bebanUangSaku: draft.bebanUangSaku?.toString() || '0',
      totalUsulan: draft.totalUsulan?.toString() || '0'
    });
    setSelectedDraft(draft);
    setIsEditMode(false);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (draft) => {
    if (draft.status !== 'DRAFT') {
      setAlertModal({
        open: true,
        title: 'Tidak Dapat Dihapus',
        message: 'Draft yang sudah disubmit tidak dapat dihapus',
        type: 'warning'
      });
      return;
    }
    setConfirmModal({
      open: true,
      title: 'Konfirmasi Hapus',
      message: 'Apakah Anda yakin ingin menghapus draft ini?',
      onConfirm: async () => {
        try {
          const result = await draftTNA2026API.delete(draft.id);
          if (result.success) {
            fetchDrafts();
            setAlertModal({
              open: true,
              title: 'Berhasil!',
              message: 'Draft berhasil dihapus',
              type: 'success'
            });
          } else {
            setAlertModal({
              open: true,
              title: 'Gagal',
              message: result.message || 'Gagal menghapus draft',
              type: 'error'
            });
          }
        } catch (error) {
          setAlertModal({
            open: true,
            title: 'Terjadi Kesalahan',
            message: 'Gagal menghapus draft. Silakan coba lagi.',
            type: 'error'
          });
        } finally {
          setConfirmModal({ open: false, onConfirm: null });
        }
      }
    });
  };

  const handleSubmit = (draft) => {
    if (draft.status !== 'DRAFT') {
      setAlertModal({
        open: true,
        title: 'Tidak Dapat Disubmit',
        message: 'Draft ini sudah disubmit',
        type: 'warning'
      });
      return;
    }
    setConfirmModal({
      open: true,
      title: 'Konfirmasi Submit',
      message: 'Apakah Anda yakin ingin submit draft ini? Setelah disubmit, draft tidak dapat diedit lagi.',
      onConfirm: async () => {
        try {
          const result = await draftTNA2026API.submit(draft.id);
          if (result.success) {
            fetchDrafts();
            setAlertModal({
              open: true,
              title: 'Berhasil!',
              message: 'Draft berhasil disubmit. Admin dan superadmin telah menerima notifikasi.',
              type: 'success'
            });
          } else {
            setAlertModal({
              open: true,
              title: 'Gagal',
              message: result.message || 'Gagal submit draft',
              type: 'error'
            });
          }
        } catch (error) {
          setAlertModal({
            open: true,
            title: 'Terjadi Kesalahan',
            message: 'Gagal submit draft. Silakan coba lagi.',
            type: 'error'
          });
        } finally {
          setConfirmModal({ open: false, onConfirm: null });
        }
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
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
    
    // Validasi
    if (!formData.uraian || !formData.waktuPelaksanaan || !formData.jumlahPeserta || !formData.jumlahHari) {
      setAlertModal({
        open: true,
        title: 'Validasi Gagal',
        message: 'Mohon lengkapi semua field yang wajib diisi',
        type: 'warning'
      });
      return;
    }

    try {
      const draftData = {
        uraian: formData.uraian,
        waktuPelaksanaan: formData.waktuPelaksanaan,
        jumlahPeserta: parseInt(formData.jumlahPeserta),
        jumlahHari: parseInt(formData.jumlahHari),
        levelTingkatan: formData.levelTingkatan,
        beban: parseFloat(formData.beban) || 0,
        bebanTransportasi: parseFloat(formData.bebanTransportasi) || 0,
        bebanAkomodasi: parseFloat(formData.bebanAkomodasi) || 0,
        bebanUangSaku: parseFloat(formData.bebanUangSaku) || 0,
        totalUsulan: parseFloat(formData.totalUsulan) || 0,
        tahun: 2026
      };

      const result = await draftTNA2026API.update(selectedDraft.id, draftData);

      if (result.success) {
        fetchDrafts();
        setIsModalOpen(false);
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: 'Draft berhasil diupdate',
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal',
          message: result.message || 'Gagal menyimpan draft',
          type: 'error'
        });
      }
    } catch (error) {
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Gagal menyimpan draft. Silakan coba lagi.',
        type: 'error'
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': { label: 'Draft', class: 'status-draft' },
      'SUBMITTED': { label: 'Disubmit', class: 'status-submitted' },
      'APPROVED': { label: 'Disetujui', class: 'status-approved' }
    };
    return statusMap[status] || { label: status, class: 'status-default' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="user-draft-tna-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data draft TNA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-draft-tna-container">
      <div className="content-header">
        <div>
          <h2>Draft TNA</h2>
          <p>Kelola draft Training Need Analysis Anda</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="empty-state">
          <LuFileText size={64} />
          <h3>Belum Ada Draft</h3>
          <p>Draft TNA akan dibuat otomatis dari proposal yang sudah direalisasikan</p>
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map((draft) => {
            const statusInfo = getStatusBadge(draft.status);
            return (
              <div key={draft.id} className="draft-card">
                <div className="draft-header">
                  <div className="draft-title-section">
                    <h3>{draft.uraian || 'Draft TNA'}</h3>
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div className="draft-content">
                  <div className="draft-info-row">
                    <span className="info-label">Waktu Pelaksanaan:</span>
                    <span className="info-value">
                      {draft.waktuPelaksanaan ? new Date(draft.waktuPelaksanaan).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div className="draft-info-row">
                    <span className="info-label">Jumlah Peserta:</span>
                    <span className="info-value">{draft.jumlahPeserta || 0} orang</span>
                  </div>
                  <div className="draft-info-row">
                    <span className="info-label">Jumlah Hari:</span>
                    <span className="info-value">{draft.jumlahHari || 0} hari</span>
                  </div>
                  <div className="draft-info-row">
                    <span className="info-label">Level:</span>
                    <span className="info-value">{draft.levelTingkatan || '-'}</span>
                  </div>
                  <div className="draft-info-row">
                    <span className="info-label">Total Usulan:</span>
                    <span className="info-value highlight">{formatCurrency(draft.totalUsulan)}</span>
                  </div>
                </div>
                <div className="draft-actions">
                  <button className="btn-action btn-view" onClick={() => handleView(draft)} title="Lihat Detail">
                    <LuEye size={16} />
                  </button>
                  {draft.status === 'DRAFT' && (
                    <>
                      <button className="btn-action btn-edit" onClick={() => handleEdit(draft)} title="Edit">
                        <LuPencil size={16} />
                      </button>
                      <button className="btn-action btn-submit" onClick={() => handleSubmit(draft)} title="Submit">
                        <LuSend size={16} />
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(draft)} title="Hapus">
                        <LuTrash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isViewMode && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isViewMode ? 'Detail Draft TNA' : 'Edit Draft TNA'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Uraian *</label>
                  <textarea
                    name="uraian"
                    value={formData.uraian}
                    onChange={handleChange}
                    required
                    disabled={isViewMode}
                    rows={3}
                    placeholder="Masukkan uraian draft TNA"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Waktu Pelaksanaan *</label>
                    <input
                      type="date"
                      name="waktuPelaksanaan"
                      value={formData.waktuPelaksanaan}
                      onChange={handleChange}
                      required
                      disabled={isViewMode}
                    />
                  </div>
                  <div className="form-group">
                    <label>Level Tingkatan *</label>
                    <select
                      name="levelTingkatan"
                      value={formData.levelTingkatan}
                      onChange={handleChange}
                      required
                      disabled={isViewMode}
                    >
                      <option value="STRUKTURAL">STRUKTURAL</option>
                      <option value="NON STRUKTURAL">NON STRUKTURAL</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Jumlah Peserta *</label>
                    <input
                      type="number"
                      name="jumlahPeserta"
                      value={formData.jumlahPeserta}
                      onChange={handleChange}
                      required
                      min="1"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Jumlah Hari *</label>
                    <input
                      type="number"
                      name="jumlahHari"
                      value={formData.jumlahHari}
                      onChange={handleChange}
                      required
                      min="1"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-section-title">Rincian Biaya (Rp)</div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Beban</label>
                    <input
                      type="number"
                      name="beban"
                      value={formData.beban}
                      onChange={handleChange}
                      min="0"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Beban Transportasi</label>
                    <input
                      type="number"
                      name="bebanTransportasi"
                      value={formData.bebanTransportasi}
                      onChange={handleChange}
                      min="0"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Beban Akomodasi</label>
                    <input
                      type="number"
                      name="bebanAkomodasi"
                      value={formData.bebanAkomodasi}
                      onChange={handleChange}
                      min="0"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Beban Uang Saku</label>
                    <input
                      type="number"
                      name="bebanUangSaku"
                      value={formData.bebanUangSaku}
                      onChange={handleChange}
                      min="0"
                      disabled={isViewMode}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Total Usulan (Rp)</label>
                  <input
                    type="text"
                    value={formatCurrency(parseFloat(formData.totalUsulan) || 0)}
                    disabled
                    readOnly
                    className="total-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  {isViewMode ? 'Tutup' : 'Batal'}
                </button>
                {!isViewMode && (
                  <button type="submit" className="btn-save">
                    <LuSave size={16} />
                    {isEditMode ? 'Update' : 'Simpan'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal({ ...alertModal, open: false })}
      />

      {/* Confirm Modal */}
      {confirmModal.open && (
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Ya"
          cancelText="Batal"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ open: false, onConfirm: null })}
        />
      )}
    </div>
  );
};

export default UserDraftTNA;

