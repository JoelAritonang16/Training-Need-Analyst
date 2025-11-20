import React, { useState, useEffect } from 'react';
import { divisiAPI, branchAPI, anakPerusahaanAPI } from '../../utils/api';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
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
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'success'
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    userId: null,
    isBulk: false
  });
  // UI state: search & filters & compact mode
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [compactMode, setCompactMode] = useState(false);
  // Sorting & pagination
  const [sortBy, setSortBy] = useState('username'); // username | role | status
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

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
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:5000/api/users?currentUserRole=${currentUserRole}`, {
        method: 'GET',
        headers: headers,
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
        const roleText = formData.role === 'admin' ? 'Admin' : 'User';
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Akun ${roleText} "${formData.username}" berhasil ditambahkan ke sistem.`,
          type: 'success'
        });
        // Reset form
        setFormData({
          username: '',
          password: '',
          role: 'user',
          email: '',
          unit: '',
          divisiId: '',
          branchId: '',
          anakPerusahaanId: ''
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menambahkan',
          message: data.message || 'Gagal menambahkan user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menambahkan user. Silakan coba lagi.',
        type: 'error'
      });
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
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `Data user "${formData.username}" berhasil diperbarui.`,
          type: 'success'
        });
      } else {
        console.log('Edit failed:', data.message);
        setAlertModal({
          open: true,
          title: 'Gagal Memperbarui',
          message: data.message || 'Gagal mengupdate user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat mengupdate user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = userList.find(u => u.id === userId);
    setConfirmDelete({
      open: true,
      userId: userId,
      isBulk: false
    });
  };

  const confirmDeleteAction = async () => {
    const userId = confirmDelete.userId;
    if (!userId) return;
    
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
        const deletedUser = userList.find(u => u.id === userId);
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `User "${deletedUser?.username || 'yang dipilih'}" berhasil dihapus dari sistem.`,
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Gagal Menghapus',
          message: data.message || 'Gagal menghapus user. Silakan coba lagi.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, userId: null, isBulk: false });
    }
  };

  // Derived: options for role filter from existing users
  const roleOptions = Array.from(new Set(userList.map(u => u.role))).filter(Boolean);

  // Derived: filtered users
  const filteredUsers = userList.filter(u => {
    const matchesSearch = [u.username, u.email, u.unit, u?.divisi?.nama, u?.branch?.nama, u?.anakPerusahaan?.nama]
      .filter(Boolean)
      .some(val => String(val).toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || (u.role === roleFilter);
    const matchesStatus = statusFilter === 'all' || ((u.status || '').toLowerCase() === statusFilter);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const getVal = (u) => {
      if (sortBy === 'username') return (u.username || '').toLowerCase();
      if (sortBy === 'role') return (u.role || '').toLowerCase();
      if (sortBy === 'status') return ((u.status || '') + '').toLowerCase();
      return (u.username || '').toLowerCase();
    };
    const va = getVal(a), vb = getVal(b);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  // No pagination: show all
  const totalUsers = sortedUsers.length;
  const totalPages = 1;
  const currentPage = 1;
  const pagedUsers = sortedUsers;

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pagedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pagedUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setConfirmDelete({
      open: true,
      userId: null,
      isBulk: true
    });
  };

  const confirmBulkDeleteAction = async () => {
    try {
      setLoading(true);
      const idsToDelete = Array.from(selectedIds);
      let successCount = 0;
      let failCount = 0;

      for (const id of idsToDelete) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/role-based/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ currentUserRole })
          });
          
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      fetchUsers();
      setSelectedIds(new Set());
      
      if (failCount === 0) {
        setAlertModal({
          open: true,
          title: 'Berhasil!',
          message: `${successCount} user berhasil dihapus dari sistem.`,
          type: 'success'
        });
      } else {
        setAlertModal({
          open: true,
          title: 'Sebagian Gagal',
          message: `${successCount} user berhasil dihapus, ${failCount} user gagal dihapus.`,
          type: 'warning'
        });
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      setAlertModal({
        open: true,
        title: 'Terjadi Kesalahan',
        message: 'Terjadi kesalahan saat menghapus user. Silakan coba lagi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, userId: null, isBulk: false });
    }
  };

  const handleBulkToggleStatus = (target) => {
    // Local optimistic: flip/set status, also call onToggleStatus if provided.
    setUserList(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: target } : u));
    if (onToggleStatus) {
      selectedIds.forEach(id => onToggleStatus(id));
    }
    setSelectedIds(new Set());
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
         
          <p>Kelola pengguna dan hak akses. {currentUserRole === 'superadmin' ? 'SuperAdmin mengelola User & Admin.' : 'Admin mengelola User.'}</p>
        </div>
      </div>

      <div className="card-surface">
        <div className="inner-card header-row">
          <div className="list-title">
            <span className="list-icon">USERS</span>
            <h3>Daftar Pengguna</h3>
            <span className="count-badge" aria-label={`Total pengguna: ${totalUsers}`}>{totalUsers}</span>
          </div>
          <button className="btn-primary" onClick={handleAddUser} disabled={loading}>
            {loading ? 'Loading...' : '+ Tambah Pengguna'}
          </button>
        </div>

        <div className="inner-card">
          <div className="controls-row">
            <div className="search-control">
              <input
                type="text"
                placeholder="Cari nama, email, unit, divisi, branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters">
              <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
                <option value="all">Semua Role</option>
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r.toUpperCase()}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* controls removed: sorting, compact toggle */}
            </div>
          </div>

          {/* Bulk actions removed as requested */}

          <div className={`user-list ${compactMode ? 'compact' : ''}`}>
            {/* utility row removed */}

            {pagedUsers.map(user => (
              <div key={user.id} className="user-item-card">
                <div className={`avatar role-${user.role}`}>{user.username?.charAt(0)?.toUpperCase()}</div>
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

            {pagedUsers.length === 0 && (
              <div className="empty-state">
                <div>
                  {currentUserRole === 'admin' 
                    ? 'Belum ada pengguna yang dibuat untuk branch Anda. Mulai dengan menambahkan pengguna pertama.'
                    : 'Tidak ada pengguna ditemukan'}
                </div>
                <button className="btn-primary" style={{marginTop: '12px'}} onClick={handleAddUser}>+ Tambah Pengguna</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit melalui halaman khusus, modal dihapus */}

      <ConfirmModal
        open={confirmDelete.open}
        title="Konfirmasi Hapus"
        message={
          confirmDelete.isBulk
            ? `Apakah Anda yakin ingin menghapus ${selectedIds.size} user terpilih?`
            : `Apakah Anda yakin ingin menghapus user "${userList.find(u => u.id === confirmDelete.userId)?.username || 'ini'}"?`
        }
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={confirmDelete.isBulk ? confirmBulkDeleteAction : confirmDeleteAction}
        onCancel={() => setConfirmDelete({ open: false, userId: null, isBulk: false })}
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

export default UserManagement;
