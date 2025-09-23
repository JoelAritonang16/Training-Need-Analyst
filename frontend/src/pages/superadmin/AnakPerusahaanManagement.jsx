import React, { useState, useEffect } from 'react';
import { anakPerusahaanAPI, branchAPI } from '../../utils/api';
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
        alert('Anak perusahaan berhasil ditambahkan!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding anak perusahaan:', error);
      alert('Terjadi kesalahan saat menambahkan anak perusahaan');
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
        alert('Anak perusahaan berhasil diupdate!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating anak perusahaan:', error);
      alert('Terjadi kesalahan saat mengupdate anak perusahaan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnakPerusahaan = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anak perusahaan ini?')) {
      try {
        setLoading(true);
        const result = await anakPerusahaanAPI.delete(id);
        
        if (result.success) {
          fetchData();
          alert('Anak perusahaan berhasil dihapus!');
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting anak perusahaan:', error);
        alert('Terjadi kesalahan saat menghapus anak perusahaan');
      } finally {
        setLoading(false);
      }
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
        <h2>Manajemen Anak Perusahaan</h2>
        <p>Kelola data anak perusahaan dan relasi dengan branch</p>
        <button className="btn-primary" onClick={handleAddAnakPerusahaan} disabled={loading}>
          {loading ? 'Loading...' : 'Tambah Anak Perusahaan'}
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tambah Anak Perusahaan</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="form-group">
                <label>Nama Anak Perusahaan</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  required
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
                <button type="button" onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAnakPerusahaan && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Anak Perusahaan</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Nama Anak Perusahaan</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  required
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
                <button type="button" onClick={() => setShowEditModal(false)}>Batal</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
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
  );
};

export default AnakPerusahaanManagement;
