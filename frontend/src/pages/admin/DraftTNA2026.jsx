import React, { useState, useEffect } from 'react';
import { draftTNA2026API, branchAPI, divisiAPI } from '../../utils/api';
import { LuFileText, LuPencil, LuTrash2, LuEye, LuPlus } from 'react-icons/lu';
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
      alert('Hanya superadmin yang dapat mengedit draft');
      return;
    }
    setSelectedDraft(draft);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (currentUserRole !== 'superadmin') {
      alert('Hanya superadmin yang dapat menghapus draft');
      return;
    }
    
    if (!window.confirm('Apakah Anda yakin ingin menghapus draft ini?')) {
      return;
    }

    try {
      const result = await draftTNA2026API.delete(id);
      if (result.success) {
        alert('Draft berhasil dihapus');
        fetchDrafts();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Terjadi kesalahan saat menghapus draft');
    }
  };

  const handleCreate = () => {
    if (currentUserRole !== 'superadmin') {
      alert('Hanya superadmin yang dapat membuat draft');
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
        alert(isEditMode ? 'Draft berhasil diupdate' : 'Draft berhasil dibuat');
        setIsModalOpen(false);
        setSelectedDraft(null);
        fetchDrafts();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Terjadi kesalahan saat menyimpan draft');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
                rows={3}
              />
            </div>

            <div className="form-group">
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
                type="number"
                name="jumlahPeserta"
                value={formData.jumlahPeserta}
                onChange={handleChange}
                required
                min="1"
                disabled={isViewOnly}
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
                disabled={isViewOnly}
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

            <div className="form-group">
              <label>Beban (Rp) *</label>
              <input
                type="number"
                name="beban"
                value={formData.beban}
                onChange={handleChange}
                required
                min="0"
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group">
              <label>Beban Transportasi (Rp) *</label>
              <input
                type="number"
                name="bebanTransportasi"
                value={formData.bebanTransportasi}
                onChange={handleChange}
                required
                min="0"
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group">
              <label>Beban Akomodasi (Rp) *</label>
              <input
                type="number"
                name="bebanAkomodasi"
                value={formData.bebanAkomodasi}
                onChange={handleChange}
                required
                min="0"
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group">
              <label>Beban Uang Saku (Rp) *</label>
              <input
                type="number"
                name="bebanUangSaku"
                value={formData.bebanUangSaku}
                onChange={handleChange}
                required
                min="0"
                disabled={isViewOnly}
              />
            </div>

            <div className="form-group">
              <label>Total Usulan (Rp) *</label>
              <input
                type="number"
                name="totalUsulan"
                value={formData.totalUsulan}
                onChange={handleChange}
                required
                min="0"
                disabled={true}
                readOnly
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

