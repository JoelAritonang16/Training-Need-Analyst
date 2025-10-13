import React, { useState, useEffect } from 'react';
import { divisiAPI } from '../../utils/api';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import './DivisiManagement.css';

const DivisiManagement = () => {
  const [divisi, setDivisi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDivisi, setEditingDivisi] = useState(null);
  const [formData, setFormData] = useState({
    nama: ''
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [alert, setAlert] = useState({ open: false, type: 'info', title: '', message: '' });

  // Fetch divisi data
  useEffect(() => {
    fetchDivisi();
  }, []);

  const fetchDivisi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await divisiAPI.getAll();
      
      if (data.success) {
        setDivisi(data.divisi || []);
      } else {
        setError(data.message || 'Gagal mengambil data divisi');
      }
    } catch (err) {
      console.error('Error fetching divisi:', err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      let result;
      if (editingDivisi) {
        // Update existing divisi
        result = await divisiAPI.update(editingDivisi.id, formData);
      } else {
        // Create new divisi
        result = await divisiAPI.create(formData);
      }
      
      if (result.success) {
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: editingDivisi ? 'Divisi berhasil diupdate!' : 'Divisi berhasil dibuat!'
        });
        setFormData({ nama: '' });
        setShowForm(false);
        setEditingDivisi(null);
        fetchDivisi(); // Refresh data
      } else {
        setError(result.message || 'Gagal menyimpan divisi');
      }
    } catch (err) {
      console.error('Error saving divisi:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (divisiItem) => {
    setEditingDivisi(divisiItem);
    setFormData({ nama: divisiItem.nama });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteAction = async () => {
    try {
      setIsLoading(true);
      const result = await divisiAPI.delete(confirmDelete.id);
      
      if (result.success) {
        fetchDivisi(); // Refresh data
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Divisi berhasil dihapus!'
        });
      } else {
        setAlert({
          open: true,
          type: 'error',
          title: 'Error',
          message: result.message
        });
      }
    } catch (err) {
      console.error('Error deleting divisi:', err);
      setAlert({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan saat menghapus divisi'
      });
    } finally {
      setIsLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleCancel = () => {
    setFormData({ nama: '' });
    setShowForm(false);
    setEditingDivisi(null);
    setError(null);
  };

  return (
    <div className="divisi-management">
      <div className="content-header">
        <div className="header-left">
          <h2>Manajemen Divisi</h2>
          <p>Kelola data divisi dalam sistem</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-light"
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            + Tambah Divisi
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h3>{editingDivisi ? 'Edit Divisi' : 'Tambah Divisi Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nama">Nama Divisi *</label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nama divisi"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : (editingDivisi ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divisi-list">
        <h3>Daftar Divisi ({divisi.length})</h3>
        
        {isLoading && !showForm ? (
          <div className="loading">Memuat data...</div>
        ) : divisi.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada divisi yang dibuat</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Divisi</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {divisi.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nama}</td>
                    <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                        disabled={isLoading}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmDelete.open}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus divisi ini?"
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

export default DivisiManagement;
