import React, { useState, useEffect } from 'react';
import { anakPerusahaanAPI, branchAPI } from '../../utils/api';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import './AnakPerusahaanManagement.css';

const AnakPerusahaanManagement = () => {
  const [anakPerusahaanList, setAnakPerusahaanList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnakPerusahaan, setSelectedAnakPerusahaan] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    branchIds: []
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [alert, setAlert] = useState({ open: false, type: 'info', title: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [anakPerusahaanData, branchData] = await Promise.all([
        anakPerusahaanAPI.getAll(),
        branchAPI.getAll()
      ]);
      
      if (anakPerusahaanData.success) {
        setAnakPerusahaanList(anakPerusahaanData.anakPerusahaan || []);
      }
      
      if (branchData.success) {
        setBranchList(branchData.branch || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnakPerusahaan = () => {
    setFormData({
      nama: '',
      branchIds: []
    });
    setShowAddModal(true);
  };

  const handleEditAnakPerusahaan = (anakPerusahaan) => {
    setSelectedAnakPerusahaan(anakPerusahaan);
    setFormData({
      nama: anakPerusahaan.nama,
      branchIds: anakPerusahaan.branches?.map(branch => branch.id) || []
    });
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await anakPerusahaanAPI.create(formData);
      
      if (result.success) {
        setShowAddModal(false);
        fetchData();
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Anak perusahaan berhasil ditambahkan!'
        });
      } else {
        setAlert({
          open: true,
          type: 'error',
          title: 'Error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error adding anak perusahaan:', error);
      setAlert({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan saat menambahkan anak perusahaan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await anakPerusahaanAPI.update(selectedAnakPerusahaan.id, formData);
      
      if (result.success) {
        setShowEditModal(false);
        fetchData();
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Anak perusahaan berhasil diupdate!'
        });
      } else {
        setAlert({
          open: true,
          type: 'error',
          title: 'Error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error updating anak perusahaan:', error);
      setAlert({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan saat mengupdate anak perusahaan'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnakPerusahaan = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteAction = async () => {
    try {
      setLoading(true);
      const result = await anakPerusahaanAPI.delete(confirmDelete.id);
      
      if (result.success) {
        fetchData();
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Anak perusahaan berhasil dihapus!'
        });
      } else {
        setAlert({
          open: true,
          type: 'error',
          title: 'Error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error deleting anak perusahaan:', error);
      setAlert({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan saat menghapus anak perusahaan'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleBranchChange = (branchId, isChecked) => {
    if (isChecked) {
      setFormData({
        ...formData,
        branchIds: [...formData.branchIds, branchId]
      });
    } else {
      setFormData({
        ...formData,
        branchIds: formData.branchIds.filter(id => id !== branchId)
      });
    }
  };

  return (
    <div className="anak-perusahaan-container">
      <div className="content-header">
        <div className="header-left">
          <h2>Manajemen Anak Perusahaan</h2>
          <p>Kelola data anak perusahaan dan relasi dengan branch</p>
        </div>
        <div className="header-actions">
          <button className="btn-light" onClick={handleAddAnakPerusahaan} disabled={loading}>
            {loading ? 'Loading...' : 'Tambah Anak Perusahaan'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddModal && (
        <div className="form-container">
          <h3>Tambah Anak Perusahaan Baru</h3>
          <form onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label htmlFor="nama">Nama Anak Perusahaan *</label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                required
                placeholder="Masukkan nama anak perusahaan"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Branch Terkait</label>
              <div className="checkbox-group">
                {branchList.map(branch => (
                  <label key={branch.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.branchIds.includes(branch.id)}
                      onChange={(e) => handleBranchChange(branch.id, e.target.checked)}
                    />
                    {branch.nama}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {showEditModal && selectedAnakPerusahaan && (
        <div className="form-container">
          <h3>Edit Anak Perusahaan</h3>
          <form onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="nama-edit">Nama Anak Perusahaan *</label>
              <input
                type="text"
                id="nama-edit"
                name="nama"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                required
                placeholder="Masukkan nama anak perusahaan"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Branch Terkait</label>
              <div className="checkbox-group">
                {branchList.map(branch => (
                  <label key={branch.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.branchIds.includes(branch.id)}
                      onChange={(e) => handleBranchChange(branch.id, e.target.checked)}
                    />
                    {branch.nama}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="anak-list">
        <h3>Daftar Anak Perusahaan ({anakPerusahaanList.length})</h3>
        <div className="table-container">
          <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Anak Perusahaan</th>
              <th>Branch Terkait</th>
              <th>Tanggal Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {anakPerusahaanList.map(anakPerusahaan => (
              <tr key={anakPerusahaan.id}>
                <td>{anakPerusahaan.id}</td>
                <td>{anakPerusahaan.nama}</td>
                <td>
                  {anakPerusahaan.branches && anakPerusahaan.branches.length > 0 ? (
                    <div className="branch-tags">
                      {anakPerusahaan.branches.map(branch => (
                        <span key={branch.id} className="branch-tag">
                          {branch.nama}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-data">Tidak ada branch</span>
                  )}
                </td>
                <td>{new Date(anakPerusahaan.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditAnakPerusahaan(anakPerusahaan)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteAnakPerusahaan(anakPerusahaan.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus anak perusahaan ini?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />

      {/* Alert Modal */}
      <AlertModal
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, open: false })}
      />
    </div>
  );
};

export default AnakPerusahaanManagement;
