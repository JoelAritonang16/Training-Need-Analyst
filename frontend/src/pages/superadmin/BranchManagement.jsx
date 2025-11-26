import React, { useState, useEffect } from 'react';
import { branchAPI } from '../../utils/api';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import './BranchManagement.css';

const BranchManagement = () => {
  const [branch, setBranch] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    nama: ''
  });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [alert, setAlert] = useState({ open: false, type: 'info', title: '', message: '' });

  // Fetch branch data
  useEffect(() => {
    fetchBranch();
  }, []);

  const fetchBranch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await branchAPI.getAll();
      
      if (data.success) {
        setBranch(data.branch || []);
      } else {
        setError(data.message || 'Gagal mengambil data branch');
      }
    } catch (err) {
      console.error('Error fetching branch:', err);
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
      if (editingBranch) {
        // Update existing branch
        result = await branchAPI.update(editingBranch.id, formData);
      } else {
        // Create new branch
        result = await branchAPI.create(formData);
      }
      
      if (result.success) {
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: editingBranch ? 'Branch berhasil diupdate!' : 'Branch berhasil dibuat!'
        });
        setFormData({ nama: '' });
        setShowForm(false);
        setEditingBranch(null);
        fetchBranch(); // Refresh data
      } else {
        setError(result.message || 'Gagal menyimpan branch');
      }
    } catch (err) {
      console.error('Error saving branch:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (branchItem) => {
    setEditingBranch(branchItem);
    setFormData({ nama: branchItem.nama });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmDeleteAction = async () => {
    try {
      setIsLoading(true);
      const result = await branchAPI.delete(confirmDelete.id);
      
      if (result.success) {
        fetchBranch(); // Refresh data
        setAlert({
          open: true,
          type: 'success',
          title: 'Berhasil',
          message: 'Branch berhasil dihapus!'
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
      console.error('Error deleting branch:', err);
      setAlert({
        open: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan saat menghapus branch'
      });
    } finally {
      setIsLoading(false);
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleCancel = () => {
    setFormData({ nama: '' });
    setShowForm(false);
    setEditingBranch(null);
    setError(null);
  };

  return (
    <div className="branch-management">
      <div className="content-header">
        <div className="header-left">
          <h2>Manajemen Branch</h2>
          <p>Kelola data branch dalam sistem</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-light"
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            + Tambah Branch
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
          <h3>{editingBranch ? 'Edit Branch' : 'Tambah Branch Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nama">Nama Branch *</label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nama branch"
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
                {isLoading ? 'Menyimpan...' : (editingBranch ? 'Update' : 'Simpan')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="branch-list">
        <h3>Daftar Branch ({branch.length})</h3>
        
        {isLoading && !showForm ? (
          <div className="loading">Memuat data...</div>
        ) : branch.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada branch yang dibuat</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Branch</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {branch.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nama}</td>
                    <td>{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <button 
                    type="button"
                    className="icon-circle-btn"
                    title="Edit branch"
                    onClick={() => handleEdit(item)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-pen" />
                  </button>
                  <button 
                    type="button"
                    className="icon-circle-btn icon-circle-btn--danger"
                    title="Hapus branch"
                    onClick={() => handleDelete(item.id)}
                    disabled={isLoading}
                  >
                    <i className="fas fa-trash" />
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
        message="Apakah Anda yakin ingin menghapus branch ini?"
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

export default BranchManagement;
