import React, { useState, useEffect } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import './UserManagement.css';

const UserManagement = ({ users, onAddUser, onEditUser, onDeleteUser, onToggleStatus, currentUserRole = 'admin', onNavigate }) => {
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
    // Navigate to dedicated create page (new layout), keeping logic intact
    if (onNavigate) onNavigate('user-create');
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
      <div className="content-header banner">
        <div>
          <h2>Daftar Pengguna</h2>
          <p>Kelola pengguna dan hak akses. {currentUserRole === 'superadmin' ? 'SuperAdmin mengelola User & Admin.' : 'Admin mengelola User.'}</p>
        </div>
      </div>

      <div className="card-surface">
        <div className="inner-card header-row">
          <h3>Daftar Pengguna</h3>
          <button className="btn-primary" onClick={handleAddUser} disabled={loading}>
            {loading ? 'Loading...' : '+ Tambah Pengguna'}
          </button>
        </div>

        <div className="inner-card">
          <div className="user-list">
            {userList.map(user => (
              <div key={user.id} className="user-item-card">
                <div className="avatar">{user.username?.charAt(0)?.toUpperCase()}</div>
                <div className="user-meta">
                  <div className="top-line">
                    <strong className="username">{user.username}</strong>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                    <span className="status-dot" data-status={user.status}></span>
                  </div>
                  <div className="sub-line">
                    <span className="email">{user.email || 'Tidak ada email'}</span>
                  </div>
                  <div className="sub-line">
                    <span>
                      {user.role === 'user' ? 'Divisi' : 'Anak Perusahaan'}: {user.role === 'user' ? (user.divisi?.nama || 'Belum dipilih') : (user.anakPerusahaan?.nama || 'Belum dipilih')}
                    </span>
                    <span> | Branch: {user.branch?.nama || 'Belum dipilih'}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <button className="btn-ghost" onClick={() => onEditUser && onEditUser(user)} disabled={loading}>Edit</button>
                  <button className="btn-danger" onClick={() => handleDeleteUser(user.id)} disabled={loading}>Hapus</button>
                </div>
              </div>
            ))}

            {userList.length === 0 && (
              <div className="empty-state">Tidak ada pengguna ditemukan</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit melalui halaman khusus, modal dihapus */}
    </div>
  );
};

export default UserManagement;
