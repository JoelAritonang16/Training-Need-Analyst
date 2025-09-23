import React, { useState, useEffect } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import './UserManagement.css';

const UserManagement = ({ users, onAddUser, onEditUser, onDeleteUser, onToggleStatus, currentUserRole = 'admin' }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    email: '',
    unit: '',
    divisiId: '',
    branchId: '',
    anakPerusahaanId: ''
  });
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [anakPerusahaanList, setAnakPerusahaanList] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchDivisiAndBranch();
  }, [currentUserRole]);

  const fetchDivisiAndBranch = async () => {
    try {
      const promises = [branchAPI.getAll()];
      
      // Only fetch divisi and anak perusahaan if current user is superadmin
      if (currentUserRole === 'superadmin') {
        promises.push(divisiAPI.getAll(), anakPerusahaanAPI.getAll());
      }
      
      const results = await Promise.all(promises);
      
      if (results[0].success) {
        setBranchList(results[0].branch || []);
      }
      
      if (currentUserRole === 'superadmin') {
        if (results[1]?.success) {
          setDivisiList(results[1].divisi || []);
        }
        if (results[2]?.success) {
          setAnakPerusahaanList(results[2].anakPerusahaan || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users?currentUserRole=${currentUserRole}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        console.log('=== FRONTEND FETCH USERS ===');
        console.log('Users fetched:', data.users);
        data.users.forEach(user => {
          console.log(`User ${user.username}:`, {
            divisiId: user.divisiId,
            branchId: user.branchId,
            divisi: user.divisi?.nama,
            branch: user.branch?.nama
          });
        });
        setUserList(data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setFormData({
      username: '',
      password: '',
      role: currentUserRole === 'admin' ? 'user' : 'user',
      email: '',
      unit: '',
      divisiId: '',
      branchId: '',
      anakPerusahaanId: ''
    });
    setShowAddModal(true);
  };

  const handleEditUser = (userId) => {
    const user = userList.find(u => u.id === userId);
    if (user) {
      console.log('Editing user:', user);
      console.log('User divisi:', user.divisi);
      console.log('User branch:', user.branch);
      
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '',
        role: user.role,
        email: user.email || '',
        unit: user.unit || '',
        divisiId: user.divisiId || '',
        branchId: user.branchId || '',
        anakPerusahaanId: user.anakPerusahaanId || ''
      });
      setShowEditModal(true);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/role-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          currentUserRole,
          divisiId: formData.divisiId || null,
          branchId: formData.branchId || null,
          anakPerusahaanId: formData.anakPerusahaanId || null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchUsers();
        window.alert('User berhasil ditambahkan!');
      } else {
        window.alert(data.message || 'Gagal menambahkan user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      window.alert('Terjadi kesalahan saat menambahkan user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const requestData = {
        username: formData.username,
        role: formData.role,
        email: formData.email,
        unit: formData.unit,
        currentUserRole,
        divisiId: formData.divisiId || null,
        branchId: formData.branchId || null,
        anakPerusahaanId: formData.anakPerusahaanId || null
      };
      
      console.log('=== FRONTEND EDIT USER REQUEST ===');
      console.log('User ID:', selectedUser.id);
      console.log('Request Data:', requestData);
      console.log('Form Data:', formData);
      
      const response = await fetch(`http://localhost:5000/api/users/role-based/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      console.log('=== FRONTEND EDIT USER RESPONSE ===');
      console.log('Response:', data);
      
      if (data.success) {
        setShowEditModal(false);
        fetchUsers();
        window.alert('User berhasil diupdate!');
      } else {
        console.log('Edit failed:', data.message);
        window.alert(data.message || 'Gagal mengupdate user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      window.alert('Terjadi kesalahan saat mengupdate user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/users/role-based/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentUserRole })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        window.alert('User berhasil dihapus!');
      } else {
        window.alert(data.message || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      window.alert('Terjadi kesalahan saat menghapus user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear role-specific fields when role changes
      divisiId: newRole === 'user' ? prev.divisiId : '',
      anakPerusahaanId: newRole === 'admin' ? prev.anakPerusahaanId : '',
      branchId: newRole === 'user' ? prev.branchId : '' // Clear branch for admin role
    }));
  };

  const getRoleOptions = () => {
    if (currentUserRole === 'superadmin') {
      return [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' }
      ];
    } else {
      return [{ value: 'user', label: 'User' }];
    }
  };
  return (
    <div className="users-container">
      <div className="content-header">
        <h2>Manajemen Pengguna</h2>
        <p>Kelola pengguna sistem dan hak akses ({currentUserRole === 'superadmin' ? 'SuperAdmin dapat mengelola User & Admin' : 'Admin dapat mengelola User'})</p>
        <button className="btn-primary" onClick={handleAddUser} disabled={loading}>
          {loading ? 'Loading...' : 'Tambah Pengguna Baru'}
        </button>
      </div>
      
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>{currentUserRole === 'superadmin' ? 'Divisi/Anak Perusahaan' : 'Anak Perusahaan'}</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  {user.role === 'user' 
                    ? (user.divisi && user.divisi.nama ? user.divisi.nama : 'Belum dipilih')
                    : (user.anakPerusahaan && user.anakPerusahaan.nama ? user.anakPerusahaan.nama : 'Belum dipilih')
                  }
                </td>
                <td>{user.branch && user.branch.nama ? user.branch.nama : 'Belum dipilih'}</td>
                <td>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditUser(user.id)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loading}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {userList.length === 0 && (
          <div className="empty-state">
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Tambah Pengguna Baru</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                >
                  {getRoleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              {/* Role-based field selection */}
              {formData.role === 'user' && (
                <div className="form-group">
                  <label>Divisi</label>
                  <select
                    value={formData.divisiId}
                    onChange={(e) => setFormData({...formData, divisiId: e.target.value})}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisiList.map(divisi => (
                      <option key={divisi.id} value={divisi.id}>
                        {divisi.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.role === 'admin' && (
                <div className="form-group">
                  <label>Anak Perusahaan</label>
                  <select
                    value={formData.anakPerusahaanId}
                    onChange={(e) => setFormData({...formData, anakPerusahaanId: e.target.value})}
                  >
                    <option value="">Pilih Anak Perusahaan</option>
                    {anakPerusahaanList.map(anakPerusahaan => (
                      <option key={anakPerusahaan.id} value={anakPerusahaan.id}>
                        {anakPerusahaan.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Branch field only for user role */}
              {formData.role === 'user' && (
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  >
                    <option value="">Pilih Branch</option>
                    {branchList.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={loading}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Pengguna</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                >
                  {getRoleOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              {/* Role-based field selection */}
              {formData.role === 'user' && (
                <div className="form-group">
                  <label>Divisi</label>
                  <select
                    value={formData.divisiId}
                    onChange={(e) => setFormData({...formData, divisiId: e.target.value})}
                  >
                    <option value="">Pilih Divisi</option>
                    {divisiList.map(divisi => (
                      <option key={divisi.id} value={divisi.id}>
                        {divisi.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.role === 'admin' && (
                <div className="form-group">
                  <label>Anak Perusahaan</label>
                  <select
                    value={formData.anakPerusahaanId}
                    onChange={(e) => setFormData({...formData, anakPerusahaanId: e.target.value})}
                  >
                    <option value="">Pilih Anak Perusahaan</option>
                    {anakPerusahaanList.map(anakPerusahaan => (
                      <option key={anakPerusahaan.id} value={anakPerusahaan.id}>
                        {anakPerusahaan.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Branch field only for user role */}
              {formData.role === 'user' && (
                <div className="form-group">
                  <label>Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                  >
                    <option value="">Pilih Branch</option>
                    {branchList.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.nama}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} disabled={loading}>
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
